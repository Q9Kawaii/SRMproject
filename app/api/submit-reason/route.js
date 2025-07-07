import { NextResponse } from 'next/server'; // Import NextResponse for App Router API responses
import { submitReason } from '../../../attendanceLogic'; // Corrected path to attendanceLogic.js

export async function POST(request) { // Changed to App Router POST handler
  try {
    const { regNo, dateStr, reason } = await request.json(); // Access body using await request.json()

    if (!regNo || !dateStr || !reason) { // Ensure all required fields are present
      return NextResponse.json({ error: 'regNo, dateStr, and reason are required' }, { status: 400 });
    }

    await submitReason(regNo, dateStr, reason); // Call the submitReason function from attendanceLogic
    return NextResponse.json({ success: true, message: 'Reason submitted successfully' }, { status: 200 }); // Use NextResponse
  } catch (error) {
    console.error('[submit-reason]', error); // Log error with context
    return NextResponse.json({ success: false, error: error.message }, { status: 500 }); // Use NextResponse
  }
}

// Optional: Add other HTTP methods if needed
export async function GET(request) {
  return NextResponse.json({ error: 'GET method not allowed for this API.' }, { status: 405 });
}