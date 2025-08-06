// pages/api/delete-approved-achievement/route.js
import { NextResponse } from 'next/server';
import { deleteApprovedAchievement } from '@/app/components/Achievements/achievementFns';

export async function POST(request) {
  try {
    const body = await request.json();
    // Expecting regNo, category, and achievementId for direct deletion
    const { regNo, category, achievementId } = body;

    if (!regNo || !category || !achievementId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields (regNo, category, achievementId).' },
        { status: 400 }
      );
    }

    const result = await deleteApprovedAchievement(regNo, category, achievementId);
    return NextResponse.json(result);
  } catch (err) {
    console.error('API Error in delete-approved-achievement:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    );
  }
}