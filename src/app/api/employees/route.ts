import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/db';
import Employee from '../../../models/Employee';

export const dynamic = 'force-dynamic';


export async function GET() {
  try {
    await connectToDatabase();
    const employees = await Employee.find({ status: 'active' }).sort({ name: 1 });
    return NextResponse.json({ success: true, data: employees });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const newEmployee = await Employee.create(body);
    return NextResponse.json({ success: true, data: newEmployee }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
