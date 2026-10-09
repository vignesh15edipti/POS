import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Shift from '@/models/Shift';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const { physicalCashInDrawer } = await req.json();

    const shift = await Shift.findById(params.id);
    if (!shift) {
      return NextResponse.json({ success: false, error: 'Shift not found' }, { status: 404 });
    }

    if (shift.status === 'CLOSED') {
      return NextResponse.json({ success: false, error: 'Shift is already closed' }, { status: 400 });
    }

    const expectedCashInDrawer = shift.openingFloat + (shift.cashSales || 0);
    const variance = (physicalCashInDrawer || 0) - expectedCashInDrawer;

    shift.physicalCashInDrawer = physicalCashInDrawer;
    shift.expectedCashInDrawer = expectedCashInDrawer;
    shift.variance = variance;
    shift.status = 'CLOSED';
    shift.shiftEnd = new Date();

    await shift.save();

    return NextResponse.json({ success: true, data: shift });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
