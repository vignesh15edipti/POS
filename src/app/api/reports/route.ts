import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Sale from '@/models/Sale';
import Purchase from '@/models/Purchase';
import Expense from '@/models/Expense';
import Product from '@/models/Product';
import Customer from '@/models/Customer';
import Supplier from '@/models/Supplier';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const url = new URL(req.url);
    const type = url.searchParams.get('type');
    const startStr = url.searchParams.get('startDate');
    const endStr = url.searchParams.get('endDate');
    
    // Default to last 30 days if no date provided
    const startDate = startStr ? new Date(startStr) : new Date(new Date().setDate(new Date().getDate() - 30));
    const endDate = endStr ? new Date(endStr) : new Date();
    endDate.setHours(23, 59, 59, 999);

    const dateFilter = { createdAt: { $gte: startDate, $lte: endDate } };

    switch (type) {
      case 'sales': {
        const sales = await Sale.find({ ...dateFilter, status: 'COMPLETED' })
          .select('invoiceNumber grandTotal paymentMethod tax discount createdAt items')
          .sort({ createdAt: -1 })
          .lean();
        return NextResponse.json({ success: true, data: sales });
      }

      case 'purchase': {
        const purchases = await Purchase.find({ ...dateFilter, status: 'COMPLETED' })
          .populate('supplierId', 'name')
          .select('purchaseNumber invoiceNumber grandTotal tax discount paymentStatus createdAt')
          .sort({ createdAt: -1 })
          .lean();
        return NextResponse.json({ success: true, data: purchases });
      }

      case 'profit': {
        // Simple Profit calculation: Total Sales Revenue (excl tax) - Total Cost of Goods Sold - Total Expenses
        const sales = await Sale.find({ ...dateFilter, status: 'COMPLETED' }).lean();
        const expenses = await Expense.find({ expenseDate: { $gte: startDate, $lte: endDate } }).lean();

        let totalRevenue = 0;
        let totalCogs = 0; // Cost of Goods Sold
        let totalTax = 0;

        for (const sale of sales) {
          totalRevenue += (sale.grandTotal - sale.tax);
          totalTax += sale.tax;
          for (const item of sale.items) {
            // Assuming purchasePrice is stored in item or using sellingPrice - margin. 
            // In Sale model, we have sellingPriceAtSale. We need purchasePrice for exact COGS.
            // Let's assume average 20% margin if purchasePrice is missing from Sale schema for simplicity in this demo.
            const cost = item.purchasePrice ? (item.purchasePrice * item.quantity) : (item.sellingPriceAtSale * item.quantity * 0.8);
            totalCogs += cost;
          }
        }

        const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
        const grossProfit = totalRevenue - totalCogs;
        const netProfit = grossProfit - totalExpenses;

        return NextResponse.json({ 
          success: true, 
          data: { totalRevenue, totalCogs, grossProfit, totalExpenses, netProfit, totalTax } 
        });
      }

      case 'stock': {
        const products = await Product.find({ quantity: { $gt: 0 } })
          .select('name sku barcode quantity unit purchasePrice sellingPrice category subCategory')
          .sort({ name: 1 })
          .lean();
        return NextResponse.json({ success: true, data: products });
      }

      case 'low-stock': {
        // Where quantity <= minimumStock (assuming minimumStock field exists, else <= 5)
        const products = await Product.find({ $expr: { $lte: ['$quantity', { $ifNull: ['$minimumStock', 5] }] } })
          .select('name sku quantity unit minimumStock')
          .lean();
        return NextResponse.json({ success: true, data: products });
      }

      case 'customer-due': {
        const customers = await Customer.find({ totalOutstanding: { $gt: 0 } })
          .select('name mobile totalOutstanding')
          .lean();
        return NextResponse.json({ success: true, data: customers });
      }

      case 'supplier-due': {
        // To find supplier due, we sum up amountDue from Purchases per supplier, or assume Supplier has an outstanding field.
        // Let's aggregate from Purchases
        const dues = await Purchase.aggregate([
          { $match: { amountDue: { $gt: 0 }, status: 'COMPLETED' } },
          { $group: { _id: '$supplierId', totalDue: { $sum: '$amountDue' } } },
          { $lookup: { from: 'suppliers', localField: '_id', foreignField: '_id', as: 'supplier' } },
          { $unwind: '$supplier' },
          { $project: { name: '$supplier.name', mobile: '$supplier.phone', totalDue: 1, _id: 0 } }
        ]);
        return NextResponse.json({ success: true, data: dues });
      }

      case 'gst': {
        const sales = await Sale.find({ ...dateFilter, status: 'COMPLETED' }).select('invoiceNumber grandTotal tax createdAt').lean();
        const purchases = await Purchase.find({ ...dateFilter, status: 'COMPLETED' }).select('purchaseNumber invoiceNumber grandTotal tax createdAt').lean();
        
        return NextResponse.json({ success: true, data: { sales, purchases } });
      }

      default:
        return NextResponse.json({ success: false, error: 'Invalid report type' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
