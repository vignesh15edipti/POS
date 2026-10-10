import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Setting from '@/models/Setting';

export const dynamic = 'force-dynamic';


export async function GET() {
  try {
    await connectToDatabase();
    let setting = await Setting.findOne();
    if (!setting) {
      setting = await Setting.create({}); // Create default if none exists
    }
    return NextResponse.json({ success: true, data: setting });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    
    let setting = await Setting.findOne();
    if (!setting) {
      setting = await Setting.create(body);
    } else {
      setting = await Setting.findOneAndUpdate({}, body, { new: true, runValidators: true });
    }
    
    return NextResponse.json({ success: true, data: setting });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
