import { NextResponse } from 'next/server';
// Note: In your attendanceLogic.js, getLowAttendanceSubjects was commented out.
// Ensure it's uncommented and exported if you intend to use it.
import { getLowAttendanceSubjects } from '../../../attendanceLogic';

export async function POST(request) { // Changed to App Router POST handler
  try {
    const { attendanceMap } = await request.json(); // Access body

    if (!attendanceMap || typeof attendanceMap !== 'object') {
      return NextResponse.json({ error: 'attendanceMap must be a valid object.' }, { status: 400 });
    }

    // IMPORTANT: Make sure getLowAttendanceSubjects is actually implemented and exported
    // in your attendanceLogic.js. In the version you provided earlier, it was commented out.
    const lowSubjects = getLowAttendanceSubjects(attendanceMap);
    return NextResponse.json({ success: true, lowSubjects }, { status: 200 });
  } catch (error) {
    console.error('[get-low-attendance-subjects]', error);
    return NextResponse.json({ success: false, error: error.message || 'Server Error' }, { status: 500 });
  }
}

// Optional: Add other HTTP methods if needed
export async function GET(request) {
  return NextResponse.json({ error: 'GET method not allowed for this API.' }, { status: 405 });
}