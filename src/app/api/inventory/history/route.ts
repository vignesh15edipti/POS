import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import StockMovement from '@/models/StockMovement';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const sku = searchParams.get('sku');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const query: any = {};
    if (productId) query.productId = productId;
    if (sku) query.sku = sku.toUpperCase();

    const history = await StockMovement.find(query).sort({ createdAt: -1 }).limit(limit);
    return NextResponse.json({ success: true, count: history.length, data: history });
  } catch (error: any) {
    console.error('GET /api/inventory/history error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
