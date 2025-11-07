"use client";

import { useState, useEffect } from "react";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import AdminDashBoardd from "./components/Admin-DashBoard";
import StudentsDashBoard from "./components/Students-DashBoard";
import { app } from "../lib/firebase";
import HamsterLoader from "./components/DashboardComponents/HamsterLoader";
import { Copy, Shield, BookOpen, Users, TrendingUp } from 'lucide-react';

const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// ✅ Utility to parse Firebase "displayName" like -> "YASH DINGAR (RA2411003010411)"
const parseDisplayName = (displayName) => {
  if (!displayName) return { name: "", regNo: "" };
  const match = displayName.match(/^(.*?)\s*\((.*?)\)$/);
  if (match) {
    return { name: match[1].trim(), regNo: match[2].trim() };
  }
  return { name: displayName.trim(), regNo: "" };
};

export default function Home() {
  const [userRole, setUserRole] = useState(null);
  const [section, setSection] = useState("");
  const [regNo, setRegNo] = useState("");
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newUserUID, setNewUserUID] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [secRole, setSecRole] = useState(null);
  const [SectionofFA, setSectionofFA] = useState(null);
  const [nameOfFA, setnameOfFA] = useState(null);
  const [currentUID, setCurrentUID] = useState("");

  const copyToClipboard = (text) => navigator.clipboard.writeText(text);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setLoading(true);
      if (user) {
        setCurrentUID(user.uid); // ✅ Always set UID for any login attempt
        setError("");
        try {
          const normalizedEmail = user.email ? user.email.toLowerCase() : null;
          let teacherSnap = await getDoc(doc(db, "UsersLogin", user.uid));

          if (!teacherSnap.exists() && normalizedEmail) {
            teacherSnap = await getDoc(doc(db, "UsersLogin", normalizedEmail));
          }

          if (teacherSnap.exists() && teacherSnap.data().role === 'teacher') {
            const data = teacherSnap.data();
            if (data.role === 'teacher') {
              setUserRole("teacher");
              setSecRole(data.SecRole);
              setSectionofFA(data.section);
              setnameOfFA(data.name);
              setIsNewUser(false);
            } else {
              setError("Unauthorized role detected. Access denied.");
              await auth.signOut();
            }
          } else if (user.email.endsWith("@srmist.edu.in")) {
            const { regNo: parsedRegNo, name: parsedName } = parseDisplayName(user.displayName);

            if (!parsedRegNo) {
              setError("Registration number not found in your Google profile name.");
              await auth.signOut();
              return;
            }

            const studentRef = doc(db, "User", parsedRegNo);
            const studentSnap = await getDoc(studentRef);

            if (studentSnap.exists()) {
              const studentData = studentSnap.data();
              await setDoc(studentRef, {
                name: parsedName,
                email: user.email,
              }, { merge: true });

              setUserRole("student");
              setRegNo(studentData.regNo || parsedRegNo);
              setSection(studentData.section);
              setDepartment(studentData.department);
              setIsNewUser(false);
            } else {
              setError("You are not authorized. Please contact your teacher.");
              await auth.signOut();
            }
          } else {
            setNewUserUID(user.uid);
            setIsNewUser(true);
            setUserRole(null);
          }
        } catch (err) {
          setError("Something went wrong. Please try again or contact admin.");
          await auth.signOut();
        }
      } else {
        setUserRole(null);
        setIsNewUser(false);
        setNewUserUID("");
        setCurrentUID(""); // ✅ Clear UID when logged out
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    if (auth.currentUser) return;
    setLoading(true);
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError("Login failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <HamsterLoader />;

  // Login screen
  if (!userRole && !loading) {
    return (
      <div className="relative min-h-screen w-full flex flex-col items-center justify-center text-center px-4 pt-10 overflow-hidden -mb-40 lg:items-end lg:text-end lg:pb-40 lg:pr-[10%]">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat -z-10 opacity-10"
          style={{
            backgroundImage: 'url("/Dashboard-bg4.jpg")',
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "0% -55px",
          }}
        />
        <div className="relative min-h-screen overflow-hidden">
          <div className="absolute inset-0 overflow-hidden"></div>
          <div className="absolute top-20 left-20 w-4 h-4 bg-[#0c4da2] transform rotate-45 animate-bounce delay-300"></div>
          <div className="absolute top-40 right-32 w-6 h-6 bg-[#3a5b72] rounded-full animate-bounce delay-700"></div>
          <div className="absolute bottom-40 left-32 w-5 h-5 bg-blue-400 transform rotate-45 animate-bounce delay-1000"></div>
          <div className="relative z-10 w-full max-w-4xl mx-auto px-4 py-8">
            <div className="text-center mb-12">
              <div className="inline-block p-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg mb-6">
                <h1 className="text-4xl sm:text-5xl font-bold text-[#0c4da2] mb-2 lg:text-8xl">
                  <span className="text-[#3a5b72] relative">
                    SHINE
                  </span>
                </h1>
                <p className="text-sm text-gray-600 mt-3 font-medium">
                  SRM Holistic Information on Notification & Engagement
                </p>
              </div>
              <p className="text-xl text-gray-700 font-medium mb-8 lg:text-4xl">
                Welcome User,
              </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-center justify-center">
              <div className="w-full max-w-md">
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-blue-100 hover:shadow-3xl transition-all duration-500 hover:-translate-y-1">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72] rounded-full mb-4 shadow-lg">
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="font-bold text-2xl text-[#0c4da2] mb-2">Portal Login</h2>
                    <div className="w-12 h-1 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72] rounded-full mx-auto"></div>
                  </div>
                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-600 font-medium text-sm">{error}</p>
                    </div>
                  )}
                  {isNewUser && newUserUID && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                      <p className="text-sm font-semibold text-[#0c4da2] mb-3 text-center">Your UID is:</p>
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <div className="bg-white rounded-lg px-3 py-2 border border-blue-200 shadow-sm">
                          <span className="font-mono text-[#0c4da2] font-bold text-sm">
                            {newUserUID}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(newUserUID)}
                          className="p-2 bg-[#0c4da2] text-white rounded-lg hover:bg-[#3a5b72] transition-colors duration-200 shadow-md hover:shadow-lg"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-600 mb-2">Send this UID to admin for approval:</p>
                        <div className="flex items-center justify-center gap-2">
                          <div className="bg-white rounded-lg px-3 py-1 border border-blue-200 shadow-sm">
                            <span className="text-xs text-[#0c4da2] font-medium">admin@srmist.edu.in</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyToClipboard("admin@srmist.edu.in")}
                            className="p-1 bg-[#0c4da2] text-white rounded hover:bg-[#3a5b72] transition-colors duration-200"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={handleGoogleLogin}
                    className="w-full bg-[#0c4da2] text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-500 hover:bg-[#3a5b72] text-lg"
                  >
                    Sign in with Google
                  </button>
                </div>
              </div>

              {/* Features Section */}
              <div className="w-full max-w-md lg:max-w-sm">
                <div className="space-y-4">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72] rounded-full flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-[#0c4da2]">Track Attendance</h3>
                    </div>
                    <p className="text-sm text-gray-600">Monitor your class attendance and academic progress in real-time</p>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72] rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-[#0c4da2]">Academics</h3>
                    </div>
                    <p className="text-sm text-gray-600">Access grades, assignments, and course materials seamlessly</p>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72] rounded-full flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-[#0c4da2]">Placement Progress</h3>
                    </div>
                    <p className="text-sm text-gray-600">Track your placement journey and career opportunities</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-12 space-y-2">
              <p className="text-sm text-[#0c4da2] font-medium italic">
                Track attendance, academics, and placement progress
              </p>
              <p className="text-xs text-gray-500">
                SRM Institute of Science and Technology – Empowering Students for the Future
              </p>
            </div>
          </div>
        </div>

        {/* ✅ UID Display Box - Always Visible */}
        {currentUID && (
          <div className="fixed bottom-4 right-4 bg-white/90 backdrop-blur-md border border-blue-200 shadow-lg rounded-xl px-4 py-2 text-sm font-mono text-[#0c4da2]">
            UID: {currentUID}
          </div>
        )}
      </div>
    );
  }

  // Dashboard redirection
  return (
    <div className="dashboard-container p-4">
      <div className="flex justify-end mb-4"></div>
      {userRole === "teacher" && <AdminDashBoardd secRole={secRole} SectionofFA={SectionofFA} nameOfFA={nameOfFA} />}
      {userRole === "student" && <StudentsDashBoard regNo={regNo} section={section} />}
      {!userRole && <div className="error">No role assigned</div>}

      {/* ✅ UID Display Box - Always Visible */}
      {currentUID && (
        <div className="fixed bottom-4 right-4 bg-white/90 backdrop-blur-md border border-blue-200 shadow-lg rounded-xl px-4 py-2 text-sm font-mono text-[#0c4da2]">
          UID: {currentUID}
        </div>
      )}
    </div>
  );
}
