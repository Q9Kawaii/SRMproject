"use client";
import React from 'react';

export default function DashCards({ onCardClick }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 px-4 py-8">

      {/* Upload Attendance Card */}
      <a href="https://university-portal-pink.vercel.app/" target='_blank' className="block relative h-[200px] w-full">
  <div className="h-full w-full bg-green-100 rounded-xl flex flex-col items-center justify-center p-10 text-center shadow-md transition">
    <h1 className="font-bold text-3xl text-green-600">Upload Attendance</h1>
    <p className="pt-6 text-green-500">
      Upload and update attendance
      <br /> quickly and efficiently!
    </p>
  </div>
  <div className="absolute inset-0 rounded-xl hover:bg-green-200/20 z-10" />
</a>


      {/* Email System Card */}
      <div className="relative h-[200px] w-full">
        <div className="h-full w-full bg-yellow-100 rounded-xl flex flex-col items-center justify-center p-10 text-center shadow-md transition">
          <h1 className="font-bold text-3xl text-yellow-600">Email System</h1>
          <p className="pt-6 text-yellow-500">
            Send updates to students or parents.
            <br /> Keep communication clear!
          </p>
        </div>
        <div
          onClick={() => onCardClick("emailSystem")}
          className="absolute inset-0 rounded-xl cursor-pointer hover:bg-yellow-200/20 z-10"
        />
      </div>

    </div>
  );
}
