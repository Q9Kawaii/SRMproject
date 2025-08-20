import { NextResponse } from 'next/server'; // Import NextResponse for App Router API responses
import { approveAA } from '../../../attendanceLogic'; // Corrected path to attendanceLogic.js

export async function POST(request) { // Changed to App Router POST handler
  try {
    const { regNo, dateStr, remarks } = await request.json(); // Access body using await request.json()

    if (!regNo || !dateStr) {
      return NextResponse.json({ error: 'regNo and dateStr are required' }, { status: 400 }); // Use NextResponse
    }

    await approveAA(regNo, dateStr, remarks || "NA");
    return NextResponse.json({ success: true, message: 'AA approval successful' }, { status: 200 }); // Use NextResponse
  } catch (error) {
    console.error('[approve-aa]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 }); // Use NextResponse
  }
}

// Optional: Add other HTTP methods if needed
export async function GET(request) {
  return NextResponse.json({ error: 'GET method not allowed for this API.' }, { status: 405 });
}