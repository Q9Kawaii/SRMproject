"use client";
import React from "react";
import { X } from "lucide-react";
import StudentAchievementsPortal from "./StudentAchievementsPortal";

export default function AchievementsModal({ studentRegNo, onClose }) {

    console.log("Rendering AchievementsModal for studentRegNo:", studentRegNo);
    
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-md">
      <div className="relative w-[95%] h-[95%] bg-white rounded-3xl shadow-2xl overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition"
        >
          <X className="w-6 h-6 text-gray-700" />
        </button>

        <div className="w-full h-full overflow-y-auto">
            
          <StudentAchievementsPortal
            studentRegNo={studentRegNo}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
}
