"use client";
import React, { useState, useEffect } from "react";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import AnimatedBlob from "./DashboardComponents/AnimatedBlob";
import DashCards from "./DashboardComponents/DashCards";
import UploadSystem from "./Upload-Attendance/UploadSystem";
import EmailSystem from "./Email-System/EmailSystem";
import HamsterLoader from "./DashboardComponents/HamsterLoader"; // ✅ Import hamster loader
import AchievementsTable from "./Achievements/AchievementsTable";
import TeacherVerificationTable from "../placement-matrix/TeacherVerificationTable";

import { useRouter } from 'next/navigation';

import { Copy, Shield, BookOpen, Users, TrendingUp } from 'lucide-react';
import AdminAchievementDashboard from "./Achievements/AdminAchievementDashboard";


export default function AdminDashBoard({ secRole, SectionofFA, nameOfFA }) {
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [searchError, setSearchError] = useState("");
  const [loading, setLoading] = useState(false);
  const db = getFirestore();
  const router = useRouter();

  const handlePlacementMatrixRedirect = () => {
    router.push('/placement-matrix');
  };

  const handleCardClick = (type) => {
  // Special handling for AA role clicking Email System
  if (type === "emailSystem" && secRole === "AA") {
    router.push('/AAlogsForFAs');
    return;
  }
  
  setSelectedComponent(type);
};


  const renderComponent = () => {

  switch (selectedComponent) {
    case "uploadAttendance":
      return <UploadSystem />;
    case "emailSystem":
      // Double check: if somehow AA reaches here, redirect
      if (secRole === "AA") {
        router.push('/AAlogsForFAs');
        return null;
      }
      return <EmailSystem secRole={secRole} SectionofFA={SectionofFA} nameOfFA={nameOfFA}/>;
      
    case "Achievements":
      return <AdminAchievementDashboard secRole={secRole} SectionofFA={SectionofFA} />
    case "TeacherVerificationTable":
      return <TeacherVerificationTable/>
    default:
      return null;
  }
};


  return (
    <>
      <div className="relative min-h-screen w-full flex flex-col items-center justify-center text-center px-4 pt-10 overflow-hidden -mb-40 lg:items-end lg:text-end lg:pb-40 lg:pr-[10%]">
  {/* Animated Background Elements */}

  {/* Floating Geometric Shapes */}
  <div className="absolute top-20 left-20 w-4 h-4 bg-[#0c4da2] transform rotate-45 animate-bounce delay-300"></div>
  <div className="absolute top-40 right-32 w-6 h-6 bg-[#3a5b72] rounded-full animate-bounce delay-700"></div>
  <div className="absolute bottom-40 left-32 w-5 h-5 bg-blue-400 transform rotate-45 animate-bounce delay-1000"></div>
  <div className="absolute top-60 left-1/3 w-3 h-3 bg-[#0c4da2] rounded-full animate-bounce delay-1500"></div>

  <div
    className="absolute inset-0 bg-cover bg-center bg-no-repeat -z-10 opacity-10"
    style={{
      backgroundImage: 'url("/Dashboard-bg4.jpg")',
      backgroundSize: "contain",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "0% -55px",
    }}
  />

  <div className="relative z-10 w-full max-w-3xl">
    
    {/* Header Section with Glass-morphism */}
    <div className="inline-block p-6 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl mb-8 border border-blue-100 hover:shadow-3xl transition-all duration-500 hover:-translate-y-1">
    <div className="w-12 h-12 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72] rounded-full flex items-center justify-center shadow-lg">
          <Shield className="w-6 h-6 text-white" />
        </div>
      <h1 className="text-3xl sm:text-4xl font-bold mb-3 lg:mb-6 lg:text-7xl">
        <span className="text-[#0c4da2] relative">
          {secRole}
          <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72] rounded-full"></div>
        </span>{" "}
        <span className="text-[#3a5b72]">Dashboard </span>
        
      </h1>

      

      <p className="text-lg text-[#0c4da2] font-bold mb-2 lg:text-3xl">
        Welcome {nameOfFA},
      </p>
      <p className="text-sm text-gray-700 mb-6 lg:text-[20px] font-medium">
        Search for a student by registration number to view their full profile.
      </p>
    </div>

    {/* Search Section
    // <div className="mb-8">
    //   <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-blue-100 hover:shadow-xl transition-all duration-300">
    //     <SearchBar onSearch={handleSearch} />
    //   </div>
    // </div> */}

    {/* Loading and Error States */}
    {loading && (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-blue-100 mb-6">
        <HamsterLoader />
      </div>
    )}
    
    {searchError && (
      <div className="mb-6 p-4 bg-red-50/90 backdrop-blur-sm border border-red-200 rounded-xl shadow-lg">
        <p className="text-red-600 font-medium">{searchError}</p>
      </div>
    )}

    {/* Footer Section */}
    <div className="space-y-3">
      <p className="text-sm text-[#0c4da2] font-medium italic bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 inline-block shadow-md">
        Track attendance, academics, and placement progress
      </p>

      <p className="text-xs text-gray-600 bg-white/50 backdrop-blur-sm rounded-full px-3 py-1 inline-block shadow-sm">
        SRM Institute of Science and Technology – Empowering Students for the Future
      </p>
    </div>
  </div>
</div>

{/* Dashboard Cards with Enhanced Styling */}
<div className="relative">
  {/* Background decoration for cards section */}
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute top-10 right-10 w-32 h-32 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-300"></div>
    <div className="absolute bottom-10 left-10 w-40 h-40 bg-[#3a5b72] rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-pulse delay-700"></div>
  </div>
  
  <DashCards secRole={secRole} SectionofFA={SectionofFA} nameOfFA={nameOfFA} onCardClick={handleCardClick} />
</div>

{/* Main Content Area */}
<div className="px-4 py-8 w-full max-w-7xl mx-auto -mb-60 md:-mb-15 relative">
  {/* Background elements for content area */}
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-20 left-1/4 w-24 h-24 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-500"></div>
    <div className="absolute bottom-20 right-1/4 w-32 h-32 bg-[#3a5b72] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
  </div>
  
  <div className="relative z-10">
    {renderComponent()}
  </div>
  {/* --- NEW BUTTON ADDED HERE --- */}
                {/* Replaced next/link with standard <a> tag */}
                <a href="/addNewSection" className="flex items-center gap-2 text-xs font-medium text-white bg-gradient-to-r from-[#0c4da2] to-[#3a5b72] px-3 py-1.5 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 w-[100px]">
                    <span>Add New Section</span>
                </a>
                {/* --- END OF NEW BUTTON --- */}
</div>

    </>
  );
}