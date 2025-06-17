"use client";
import React, { useEffect, useState } from "react";
import SearchBar from "./DashboardComponents/SearchBar";
import AnimatedBlob from "./DashboardComponents/AnimatedBlob";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

// List all the fields you want to display/edit
const FIELD_CONFIG = [
  // Personal
  { label: "Name Of Student", name: "name" },
  { label: "Programme", name: "programme" },
  { label: "Registration Number", name: "regNo", readOnly: true },
  { label: "Semester (with Batch)", name: "semester" },
  { label: "Batch", name: "batch" },
  { label: "Date Of Admission", name: "dateOfAdmission", type: "date" },
  { label: "Section", name: "section" },
  { label: "Date of Birth (D.O.B.)", name: "dob", type: "date" },
  { label: "Net-ID", name: "netId" },
  { label: "Official Email", name: "email", type: "email" },
  { label: "Mobile No.", name: "phone", type: "tel" },
  // Family
  { label: "NRI Student", name: "isNRI" },
  { label: "Father Email ID", name: "fatherEmail", type: "email" },
  { label: "Father Mobile No.", name: "fatherPhone", type: "tel" },
  { label: "Mother Email ID", name: "motherEmail", type: "email" },
  { label: "Mother Mobile No.", name: "motherPhone", type: "tel" },
  { label: "Name of Advisor", name: "advisor" },
  { label: "Languages Known", name: "languages" },
  // Academic History
  { label: "10th Board Of Studies", name: "board10" },
  { label: "10th %age", name: "percent10" },
  { label: "12th Board Of Studies", name: "board12" },
  { label: "12th %age", name: "percent12" },
  { label: "Studied Diploma", name: "studiedDiploma" },
  { label: "Drive Link For 12th & 10th MarkSheet", name: "driveLink" },
  // Academic Performance
  { label: "CGPA (Up to 1st Semester)", name: "cgpa" },
  { label: "Standing Arrears (Backlogs)", name: "standingArrears" },
  { label: "History of Arrears (Backlogs)", name: "historyArrears" },
  // Technical & Internship
  { label: "Coding Practice Platform (GitHub Profile Link)", name: "github" },
  { label: "Internship Experience in Months", name: "internshipMonths" },
  { label: "No. of Industrial Training Completed", name: "industrialTrainingCount" },
  { label: "Company Name, Location, Year, Month (List out)", name: "companies" },
  { label: "Internship Experience (List)", name: "internshipList" },
  { label: "Standard Certification Courses Completed", name: "certProofCollected" },
  { label: "Certifications", name: "certifications" },
  { label: "Programming Skillset", name: "skillset" },
  { label: "Application Development Experience (Projects Done)", name: "appDevExp" },
  { label: "Currently Available Application Name (with month and year)", name: "currentApp" },
  { label: "Currently Available FSD Name (with month and year)", name: "currentFSD" },
  { label: "FSD Experience (Full Stack Developer – with month and year)", name: "fsdExp" },
  // Competitions & Projects
  { label: "Coding Competitions (Won / Top 3)", name: "codingCompetitions" },
  { label: "Hackathons (Won / Participated – with month and year)", name: "hackathons" },
  { label: "Hackathon Names (WON / PARTICIPATED – with month and year)", name: "hackathonNames" },
  { label: 'Other Coding Events (Won prize/award – specify with month & year or "Not Participated")', name: "otherCodingEvents" },
  { label: "Inhouse Projects (Under SRM/Foreign Professor or Reputed Institute)", name: "inhouseProjects" },
  { label: "Achievements (Last 3 years – specify with month)", name: "achievements" },
  // Extra-Curricular & Career
  { label: "Membership of Professional Bodies", name: "memberships" },
  { label: "Assessments Taken (SHL / NCET / Others)", name: "assessments" },
  { label: "Career Plans", name: "careerPlans" },
];

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

  const handleSave = async () => {
    try {
      await setDoc(doc(db, "User", studentData.regNo), studentData, { merge: true });
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
                  <button 
  type="button" 
  className="px-4 py-2 bg-blue-600 text-white rounded"
  onClick={(e) => {
    e.preventDefault(); // Add this
    setIsEditing(true);
  }}
>
  Edit Profile
</button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
