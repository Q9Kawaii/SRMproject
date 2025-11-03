// app/api/approve-single-achievement/route.js
import { NextResponse } from "next/server";
import { approveSingleAchievement } from '@/app/components/Achievements/achievementFns';

export async function POST(req) {
  try {
    console.log("[API] /api/approve-single-achievement HIT");
    const { regNo, achievementId, remarks } = await req.json();

    if (!regNo || !achievementId) {
      return NextResponse.json({
        success: false,
        message: "Missing regNo or achievementId"
      }, { status: 400 });
    }

    const response = await approveSingleAchievement(regNo, achievementId, remarks || '');
    return NextResponse.json(response);
  } catch (err) {
    console.error("API error in approve-single-achievement:", err);
    return NextResponse.json({
      success: false,
      message: "Server error"
    }, { status: 500 });
  }
}

