// app/api/reject-single-achievement/route.js
import { NextResponse } from "next/server";
import { rejectSingleAchievement } from '@/app/components/Achievements/achievementFns';

export async function POST(req) {
  try {
    console.log("[API] /api/reject-single-achievement HIT");
    const { regNo, achievementId, remarks } = await req.json();

    if (!regNo || !achievementId) {
      return NextResponse.json({
        success: false,
        message: "Missing regNo or achievementId"
      }, { status: 400 });
    }

    const response = await rejectSingleAchievement(regNo, achievementId, remarks || '');
    return NextResponse.json(response);
  } catch (err) {
    console.error("API error in reject-single-achievement:", err);
    return NextResponse.json({
      success: false,
      message: "Server error"
    }, { status: 500 });
  }
}

