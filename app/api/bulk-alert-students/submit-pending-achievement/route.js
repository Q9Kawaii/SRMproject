// pages/api/submit-pending-achievement/route.js
import { NextResponse } from 'next/server';
import { submitPendingAchievement } from '@/app/components/Achievements/achievementFns';

export async function POST(request) {
  try {
    const body = await request.json();
    // Now expecting regNo, category, and achievementData (which contains the ID)
    const { regNo, category, achievementData } = body; 

    if (!regNo || !category || !achievementData) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields (regNo, category, achievementData).' },
        { status: 400 }
      );
    }

    // Call the updated function
    const result = await submitPendingAchievement(regNo, category, achievementData); 
    return NextResponse.json(result);
  } catch (err) {
    console.error('API Error in submit-pending-achievement:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    );
  }
}