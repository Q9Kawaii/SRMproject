"use client";

import { useState, useEffect } from "react";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import AdminDashBoardd from "./components/Admin-DashBoard";
import StudentsDashBoard from "./components/Students-DashBoard";
import { app } from "../lib/firebase";
import AnimatedBlob from "./components/DashboardComponents/AnimatedBlob";

const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export default function Home() {
  const [userRole, setUserRole] = useState(null);
  const [sectionPrompt, setSectionPrompt] = useState(false);
  const [section, setSection] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setLoading(true);
      setError("");

      if (user) {
        console.log("Current UID:", user.uid);
        try {
          const userRef = doc(db, "UsersLogin", user.uid);
          const docSnap = await getDoc(userRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            const role = data.role;

            if (role === "teacher") {
              setUserRole("teacher");
            } else if (role === "student") {
              if (!user.email.endsWith("@srmist.edu.in")) {
                await auth.signOut();
                setError("Students must use @srmist.edu.in email.");
                setUserRole(null);
              } else {
                setUserRole("student");

                if (!data.section || !data.regNo) {
                  if (!data.section) {
                    setSectionPrompt(true);
                  }

                  if (!data.regNo) {
                    const regNo = prompt("Enter your Registration Number:");
                    if (regNo) {
                      await setDoc(userRef, { regNo: regNo }, { merge: true });
                    }
                  }
                }
              }
            } else {
              setError("Unknown role. Contact admin.");
              await auth.signOut();
              setUserRole(null);
            }
          } else {
            if (user.email.endsWith("@srmist.edu.in")) {
              setSectionPrompt(true);
              const regNo = prompt("Enter your Registration Number:");
              if (regNo) {
                await setDoc(doc(db, "UsersLogin", user.uid), {
                  email: user.email,
                  name: user.displayName,
                  role: "student",
                  regNo: regNo,
                });
              }
            } else {
              await auth.signOut();
              setError(
                "Only SRMIST students or pre-approved teachers can login."
              );
              setUserRole(null);
            }
          }
        } catch (err) {
          console.error("Error fetching user doc:", err);
          setError("Error fetching user data");
          await auth.signOut();
          setUserRole(null);
        }
      } else {
        setUserRole(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Signed in as:", result.user.email);
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed");
      setLoading(false);
    }
  };

  const handleSectionSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    try {
      await setDoc(
        doc(db, "UsersLogin", user.uid),
        {
          email: user.email,
          name: user.displayName,
          role: "student",
          section,
        },
        { merge: true }
      );
      setUserRole("student");
      setSectionPrompt(false);
    } catch (err) {
      setError("Failed to save section");
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setUserRole(null);
      setSectionPrompt(false);
    } catch (err) {
      setError("Logout failed");
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  if (!auth.currentUser) {
    return (
      <>
        <div className="relative min-h-screen w-full flex flex-col items-center justify-center text-center px-4 pt-10 overflow-hidden -mb-40 lg:items-end lg:text-end lg:pb-40 lg:pr-[10%]">
          <AnimatedBlob/>

          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat -z-10"
            style={{
              backgroundImage: 'url("/Dashboard-bg4.jpg")',
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "0% -55px",
            }}
          />

          <div className="relative z-10 w-full max-w-3xl">
            <h1 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-3 lg:mb-15 lg:text-7xl">
              Portal Dashboard
            </h1>

            <p className="text-lg text-gray-800 font-medium mb-2 lg:text-3xl">
              Welcome, User
            </p>

            <div className=" flex flex-col justify-center items-center text-center pb-10 lg:items-end">
              <div className="h-30 w-70 bg-white rounded flex flex-col items-center justify-center text-center px-10 drop-shadow-xl shadow-neutral-900 ">
                <h2 className="font-semibold text-xl pb-5">Portal Login</h2>
                {error && <div className="error">{error}</div>}
                <button
                  onClick={handleGoogleLogin}
                  className="bg-blue-500 rounded-xl px-5 py-2 text-white font-bold text-center"
                >
                  Sign in with Google
                </button>
              </div>
            </div>

            <p className="text-sm text-blue-700 italic mb-4">
              Track attendance, academics, and placement progress
            </p>

            <p className="text-xs text-gray-500">
              SRM Institute of Science and Technology – Empowering Students for
              the Future
            </p>
          </div>
        </div>
      </>
    );
  }

  if (sectionPrompt) {
    return (
      <form onSubmit={handleSectionSubmit} className="section-form">
        <h3>Enter Your Section</h3>
        <input
        className=" bg-neutral-200 m-3 "
          type="text"
          value={section}
          onChange={(e) => setSection(e.target.value)}
          placeholder="e.g., CSE-A"
          required
        />
        <button type="submit">Submit</button>
      </form>
    );
  }

  return (
    <div className="dashboard-container">
      <button onClick={handleLogout} className="bg-red-500 rounded text-white px-2 py-1 text-center ">
        Logout
      </button>
      {userRole === "teacher" && <AdminDashBoardd />}
      {userRole === "student" && <StudentsDashBoard />}
      {!userRole && <div className="error">No role assigned</div>}
    </div>
  );
}
