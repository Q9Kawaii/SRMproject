"use client";
import { useState } from "react";
import AddStudentForm from "./AddStudentForm";
import StudentsTable from "./StudentsTable";
import MarksTable from "./MarksTable";
import CompleteStudentForm from "./CompleteStudentForm";

export default function EmailSystem() {
  const [showForm, setShowForm] = useState(false);
  const [showMarksTable, setShowMarksTable] = useState(false);

  return (
    <div className="max-w-7xl mx-auto flex flex-col items-center px-4 py-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center">
        Student Attendance Management System
      </h1>

      <div className="mb-4 w-full flex flex-col sm:flex-row sm:justify-center gap-4">
        <button
          onClick={() => setShowForm((prev) => !prev)}
          className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {showForm ? "View Students" : "Add New Student"}
        </button>

        <button
          onClick={() => setShowMarksTable((prev) => !prev)}
          className="w-full sm:w-auto px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          {showMarksTable ? "View Attendance Table" : "View Marks Table"}
        </button>
      </div>

      <div className="w-full">
        {showForm ? (
          // <AddStudentForm />
          <CompleteStudentForm/>
        ) : showMarksTable ? (
          <MarksTable />
        ) : (
          <StudentsTable />
        )}
      </div>
    </div>
  );
}
