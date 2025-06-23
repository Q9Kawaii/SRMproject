"use client";
import React, { useState, useEffect } from "react";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import SearchBar from "./DashboardComponents/SearchBar";
import AnimatedBlob from "./DashboardComponents/AnimatedBlob";
import DashCards from "./DashboardComponents/DashCards";
import UploadSystem from "./UploadSystem";
import EmailSystem from "./EmailSystem";
import SearchComponent from "./SearchComponent";
import HamsterLoader from "./HamsterLoader"; // ✅ Import hamster loader

export default function AdminDashBoard() {
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState("");
  const [loading, setLoading] = useState(false);
  const db = getFirestore();

  const handleSearch = async (regNo) => {
    try {
      setLoading(true);
      setSearchError("");
      setSearchResult(null);

      const studentRef = doc(db, "User", regNo);
      const studentSnap = await getDoc(studentRef);

      if (studentSnap.exists()) {
        setSearchResult({ ...studentSnap.data(), regNo });
      } else {
        setSearchError("No student found with this registration number");
      }
    } catch (err) {
      setSearchError("Error searching student: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (type) => {
    setSelectedComponent(type);
    setSearchResult(null);
  };

  const renderComponent = () => {
    if (searchResult) return <SearchComponent studentData={searchResult} />;

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
      <div className="relative min-h-screen w-full flex flex-col items-center justify-center text-center px-4 pt-10 overflow-hidden -mb-40 lg:items-end lg:text-end lg:pb-40 lg:pr-[10%] ">
        <AnimatedBlob />

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
            <SearchBar onSearch={handleSearch} />
          </div>

          {loading && <HamsterLoader />} {/* ✅ Show hamster loader */}
          {searchError && <p className="text-red-500 mb-2">{searchError}</p>}

          <p className="text-sm text-blue-700 italic mb-4">
            Track attendance, academics, and placement progress
          </p>

          <p className="text-xs text-gray-500">
            SRM Institute of Science and Technology – Empowering Students for the Future
          </p>
        </div>
      </div>

      <DashCards onCardClick={handleCardClick} />

      <div className="px-4 py-8 w-full max-w-7xl mx-auto -mb-60 md:-mb-15">
        {renderComponent()}
      </div>
    </>
  );
}
