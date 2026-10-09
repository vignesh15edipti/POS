import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Employee from '@/models/Employee';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await req.json();
    const { pin } = body;

    if (!pin) {
      return NextResponse.json({ success: false, error: 'PIN is required' }, { status: 400 });
    }

    // Find active employee with this PIN
    const employee = await Employee.findOne({ pin, status: 'active' });

    if (!employee) {
      // For fallback/dev, allow 0000 for Owner
      if (pin === '0000') {
        return NextResponse.json({
          success: true,
          data: {
            id: 'admin-dev',
            employeeId: 'ADM-00',
            name: 'Dev Admin',
            role: 'OWNER',
          }
        });
      }
      return NextResponse.json({ success: false, error: 'Invalid PIN' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: employee._id.toString(),
        employeeId: employee.employeeId,
        name: employee.name,
        role: employee.role,
      }
    });

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
