"use client";
import React from "react";
import { useRouter } from "next/navigation";

export default function DashCards({ onCardClick, secRole, SectionofFA, nameOfFA }) {
  const router = useRouter();

  const goToAdminAttendance = () => {
    if (!secRole) {
      alert("No secRole assigned. Contact admin.");
      return;
    }

    router.push(`/admin-attendance?role=${secRole}&section=${SectionofFA}`)
  };

  const goToPlacementMatrix = () => {
    router.push('/placement-matrix');
  };

  // Handle click events with proper event stopping
  const handleCardClick = (action, event) => {
    event.stopPropagation();
    if (typeof action === 'function') {
      action();
    } else {
      onCardClick(action);
    }
  };

  return (
    <div className="relative">
      {/* Background decoration for cards section */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-32 h-32 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-300"></div>
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-[#3a5b72] rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 px-4 py-10">
        {/* Upload Attendance Card */}
        <div 
          className="group relative h-[220px] w-full rounded-3xl shadow-lg bg-white/80 backdrop-blur-sm border border-blue-100 flex flex-col items-center justify-center text-center px-10 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl cursor-pointer overflow-hidden"
          onClick={(e) => handleCardClick(goToAdminAttendance, e)}
        >
          <span className="absolute top-0 left-0 w-full h-1 rounded-t-3xl bg-gradient-to-r from-[#0c4da2] to-[#3a5b72]"></span>
          
          <div className="w-14 h-14 mb-5 flex items-center justify-center rounded-full shadow-md bg-gradient-to-r from-[#0c4da2] to-[#3a5b72] text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          
          <h1 className="font-bold text-2xl text-[#0c4da2] mb-3">
            Upload Attendance
          </h1>
          <p className="text-sm text-gray-600">
            Upload and update attendance<br />quickly and efficiently!
          </p>
          
          <div className="absolute inset-0 rounded-3xl bg-[#0c4da2]/0 group-hover:bg-[#0c4da2]/5 transition-colors pointer-events-none" />
        </div>

        {/* Email System Card */}
        <div 
          className="group relative h-[220px] w-full rounded-3xl shadow-lg bg-white/80 backdrop-blur-sm border border-blue-100 flex flex-col items-center justify-center text-center px-10 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl cursor-pointer overflow-hidden"
          onClick={(e) => handleCardClick("emailSystem", e)}
        >
          <span className="absolute top-0 left-0 w-full h-1 rounded-t-3xl bg-gradient-to-r from-[#0c4da2] to-[#3a5b72]"></span>
          
          <div className="w-14 h-14 mb-5 flex items-center justify-center rounded-full shadow-md bg-gradient-to-r from-[#0c4da2] to-[#3a5b72] text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          
          <h1 className="font-bold text-2xl text-[#0c4da2] mb-3">
            Email System
          </h1>
          <p className="text-sm text-gray-600">
            Send updates to students or parents.<br />Keep communication clear!
          </p>
          
          <div className="absolute inset-0 rounded-3xl bg-[#0c4da2]/0 group-hover:bg-[#0c4da2]/5 transition-colors pointer-events-none" />
        </div>

        {/* Achievements Card */}
        <div 
          className="group relative h-[220px] w-full rounded-3xl shadow-lg bg-white/80 backdrop-blur-sm border border-blue-100 flex flex-col items-center justify-center text-center px-10 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl cursor-pointer overflow-hidden"
          onClick={(e) => handleCardClick("Achievements", e)}
        >
          <span className="absolute top-0 left-0 w-full h-1 rounded-t-3xl bg-gradient-to-r from-[#0c4da2] to-[#3a5b72]"></span>
          
          <div className="w-14 h-14 mb-5 flex items-center justify-center rounded-full shadow-md bg-gradient-to-r from-[#0c4da2] to-[#3a5b72] text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          
          <h1 className="font-bold text-2xl text-[#0c4da2] mb-3">
            Achievements
          </h1>
          <p className="text-sm text-gray-600">
            Showcase student milestones and<br />celebrate success!
          </p>
          
          <div className="absolute inset-0 rounded-3xl bg-[#0c4da2]/0 group-hover:bg-[#0c4da2]/5 transition-colors pointer-events-none" />
        </div>

        {/* Placement Matrix Card - Updated to redirect to /placement-matrix */}
        <div 
          className="group relative h-[220px] w-full rounded-3xl shadow-lg bg-white/80 backdrop-blur-sm border border-blue-100 flex flex-col items-center justify-center text-center px-10 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl cursor-pointer overflow-hidden"
          onClick={(e) => handleCardClick(goToPlacementMatrix, e)}
        >
          <span className="absolute top-0 left-0 w-full h-1 rounded-t-3xl bg-gradient-to-r from-[#0c4da2] to-[#3a5b72]"></span>
          
          <div className="w-14 h-14 mb-5 flex items-center justify-center rounded-full shadow-md bg-gradient-to-r from-[#0c4da2] to-[#3a5b72] text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
            </svg>
          </div>
          
          <h1 className="font-bold text-2xl text-[#0c4da2] mb-3">
            Placement Matrix
          </h1>
          <p className="text-sm text-gray-600">
            Track placement statistics and<br />analyze performance!
          </p>
          
          <div className="absolute inset-0 rounded-3xl bg-[#0c4da2]/0 group-hover:bg-[#0c4da2]/5 transition-colors pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
