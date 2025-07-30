import { NextResponse } from "next/server";
import { approvePendingUpdate } from '@/app/components/achievementFns';


export async function POST(req) {
  try {
    
    console.log("[API] /api/approve-pending-update HIT");
    const { regNo } = await req.json();

    if (!regNo) {
      return NextResponse.json({
        success: false,
        message: "Missing regNo"
      });
    }

    const response = await approvePendingUpdate(regNo);
    return NextResponse.json(response);
  } catch (err) {
    console.error("API error in approve-pending-update:", err);
    return NextResponse.json({
      success: false,
      message: "Server error"
    });
  }
}
