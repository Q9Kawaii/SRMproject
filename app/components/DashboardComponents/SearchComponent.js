"use client";
import React from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// Renders one field: either as plain text or a URL based on isUrl
const DetailItem = ({ label, value, isUrl }) => {
  let displayValue;

  if (typeof value === "object" && value !== null) {
    displayValue = <span className="text-gray-400 italic">[Object]</span>;
  } else if (isUrl && typeof value === "string") {
    displayValue = (
      <a
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#3a5b72] hover:text-[#0c4da2] underline font-medium transition-colors duration-200 break-all"
      >
        {value}
      </a>
    );
  } else {
    displayValue = value || <span className="text-gray-400 italic">N/A</span>;
  }
}

// Full field config with ids where needed
const FIELD_CONFIG = [
  { label: "Registration Number", name: "regNo", readOnly: true },
  { label: "Name Of Student", name: "name" },
  { label: "Gender", name: "gender" },
  { label: "NRI Student", name: "isNRI" },
  { label: "Date of Birth (D.O.B.)", name: "dob", type: "date" },
  { label: "Department", name: "department" },
  { label: "Specialization", name: "specialization" },
  { label: "Section", name: "section" },
  { label: "Official Email", name: "email", type: "email" },
  { label: "Personal Email", name: "personalEmail", type: "personalEmail" },
  { label: "Mobile No.", name: "phone", type: "tel" },
  { label: "Alternate Contact Number", name: "alternatePhone", type: "tel" },
  { label: "Father Mobile No.", name: "fatherPhone", type: "tel" },
  { label: "Father Email ID", name: "parentEmail", type: "email" },
  { label: "Mother Mobile No.", name: "motherPhone", type: "tel" },
  { label: "Mother Email ID", name: "motherEmail", type: "email" },
  { label: "Guardian Contact Number", name: "guardianPhone", type: "tel" },
  { label: "Name of Faculty Advisor", name: "advisorName" },
  { label: "Languages Known", name: "languages" },
  { label: "10th %age", name: "percent10" },
  { label: "10th Medium of Instruction", name: "10thMediumofInstruction" },
  { label: "10th Board Of Studies", name: "board10" },
  { label: "Studied Diploma", name: "studied极狐Diploma" },
  { label: "12th %age", name: "percent12" },
  { label: "12th Medium of Instruction", name: "12thMediumofInstruction" },
  { label: "12th Board Of Studies", name: "board12" },
  { label: "Copy of 10th & 12th Marksheet", name: "Copyof10th&12thMarksheet" },
  { label: "CGPA", name: "cgpa" },
  { label: "Standing Arrears", name: "standingArrears" },
  { label: "History of Arrears", name: "historyArrears" },
  { label: "GitHub Profile Link", name: "githubLink", id: "link" },
  { label: "Coding Practice Platform", name: "CodingPracticePlatform" },
  { label: "Internship Experience", name: "internshipExperience" },
  { label: "Internship Experience in Months", name: "internshipMonths" },
  { label: "Training Company Details(name,location,year,month)", name: "trainingDetails" },
  { label: "Programming Skillset", name: "skillset" },
  { label: "Standard Certification Courses Completed", name: "StdCertificationCourses" },
  { label: "Application Development Experience", name: "AppDevExp" },
  { label: "Currently Available Application Name", name: "currentApps" },
  { label: "FSD Experience", name: "fsdExp" },
  { label: "Currently Available FSD Apps Name", name: "currentFSD" },
  { label: "Coding Competitions", name: "codingCompetitionswon" },
  { label: "Hackathons", name: "hackathonswon" },
  { label: "Hackathon Names", name: "hackathonNames" },
  { label: "Other Coding Events", name: "otherCodingEvents" },
  { label: "Inhouse Projects", name: "inhouseProjects" },
  { label: "Achievements", name: "achievements" },
  { label: "Membership of Professional Bodies", name: "memberships" },
  { label: "Assessment Score (SHL/NCET)", name: "assessmentScore" },
  { label: "Career Plans", name: "careerPlans" },
  { label: "GitHub No. of Contributions", name: "githubContri" },
  { label: "GitHub Frequency of Contributions", name: "githubContriFreq" },
  { label: "Projects done for comunity", name: "ProjectsDoneForComunity" },
  { label: "GitHub Collaborations", name: "githubCollaborations" },
  { label: "No of Badges Earned", name: "BadgesEarned" },
  { label: "No of Medium & Difficult Questions Solv.", name: "MediumDifficultQuestions" },
  { label: "IIT, NIT, SRM internship Cycle", name: "eliteInternshipCycle" },
  { label: "Fortune 500 Companies", name: "Fortune500" },
  { label: "Small Companies", name: "SmallCompanies" },
  { label: "Internship Duration < 3 Months", name: "internshipShort" },
  { label: "Paid Intern", name: "internshipPaid" },
  { label: "CISCO, CCNA, CCNP, MCNA, MCNP, Matlab, Redhat, IBM", name: "ciscolist" },
  { label: "NPTEL", name: "nptel" },
  { label: "Coursera", name: "coursera" },
  { label: "Programming Certificate", name: "Pcertificate" },
  { label: "Udemy/Elab", name: "udemy" },
  { label: "IIT,NIT,DRDO Projects", name: "eliteProjects" },
  { label: "Govt Projects", name: "govtprojects" },
  { label: "Mobile & Web App Projects", name: "mobilewebProjects" },
  { label: "Mini Project", name: "miniprojects" },
  { label: "FSD Project", name: "fsdProjects" },
  { label: "First Prize", name: "firstprize" },
  { label: "Second Prize", name: "secondprize" },
  { label: "Third Prize", name: "thirdprize" },
  { label: "Participated", name: "participated" },
  { label: "Inhouse Projects", name: "inhouseprojects" },
  { label: "Date Of Admission", name: "dateOfAdmission", type: "date" },
  { label: "Total placement marks", name: "PLM" },
];

// PDF Generation function
const generatePDF = (studentData, fieldConfig) => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text("Student Profile", 14, 15);

  const tableRows = fieldConfig.map(field => [
    field.label,
    studentData[field.name] ? String(studentData[field.name]) : "-"
  ]);

  autoTable(doc, {
    head: [["Field", "Value"]],
    body: tableRows,
    startY: 25,
    styles: { fontSize: 10, cellPadding: 2 },
    headStyles: { fillColor: [12, 77, 162] }, // Updated to match #0c4da2
  });

  const achievements = studentData.achievementsMap;
  if (achievements && typeof achievements === "object" && Object.keys(achievements).length > 0) {
    const achievementData = Object.values(achievements).map((val, idx) => {
      let title = `Achievement ${idx + 1}`;
      let link = "";
      if (typeof val === "string") {
        const parts = val.split("~");
        title = parts[0]?.trim() || title;
        link = parts[1]?.trim() || "No link";
      }
      return [title, link];
    });

    doc.addPage();
    doc.setFontSize(16);
    doc.text("Achievements", 14, 15);

    autoTable(doc, {
      startY: 20,
      head: [["Title", "Link"]],
      body: achievementData,
      styles: { fontSize: 10, cellPadding: 2 },
      headStyles: { fillColor: [58, 91, 114] }, // Updated to match #3a5b72
      columnStyles: {
        1: { cellWidth: 120 },
      },
    });
  }

  doc.save("student_profile.pdf");
};

// Main UI Component
export default function SearchComponent({ studentData }) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-[#3a5b72] rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-pulse delay-1000"></div>
      </div>

      {/* Floating Geometric Shapes */}
      <div className="absolute top-20 left-20 w-4 h-4 bg-[#0c4da2] transform rotate-45 animate-bounce delay-300"></div>
      <div className="absolute top-40 right-32 w-6 h-6 bg-[#3a5b72] rounded-full animate-bounce delay-700"></div>
      <div className="absolute bottom-40 left-32 w-5 h-5 bg-blue-400 transform rotate-45 animate-bounce delay-1000"></div>

      <div className="relative z-10 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-blue-100 m-4 overflow-hidden">
        {/* Header gradient accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72]"></div>
        
        <div className="p-8">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72] rounded-full flex items-center justify-center shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-[#0c4da2] relative">
                Student Profile
                <div className="absolute -bottom-2 left-0 w-3/4 h-1 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72] rounded-full"></div>
              </h2>
            </div>

            {/* Download Button */}
            <button
              className="px-8 py-3 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 hover:from-[#3a5b72] hover:to-[#0c4da2] flex items-center gap-3"
              onClick={() => generatePDF(studentData, FIELD_CONFIG)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-4-4m4 4l4-4m-4-10v4" />
              </svg>
              Download PDF
            </button>
          </div>

          {/* Student Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {FIELD_CONFIG.map(({ label, name, id }) => (
              <DetailItem
                key={name}
                label={label}
                value={studentData[name]}
                isUrl={id === "link"}
              />
            ))}
          </div>

          {/* Achievements Section */}
          {studentData.achievementsMap && Object.keys(studentData.achievementsMap).length > 0 && (
            <div className="bg-blue-50/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-200 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72] rounded-full flex items-center justify-center shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-[#0c4da2]">Achievements</h3>
                <div className="flex-1 h-1 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72] rounded-full ml-4"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.values(studentData.achievementsMap).map((val, i) => {
                  const [title, link] = val.split("~");
                  return (
                    <div key={i} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-bold text-[#0c4da2] mb-2">{title}</h4>
                          {link && (
                            <a
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-[#3a5b72] hover:text-[#0c4da2] font-medium transition-colors duration-200"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              View Evidence
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
