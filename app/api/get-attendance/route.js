import { NextResponse } from 'next/server';
import { getAttendanceMapForStudent } from '../../../attendanceLogic'; // Corrected path

export async function GET(request) { // Changed to App Router GET handler
  const { searchParams } = new URL(request.url); // Access query parameters
  const regNo = searchParams.get('regNo');

  if (!regNo) {
    return NextResponse.json({ error: 'Registration number (regNo) is required.' }, { status: 400 });
  }

  try {
    const attendanceMap = await getAttendanceMapForStudent(regNo);

    if (!attendanceMap) {
      // In App Router, 404 can be specific. Or simply return empty map with 200 if that's acceptable.
      // Based on attendanceLogic.js, getAttendanceMapForStudent returns {} if not found, so 200 is fine.
      return NextResponse.json({ success: false, message: 'Attendance data not found for student.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, attendanceMap }, { status: 200 });
  } catch (error) {
    console.error('[get-attendance]', error);
    return NextResponse.json({ success: false, error: error.message || 'Server Error fetching attendance.' }, { status: 500 });
  }
}

// Optional: Add other HTTP methods if needed
export async function POST(request) {
  return NextResponse.json({ error: 'POST method not allowed for this API.' }, { status: 405 });
}