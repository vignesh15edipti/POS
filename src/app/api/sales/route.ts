import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import Sale from '@/models/Sale';
import Product from '@/models/Product';
import StockMovement from '@/models/StockMovement';
import Customer from '@/models/Customer';
import Setting from '@/models/Setting';

export const dynamic = 'force-dynamic';


export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const sales = await Sale.find({}).sort({ createdAt: -1 }).limit(limit);
    return NextResponse.json({ success: true, count: sales.length, data: sales });
  } catch (error: any) {
    console.error('GET /api/sales error:', error);
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

    const {
      items,
      subtotal,
      discount = 0,
      tax = 0,
      grandTotal,
      paymentMethod = 'CASH',
      amountReceived = 0,
      change = 0,
      cashierId,
      cashierName,
      customerId,
      customerName,
      pointsRedeemed = 0,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error('Sale must contain at least one item.');
    }

    if (amountReceived < grandTotal && paymentMethod === 'CASH') {
      throw new Error('Payment amount is insufficient');
    }

    // 1. Verify stock availability for all items first
    const validatedItems = [];
    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);
      if (!product) {
        throw new Error(`Product "${item.name}" (SKU: ${item.sku}) no longer exists.`);
      }

      if (product.quantity < item.quantity) {
        throw new Error(`Insufficient stock for "${product.name}". Available: ${product.quantity}, Requested: ${item.quantity}.`);
      }

      validatedItems.push({
        productDoc: product,
        itemData: {
          productId: product._id,
          productName: product.name,
          sku: product.sku,
          barcode: product.barcode,
          unit: product.unit,
          quantity: Number(item.quantity),
          sellingPriceAtSale: Number(item.price || product.sellingPrice),
          purchasePriceAtSale: product.purchasePrice || 0,
          discount: Number(item.discount || 0),
          tax: Number(item.tax || 0),
          lineTotal: Number(item.quantity) * Number(item.price || product.sellingPrice) - Number(item.discount || 0) + Number(item.tax || 0),
        },
      });
    }

    // 2. Auto-generate sequential Invoice Number
    const settings = await Setting.findOne().session(session);
    const prefix = settings?.salesInvoicePrefix || 'INV-';
    
    // Safely generate invoice number (prevent duplicates)
    const count = await Sale.countDocuments({}).session(session);
    const invoiceNumber = `${prefix}${(count + 1).toString().padStart(6, '0')}`;

    // Ensure unique invoice number by checking existence (in case of race conditions during count)
    const existing = await Sale.findOne({ invoiceNumber }).session(session);
    if (existing) {
        throw new Error('Duplicate invoice number generation detected. Please try again.');
    }

    const saleItemDocs = [];
    
    // 3. Atomically decrement stock in MongoDB & create StockMovement logs
    for (const v of validatedItems) {
      const product = v.productDoc;
      const qtySold = v.itemData.quantity;

      const beforeStock = product.quantity;
      const afterStock = beforeStock - qtySold;

      // Atomic stock deduction
      const updatedProduct = await Product.findByIdAndUpdate(
        product._id,
        { $inc: { quantity: -qtySold } },
        { new: true, session }
      );

      // Create Stock Movement log
      await StockMovement.create([{
        productId: product._id,
        productName: product.name,
        sku: product.sku,
        movementType: 'SALE',
        quantity: -qtySold,
        beforeStock: beforeStock,
        afterStock: updatedProduct?.quantity || afterStock,
        referenceType: 'Sale',
        reason: `Sold on Invoice #${invoiceNumber}`,
        createdBy: cashierId || null,
      }], { session });

      saleItemDocs.push(v.itemData);
    }

    // 4. Save Sale in MongoDB
    const calcSubtotal = subtotal || saleItemDocs.reduce((acc, i) => acc + i.lineTotal, 0);
    const calcGrandTotal = grandTotal || (calcSubtotal - discount + tax);

    const newSale = await Sale.create([{
      invoiceNumber,
      items: saleItemDocs,
      subtotal: calcSubtotal,
      discount,
      tax,
      grandTotal: calcGrandTotal,
      paymentMethod,
      paymentStatus: 'PAID',
      amountReceived: paymentMethod === 'CASH' ? amountReceived : calcGrandTotal,
      change: paymentMethod === 'CASH' ? change : 0,
      cashierId,
      cashierName,
      customerId,
      customerName,
      status: 'COMPLETED',
    }], { session });

    // 5. Update Customer Outstanding if CREDIT payment & Award Points
    if (customerId) {
        const customer = await Customer.findById(customerId).session(session);
        if (!customer) {
            throw new Error('Customer not found');
        }
        
        let outstandingUpdate = 0;
        if (paymentMethod === 'CREDIT') {
          if (customer.creditLimit > 0 && (customer.outstanding + calcGrandTotal) > customer.creditLimit) {
              throw new Error('Payment amount exceeds customer credit limit');
          }
          outstandingUpdate = calcGrandTotal;
        }

        // Award Points: 1 point per 100 currency units (calc on final paid amt)
        const pointsEarned = Math.floor(calcGrandTotal / 100);
        
        if (outstandingUpdate > 0 || pointsEarned > 0 || pointsRedeemed > 0) {
          const updatedCustomer = await Customer.findByIdAndUpdate(
              customerId,
              { 
                $inc: { 
                  outstanding: outstandingUpdate,
                  points: pointsEarned - pointsRedeemed
                } 
              },
              { new: true, session }
          );

          if (updatedCustomer) {
            const CustomerPointTransaction = (await import('@/models/CustomerPointTransaction')).default;
            
            if (pointsEarned > 0) {
              await CustomerPointTransaction.create([{
                customerId: customer._id,
                customerMobile: customer.mobile,
                billId: newSale[0]._id,
                billNumber: invoiceNumber,
                pointsChanged: pointsEarned,
                balance: updatedCustomer.points + pointsRedeemed, // balance before redeem
                reason: `Earned points on Invoice #${invoiceNumber}`,
              }], { session });
            }

            if (pointsRedeemed > 0) {
              await CustomerPointTransaction.create([{
                customerId: customer._id,
                customerMobile: customer.mobile,
                billId: newSale[0]._id,
                billNumber: invoiceNumber,
                pointsChanged: -pointsRedeemed,
                balance: updatedCustomer.points, // final balance
                reason: `Redeemed points on Invoice #${invoiceNumber}`,
              }], { session });
            }
          }
        }
    }

    // Commit Transaction
    await session.commitTransaction();
    session.endSession();

    return NextResponse.json(
      {
        success: true,
        message: `Sale ${invoiceNumber} completed successfully.`,
        data: newSale[0],
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    console.error('POST /api/sales error:', error);
    
    // Check if error is related to MongoDB replica set constraint (if not supported)
    if (error.message.includes('Transaction numbers')) {
         return NextResponse.json({ success: false, error: 'Database does not support transactions. Please ensure Replica Set is configured.' }, { status: 500 });
    }
    
    return NextResponse.json({ success: false, error: error.message || 'Unable to complete sale' }, { status: 400 });
  }
}
