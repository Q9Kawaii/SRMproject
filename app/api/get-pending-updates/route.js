import { NextResponse } from "next/server";
import { getPendingUpdates } from '@/app/components/Achievements/achievementFns';

export async function POST(req) {
  try {
    const { identifier, type } = await req.json();

    if (!identifier || !type) {
      return NextResponse.json({
        success: false,
        message: "Missing identifier or type",
        data: {}
      });
    }

    const response = await getPendingUpdates(identifier, type);
    return NextResponse.json(response);
  } catch (err) {
    console.error("API error in get-pending-updates:", err);
    return NextResponse.json({
      success: false,
      message: "Server error",
      data: {}
    });
  }
}
