// pages/api/dismiss-remark/route.js
import { NextResponse } from "next/server";
import { dismissRemark } from '@/app/components/Achievements/achievementFns';

export async function POST(req) {
  try {
    const { regNo } = await req.json();

    if (!regNo) {
      return NextResponse.json({
        success: false,
        message: "Missing regNo"
      });
    }

    const response = await dismissRemark(regNo);
    return NextResponse.json(response);
  } catch (err) {
    console.error("API error in dismiss-remark:", err);
    return NextResponse.json({
      success: false,
      message: "Server error"
    });
  }
}
