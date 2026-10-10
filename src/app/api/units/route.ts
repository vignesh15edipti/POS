import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Unit from '@/models/Unit';

export const dynamic = 'force-dynamic';


export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active');
    
    let query = {};
    if (active === 'true') query = { isActive: true };
    
    const items = await Unit.find(query).sort({ createdAt: -1 });
    return NextResponse.json(items);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const item = await Unit.create(body);
    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Unit already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
