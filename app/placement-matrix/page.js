"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { auth, db } from "../../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

/* ----------  Dynamically loaded browser-only components  ---------- */
const FormatAForm            = dynamic(() => import("./FormatAForm"),            { ssr: false });
const FormatBForm            = dynamic(() => import("./FormatBForm"),            { ssr: false });
const TeacherVerificationTable = dynamic(() => import("./TeacherVerificationTable"), { ssr: false });
const ApprovedProofs         = dynamic(() => import("./ApprovedProofs"),         { ssr: false });
const ExportButtonFormA      = dynamic(() => import("./ExportButtonFormA"),      { ssr: false });
const ExportButtonFormB      = dynamic(() => import("./ExportButtonFormB"),      { ssr: false });
/* ------------------------------------------------------------------ */

export default function PlacementMatrixPage() {
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [prefilledRegNum, setPrefilledRegNum] = useState("");

  /* --------------------  AUTH & ROLE HANDLING  -------------------- */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async currentUser => {
      setUser(currentUser);

      if (!currentUser) {
        // signed out
        setUserRole(null);
        setPrefilledRegNum("");
        setSelectedFormat(null);
        return;
      }

      const userDocRef  = doc(db, "UsersLogin", currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        setUserRole(userData.role);

        // Prefill reg-no for students
        if (
          userData.role === "student" &&
          currentUser.email?.endsWith("@srmist.edu.in")
        ) {
          const displayName = currentUser.displayName ?? "";
          const match = displayName.match(/\((RA\d{13})\)/);
          if (match?.[1]) setPrefilledRegNum(match[1].toUpperCase());
        }
      } else {
        // First login → add record, default role = student
        await setDoc(
          userDocRef,
          {
            name: currentUser.displayName,
            email: currentUser.email,
            role: "student"
          },
          { merge: true }
        );
        setUserRole("student");
      }
    });

    return () => unsubscribe();
  }, []);
  /* --------------------------------------------------------------- */


  return (
    <div style={styles.container}>

      {userRole === "teacher" ? (
        <>
          <TeacherVerificationTable />
          <ApprovedProofs />
        </>
      ) : (
        <>
          <div style={styles.buttonContainer}>
            <button
              onClick={() => setSelectedFormat("A")}
              style={{
                ...styles.button,
                ...(selectedFormat === "A" ? styles.activeButton : {})
              }}
            >
              Format&nbsp;A
            </button>

            <button
              onClick={() => setSelectedFormat("B")}
              style={{
                ...styles.button,
                ...(selectedFormat === "B" ? styles.activeButton : {})
              }}
            >
              Format&nbsp;B
            </button>
          </div>

          {selectedFormat === "A" && (
            <FormatAForm prefilledRegistrationNumber={prefilledRegNum} />
          )}
          {selectedFormat === "B" && (
            <FormatBForm prefilledRegistrationNumber={prefilledRegNum} />
          )}
        </>
      )}
    </div>
  );
}

/* -------------------------------  STYLES  ------------------------------- */
const styles = {
  container: {
    maxWidth: "900px",
    margin: "40px auto",
    padding: "25px",
    border: "1px solid #e0e0e0",
    borderRadius: "10px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    backgroundColor: "#ffffff",
    fontFamily: "Arial, sans-serif",
    lineHeight: "1.6",
    color: "#333"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "35px"
  },
  heading: {
    textAlign: "center",
    color: "#1a202c",
    fontSize: "2.5em",
    flexGrow: 1
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "40px",
    gap: "20px"
  },
  button: {
    padding: "14px 30px",
    fontSize: "18px",
    borderRadius: "8px",
    border: "2px solid #3b82f6",
    backgroundColor: "#eff6ff",
    color: "#1d4ed8",
    cursor: "pointer",
    fontWeight: "600",
    transition: "background-color 0.3s, color 0.3s, border-color 0.3s"
  },
  activeButton: {
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    borderColor: "#3b82f6"
  }
};