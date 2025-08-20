// import { NextResponse } from 'next/server';
// import { approveFA } from '../../../attendanceLogic'; // Corrected path

// export async function POST(request) {
//   try {
//     const { regNo, dateStr } = await request.json(); // Access body

//     if (!regNo || !dateStr) {
//       return NextResponse.json({ error: 'regNo and dateStr are required' }, { status: 400 });
//     }

//     await approveFA(regNo, dateStr);
//     return NextResponse.json({ success: true, message: 'FA approval successful' }, { status: 200 });
//   } catch (error) {
//     console.error('[approve-fa]', error);
//     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//   }
// }

// // Optional: Add other HTTP methods if needed
// export async function GET(request) {
//   return NextResponse.json({ error: 'GET method not allowed for this API.' }, { status: 405 });
// }

import { NextResponse } from 'next/server';
import { approveFA } from '../../../attendanceLogic'; // <-- adjust path if needed

export async function POST(request) {
  try {
    const { regNo, dateStr, remarks } = await request.json();

    if (!regNo || !dateStr) {
      return NextResponse.json(
        { success: false, error: 'regNo and dateStr are required' },
        { status: 400 }
      );
    }

    await approveFA(regNo, dateStr, remarks ?? 'NA');
    return NextResponse.json(
      { success: true, message: 'FA verified successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[fa-verify]', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: 'GET not allowed' }, { status: 405 });
}
