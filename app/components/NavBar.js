"use client";
import React from "react";

export default function NavBar() {
  return (
    <div className="w-full">
      <div className="flex justify-center items-center text-white h-6 bg-[#0c4da2] text-xs sm:text-sm">
        Upper Nav (We can put something here)
      </div>
      <div className="bg-white flex flex-col sm:flex-row sm:justify-between items-center p-3 sm:p-5 gap-2">
        <img src="/SRMlogo.png" className="h-12 sm:h-[90px]" alt="Logo" />
      </div>
    </div>
  );
}