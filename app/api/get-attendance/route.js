import { NextResponse } from 'next/server';
import { getAttendanceMapForStudent } from '../../../attendanceLogic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const regNo = searchParams.get('regNo');

  if (!regNo) {
    return NextResponse.json(
      { error: 'Registration number (regNo) is required.' },
      { status: 400 }
    );
  }

  try {
    const attendanceMap = await getAttendanceMapForStudent(regNo);

    if (!attendanceMap || Object.keys(attendanceMap).length === 0) {
      return NextResponse.json(
        { success: false, message: 'Attendance data not found for student.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, attendanceMap }, { status: 200 });
  } catch (error) {
    console.error('[get-attendance]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server Error fetching attendance.' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  return NextResponse.json(
    { error: 'POST method not allowed for this API.' },
    { status: 405 }
  );
}
