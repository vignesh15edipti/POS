import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import Sale from '@/models/Sale';
import SalesReturn from '@/models/SalesReturn';
import Product from '@/models/Product';
import StockMovement from '@/models/StockMovement';
import Customer from '@/models/Customer';

export const dynamic = 'force-dynamic';


export async function POST(req: NextRequest) {
  let session = null;
  try {
    await connectToDatabase();
    session = await mongoose.startSession();
    session.startTransaction();

    const body = await req.json();
    const { saleId, returnedItems, reason, createdBy } = body;

    // 1. Fetch original Sale
    const sale = await Sale.findById(saleId).session(session);
    if (!sale) {
      throw new Error('Original sale not found');
    }

    if (sale.status === 'CANCELLED' || sale.status === 'RETURNED') {
      throw new Error(`Cannot return items from a ${sale.status} sale.`);
    }

    // 2. Validate Items & calculate total refund
    let totalRefund = 0;
    const returnItemsDocs = [];

    for (const returnItem of returnedItems) {
      // Find item in original sale
      const originalItem = sale.items.find((i: any) => i.productId.toString() === returnItem.productId);
      if (!originalItem) {
        throw new Error(`Product ${returnItem.productId} was not part of this sale.`);
      }

      if (returnItem.quantity > originalItem.quantity) {
        throw new Error(`Cannot return more than purchased for ${originalItem.productName}. Purchased: ${originalItem.quantity}, Requested: ${returnItem.quantity}`);
      }

      // Calculate prorated refund amount for this item (excluding tax/discount complexities for simplicity, or prorating)
      const unitPrice = originalItem.sellingPriceAtSale;
      const refundAmount = unitPrice * returnItem.quantity;
      totalRefund += refundAmount;

      returnItemsDocs.push({
        productId: originalItem.productId,
        productName: originalItem.productName,
        sku: originalItem.sku,
        returnQuantity: returnItem.quantity,
        refundAmount: refundAmount,
        reason: reason || 'Customer Return',
      });

      // 3. Increment Stock
      const product = await Product.findById(originalItem.productId).session(session);
      if (product) {
        const beforeStock = product.quantity;
        const afterStock = beforeStock + returnItem.quantity;

        await Product.findByIdAndUpdate(
          product._id,
          { $inc: { quantity: returnItem.quantity } },
          { session }
        );

        // Create Stock Movement log
        await StockMovement.create([{
          productId: product._id,
          productName: product.name,
          sku: product.sku,
          movementType: 'SALES_RETURN',
          quantity: returnItem.quantity,
          beforeStock: beforeStock,
          afterStock: afterStock,
          referenceType: 'SalesReturn',
          reason: `Returned from Invoice #${sale.invoiceNumber}`,
          createdBy: createdBy || null,
        }], { session });
      }
    }

    // 4. Handle Customer Credit & Points Reversal if applicable
    if (sale.customerId) {
      const customer = await Customer.findById(sale.customerId).session(session);
      if (customer) {
        // If sale was on CREDIT, reduce outstanding
        let outstandingUpdate = 0;
        if (sale.paymentMethod === 'CREDIT') {
          outstandingUpdate = -totalRefund;
        }

        // Revert points earned (prorated)
        const pointsToRevert = Math.floor(totalRefund / 100);

        if (outstandingUpdate !== 0 || pointsToRevert !== 0) {
          const updatedCustomer = await Customer.findByIdAndUpdate(
            customer._id,
            { 
              $inc: { 
                outstanding: outstandingUpdate,
                points: -pointsToRevert 
              } 
            },
            { new: true, session }
          );

          if (pointsToRevert > 0 && updatedCustomer) {
            const CustomerPointTransaction = (await import('@/models/CustomerPointTransaction')).default;
            await CustomerPointTransaction.create([{
              customerId: customer._id,
              customerMobile: customer.mobile,
              billId: sale._id,
              billNumber: sale.invoiceNumber,
              pointsChanged: -pointsToRevert,
              balance: updatedCustomer.points,
              reason: `Reversed points for return on Invoice #${sale.invoiceNumber}`,
            }], { session });
          }
        }
      }
    }

    // 5. Create SalesReturn Record
    const returnNumber = `RET-${Date.now().toString().slice(-6)}`;
    const newReturn = await SalesReturn.create([{
      returnNumber,
      saleId: sale._id,
      invoiceNumber: sale.invoiceNumber,
      items: returnItemsDocs,
      totalRefund,
      status: 'COMPLETED',
      createdBy: createdBy || null,
    }], { session });

    // 6. Update Sale Status if fully returned
    // (Simple check: if we are returning everything, mark RETURNED, else leave as COMPLETED or PARTIAL_RETURN)
    // For now, let's mark it as RETURNED if totalRefund equals grandTotal
    if (totalRefund >= sale.grandTotal) {
      sale.status = 'RETURNED';
      await sale.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    return NextResponse.json({ success: true, data: newReturn[0] }, { status: 201 });
  } catch (error: any) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    console.error('POST /api/sales/returns error:', error);
    if (error.message.includes('Transaction numbers')) {
         return NextResponse.json({ success: false, error: 'Database does not support transactions. Please ensure Replica Set is configured.' }, { status: 500 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    
    const returns = await SalesReturn.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ success: true, data: returns });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
