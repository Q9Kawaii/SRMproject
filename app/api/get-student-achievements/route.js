import { NextResponse } from 'next/server';
import { getStudentAchievements } from '@/app/components/Achievements/achievementFns';

export async function POST(request) {
  try {
    const { regNo } = await request.json();

    if (!regNo) {
      return NextResponse.json({ success: false, message: 'Missing registration number', data: {} }, { status: 400 });
    }

    const response = await getStudentAchievements(regNo);
    return NextResponse.json(response); // ✅ Directly return structured response
  } catch (error) {
    console.error('Error fetching student achievements:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch achievements', data: {} }, { status: 500 });
  }
}
