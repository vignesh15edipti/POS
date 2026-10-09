import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import Sale from '@/models/Sale';
import Product from '@/models/Product';
import StockMovement from '@/models/StockMovement';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  let session = null;
  try {
    await connectToDatabase();
    
    session = await mongoose.startSession();
    session.startTransaction();

    const sale = await Sale.findById(params.id).session(session);

    if (!sale) {
      throw new Error('Sale not found.');
    }

    if (sale.status === 'CANCELLED') {
      throw new Error('Sale is already cancelled.');
    }

    // Restore stock for each item in the sale
    for (const item of sale.items) {
      const product = await Product.findById(item.productId).session(session);
      
      const beforeStock = product?.quantity || 0;
      const afterStock = beforeStock + item.quantity;

      const updatedProduct = await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { quantity: item.quantity } },
        { new: true, session }
      );

      if (updatedProduct) {
        await StockMovement.create([{
          productId: updatedProduct._id,
          productName: updatedProduct.name,
          sku: updatedProduct.sku,
          movementType: 'SALES_RETURN',
          quantity: item.quantity,
          beforeStock,
          afterStock,
          referenceType: 'SaleCancel',
          referenceId: sale._id,
          reason: `Restored stock from cancelled Invoice #${sale.invoiceNumber}`,
        }], { session });
      }
    }

    sale.status = 'CANCELLED';
    await sale.save({ session });

    await session.commitTransaction();
    session.endSession();

    return NextResponse.json({
      success: true,
      message: `Sale #${sale.invoiceNumber} cancelled and stock restored.`,
      data: sale,
    });
  } catch (error: any) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    console.error('POST /api/sales/[id]/cancel error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
