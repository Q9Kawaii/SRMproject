"use client";
import React, { useState } from "react";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

// Your dataset object
const studentDataSet = {
  name: [
    "Aarav Mehta", "Priya Sharma", "Rohan Das", "Sneha Iyer", "Aditya Verma"
  ],
  programme: [
    "B.Tech CSE", "B.Tech EEE", "B.Tech Mech", "B.Tech IT", "B.Tech Civil"
  ],
  regNo: [
    "RA2211001010001", "RA2211001010002", "RA2211001010003", "RA2211001010004", "RA2211001010005"
  ],
  semester: ["3", "4", "5", "6", "7"],
  batch: [
    "2021-2025", "2020-2024", "2019-2023", "2022-2026", "2023-2027"
  ],
  dateOfAdmission: [
    "2021-08-01", "2022-08-01", "2023-08-01", "2024-08-01"
  ],
  section: ["A", "B", "C", "D", "E"],
  dob: [
    "2003-02-14", "2002-08-30", "2004-01-10", "2003-07-25", "2002-11-19"
  ],
  netId: [
    "aarav.m", "priya.s", "rohan.d", "sneha.i", "aditya.v"
  ],
  email: [
    "aarav@srmist.edu.in", "priya@srmist.edu.in", "rohan@srmist.edu.in", "sneha@srmist.edu.in", "aditya@srmist.edu.in"
  ],
  phone: [
    "9876543210", "9876543211", "9876543212", "9876543213", "9876543214"
  ],
  isNRI: ["Yes", "No"],
  parentEmail: [
    "father.aarav@gmail.com", "father.priya@gmail.com", "father.rohan@gmail.com", "father.sneha@gmail.com", "father.aditya@gmail.com"
  ],
  fatherPhone: [
    "9876500001", "9876500002", "9876500003", "9876500004", "9876500005"
  ],
  motherEmail: [
    "mother.aarav@gmail.com", "mother.priya@gmail.com", "mother.rohan@gmail.com", "mother.sneha@gmail.com", "mother.aditya@gmail.com"
  ],
  motherPhone: [
    "9876510001", "9876510002", "9876510003", "9876510004", "9876510005"
  ],
  advisor: [
    "Dr. Ramesh", "Dr. Anitha", "Dr. Mohan", "Dr. Keerthi", "Dr. Arvind"
  ],
  languages: [
    "English, Hindi", "English, Tamil", "English, Bengali", "English, Telugu", "English, Marathi"
  ],
  board10: ["CBSE", "ICSE", "State Board"],
  percent10: ["87", "92", "78", "85", "90"],
  board12: ["CBSE", "ICSE", "State Board"],
  percent12: ["80", "85", "88", "75", "91"],
  studiedDiploma: ["Yes", "No"],
  driveLink: [
    "https://drive.google.com/example1", "https://drive.google.com/example2"
  ],
  cgpa: ["8.2", "7.9", "9.1", "8.7", "7.5"],
  standingArrears: ["0", "1", "2"],
  historyArrears: ["0", "1", "2", "3"],
  github: [
    "https://github.com/aaravm", "https://github.com/priyas", "https://github.com/rohand", "https://github.com/snehai", "https://github.com/adityav"
  ],
  internshipMonths: ["2", "3", "4", "6"],
  industrialTrainingCount: ["0", "1", "2", "3"],
  companies: [
    "TCS", "Infosys", "Zoho", "Wipro", "Google"
  ],
  internshipList: [
    "TCS-Chennai", "Zoho-Chengalpattu", "Wipro-Pune"
  ],
  certProofCollected: ["Yes", "No"],
  certifications: [
    "AWS", "Google Analytics", "Azure", "NPTEL"
  ],
  skillset: [
    "JavaScript, React, Firebase",
    "C++, Python, SQL",
    "Java, Spring Boot",
    "Python, Django, MongoDB",
    "C, Flutter, Node.js"
  ],
  appDevExp: ["Yes", "No"],
  currentApp: [
    "Task Manager", "EduApp", "TodoList", "WeatherApp"
  ],
  currentFSD: [
    "E-Commerce", "Booking App", "Inventory Tool"
  ],
  fsdExp: ["3", "5", "6"],
  codingCompetitions: [
    "Codevita", "CodeChef", "HackerRank"
  ],
  hackathons: [
    "SRM Hack", "Code Fiesta", "Hack36", "SIH", "Hacktoberfest"
  ],
  hackathonNames: [
    "SIH 2023", "HackSRM", "CodeMania"
  ],
  otherCodingEvents: [
    "SRM Code League", "Algo Nights", "Not Participated"
  ],
  inhouseProjects: [
    "ERP System", "Attendance Tracker", "Hostel Portal"
  ],
  achievements: [
    "1st Place in Hack36",
    "Top 3 at CodeMania",
    "Won SRM Coding League",
    "2nd in SIH",
    "3rd Prize at CodeQuest"
  ],
  memberships: [
    "GDSC", "Coding Club", "EEE Club", "AI Club"
  ],
  assessments: [
    "AMCAT", "CoCubes", "eLitmus", "SHL", "NCET"
  ],
  careerPlans: [
    "Software Developer", "Data Analyst", "Entrepreneur", "Full-Stack Dev"
  ]
};

function getRandomFromArray(arr) {
  if (!arr || arr.length === 0) return "";
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function StudentForm() {
  const [form, setForm] = useState({
    name: "",
    programme: "",
    regNo: "",
    semester: "",
    batch: "",
    dateOfAdmission: "",
    section: "",
    dob: "",
    netId: "",
    email: "",
    phone: "",
    isNRI: "",
    parentEmail: "",
    fatherPhone: "",
    motherEmail: "",
    motherPhone: "",
    advisor: "",
    languages: "",
    board10: "",
    percent10: "",
    board12: "",
    percent12: "",
    studiedDiploma: "",
    driveLink: "",
    cgpa: "",
    standingArrears: "",
    historyArrears: "",
    github: "",
    internshipMonths: "",
    industrialTrainingCount: "",
    companies: "",
    internshipList: "",
    certProofCollected: "",
    certifications: "",
    skillset: "",
    appDevExp: "",
    currentApp: "",
    currentFSD: "",
    fsdExp: "",
    codingCompetitions: "",
    hackathons: "",
    hackathonNames: "",
    otherCodingEvents: "",
    inhouseProjects: "",
    achievements: "",
    memberships: "",
    assessments: "",
    careerPlans: "",
  });

  const [message, setMessage] = useState("");
  const db = getFirestore();

  // Fill random data from studentDataSet
  const fillRandom = () => {
    const newForm = {};
    for (const key in form) {
      if (studentDataSet[key]) {
        newForm[key] = getRandomFromArray(studentDataSet[key]);
      } else {
        newForm[key] = "";
      }
    }
    setForm(newForm);
    setMessage("Random data filled. You can edit before submitting.");
  };

  // Handle input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle form submit (create/update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.regNo) {
      setMessage("Registration Number is required.");
      return;
    }
    try {
      // setDoc with merge:true will update if exists, or create if not
      await setDoc(doc(db, "User", form.regNo), form, { merge: true });
      setMessage("Student data saved/updated successfully!");
    } catch (err) {
      setMessage("Error saving data: " + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-4 bg-white rounded shadow space-y-4">
      <h2 className="text-xl font-bold mb-2">Student Registration Form</h2>
      <button type="button" onClick={fillRandom} className="mb-2 px-3 py-1 bg-green-600 text-white rounded">
        Fill Random Data
      </button>
      <div className="grid grid-cols-2 gap-4">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Name Of Student" required />
        <input name="programme" value={form.programme} onChange={handleChange} placeholder="Programme" required />
        <input name="regNo" value={form.regNo} onChange={handleChange} placeholder="Registration Number" required />
        <input name="semester" value={form.semester} onChange={handleChange} placeholder="Semester" />
        <input name="batch" value={form.batch} onChange={handleChange} placeholder="Batch" />
        <input name="dateOfAdmission" value={form.dateOfAdmission} onChange={handleChange} placeholder="Date Of Admission" />
        <input name="section" value={form.section} onChange={handleChange} placeholder="Section" />
        <input name="dob" value={form.dob} onChange={handleChange} placeholder="Date of Birth (D.O.B.)" />
        <input name="netId" value={form.netId} onChange={handleChange} placeholder="Net-ID" />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Official Email" />
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="Mobile No." />
        <input name="isNRI" value={form.isNRI} onChange={handleChange} placeholder="NRI Student" />
        <input name="parentEmail" value={form.parentEmail} onChange={handleChange} placeholder="Father Email ID" />
        <input name="fatherPhone" value={form.fatherPhone} onChange={handleChange} placeholder="Father Mobile No." />
        <input name="motherEmail" value={form.motherEmail} onChange={handleChange} placeholder="Mother Email ID" />
        <input name="motherPhone" value={form.motherPhone} onChange={handleChange} placeholder="Mother Mobile No." />
        <input name="advisor" value={form.advisor} onChange={handleChange} placeholder="Name of Advisor" />
        <input name="languages" value={form.languages} onChange={handleChange} placeholder="Languages Known" />
        <input name="board10" value={form.board10} onChange={handleChange} placeholder="10th Board Of Studies" />
        <input name="percent10" value={form.percent10} onChange={handleChange} placeholder="10th %age" />
        <input name="board12" value={form.board12} onChange={handleChange} placeholder="12th Board Of Studies" />
        <input name="percent12" value={form.percent12} onChange={handleChange} placeholder="12th %age" />
        <input name="studiedDiploma" value={form.studiedDiploma} onChange={handleChange} placeholder="Studied Diploma" />
        <input name="driveLink" value={form.driveLink} onChange={handleChange} placeholder="Drive Link For 12th & 10th MarkSheet" />
        <input name="cgpa" value={form.cgpa} onChange={handleChange} placeholder="CGPA (Up to 1st Semester)" />
        <input name="standingArrears" value={form.standingArrears} onChange={handleChange} placeholder="Standing Arrears (Backlogs)" />
        <input name="historyArrears" value={form.historyArrears} onChange={handleChange} placeholder="History of Arrears (Backlogs)" />
        <input name="github" value={form.github} onChange={handleChange} placeholder="GitHub Profile Link" />
        <input name="internshipMonths" value={form.internshipMonths} onChange={handleChange} placeholder="Internship Experience in Months" />
        <input name="industrialTrainingCount" value={form.industrialTrainingCount} onChange={handleChange} placeholder="No. of Industrial Training Completed" />
        <input name="companies" value={form.companies} onChange={handleChange} placeholder="Company Name, Location, Year, Month (List out)" />
        <input name="internshipList" value={form.internshipList} onChange={handleChange} placeholder="Internship Experience (List)" />
        <input name="certProofCollected" value={form.certProofCollected} onChange={handleChange} placeholder="Standard Certification Courses Completed" />
        <input name="certifications" value={form.certifications} onChange={handleChange} placeholder="Certifications" />
        <input name="skillset" value={form.skillset} onChange={handleChange} placeholder="Programming Skillset" />
        <input name="appDevExp" value={form.appDevExp} onChange={handleChange} placeholder="Application Development Experience" />
        <input name="currentApp" value={form.currentApp} onChange={handleChange} placeholder="Currently Available Application Name" />
        <input name="currentFSD" value={form.currentFSD} onChange={handleChange} placeholder="Currently Available FSD Name" />
        <input name="fsdExp" value={form.fsdExp} onChange={handleChange} placeholder="FSD Experience" />
        <input name="codingCompetitions" value={form.codingCompetitions} onChange={handleChange} placeholder="Coding Competitions (Won / Top 3)" />
        <input name="hackathons" value={form.hackathons} onChange={handleChange} placeholder="Hackathons (Won / Participated)" />
        <input name="hackathonNames" value={form.hackathonNames} onChange={handleChange} placeholder="Hackathon Names" />
        <input name="otherCodingEvents" value={form.otherCodingEvents} onChange={handleChange} placeholder="Other Coding Events" />
        <input name="inhouseProjects" value={form.inhouseProjects} onChange={handleChange} placeholder="Inhouse Projects" />
        <input name="achievements" value={form.achievements} onChange={handleChange} placeholder="Achievements" />
        <input name="memberships" value={form.memberships} onChange={handleChange} placeholder="Membership of Professional Bodies" />
        <input name="assessments" value={form.assessments} onChange={handleChange} placeholder="Assessments Taken" />
        <input name="careerPlans" value={form.careerPlans} onChange={handleChange} placeholder="Career Plans" />
      </div>
      <button type="submit" className="mt-4 px-4 py-2 bg-blue-700 text-white rounded">Submit</button>
      {message && <p className="mt-2">{message}</p>}
    </form>
  );
}
