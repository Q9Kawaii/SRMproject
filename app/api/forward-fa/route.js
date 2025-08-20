import { NextResponse } from 'next/server';
import { forwardFA } from '../../../attendanceLogic'; // <-- adjust path if needed

export async function POST(request) {
  try {
    const { regNo, dateStr, remarks } = await request.json();

    if (!regNo || !dateStr) {
      return NextResponse.json(
        { success: false, error: 'regNo and dateStr are required' },
        { status: 400 }
      );
    }

    await forwardFA(regNo, dateStr, remarks ?? 'NA');
    return NextResponse.json(
      { success: true, message: 'FA verified & forwarded successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[fa-forward]', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: 'GET not allowed' }, { status: 405 });
}
