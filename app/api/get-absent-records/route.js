import { NextResponse } from 'next/server';
import { getAbsentRecords } from '../../../attendanceLogic'; // Corrected path

export async function GET(request) { // Changed to App Router GET handler
  const { searchParams } = new URL(request.url); // Access query parameters
  const regNo = searchParams.get('regNo');
  const role = searchParams.get('role');


  if (!regNo) {
    return NextResponse.json({ error: 'regNo is required' }, { status: 400 });
  }

  try {
    // const records = await getAbsentRecords(regNo);
    const records = await getAbsentRecords(regNo, role || "FA");
    return NextResponse.json({ success: true, records }, { status: 200 });
  } catch (error) {
    console.error('[get-absent-records]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Optional: Add other HTTP methods if needed
export async function POST(request) {
  return NextResponse.json({ error: 'POST method not allowed for this API.' }, { status: 405 });
}