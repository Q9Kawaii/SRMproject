"use client";
import React, { useEffect, useState } from "react";
import SearchBar from "./DashboardComponents/SearchBar";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import StudentAttendancePage from "./StudentAttendancePage";



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
  { label: "Father Email ID", name: "parentEmail", type: "email" },
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



export default function StudentsDashBoard({ regNo: propRegNo, section: propSection }) {
  const [declineAlert, setDeclineAlert] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
   const [originalData, setOriginalData] = useState(null);
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

  const dismissAlert = () => {
  setDeclineAlert(null);
  // Optional: Clear from Firestore
  // const docRef = doc(db, "PendingUpdates", studentData.regNo);
  // await updateDoc(docRef, { message: "" });
};


  const handleSave = async () => {
  try {
    // 1. Calculate PLM score
    const totalScore = calculateTotalScore();
    
    // 2. Create updated data
    const updatedData = { 
      ...studentData, 
      PLM: totalScore,
      cgpa: studentData.cgpa 
    };

    // 3. Collect ALL changed fields
    const changes = {};
    Object.keys(updatedData).forEach(key => {
      if (updatedData[key] !== originalData[key]) {
        changes[key] = updatedData[key];
      }
    });

    // 4. Save to PendingUpdates with filtered original values
    if (Object.keys(changes).length > 0) {
      // ✅ Filter out undefined/null values from original data
      const filteredOriginal = Object.fromEntries(
        Object.keys(changes)
          .map(k => [k, originalData[k]])
          .filter(([key, value]) => value !== undefined && value !== null)
      );

      const pendingRef = doc(db, "PendingUpdates", updatedData.regNo);
      await setDoc(pendingRef, {
        regNo: updatedData.regNo || studentData.regNo,
        updates: changes,
        original: filteredOriginal, // ✅ Use filtered original
        status: "pending",
        timestamp: new Date().toISOString()
      }, { merge: true });

      setIsEditing(false);
      setError("Changes submitted for teacher approval.");
    } else {
      setError("No changes to save.");
    }
  } catch (err) {
    setError("Error submitting changes: " + err.message);
  }
};



useEffect(() => {
  const auth = getAuth();

  const fetchData = async (user) => {
  try {
    // 🔽 Use prop if available, else fallback to Firestore
    let registrationNumber = propRegNo;

    if (!registrationNumber) {
      const userLoginRef = doc(db, "UsersLogin", user.uid);
      const userLoginSnap = await getDoc(userLoginRef);

      if (!userLoginSnap.exists()) {
        setError("Registration number not found.");
        setLoading(false);
        return;
      }

      registrationNumber = userLoginSnap.data()?.regNo;
    }

    if (!registrationNumber) {
      setError("Registration number missing.");
      setLoading(false);
      return;
    }

    const studentRef = doc(db, "User", registrationNumber);
    const studentSnap = await getDoc(studentRef);

    if (studentSnap.exists()) {
      const data = { ...studentSnap.data(), regNo: registrationNumber };
      setStudentData(data);
      setOriginalData(data);
    } else {
      // Create a new document if it doesn't exist
      const newStudentData = { regNo: registrationNumber };
      await setDoc(studentRef, newStudentData);
      setStudentData(newStudentData);
      setOriginalData(newStudentData);
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
}, [db, propRegNo]);

  

  useEffect(() => {
  if (!studentData?.regNo) return;
  
  const docRef = doc(db, "PendingUpdates", studentData.regNo);
  const unsubscribe = onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.status === "declined" && data.message) {
        setDeclineAlert({
          message: data.message,
          timestamp: data.timestamp
        });
      } else {
        setDeclineAlert(null);
      }
    } else {
      setDeclineAlert(null);
    }
  });
  
  return () => unsubscribe();
}, [studentData?.regNo]);




  if (loading) return <div className="text-center p-4">Loading...</div>;

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center text-center px-4 pt-10 overflow-hidden -mb-40 lg:items-end lg:text-end lg:pb-40 lg:pr-[10%]">
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

  <div
    className="absolute inset-0 bg-cover bg-center bg-no-repeat -z-10 opacity-10"
    style={{
      backgroundImage: 'url("/Dashboard-bg4.jpg")',
      backgroundSize: '900px',
      backgroundRepeat: "no-repeat",
      backgroundPosition: '0% -55px',
    }}
  />

  <div className="relative z-10 w-full max-w-3xl">
    {/* Header Section */}
    
    <div className="inline-block p-6 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl mb-8 border border-blue-100 hover:shadow-3xl transition-all duration-500 hover:-translate-y-1">
    <div className="w-12 h-12 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72] rounded-full flex items-center justify-center shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      <h1 className="text-3xl sm:text-4xl font-bold mb-3 lg:mb-6 lg:text-7xl">
        <span className="text-[#0c4da2] relative">
          Student
          <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72] rounded-full"></div>
        </span>{" "}
        <span className="text-[#3a5b72]">Dashboard</span>
      </h1>

      <div className="flex items-center justify-center gap-3 mb-4">
        
      </div>

      <p className="text-lg text-[#0c4da2] font-bold mb-2 lg:text-3xl">
        Welcome, {studentData?.name || "Student"}
      </p>
      <p className="text-sm text-[#0c4da2] font-medium italic mb-4">
        Track attendance, academics, and placement progress
      </p>
      <p className="text-xs text-gray-600">
        SRM Institute of Science and Technology – Empowering Students for the Future
      </p>
    </div>

    {/* Main Content */}
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-blue-100 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72]"></div>
      
      <div className="p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50/90 backdrop-blur-sm border-l-4 border-red-500 rounded-r-xl shadow-lg">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* Absence Reason Input for Low Attendance Alert */}
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
            className="mb-8 p-6 bg-yellow-50/90 backdrop-blur-sm rounded-2xl shadow-lg border border-yellow-200"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <label className="block text-lg font-bold text-yellow-700">
                Please provide a reason for your absenteeism:
              </label>
            </div>
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
              className="w-full px-4 py-3 border-2 border-yellow-300 rounded-xl bg-white/90 backdrop-blur-sm focus:border-yellow-500 focus:outline-none transition-colors duration-300 mb-4"
              required
            />
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
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
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {FIELD_CONFIG.map((field) => (
              <div key={field.name} className="text-left">
                <label className="block text-sm font-bold text-[#0c4da2] mb-2">
                  {field.label}
                </label>
                {isEditing && !field.readOnly ? (
                  <input
                    type={field.type || "text"}
                    name={field.name}
                    value={studentData[field.name] || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl bg-white/90 backdrop-blur-sm focus:border-[#0c4da2] focus:outline-none transition-colors duration-300"
                  />
                ) : (
                  <div className="p-4 bg-gray-50/80 backdrop-blur-sm rounded-xl min-h-[50px] border border-gray-200 shadow-sm">
                    {studentData[field.name] || <span className="text-gray-400 italic">N/A</span>}
                  </div>
                )}
              </div>
            ))}

            {/* Achievements Editable Section */}
            {isEditing && (
              <div className="md:col-span-2 mt-6">
                <div className="bg-blue-50/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72] rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold text-[#0c4da2]">Achievements</h2>
                  </div>

                  {Object.entries(studentData.achievementsMap || {}).map(([key, value]) => {
  const parts = value.split("~");
  const title = parts[0] || "";
  const link = parts[1] || "";
  const verified = parts[2] || "0";
  const timestamp = parts[3] || "";

  return (
    <div key={key} className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      <input
        type="text"
        placeholder="Achievement Title"
        value={title}
        onChange={(e) => {
          const updatedMap = { ...studentData.achievementsMap };
          updatedMap[key] = `${e.target.value}~${link}~${verified}~${timestamp}`;
          setStudentData((prev) => ({ ...prev, achievementsMap: updatedMap }));
        }}
        className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl bg-white/90 backdrop-blur-sm focus:border-[#0c4da2] focus:outline-none transition-colors duration-300"
      />
      <input
        type="text"
        placeholder="Google Drive Link"
        value={link}
        onChange={(e) => {
          const updatedMap = { ...studentData.achievementsMap };
          updatedMap[key] = `${title}~${e.target.value}~${verified}~${timestamp}`;
          setStudentData((prev) => ({ ...prev, achievementsMap: updatedMap }));
        }}
        className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl bg-white/90 backdrop-blur-sm focus:border-[#0c4da2] focus:outline-none transition-colors duration-300"
      />
    </div>
  );
})}


                  <button
  type="button"
  className="mt-4 px-6 py-3 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
  onClick={() => {
    const newKey = `achi${Date.now()}`;
    const updatedMap = {
      ...(studentData.achievementsMap || {}),
      [newKey]: `~~0~`, // 4 parts: empty title, empty link, unverified (0), empty timestamp
    };
    setStudentData((prev) => ({ ...prev, achievementsMap: updatedMap }));
  }}
>
  + Add Achievement
</button>
                </div>
              </div>
            )}

            {/* Achievements View Section */}
            {studentData.achievementsMap && !isEditing && (
  <div className="md:col-span-2 mt-6">
    <div className="bg-blue-50/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72] rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[#0c4da2]">Achievements</h2>
      </div>
      <ul className="list-disc list-inside text-left space-y-2">
        {Object.values(studentData.achievementsMap).map((val, i) => {
          const parts = val.split("~");
          const title = parts[0] || "";
          const link = parts[1] || "";
          const verified = parts[2] === "1";
          
          return (
            <li key={i} className="text-gray-700 flex items-center justify-between">
              <div>
                <strong className="text-[#0c4da2]">{title}</strong>
                {verified && <span className="ml-2 text-green-600 text-sm">✓ Verified</span>}
                {link && (
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#3a5b72] hover:text-[#0c4da2] underline ml-2 font-medium transition-colors duration-200"
                  >
                    [View]
                  </a>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  </div>
)}


            {/* Action Buttons */}
            <div className="md:col-span-2 flex justify-end mt-8">
              {isEditing ? (
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    className="px-8 py-3 bg-white/90 backdrop-blur-sm text-gray-600 font-bold rounded-xl shadow-lg border-2 border-gray-300 hover:bg-gray-100 transform hover:-translate-y-0.5 transition-all duration-300"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex space-x-4">
                  <button
                    type="button"
                    className="px-8 py-3 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 hover:from-[#3a5b72] hover:to-[#0c4da2]"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsEditing(true);
                    }}
                  >
                    Edit Profile
                  </button>
                  <button
                    type="button"
                    className="px-8 py-3 bg-white/90 backdrop-blur-sm text-[#0c4da2] font-bold rounded-xl shadow-lg border-2 border-[#0c4da2] hover:bg-[#0c4da2] hover:text-white transform hover:-translate-y-0.5 transition-all duration-300 flex items-center"
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
    </div>

    {/* Profile Score */}
    {studentData && !isEditing && (
      <div className="mt-8 p-6 bg-green-50/80 backdrop-blur-sm rounded-2xl shadow-lg border border-green-200">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="text-2xl font-bold text-green-700">
            Total Profile Score: {calculateTotalScore()}
          </div>
        </div>
      </div>
    )}
  </div>

  

  {/* Decline Alert */}
  {declineAlert && (
    <div className="fixed top-4 right-4 z-50 bg-yellow-50/90 backdrop-blur-sm border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-r-xl shadow-2xl max-w-md">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-bold text-lg">Update Declined</div>
          <p className="mt-1">{declineAlert.message}</p>
          <div className="text-xs mt-2 text-yellow-600">
            {declineAlert.timestamp && new Date(declineAlert.timestamp).toLocaleString()}
          </div>
        </div>
        <button
          onClick={dismissAlert}
          className="ml-4 text-yellow-700 hover:text-yellow-900 font-bold text-xl"
        >
          ×
        </button>
      </div>
    </div>
  )}

<div className="pt-10">
  <StudentAttendancePage studentRegNo={studentData?.regNo}/>
</div>

</div>

  );
}
