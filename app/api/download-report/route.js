import { NextResponse } from 'next/server';
// Changed from require to import for consistency
import { generatePdfReport } from '../../../attendanceLogic'; // Corrected path

export async function GET(request) { // Changed to App Router GET handler
  const { searchParams } = new URL(request.url); // Access query parameters
  const section = searchParams.get('section');
  const month = searchParams.get('month');

  if (!section || !month) {
    return NextResponse.json({ error: 'Missing section or month parameter.' }, { status: 400 });
  }

  try {
    const pdfBuffer = await generatePdfReport(section, month);

    if (!pdfBuffer) {
      // If generatePdfReport returns null, it means no data was found
      // Return a 204 No Content response
      return new Response(null, { status: 204 });
    }

    // Create a new Response object with the PDF buffer and appropriate headers
    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Attendance_Report_${section}_${month}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(), // Content-Length must be a string
      },
    });

  } catch (error) {
    console.error(`API Error generating report for section ${section}, month ${month}:`, error);
    return NextResponse.json(
      { error: `Failed to generate PDF report: ${error.message || 'Internal server error.'}` },
      { status: 500 }
    );
  }
}

// Optional: Add other HTTP methods if needed
export async function POST(request) {
  return NextResponse.json({ error: 'POST method not allowed for this API.' }, { status: 405 });
}