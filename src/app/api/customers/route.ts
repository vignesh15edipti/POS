import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/db';
import Customer from '../../../models/Customer';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const mobile = searchParams.get('mobile');

    if (mobile) {
      const customer = await Customer.findOne({ mobile });
      if (customer) {
        return NextResponse.json({ success: true, data: customer });
      } else {
        return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
      }
    }

    const customers = await Customer.find().sort({ name: 1 });
    return NextResponse.json({ success: true, data: customers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const newCustomer = await Customer.create(body);
    return NextResponse.json({ success: true, data: newCustomer }, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: 'Mobile number already registered.' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
