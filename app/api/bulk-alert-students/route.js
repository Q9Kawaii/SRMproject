import { NextResponse } from 'next/server';
import { bulkAlertStudents } from '../../../attendanceLogic'; // Corrected path

export async function POST(request) {
  try {
    const { regNos, dateStr } = await request.json(); // Access body

    if (!Array.isArray(regNos) || !dateStr) {
      return NextResponse.json({ error: 'regNos (array) and dateStr are required' }, { status: 400 });
    }

    const result = await bulkAlertStudents(regNos, dateStr);
    return NextResponse.json({ success: true, result }, { status: 200 });
  } catch (error) {
    console.error('[bulk-alert-students]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Optional: Add other HTTP methods if needed
export async function GET(request) {
  return NextResponse.json({ error: 'GET method not allowed for this API.' }, { status: 405 });
}