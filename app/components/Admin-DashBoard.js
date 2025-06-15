"use client";
import React, { useState } from "react";
import SearchBar from "./DashboardComponents/SearchBar";
import AnimatedBlob from "./DashboardComponents/AnimatedBlob";
import DashCards from "./DashboardComponents/DashCards";
import UploadSystem from "./UploadSystem";
import EmailSystem from "./EmailSystem";

export default function AdminDashBoard() {
  const [selectedComponent, setSelectedComponent] = useState(null);

  const handleCardClick = (type) => {
    setSelectedComponent(type);
  };

  const renderComponent = () => {
    switch (selectedComponent) {
      case "uploadAttendance":
        return <UploadSystem />;
      case "emailSystem":
        return <EmailSystem />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="relative min-h-screen w-full flex flex-col items-center justify-center text-center px-4 pt-10 overflow-hidden -mb-25 lg:items-end lg:text-end lg:pb-40 lg:pr-[10%]">
        <AnimatedBlob />

        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat -z-10"
          style={{
            backgroundImage: 'url("/Dashboard-bg4.jpg")',
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "0% -55px",
          }}
        />

        <div className="relative z-10 w-full max-w-3xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-3 lg:mb-15 lg:text-7xl">
            Admin Dashboard
          </h1>

          <p className="text-lg text-gray-800 font-medium mb-2 lg:text-3xl">
            Welcome, Admin
          </p>
          <p className="text-sm text-gray-700 mb-6 lg:text-[20px]">
            Search for a student by registration number to view their full profile.
          </p>

          <div className="mb-8">
            <SearchBar />
          </div>

          <p className="text-sm text-blue-700 italic mb-4">
            Track attendance, academics, and placement progress
          </p>

          <p className="text-xs text-gray-500">
            SRM Institute of Science and Technology – Empowering Students for the Future
          </p>
        </div>
      </div>

      {/* Cards */}
      <DashCards onCardClick={handleCardClick} />

      {/* Render selected component */}
      <div className="px-4 py-8">{renderComponent()}</div>
    </>
  );
}
