import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import Purchase from '@/models/Purchase';
import PurchaseReturn from '@/models/PurchaseReturn';
import Product from '@/models/Product';
import StockMovement from '@/models/StockMovement';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    
    const returns = await PurchaseReturn.find()
      .populate('supplierId', 'name')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ success: true, data: returns });
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
    const { purchaseId, returnedItems, reason, createdBy } = body;

    const purchase = await Purchase.findById(purchaseId).session(session);
    if (!purchase) {
      throw new Error('Original purchase not found');
    }

    if (purchase.status === 'CANCELLED') {
      throw new Error(`Cannot return items from a cancelled purchase.`);
    }

    let totalRefund = 0;
    const returnItemsDocs = [];

    for (const returnItem of returnedItems) {
      const originalItem = purchase.items.find((i: any) => i.productId.toString() === returnItem.productId);
      if (!originalItem) {
        throw new Error(`Product ${returnItem.productId} was not part of this purchase.`);
      }

      if (returnItem.quantity > originalItem.quantity) {
        throw new Error(`Cannot return more than purchased for ${originalItem.name}. Purchased: ${originalItem.quantity}, Requested: ${returnItem.quantity}`);
      }

      const unitPrice = originalItem.purchasePrice;
      const refundAmount = unitPrice * returnItem.quantity;
      totalRefund += refundAmount;

      returnItemsDocs.push({
        productId: originalItem.productId,
        productName: originalItem.name,
        sku: originalItem.sku,
        returnQuantity: returnItem.quantity,
        refundAmount: refundAmount,
        reason: reason || 'Defective/Expired',
      });

      // Decrement Stock
      const product = await Product.findById(originalItem.productId).session(session);
      if (product) {
        const beforeStock = product.quantity;
        const afterStock = beforeStock - returnItem.quantity;

        if (afterStock < 0) {
           throw new Error(`Returning this item drops stock below 0 for ${product.name}`);
        }

        await Product.findByIdAndUpdate(
          product._id,
          { $inc: { quantity: -returnItem.quantity } },
          { session }
        );

        // Record stock movement
        await StockMovement.create([{
          productId: product._id,
          productName: product.name,
          sku: product.sku,
          movementType: 'PURCHASE_RETURN',
          quantity: returnItem.quantity,
          beforeStock: beforeStock,
          afterStock: afterStock,
          referenceType: 'PurchaseReturn',
          reason: `Returned to Supplier from PO #${purchase.purchaseNumber}`,
          createdBy: createdBy || null,
        }], { session });
      }
    }

    const count = await PurchaseReturn.countDocuments().session(session);
    const returnNumber = `PR-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${(count + 1).toString().padStart(4, '0')}`;

    const newReturn = await PurchaseReturn.create([{
      returnNumber,
      purchaseId: purchase._id,
      purchaseInvoiceNumber: purchase.invoiceNumber,
      supplierId: purchase.supplierId,
      items: returnItemsDocs,
      totalRefund,
      status: 'COMPLETED',
      createdBy: createdBy || null,
    }], { session });

    await session.commitTransaction();
    session.endSession();

    return NextResponse.json({ success: true, data: newReturn[0] }, { status: 201 });
  } catch (error: any) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    if (error.message.includes('Transaction numbers')) {
         return NextResponse.json({ success: false, error: 'Database does not support transactions.' }, { status: 500 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
