import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Product from '@/models/Product';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || searchParams.get('barcode') || searchParams.get('sku') || '').trim();

    if (!q) {
      return NextResponse.json(
        { success: false, error: 'Query parameter q, barcode, or sku is required.' },
        { status: 400 }
      );
    }

    const uppercaseQ = q.toUpperCase();

    // Fast exact lookup by barcode or SKU
    const product = await Product.findOne({
      isActive: true,
      $or: [
        { barcode: q },
        { sku: uppercaseQ },
        { barcode: uppercaseQ }
      ]
    });

    if (!product) {
      // Partial fallback match if no exact match
      const partialMatch = await Product.findOne({
        isActive: true,
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { sku: { $regex: q, $options: 'i' } }
        ]
      });

      if (partialMatch) {
        return NextResponse.json({ success: true, exactMatch: false, data: partialMatch });
      }

      return NextResponse.json(
        { success: false, error: `Product not found for SKU / Barcode "${q}".` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, exactMatch: true, data: product });
  } catch (error: any) {
    console.error('GET /api/products/lookup error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
