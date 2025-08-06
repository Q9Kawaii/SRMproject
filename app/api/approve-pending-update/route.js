// pages/api/approve-pending-update/route.js
import { NextResponse } from "next/server";
import { approvePendingUpdate } from '@/app/components/Achievements/achievementFns';

export async function POST(req) {
  try {
    console.log("[API] /api/approve-pending-update HIT");
    // Destructure remarks from the request body as well
    const { regNo, remarks } = await req.json(); 

    if (!regNo) {
      return NextResponse.json({
        success: false,
        message: "Missing regNo"
      });
    }

    // Pass the remarks to the backend function
    const response = await approvePendingUpdate(regNo, remarks); 
    return NextResponse.json(response);
  } catch (err) {
    console.error("API error in approve-pending-update:", err);
    return NextResponse.json({
      success: false,
      message: "Server error"
    });
  }
}
