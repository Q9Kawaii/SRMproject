import { alertStudent } from '../../../attendanceLogic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { regNo, dateStr } = body;

    if (!regNo || !dateStr) {
      return Response.json({ 
        success: false, 
        error: 'regNo and dateStr are required' 
      }, { status: 400 });
    }

    await alertStudent(regNo, dateStr);

    return Response.json({ 
      success: true, 
      message: 'Alert raised successfully' 
    });

  } catch (err) {
    console.error('[alert-student]', err);
    return Response.json({ 
      success: false, 
      error: err.message 
    }, { status: 500 });
  }
}
