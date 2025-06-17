"use client";
import React from 'react';

const DetailItem = ({ label, value, isUrl = false }) => (
  <div className="flex justify-between items-start py-2 border-b">
    <span className="font-medium text-gray-700">{label}:</span>
    {isUrl ? (
      <a 
        href={value} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline break-all max-w-[60%] text-right"
      >
        {value || "N/A"}
      </a>
    ) : (
      <span className="text-gray-900 max-w-[60%] text-right">{value || "N/A"}</span>
    )}
  </div>
);

export default function SearchComponent({ studentData }) {
  if (!studentData) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Student Profile</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
          <DetailItem label="Name" value={studentData.name} />
          <DetailItem label="Registration Number" value={studentData.regNo} />
          <DetailItem label="Programme" value={studentData.programme} />
          <DetailItem label="Semester" value={studentData.semester} />
          <DetailItem label="Batch" value={studentData.batch} />
          <DetailItem label="Date of Admission" value={studentData.dateOfAdmission} />
          <DetailItem label="Section" value={studentData.section} />
          <DetailItem label="Date of Birth" value={studentData.dob} />
          <DetailItem label="Net-ID" value={studentData.netId} />
          <DetailItem label="Official Email" value={studentData.email} />
          <DetailItem label="Mobile No" value={studentData.phone} />
        </div>

        {/* Academic Information */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold mb-3">Academic Details</h3>
          <DetailItem label="10th Board" value={studentData.board10} />
          <DetailItem label="10th Percentage" value={studentData.percent10} />
          <DetailItem label="12th Board" value={studentData.board12} />
          <DetailItem label="12th Percentage" value={studentData.percent12} />
          <DetailItem label="Studied Diploma" value={studentData.studiedDiploma} />
          <DetailItem label="CGPA" value={studentData.cgpa} />
          <DetailItem label="Standing Arrears" value={studentData.standingArrears} />
          <DetailItem label="History of Arrears" value={studentData.historyArrears} />
          <DetailItem label="GitHub Profile" value={studentData.github} isUrl />
        </div>

        {/* Professional Development */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold mb-3">Professional Details</h3>
          <DetailItem label="Internship Experience (Months)" value={studentData.internshipMonths} />
          <DetailItem label="Industrial Trainings" value={studentData.industrialTrainingCount} />
          <DetailItem label="Certifications" value={studentData.certifications} />
          <DetailItem label="Programming Skills" value={studentData.skillset} />
          <DetailItem label="Current Application" value={studentData.currentApp} />
          <DetailItem label="FSD Experience" value={studentData.fsdExp} />
          <DetailItem label="Coding Competitions" value={studentData.codingCompetitions} />
          <DetailItem label="Hackathons" value={studentData.hackathons} />
          <DetailItem label="Career Plans" value={studentData.careerPlans} />
        </div>
      </div>
    </div>
  );
}
