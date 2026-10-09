import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Product from '@/models/Product';
import StockMovement from '@/models/StockMovement';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const stockStatus = searchParams.get('stockStatus') || '';

    const query: any = { isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } },
      ];
    }

    if (category && category !== 'ALL') {
      query.category = category;
    }

    if (stockStatus === 'low') {
      query.$expr = { $lte: ['$quantity', '$minimumStock'] };
    } else if (stockStatus === 'out') {
      query.quantity = 0;
    }

    const products = await Product.find(query).sort({ updatedAt: -1 });
    return NextResponse.json({ success: true, count: products.length, data: products });
  } catch (error: any) {
    console.error('GET /api/products error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const {
      name,
      sku,
      barcode,
      category = 'General',
      unit = 'piece',
      purchasePrice = 0,
      sellingPrice = 0,
      mrp = 0,
      quantity = 0,
      minimumStock = 10,
      imageUrl = '',
    } = body;

    if (!name || !sku || !barcode) {
      return NextResponse.json(
        { success: false, error: 'Product name, SKU, and barcode are required.' },
        { status: 400 }
      );
    }

    const uppercaseSku = sku.trim().toUpperCase();
    const trimmedBarcode = barcode.trim();

    // Check if product with given SKU already exists in MongoDB
    const existingProduct = await Product.findOne({ sku: uppercaseSku });

    if (existingProduct) {
      const beforeStock = existingProduct.quantity;
      const addedQty = Number(quantity) || 0;
      const updatedQty = beforeStock + addedQty;

      existingProduct.quantity = updatedQty;
      existingProduct.name = name.trim() || existingProduct.name;
      existingProduct.category = category || existingProduct.category;
      existingProduct.purchasePrice = Number(purchasePrice) || existingProduct.purchasePrice;
      existingProduct.sellingPrice = Number(sellingPrice) || existingProduct.sellingPrice;
      existingProduct.mrp = Number(mrp) || existingProduct.mrp;
      existingProduct.unit = unit || existingProduct.unit;
      if (imageUrl) existingProduct.imageUrl = imageUrl;

      await existingProduct.save();

      // Log Stock Movement in MongoDB
      if (addedQty > 0) {
        await StockMovement.create({
          productId: existingProduct._id,
          productName: existingProduct.name,
          sku: existingProduct.sku,
          movementType: 'ADJUSTMENT',
          quantity: addedQty,
          beforeStock,
          afterStock: updatedQty,
          referenceType: 'ProductUpdate',
          reason: `Stock increased via duplicate SKU input (${uppercaseSku})`,
        });
      }

      return NextResponse.json({
        success: true,
        message: `Existing SKU (${uppercaseSku}) found! Stock incremented by +${addedQty}. Final quantity: ${updatedQty}.`,
        isDuplicateSkuUpdate: true,
        data: existingProduct,
      });
    }

    // Check if barcode belongs to another product
    const existingBarcode = await Product.findOne({ barcode: trimmedBarcode });
    if (existingBarcode) {
      return NextResponse.json(
        {
          success: false,
          error: `Barcode "${trimmedBarcode}" is already assigned to product "${existingBarcode.name}" (SKU: ${existingBarcode.sku}).`,
        },
        { status: 400 }
      );
    }

    // IF SKU does not exist: Create NEW product record
    const newProduct = await Product.create({
      name: name.trim(),
      sku: uppercaseSku,
      barcode: trimmedBarcode,
      category,
      unit,
      purchasePrice: Number(purchasePrice),
      sellingPrice: Number(sellingPrice),
      mrp: Number(mrp) || Number(sellingPrice),
      quantity: Number(quantity),
      minimumStock: Number(minimumStock),
      imageUrl,
      isActive: true,
    });

    // Log Initial Stock History
    await StockMovement.create({
      productId: newProduct._id,
      productName: newProduct.name,
      sku: newProduct.sku,
      movementType: 'INITIAL',
      quantity: newProduct.quantity,
      beforeStock: 0,
      afterStock: newProduct.quantity,
      referenceType: 'ProductCreation',
      reason: 'New product creation in catalog',
    });

    return NextResponse.json(
      {
        success: true,
        message: 'New product created successfully.',
        isDuplicateSkuUpdate: false,
        data: newProduct,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST /api/products error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
