import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Product from '@/models/Product';
import StockMovement from '@/models/StockMovement';

export const dynamic = 'force-dynamic';


export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const product = await Product.findById(params.id);
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: product });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const product = await Product.findById(params.id);
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found.' }, { status: 404 });
    }

    const oldQty = product.quantity;
    const newQty = body.quantity !== undefined ? Number(body.quantity) : oldQty;

    // Update product fields
    Object.assign(product, body);
    if (body.sku) product.sku = body.sku.trim().toUpperCase();
    await product.save();

    // Log Stock History if quantity changed manually
    if (newQty !== oldQty) {
      const diff = newQty - oldQty;
      await StockMovement.create({
        productId: product._id,
        productName: product.name,
        sku: product.sku,
        movementType: 'ADJUSTMENT',
        quantity: diff,
        beforeStock: oldQty,
        afterStock: newQty,
        referenceType: 'ManualEdit',
        reason: body.adjustmentReason || 'Manual edit via product form',
      });
    }

    return NextResponse.json({ success: true, message: 'Product updated successfully.', data: product });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const product = await Product.findById(params.id);
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found.' }, { status: 404 });
    }

    product.isActive = false;
    await product.save();

    return NextResponse.json({ success: true, message: 'Product disabled/deleted successfully.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
