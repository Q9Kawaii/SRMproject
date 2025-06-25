"use client";
import React from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// Renders one field: either as plain text or a URL based on isUrl
const DetailItem = ({ label, value, isUrl }) => (
  <div>
    <span className="font-medium">{label}: </span>
    {isUrl && value ? (
      <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
        {value}
      </a>
    ) : (
      <span>{value || "-"}</span>
    )}
  </div>
);

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
  { label: "Placed via SRM Placement Process", name: "internshipViaSRM" },
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
    headStyles: { fillColor: [30, 64, 175] },
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
      headStyles: { fillColor: [34, 139, 34] },
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
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Student Profile</h2>
      <button
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => generatePDF(studentData, FIELD_CONFIG)}
      >
        Download PDF
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FIELD_CONFIG.map(({ label, name, id }) => (
          <DetailItem
            key={name}
            label={label}
            value={studentData[name]}
            isUrl={id === "link"}
          />
        ))}

        {/* Achievements Section */}
        {studentData.achievementsMap && Object.keys(studentData.achievementsMap).length > 0 && (
          <div className="mt-8 col-span-full">
            <h3 className="text-xl font-semibold text-blue-700 mb-2">Achievements</h3>
            <ul className="list-disc list-inside">
              {Object.values(studentData.achievementsMap).map((val, i) => {
                const [title, link] = val.split("~");
                return (
                  <li key={i} className="mb-1">
                    <strong>{title}</strong>{" "}
                    {link && (
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline ml-2"
                      >
                        [View]
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
