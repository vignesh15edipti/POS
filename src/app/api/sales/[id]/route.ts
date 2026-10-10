import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import Sale from '@/models/Sale';

export const dynamic = 'force-dynamic';


export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid Invoice ID' }, { status: 400 });
    }

    const sale = await Sale.findById(id);

    if (!sale) {
      return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: sale });
  } catch (error: any) {
    console.error(`GET /api/sales/${params.id} error:`, error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
