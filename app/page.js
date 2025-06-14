"use client";
import { useState } from "react";
import AddStudentForm from "./components/AddStudentForm";
import StudentsTable from "./components/StudentsTable";

export default function Home() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="max-w-7xl mx-auto flex flex-col items-center px-4 py-6 ">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center">
        Student Attendance Management System
      </h1>

      <div className="mb-4 w-full flex justify-center">
        <button
          onClick={() => setShowForm((prev) => !prev)}
          className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {showForm ? "View Students" : "Add New Student"}
        </button>
      </div>

      <div className="w-full">
        {showForm ? <AddStudentForm /> : <StudentsTable />}
      </div>
    </div>
  );
}