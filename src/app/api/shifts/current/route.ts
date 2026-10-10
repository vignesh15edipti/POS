import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Shift from '@/models/Shift';
import Sale from '@/models/Sale';

export const dynamic = 'force-dynamic';


export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    
    // Find any OPEN shift. (In a real multi-counter app, we'd filter by counterId or cashierId)
    const shift = await Shift.findOne({ status: 'OPEN' }).sort({ createdAt: -1 });
    
    if (!shift) {
      return NextResponse.json({ success: true, data: null });
    }

    // Recalculate live sales for this shift
    // In production, we'd link sales to the shift._id, but for now we'll just sum all sales created after shiftStart
    const salesAgg = await Sale.aggregate([
      {
        $match: {
          status: 'COMPLETED',
          createdAt: { $gte: shift.shiftStart }
        }
      },
      {
        $group: {
          _id: '$paymentMethod',
          total: { $sum: '$grandTotal' }
        }
      }
    ]);

    let cashSales = 0;
    let cardSales = 0;
    let upiSales = 0;

    salesAgg.forEach(s => {
      if (s._id === 'CASH') cashSales += s.total;
      if (s._id === 'CARD') cardSales += s.total;
      if (s._id === 'UPI') upiSales += s.total;
    });

    // Update the shift temporarily with live aggregates (we don't save until close)
    shift.cashSales = cashSales;
    shift.cardSales = cardSales;
    shift.upiSales = upiSales;
    await shift.save(); // It's fine to save the running totals

    return NextResponse.json({ success: true, data: shift });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { openingFloat, cashierName, cashierId, counterId } = body;

    // Ensure no shift is currently open
    const existing = await Shift.findOne({ status: 'OPEN' });
    if (existing) {
      return NextResponse.json({ success: false, error: 'A shift is already open.' }, { status: 400 });
    }

    const shift = new Shift({
      cashierName: cashierName || 'Alex Mercer',
      cashierId: cashierId || 'usr-01',
      counterId: counterId || 'Counter 1',
      openingFloat: openingFloat || 0,
      status: 'OPEN'
    });

    await shift.save();

    return NextResponse.json({ success: true, data: shift });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
