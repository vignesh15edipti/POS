import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Product from '@/models/Product';
import StockMovement from '@/models/StockMovement';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
  let session = null;
  try {
    await connectToDatabase();
    
    session = await mongoose.startSession();
    session.startTransaction();

    const body = await req.json();
    const { productId, sku, adjustmentType, quantity, reason, notes, employeeId, batchNumber, expiryDate } = body;

    const qty = Number(quantity);
    if (!qty || isNaN(qty)) {
      throw new Error('Valid quantity is required.');
    }

    if (!['DAMAGE', 'WASTAGE', 'EXPIRY', 'ADJUSTMENT', 'PHYSICAL_COUNT'].includes(adjustmentType)) {
      throw new Error('Invalid adjustment type.');
    }

    let product;
    if (productId) {
      product = await Product.findById(productId).session(session);
    } else if (sku) {
      product = await Product.findOne({ sku: sku.trim().toUpperCase() }).session(session);
    }

    if (!product) {
      throw new Error('Product not found.');
    }

    const beforeStock = product.quantity;
    
    // For PHYSICAL_COUNT, quantity is the new exact stock. For others, it's a relative change.
    let afterStock;
    let actualQtyChanged;

    if (adjustmentType === 'PHYSICAL_COUNT') {
        if (qty < 0) throw new Error('Physical count cannot be negative');
        afterStock = qty;
        actualQtyChanged = afterStock - beforeStock;
    } else {
        // Adjustments like damage/wastage/expiry are usually negative changes.
        // We expect the frontend to pass negative values for deductions.
        afterStock = beforeStock + qty;
        actualQtyChanged = qty;
    }

    if (afterStock < 0) {
      throw new Error(`Cannot reduce stock below 0. Current stock: ${beforeStock}.`);
    }

    product.quantity = afterStock;

    if (batchNumber && expiryDate) {
      if (!product.batches) product.batches = [];
      const existingBatch = product.batches.find((b: any) => b.batchNumber === batchNumber);
      if (existingBatch) {
        existingBatch.qty += actualQtyChanged;
        // If qty is 0 or less, maybe remove it or keep it for history, let's keep it.
      } else if (actualQtyChanged > 0) {
        product.batches.push({
          batchNumber,
          expiryDate: new Date(expiryDate),
          qty: actualQtyChanged
        });
      }
    }

    await product.save({ session });

    const movement = await StockMovement.create([{
      productId: product._id,
      productName: product.name,
      sku: product.sku,
      movementType: adjustmentType,
      quantity: actualQtyChanged,
      beforeStock,
      afterStock,
      referenceType: 'ManualAdjustment',
      reason: reason ? `${reason}${notes ? ' - ' + notes : ''}` : (notes || 'Manual stock adjustment'),
      createdBy: employeeId || null,
    }], { session });

    await session.commitTransaction();
    session.endSession();

    return NextResponse.json({
      success: true,
      message: `Stock adjusted successfully. New stock: ${afterStock}.`,
      data: product,
      history: movement[0],
    });
  } catch (error: any) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    console.error('POST /api/inventory/adjust error:', error);
    
    if (error.message.includes('Transaction numbers')) {
         return NextResponse.json({ success: false, error: 'Database does not support transactions. Please ensure Replica Set is configured.' }, { status: 500 });
    }
    
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
