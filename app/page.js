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
  const [regNo, setRegNo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newUserUID, setNewUserUID] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

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
            setNewUserUID(user.uid); // store it for later display if needed

            if (role === "teacher") {
              setUserRole("teacher");
            } else if (role === "student") {
              if (!user.email.endsWith("@srmist.edu.in")) {
                setError("Students must use @srmist.edu.in email.");
                setUserRole(null);
              } else {
                setUserRole("student");
                if (!data.section || !data.regNo) {
                  setSectionPrompt(true);
                }
              }
            } else {
              setError("Unknown role. Contact admin.");
              await auth.signOut();
              setUserRole(null);
            }
          } else {
            setNewUserUID(user.uid);
            setIsNewUser(true);
            setSectionPrompt(true);
          }
        } catch (err) {
          console.error("Error fetching user doc:", err);
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
          regNo,
        },
        { merge: true }
      );
      setUserRole("student");
      setSectionPrompt(false);
    } catch (err) {
      setError("Failed to save section and registration number");
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

  if (loading) return <div className="text-center p-5">Loading...</div>;

  if (!userRole && !loading) {
    return (
      <>
        <div className="relative min-h-screen w-full flex flex-col items-center justify-center text-center px-4 pt-10 overflow-hidden -mb-40 lg:items-end lg:text-end lg:pb-40 lg:pr-[10%]">
          <AnimatedBlob />

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

            <div className="flex flex-col justify-center items-center text-center pb-10 lg:items-end">
              <div className="bg-white rounded-xl flex flex-col items-center justify-center text-center px-6 py-4 drop-shadow-xl shadow-neutral-900 w-[85%] max-w-md">
                <h2 className="font-semibold text-xl pb-3">Portal Login</h2>
                {error && <div className="error mb-3 text-red-600 font-medium">{error}</div>}
                {isNewUser && newUserUID && (
                  <div className="text-sm text-blue-600 mb-3 text-center">
                    <p className="mb-1 font-medium text-black">Your UID is:</p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-40 overflow-hidden bg-neutral-200 rounded px-1"><p className="font-mono bg-gray-100 px-3 py-1 rounded text-base text-blue-800">{newUserUID}</p></span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(newUserUID)}
                        className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                      >Copy</button>
                    </div>
                    <p className="mt-2">
                      If there is an issue, email: 
                      <span className="inline-flex items-center gap-2">
                        <br />
                        <span className="w-20 overflow-hidden bg-neutral-200 rounded px-1">email@srmist.edu.in</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard("placements@srmist.edu.in")}
                          className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                        >Copy</button>
                      </span>
                    </p>
                  </div>
                )}
                <button
                  onClick={handleGoogleLogin}
                  className="bg-blue-500 rounded-xl px-5 py-2 text-white font-bold text-center hover:bg-blue-600"
                >
                  Sign in with Google
                </button>
              </div>
            </div>

            <p className="text-sm text-blue-700 italic mb-4">
              Track attendance, academics, and placement progress
            </p>

            <p className="text-xs text-gray-500">
              SRM Institute of Science and Technology – Empowering Students for the Future
            </p>
          </div>
        </div>
      </>
    );
  }

  if (sectionPrompt) {
    return (
      <form
        onSubmit={handleSectionSubmit}
        className="section-form flex flex-col items-center justify-center gap-4 p-10 bg-white rounded shadow max-w-md mx-auto mt-10"
      >
        <h3 className="text-xl font-semibold">Enter Your Section & Registration Number</h3>

        {newUserUID && (
          <div className="text-sm text-blue-600 text-center">
            <p className="mb-1 font-medium text-black">Your UID is:</p>
            <div className="flex items-center justify-center gap-2">
              <code className="font-mono bg-gray-100 px-2 py-1 rounded text-blue-800">{newUserUID}</code>
              <button
                type="button"
                onClick={() => copyToClipboard(newUserUID)}
                className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
              >Copy</button>
            </div>
            <p className="mt-2">
              If there is an issue, email:
              <span className="inline-flex items-center gap-2">
                <a href="mailto:placements@srmist.edu.in" className="text-blue-500 underline">placements@srmist.edu.in</a>
                <button
                  type="button"
                  onClick={() => copyToClipboard("placements@srmist.edu.in")}
                  className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                >Copy</button>
              </span>
            </p>
          </div>
        )}

        <input
          className="bg-neutral-200 p-2 rounded w-full"
          type="text"
          value={section}
          onChange={(e) => setSection(e.target.value)}
          placeholder="Section (e.g., CSE-A)"
          required
        />
        <input
          className="bg-neutral-200 p-2 rounded w-full"
          type="text"
          value={regNo}
          onChange={(e) => setRegNo(e.target.value)}
          placeholder="Registration Number"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Submit
        </button>
        {error && <p className="text-red-500">{error}</p>}
      </form>
    );
  }

  return (
    <div className="dashboard-container p-4">
      <div className="flex justify-end mb-4">
        <button
          onClick={handleLogout}
          className="bg-red-500 rounded text-white px-3 py-1"
        >
          Logout
        </button>
      </div>
      {userRole === "teacher" && <AdminDashBoardd />}
      {userRole === "student" && <StudentsDashBoard />}
      {!userRole && <div className="error">No role assigned</div>}
    </div>
  );
}