"use client";
import React from "react";

export default function NavBar() {
return (
<div className="w-[100%]">
<div className="flex justify-center items-center text-white h-6 bg-[#0c4da2] text-xs sm:text-sm">
Upper Nav (We can put something here)
</div>
<div className="bg-white flex sm:flex-row justify-between items-center px-3 py-3 gap-2">
<img src="/SRMlogo.png" className="h-12 " alt="Logo" />
<span className="text-3xl text-[#0c4da2] font-extrabold">&#9776;</span>
</div>
</div>
);
}