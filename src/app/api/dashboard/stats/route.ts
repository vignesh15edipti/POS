import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Product from '@/models/Product';
import Sale from '@/models/Sale';
import StockMovement from '@/models/StockMovement';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    // 1. Live Product & Inventory Metrics from MongoDB
    const totalProducts = await Product.countDocuments({ isActive: true });

    const inventoryAgg = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalQty: { $sum: '$quantity' },
          totalCostValue: { $sum: { $multiply: ['$quantity', '$purchasePrice'] } },
          totalRetailValue: { $sum: { $multiply: ['$quantity', '$sellingPrice'] } },
        },
      },
    ]);

    const totalQty = inventoryAgg[0]?.totalQty || 0;
    const totalInventoryValue = inventoryAgg[0]?.totalCostValue || 0;
    const totalRetailValue = inventoryAgg[0]?.totalRetailValue || 0;

    const lowStockCount = await Product.countDocuments({
      isActive: true,
      $expr: { $lte: ['$quantity', '$minimumStock'] },
    });

    const outOfStockCount = await Product.countDocuments({
      isActive: true,
      quantity: 0,
    });

    // 2. Today's Date Range (UTC start of day)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayBillsCount = await Sale.countDocuments({
      status: 'COMPLETED',
      createdAt: { $gte: startOfToday },
    });

    const todaySalesAgg = await Sale.aggregate([
      {
        $match: {
          status: 'COMPLETED',
          createdAt: { $gte: startOfToday },
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$grandTotal' },
        },
      },
    ]);
    const todaySales = todaySalesAgg[0]?.totalSales || 0;

    // 3. Lifetime Completed Sales Metric
    const lifetimeSalesAgg = await Sale.aggregate([
      { $match: { status: 'COMPLETED' } },
      { $group: { _id: null, totalSales: { $sum: '$grandTotal' } } },
    ]);
    const totalSales = lifetimeSalesAgg[0]?.totalSales || 0;
    const totalBills = await Sale.countDocuments({ status: 'COMPLETED' });

    // 4. Top Selling Products (Aggregated from completed Sales)
    const topProductsAgg = await Sale.aggregate([
      { $match: { status: 'COMPLETED' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.sku',
          name: { $first: '$items.productName' },
          sku: { $first: '$items.sku' },
          totalQuantitySold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.lineTotal' },
        },
      },
      { $sort: { totalQuantitySold: -1 } },
      { $limit: 5 },
    ]);

    // 5. Recent Sales & Stock Movements Stream
    const recentBills = await Sale.find({}).sort({ createdAt: -1 }).limit(5);
    const recentStockLogs = await StockMovement.find({}).sort({ createdAt: -1 }).limit(5);

    return NextResponse.json({
      success: true,
      data: {
        totalProducts,
        totalQty,
        totalInventoryValue,
        totalRetailValue,
        lowStockCount,
        outOfStockCount,
        todayBillsCount,
        todaySales,
        totalBills,
        totalSales,
        topSellingProducts: topProductsAgg,
        recentBills,
        recentStockLogs,
      },
    });
  } catch (error: any) {
    console.error('GET /api/dashboard/stats error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
