// pages/api/reject-pending-update/route.js
import { NextResponse } from "next/server";
import { rejectPendingUpdate } from '@/app/components/Achievements/achievementFns';

export async function POST(req) {
  try {
    const { regNo, remarks } = await req.json();

    if (!regNo) {
      return NextResponse.json({
        success: false,
        message: "Missing regNo"
      });
    }

    // Call the updated backend function with both regNo and remarks
    const response = await rejectPendingUpdate(regNo, remarks);
    return NextResponse.json(response);
  } catch (err) {
    console.error("API error in reject-pending-update:", err);
    return NextResponse.json({
      success: false,
      message: "Server error"
    });
  }
}
