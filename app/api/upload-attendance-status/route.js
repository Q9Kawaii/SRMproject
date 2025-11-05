import { NextResponse } from 'next/server';
import { getStatus } from '../../../lib/status-store';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');
  
  if (!jobId) {
    return NextResponse.json({ error: 'jobId required' }, { status: 400 });
  }
  
  const status = getStatus(jobId);
  return NextResponse.json(status);
}

