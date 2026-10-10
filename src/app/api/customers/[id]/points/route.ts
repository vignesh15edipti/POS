import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import CustomerPointTransaction from '@/models/CustomerPointTransaction';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';


export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid Customer ID' }, { status: 400 });
    }

    const transactions = await CustomerPointTransaction.find({ customerId: id })
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json({ success: true, data: transactions });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
