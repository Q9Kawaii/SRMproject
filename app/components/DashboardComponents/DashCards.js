"use client";
import React from 'react';

export default function DashCards({ onCardClick }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 px-4 py-8">
      
      {/* Upload Attendance Card */}
      <div
        onClick={() => onCardClick("uploadAttendance")}
        className="cursor-pointer h-[200px] w-full bg-green-100 rounded-xl flex flex-col items-center justify-center p-10 text-center shadow-md hover:bg-green-200 transition"
      >
        <h1 className="font-bold text-3xl text-green-600">Upload Attendance</h1>
        <p className="pt-6 text-green-500">
          Upload and update attendance
          <br /> quickly and efficiently!
        </p>
      </div>

      {/* Email System Card */}
      <div
        onClick={() => onCardClick("emailSystem")}
        className="cursor-pointer h-[200px] w-full bg-yellow-100 rounded-xl flex flex-col items-center justify-center p-10 text-center shadow-md hover:bg-yellow-200 transition"
      >
        <h1 className="font-bold text-3xl text-yellow-600">Email System</h1>
        <p className="pt-6 text-yellow-500">
          Send updates to students or parents.
          <br /> Keep communication clear!
        </p>
      </div>

    </div>
  );
}
