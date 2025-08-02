"use client";
import { useState } from "react";
import { Users, UserPlus, BarChart3, GraduationCap } from "lucide-react";
import AddStudentForm from "./AddStudentForm";
import StudentsTable from "./StudentsTable";
import MarksTable from "./MarksTable";
import CompleteStudentForm from "./CompleteStudentForm";

export default function EmailSystem({ SectionofFA, nameOfFA }) {
  const [showForm, setShowForm] = useState(false);
  const [showMarksTable, setShowMarksTable] = useState(false);
  

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">\
      </div>

      {/* Floating Geometric Shapes */}
      <div className="absolute top-20 left-20 w-4 h-4 bg-[#0c4da2] transform rotate-45 animate-bounce delay-300"></div>
      <div className="absolute top-40 right-32 w-6 h-6 bg-[#3a5b72] rounded-full animate-bounce delay-700"></div>
      <div className="absolute bottom-40 left-32 w-5 h-5 bg-blue-400 transform rotate-45 animate-bounce delay-1000"></div>

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-block p-6 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl mb-6 border border-blue-100 hover:shadow-3xl transition-all duration-500">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-14 h-14 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72] rounded-full flex items-center justify-center shadow-lg">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div className="w-16 h-1 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72] rounded-full"></div>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0c4da2] mb-2 relative">
              Student Attendance Management System
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72] rounded-full"></div>
            </h1>
          </div>
        </div>

        {/* Control Buttons */}
        {/* <div className="mb-8 w-full flex flex-col sm:flex-row sm:justify-center gap-6">
          <button
            onClick={() => setShowForm((prev) => !prev)}
            className="group relative w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72] text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-500 hover:from-[#3a5b72] hover:to-[#0c4da2] overflow-hidden"
          >
            <div className="flex items-center justify-center gap-3">
              {showForm ? (
                <Users className="w-5 h-5" />
              ) : (
                <UserPlus className="w-5 h-5" />
              )}
              <span className="text-lg">
                {showForm ? "View Students" : "Add New Student"}
              </span>
            </div>
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div> */}

        {/* Content Area */}
        <div className="w-full relative">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-blue-100 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72]"></div>
            
            <div className="p-6">
              {showForm ? (
                <CompleteStudentForm />
              ) : showMarksTable ? (
                <MarksTable />
              ) : (
                <StudentsTable SectionofFA={SectionofFA} nameOfFA={nameOfFA}/>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 space-y-2">
          <p className="text-sm text-[#0c4da2] font-medium italic bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 inline-block shadow-md">
            Efficient student management for academic excellence
          </p>
          <p className="text-xs text-gray-600 bg-white/50 backdrop-blur-sm rounded-full px-3 py-1 inline-block shadow-sm">
            SRM Institute of Science and Technology
          </p>
        </div>
      </div>
    </div>
  );
}
