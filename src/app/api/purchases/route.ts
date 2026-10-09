import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import Purchase from '@/models/Purchase';
import Product from '@/models/Product';
import StockMovement from '@/models/StockMovement';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    
    const purchases = await Purchase.find()
      .populate('supplierId', 'name mobile')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ success: true, data: purchases });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let session = null;
  try {
    await connectToDatabase();
    session = await mongoose.startSession();
    session.startTransaction();

    const body = await req.json();
    const { supplierId, invoiceNumber, items, subtotal, tax, discount, grandTotal, paymentStatus, amountPaid, amountDue, createdBy } = body;

    // Generate Purchase Number
    const count = await Purchase.countDocuments().session(session);
    const purchaseNumber = `PO-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${(count + 1).toString().padStart(4, '0')}`;

    const purchase = new Purchase({
      purchaseNumber,
      invoiceNumber,
      supplierId,
      items,
      subtotal,
      tax,
      discount,
      grandTotal,
      paymentStatus,
      amountPaid,
      amountDue,
      createdBy: createdBy || null,
    });

    await purchase.save({ session });

    // Update Product Stock and create Stock Movements
    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);
      if (product) {
        const beforeStock = product.quantity;
        const afterStock = beforeStock + item.quantity;

        // Update product stock and optionally update purchase price based on new stock
        await Product.findByIdAndUpdate(
          product._id,
          { 
            $inc: { quantity: item.quantity },
            $set: { purchasePrice: item.purchasePrice } // update to latest purchase price
          },
          { session }
        );

        // Record stock movement
        await StockMovement.create([{
          productId: product._id,
          productName: product.name,
          sku: product.sku,
          movementType: 'PURCHASE',
          quantity: item.quantity,
          beforeStock: beforeStock,
          afterStock: afterStock,
          referenceType: 'Purchase',
          referenceId: purchase._id,
          reason: `Purchased via PO #${purchaseNumber}`,
          createdBy: createdBy || null,
        }], { session });
      }
    }

    await session.commitTransaction();
    session.endSession();

    return NextResponse.json({ success: true, data: purchase }, { status: 201 });
  } catch (error: any) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    if (error.message.includes('Transaction numbers')) {
         return NextResponse.json({ success: false, error: 'Database does not support transactions. Please ensure Replica Set is configured.' }, { status: 500 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
