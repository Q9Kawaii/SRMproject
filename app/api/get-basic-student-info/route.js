// app/api/get-basic-student-info/route.js or route.ts
import { getBasicStudentInfo } from "../../components/Achievements/achievementFns";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { regNo } = body;

    if (!regNo) {
      return NextResponse.json({ success: false, message: "regNo missing" }, { status: 400 });
    }

    const result = await getBasicStudentInfo(regNo);

    return NextResponse.json(result);
  } catch (err) {
    console.error("API error in getBasicStudentInfo:", err);
    return NextResponse.json({ success: false, message: "Server error", data: {} }, { status: 500 });
  }
}
