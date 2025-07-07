import { NextResponse } from 'next/server';
import { fetchStudentsBySection } from '../../../attendanceLogic'; // Corrected path

export async function POST(request) { // Changed to App Router POST handler
  try {
    const { section } = await request.json(); // Access body

    if (!section) {
      return NextResponse.json({ error: 'Section required' }, { status: 400 });
    }

    const students = await fetchStudentsBySection(section);
    return NextResponse.json({ success: true, data: students }, { status: 200 });
  } catch (err) {
    console.error('[fetch-students]', err);
    return NextResponse.json({ error: err.message }, { status: 500 }); // Changed to match error structure
  }
}

// Optional: Add other HTTP methods if needed
export async function GET(request) {
  return NextResponse.json({ error: 'GET method not allowed for this API.' }, { status: 405 });
}