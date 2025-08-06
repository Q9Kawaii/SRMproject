// app/api/get-all-students-achievements/route.js
import { NextResponse } from "next/server";
import { getAllStudentsAchievements } from '@/app/components/Achievements/achievementFns'; // Adjust path if necessary

export async function POST(req) { // Using POST for consistency with other APIs
    try {
        const response = await getAllStudentsAchievements();
        return NextResponse.json(response);
    } catch (err) {
        console.error("API error in get-all-students-achievements:", err);
        return NextResponse.json({
            success: false,
            message: "Server error",
            data: []
        });
    }
}