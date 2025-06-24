"use client";
import React, { useEffect, useState } from "react";
import SearchBar from "./DashboardComponents/SearchBar";
import AnimatedBlob from "./DashboardComponents/AnimatedBlob";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

//hehe

const FIELD_CONFIG = [
  // Basic Details :
  { label: "Registration Number", name: "regNo", readOnly: true },
  { label: "Name Of Student", name: "name" },
  { label: "Gender", name: "gender" },
  { label: "NRI Student", name: "isNRI" },
  { label: "Date of Birth (D.O.B.)", name: "dob", type: "date" },
  { label: "Department", name: "department" },
  { label: "Specialization", name: "specialization" },
  { label: "Section", name: "section" },
  { label: "Official Email", name: "email", type: "email" },
  { label: "Personal Email", name: "personalEmail", type: "email" },
  { label: "Mobile No.", name: "phone", type: "tel" },
  { label: "Alternate Contact Number", name: "alternatePhone", type: "tel" },
  { label: "Father Mobile No.", name: "fatherPhone", type: "tel" },
  { label: "Father Email ID", name: "fatherEmail", type: "email" },
  { label: "Mother Mobile No.", name: "motherPhone", type: "tel" },
  { label: "Mother Email ID", name: "motherEmail", type: "email" },
  { label: "Guardian Contact Number", name: "guardianPhone", type: "tel" },
  { label: "Name of Faculty Advisor", name: "advisorName" },
  { label: "Languages Known", name: "languages" },
  { label: "10th %age", name: "percent10", type: "number" },
  { label: "10th Medium of Instruction", name: "10thMediumofInstruction" },
  { label: "10th Board Of Studies", name: "board10" },
  { label: "Studied Diploma", name: "studiedDiploma" },
  { label: "12th %age", name: "percent12", type: "number" },
  { label: "12th Medium of Instruction", name: "12thMediumofInstruction" },
  { label: "12th Board Of Studies", name: "board12" },
  { label: "Copy of 10th & 12th Marksheet", name: "Copyof10th&12thMarksheet" },

  // Academic & Technical Details Format A :
  { label: "CGPA", name: "cgpa", type: "number" },
  { label: "Standing Arrears", name: "standingArrears", type: "number" },
  { label: "History of Arrears", name: "historyArrears", type: "number" },
  { label: "GitHub Profile Link", name: "githubLink" },
  { label: "Coding Practice Platform", name: "CodingPracticePlatform" },
  { label: "Internship Experience", name: "internshipExperience" },
  { label: "Internship Experience in Months", name: "internshipMonths", type: "number" },
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
  { label: "Membership of Professional Bodies", name: "memberships", type: "number" },
  { label: "Assessment Score (SHL/NCET)", name: "assessmentScore", type: "number" },
  { label: "Career Plans", name: "careerPlans" },

  // other fields from Format B :
  { label: "GitHub No. of Contributions", name: "githubContri", type: "number" },
  { label: "GitHub Frequency of Contributions", name: "githubContriFreq", type: "number" },
  { label: "Projects done for comunity", name: "ProjectsDoneForComunity", type: "number" },
  { label: "GitHub Collaborations", name: "githubCollaborations", type: "number" },
  { label: "No of Badges Earned", name: "BadgesEarned", type: "number" },
  { label: "No of Medium & Difficult Questions Solv.", name: "MediumDifficultQuestions", type: "number" },
  { label: "IIT, NIT, SRM internship Cycle", name: "eliteInternshipCycle", type: "number" },
  { label: "Fortune 500 Companies", name: "Fortune500", type: "number" },
  { label: "Small Companies", name: "SmallCompanies", type: "number" },
  { label: "Internship Duration < 3 Months", name: "internshipShort", type: "number" },
  { label: "Paid Intern", name: "internshipPaid", type: "number" },
  { label: "CISCO, CCNA, CCNP, MCNA, MCNP, Matlab, Redhat, IBM", name: "ciscolist", type: "number" },
  { label: "NPTEL", name: "nptel", type: "number" },
  { label: "Coursera", name: "coursera", type: "number" },
  { label: "Programming Certificate", name: "Pcertificate", type: "number" },
  { label: "Udemy/Elab", name: "udemy", type: "number" },
  { label: "IIT,NIT,DRDO Projects", name: "eliteProjects", type: "number" },
  { label: "Govt Projects", name: "govtprojects", type: "number" },
  { label: "Mobile & Web App Projects", name: "mobilewebProjects", type: "number" },
  { label: "Mini Project", name: "miniprojects", type: "number" },
  { label: "FSD Project", name: "fsdProjects", type: "number" },
  { label: "First Prize", name: "firstprize", type: "number" },
  { label: "Second Prize", name: "secondprize", type: "number" },
  { label: "Third Prize", name: "thirdprize", type: "number" },
  { label: "Participated", name: "participated", type: "number" },
  { label: "Inhouse Projects", name: "inhouseprojects", type: "number" },

  // Others :
  { label: "Placed via SRM Placement Process", name: "internshipViaSRM" },
  { label: "Date Of Admission", name: "dateOfAdmission", type: "date" },
];


const SCORE_CONFIG = {
  // 10th Percentage – Max 2.5 Marks
  percent10: (val) => {
    if (!val || val === "0") return 0;
    const n = parseFloat(val);
    if (n >= 96) return 2.5;
    if (n >= 91) return 2;
    if (n >= 86) return 1.5;
    if (n >= 75) return 1;
    return 0.5;
  },

  // 12th Percentage – Max 2.5 Marks
  percent12: (val) => {
    if (!val || val === "0") return 0;
    const n = parseFloat(val);
    if (n >= 96) return 2.5;
    if (n >= 91) return 2;
    if (n >= 86) return 1.5;
    if (n >= 75) return 1;
    return 0.5;
  },

  // CGPA – Max 5 Marks
  cgpa: (val) => {
    if (!val || val === "0") return 0;
    const n = parseFloat(val);
    if (n > 9.5) return 5;
    if (n >= 9.1) return 4;
    if (n >= 8.6) return 3;
    if (n >= 7.5) return 2;
    return 1;
  },

  // GitHub Contributions – Max 5 Marks
  githubContri: (val) => {
    if (!val || val === "0") return 0;
    const n = parseInt(val);
    if (n > 20) return 5;
    if (n >= 16) return 4;
    if (n >= 11) return 3;
    if (n >= 6) return 2;
    if (n >= 1) return 1;
    return 0;
  },

  // GitHub Monthly Contribution Frequency – Max 2 Marks
  githubContriFreq: (val) => {
    if (!val || val === "0") return 0;
    const n = parseFloat(val);
    if (n >= 2) return 2;
    if (n >= 1) return 1;
    return 0;
  },

  // Projects done for community – Max 3 Marks (each = 2 marks, max 2 projects)
  ProjectsDoneForComunity: (val) => {
    if (!val || val === "0") return 0;
    const count = parseInt(val);
    return Math.min(count * 2, 3);
  },

  // GitHub Collaborations – Max 5 Marks (each = 2 marks, max 3 projects)
  githubCollaborations: (val) => {
    if (!val || val === "0") return 0;
    const count = parseInt(val);
    return Math.min(count * 2, 5);
  },

  // No of Badges – Max 5 Marks
  BadgesEarned: (val) => {
    if (!val || val === "0") return 0;
    const n = parseInt(val);
    if (n >= 25) return 5;
    if (n >= 20) return 4;
    if (n >= 15) return 3;
    if (n >= 10) return 2;
    if (n >= 5) return 1;
    return 0;
  },

  // Medium & Difficult Questions Solved – Max 5 Marks
  MediumDifficultQuestions: (val) => {
    if (!val || val === "0") return 0;
    const n = parseInt(val);
    if (n > 200) return 5;
    if (n >= 150) return 4;
    if (n >= 100) return 3;
    if (n >= 50) return 2;
    if (n >= 25) return 1;
    return 0;
  },

  // Internship Experience – Max 10 Marks
  internshipScore: (data) => {
    if (
      (!data.eliteInternshipCycle || data.eliteInternshipCycle === "0") &&
      (!data.internshipViaSRM || data.internshipViaSRM === "0") &&
      (!data.Fortune500 || data.Fortune500 === "0") &&
      (!data.SmallCompanies || data.SmallCompanies === "0") &&
      (!data.internshipShort || data.internshipShort === "0") &&
      (!data.internshipPaid || data.internshipPaid === "0")
    ) return 0;

    let score = 0;
    if (data.eliteInternshipCycle || data.internshipViaSRM) score += 5;
    else if (data.Fortune500) score += 4;
    else if (data.SmallCompanies) score += 3;
    else if (data.internshipShort) score += 2;

    if (data.internshipPaid) score += 1;

    return Math.min(score, 10);
  },

  // Certification Courses – Max 15 Marks (max 5 courses considered)
  certificationScore: (data) => {
    if (
      (!data.ciscolist || data.ciscolist === "0") &&
      (!data.nptel || data.nptel === "0") &&
      (!data.coursera || data.coursera === "0") &&
      (!data.Pcertificate || data.Pcertificate === "0") &&
      (!data.udemy || data.udemy === "0")
    ) return 0;

    let cisco = parseInt(data.ciscolist) || 0;     // 5 marks
    let nptel = parseInt(data.nptel) || 0;         // 3 marks
    let coursera = parseInt(data.coursera) || 0;   // 2 marks
    let progCert = parseInt(data.Pcertificate) || 0; // 1 mark
    let udemy = parseInt(data.udemy) || 0;         // 0.5 marks

    let totalMarks = 0;
    let coursesCounted = 0;

    // Priority 1: CISCO etc. – 5 marks
    while (cisco > 0 && coursesCounted < 5) {
      totalMarks += 5;
      cisco--;
      coursesCounted++;
    }
    // Priority 2: NPTEL – 3 marks
    while (nptel > 0 && coursesCounted < 5) {
      totalMarks += 3;
      nptel--;
      coursesCounted++;
    }
    // Priority 3: Coursera – 2 marks
    while (coursera > 0 && coursesCounted < 5) {
      totalMarks += 2;
      coursera--;
      coursesCounted++;
    }
    // Priority 4: Programming Certs – 1 mark
    while (progCert > 0 && coursesCounted < 5) {
      totalMarks += 1;
      progCert--;
      coursesCounted++;
    }
    // Priority 5: Udemy – 0.5 mark
    while (udemy > 0 && coursesCounted < 5) {
      totalMarks += 0.5;
      udemy--;
      coursesCounted++;
    }
    // Cap the final total to 15 marks
    return Math.min(totalMarks, 15);
  },

  // Projects Score – Max 5 Marks
  projectsScore: (data) => {
    if (
      (!data.eliteProjects || data.eliteProjects === "0") &&
      (!data.govtprojects || data.govtprojects === "0") &&
      (!data.mobilewebProjects || data.mobilewebProjects === "0") &&
      (!data.miniprojects || data.miniprojects === "0")
    ) return 0;

    let elite = parseInt(data.eliteProjects) || 0;         // 5 marks each
    let govt = parseInt(data.govtprojects) || 0;           // 4 marks each
    let mobileweb = parseInt(data.mobilewebProjects) || 0; // 3 marks each
    let mini = parseInt(data.miniprojects) || 0;           // 1 mark each

    let totalMarks = 0;
    let projectsCounted = 0;

    // 1. Count IIT/NIT/DRDO Projects
    while (elite > 0 && projectsCounted < 3) {
      totalMarks += 5;
      elite--;
      projectsCounted++;
    }

    // 2. Count Govt Projects
    while (govt > 0 && projectsCounted < 3) {
      totalMarks += 4;
      govt--;
      projectsCounted++;
    }

    // 3. Count Mobile/Web App Projects
    while (mobileweb > 0 && projectsCounted < 3) {
      totalMarks += 3;
      mobileweb--;
      projectsCounted++;
    }

    // 4. Count Mini Projects (1 mark each)
    while (mini > 0 && projectsCounted < 3) {
      totalMarks += 1;
      mini--;
      projectsCounted++;
    }

    // Cap total score to max 5 marks
    return Math.min(totalMarks, 5);
  },

  // FSD Project – Max 5 Marks
  fsdProjects: (val) => {
    if (!val || val === "0") return 0;
    const n = parseInt(val);
    return n > 0 ? 5 : 0;
  },

  // Coding Competitions & Hackathons – Max 10 Marks (max 4 considered)
  codingHackathonScore: (data) => {
    if (
      (!data.firstprize || data.firstprize === "0") &&
      (!data.secondprize || data.secondprize === "0") &&
      (!data.thirdprize || data.thirdprize === "0") &&
      (!data.participated || data.participated === "0")
    ) return 0;

    let first = parseInt(data.firstprize) || 0;
    let second = parseInt(data.secondprize) || 0;
    let third = parseInt(data.thirdprize) || 0;
    let participated = parseInt(data.participated) || 0;

    let totalMarks = 0;
    let eventsCounted = 0;

    // First Prizes (5 marks each)
    while (first > 0 && eventsCounted < 4) {
      totalMarks += 5;
      first--;
      eventsCounted++;
    }

    // Second Prizes (4 marks each)
    while (second > 0 && eventsCounted < 4) {
      totalMarks += 4;
      second--;
      eventsCounted++;
    }

    // Third Prizes (3 marks each)
    while (third > 0 && eventsCounted < 4) {
      totalMarks += 3;
      third--;
      eventsCounted++;
    }

    // Participation (1 mark each)
    while (participated > 0 && eventsCounted < 4) {
      totalMarks += 1;
      participated--;
      eventsCounted++;
    }

    // Cap the total score to max 10 marks
    return Math.min(totalMarks, 10);
  },

  // Inhouse Projects – Max 4 Marks
  inhouseprojects: (val) => {
    if (!val || val === "0") return 0;
    const n = parseInt(val);
    return n >= 1 ? 4 : 0;
  },

  // Membership – Max 2 Marks
  memberships: (val) => {
    if (!val || val === "0") return 0;
    const n = parseInt(val);
    return n > 0 ? 2 : 0;
  },

  // SHL/NCET Assessment – Max 10 Marks
  assessmentScore: (val) => {
    if (!val || val === "0") return 0;
    const n = parseInt(val);
    if (n >= 90) return 10;
    if (n >= 80) return 9;
    if (n >= 70) return 8;
    if (n >= 65) return 7;
    if (n >= 60) return 6;
    if (n >= 55) return 5;
    if (n >= 50) return 4;
    if (n >= 40) return 3;
    if (n >= 30) return 2;
    if (n >= 25) return 1;
    return 0;
  }
};



export default function StudentsDashBoard() {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const db = getFirestore();
  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudentData((prev) => ({ ...prev, [name]: value }));
  };

  

const calculateTotalScore = () => {
  let total = 0;
  for (const key in SCORE_CONFIG) {
    const computeScore = SCORE_CONFIG[key];
    const fieldValue = studentData?.[key];
    total += computeScore(fieldValue || "");
  }
  return total;
};

const generatePDF = () => {
    if (!studentData) return;
    
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Student Profile", 14, 15);

    // Prepare table data
    const tableData = FIELD_CONFIG.map(field => [
      field.label, 
      studentData[field.name] || "-"
    ]);

    // Generate table
    autoTable(doc, {
      head: [['Field', 'Value']],
      body: tableData,
      startY: 20,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 64, 175],
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: {
        cellPadding: 3,
        fontSize: 10,
        valign: 'middle'
      },
      columnStyles: {
        0: { cellWidth: 70, fontStyle: 'bold' },
        1: { cellWidth: 'auto' }
      }
    });

    // Add PLM score
    doc.setFontSize(12);
    doc.text(`PLM Score: ${studentData.PLM || calculateTotalScore()}`, 14, doc.lastAutoTable.finalY + 10);
    
    doc.save('student_profile.pdf');
  };

  const handleSave = async () => {
  try {
    // 1. Calculate the total score
    const totalScore = calculateTotalScore();

    // 2. Add/Update the PLM field in studentData
    const updatedData = { ...studentData, PLM: totalScore };

    // 3. Save to Firestore
    await setDoc(doc(db, "User", updatedData.regNo), updatedData, { merge: true });

    // 4. Update local state and UI
    setStudentData(updatedData);
    setIsEditing(false);
    setError("Changes saved successfully!");
  } catch (err) {
    setError("Error saving changes: " + err.message);
  }
};


  useEffect(() => {
    const auth = getAuth();

    const fetchData = async (user) => {
      try {
        const userLoginRef = doc(db, "UsersLogin", user.uid);
        const userLoginSnap = await getDoc(userLoginRef);

        if (!userLoginSnap.exists()) {
          setError("Registration number not found.");
          setLoading(false);
          return;
        }

        const registrationNumber = userLoginSnap.data()?.regNo;
        if (!registrationNumber) {
          setError("Registration number missing.");
          setLoading(false);
          return;
        }

        const studentRef = doc(db, "User", registrationNumber);
        const studentSnap = await getDoc(studentRef);

        if (studentSnap.exists()) {
          setStudentData({ ...studentSnap.data(), regNo: registrationNumber });
        } else {
          // If no data, initialize with regNo so the form can be filled
          setStudentData({ regNo: registrationNumber });
        }
      } catch (err) {
        setError("Error fetching data: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) fetchData(user);
      else {
        setError("User not logged in.");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [db]);


  if (loading) return <div className="text-center p-4">Loading...</div>;

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center text-center px-4 pt-10 overflow-hidden -mb-40 lg:items-end lg:text-end lg:pb-40 lg:pr-[10%]">
      <AnimatedBlob />
      <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat -z-10"
          style={{
            backgroundImage: 'url("/Dashboard-bg4.jpg")',
            backgroundSize: '900px',
            backgroundRepeat: "no-repeat",
        backgroundPosition: '0% -55px',
          }}
        />
      <div className="relative z-10 w-full max-w-3xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-3 lg:mb-15 lg:text-7xl">
            Student Dashboard
          </h1>

          <p className="text-lg text-gray-800 font-medium mb-2 lg:text-3xl">
            Welcome, {studentData.name}
          </p>
        <p className="text-sm text-blue-700 italic mb-4">
          Track attendance, academics, and placement progress
        </p>
        <p className="text-xs text-gray-500 mb-6">
          SRM Institute of Science and Technology – Empowering Students for the Future
        </p>

        <div className="mt-8 p-4 bg-white rounded-lg shadow-md">
          {error && <p className="text-red-500 mb-2">{error}</p>}

          {/* --- Absence Reason Input for Low Attendance Alert --- */}
{studentData?.attendanceAlert && !isEditing && (
  <form
    onSubmit={async (e) => {
      e.preventDefault();
      try {
        await setDoc(
          doc(getFirestore(), "User", studentData.regNo),
          { absenceReason: studentData.absenceReason || "" },
          { merge: true }
        );
        setError("Reason submitted!");
      } catch (err) {
        setError("Failed to submit reason: " + err.message);
      }
    }}
    className="mt-8 p-4 bg-yellow-100 rounded-lg shadow-md"
  >
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Please provide a reason for your absenteeism:
    </label>
    <input
      type="text"
      name="absenceReason"
      value={studentData.absenceReason || ""}
      onChange={(e) =>
        setStudentData((prev) => ({
          ...prev,
          absenceReason: e.target.value,
        }))
      }
      className="w-full px-2 py-1 border rounded mb-2"
      required
    />
    <button
      type="submit"
      className="px-4 py-2 bg-yellow-600 text-white rounded"
    >
      Submit Reason
    </button>
  </form>
)}


          {studentData && (
            <form
  onSubmit={(e) => {
    e.preventDefault();
    if (isEditing) handleSave();
    else setIsEditing(true);
  }}
  className="grid grid-cols-1 md:grid-cols-2 gap-4"
>
  {FIELD_CONFIG.map((field) => (
    <div key={field.name} className="text-left">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {field.label}
      </label>
      {isEditing && !field.readOnly ? (
        <input
          type={field.type || "text"}
          name={field.name}
          value={studentData[field.name] || ""}
          onChange={handleChange}
          className="w-full px-2 py-1 border rounded"
        />
      ) : (
        <div className="p-2 bg-gray-50 rounded min-h-[38px]">
          {studentData[field.name] || <span className="text-gray-400">N/A</span>}
        </div>
      )}
    </div>
  ))}

  {/* --- Achievements Editable Section --- */}
  {isEditing && (
    <div className="md:col-span-2 mt-4">
      <h2 className="text-xl font-semibold text-blue-700 mb-2">Achievements</h2>

      {Object.entries(studentData.achievementsMap || {}).map(([key, value]) => {
        const [title, link] = value.split("~");

        return (
          <div key={key} className="mb-3 grid grid-cols-1 md:grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Achievement Title"
              value={title}
              onChange={(e) => {
                const updatedMap = { ...studentData.achievementsMap };
                updatedMap[key] = `${e.target.value}~${link}`;
                setStudentData((prev) => ({ ...prev, achievementsMap: updatedMap }));
              }}
              className="w-full px-2 py-1 border rounded"
            />
            <input
              type="text"
              placeholder="Google Drive Link"
              value={link}
              onChange={(e) => {
                const updatedMap = { ...studentData.achievementsMap };
                updatedMap[key] = `${title}~${e.target.value}`;
                setStudentData((prev) => ({ ...prev, achievementsMap: updatedMap }));
              }}
              className="w-full px-2 py-1 border rounded"
            />
          </div>
        );
      })}

      <button
        type="button"
        className="mt-2 px-4 py-1 bg-blue-500 text-white rounded"
        onClick={() => {
          const newKey = `achi${Date.now()}`;
          const updatedMap = {
            ...(studentData.achievementsMap || {}),
            [newKey]: `~`,
          };
          setStudentData((prev) => ({ ...prev, achievementsMap: updatedMap }));
        }}
      >
        + Add Achievement
      </button>
    </div>
  )}

  {/* 👇 Achievements View Section */}
        {studentData.achievementsMap && !isEditing && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-blue-700 mb-2">Achievements</h2>
            <ul className="list-disc list-inside text-left">
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
                        className="text-blue-600 underline ml-1"
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

  {/* Buttons */}
  <div className="md:col-span-2 flex justify-end mt-4">
    {isEditing ? (
      <>
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded mr-2"
        >
          Save Changes
        </button>
        <button
          type="button"
          className="px-4 py-2 bg-gray-500 text-white rounded"
          onClick={() => setIsEditing(false)}
        >
          Cancel
        </button>
      </>
    ) : (
      <div className="flex space-x-2">
        <button
          type="button"
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={(e) => {
            e.preventDefault();
            setIsEditing(true);
          }}
        >
          Edit Profile
        </button>
        <button
          type="button"
          className="px-4 py-2 bg-purple-600 text-white rounded flex items-center"
          onClick={generatePDF}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
          Download PDF
        </button>
      </div>
    )}
  </div>
</form>

          )}
        </div>
                {studentData && !isEditing && (
          <div className="mt-6 text-lg font-semibold text-green-700">
            Total Profile Score: {calculateTotalScore()}
          </div>
        )}

        


      </div>
    </div>
  );
}
