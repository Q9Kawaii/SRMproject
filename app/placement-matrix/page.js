// P_Matrix/app/page.js

"use client";

import React, { useState, useEffect } from 'react';
import FormatAForm from '../components/FormatAForm';
import FormatBForm from '../components/FormatBForm';
import TeacherVerificationTable from '../components/TeacherVerificationTable'; 
import Login from '../components/Login';
import { auth, db } from '../../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import ExportButtonFormA from '../components/ExportButtonFormA';
import ExportButtonFormB from '../components/ExportButtonFormB';
import ApprovedProofs from '../components/ApprovedProofs';


export default function HomePage() {
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [prefilledRegNum, setPrefilledRegNum] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        console.log("Logged in user:", currentUser);
        console.log("User Display Name:", currentUser.displayName);
        console.log("User Email:", currentUser.email);

        const userDocRef = doc(db, "UsersLogin", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setUserRole(userData.role);

          if (userData.role === 'student' && currentUser.email.endsWith('@srmist.edu.in')) {
            const displayName = currentUser.displayName;
            let extractedReg = '';

            
            const regNumDisplayNameMatch = displayName ? displayName.match(/\((RA\d{13})\)/) : null;
            
            if (regNumDisplayNameMatch && regNumDisplayNameMatch[1]) {
              extractedReg = regNumDisplayNameMatch[1].toUpperCase(); 
              console.log(`Successfully Extracted Registration Number: ${extractedReg}`);
            } else {
              console.warn("Could not extract a valid RA-Registration Number from display name. Check if it's in the format 'NAME (RA followed by 13 digits)'. DisplayName:", displayName);
            }

            if (extractedReg) {
              setPrefilledRegNum(extractedReg);
            }
          }
        } else {
          await setDoc(userDocRef, {
            name: currentUser.displayName,
            email: currentUser.email,
            role: "student"
          }, { merge: true });
          setUserRole("student");
          console.log("User added to UsersLogin collection with default 'student' role.");
        }
      } else {
        setUserRole(null);
        setPrefilledRegNum('');
        setSelectedFormat(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User logged out");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (!user) {
    return <Login />;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.heading}>Placement Matrix</h1>
        <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
      </div>

      {userRole === 'teacher' ? (
        <>
          <TeacherVerificationTable />
          <ApprovedProofs />
        </>
        
      ) : (
        <>
          <div style={styles.buttonContainer}>
            <button
              onClick={() => setSelectedFormat('A')}
              style={{ ...styles.button, ...(selectedFormat === 'A' && styles.activeButton) }}
            >
              Format A
            </button>
            <button
              onClick={() => setSelectedFormat('B')}
              style={{ ...styles.button, ...(selectedFormat === 'B' && styles.activeButton) }}
            >
              Format B
            </button>
          </div>

          {selectedFormat === 'A' && <FormatAForm prefilledRegistrationNumber={prefilledRegNum} />}
          {selectedFormat === 'B' && <FormatBForm prefilledRegistrationNumber={prefilledRegNum} />}
        </>
      )}

      <ExportButtonFormA/>
      <ExportButtonFormB/>
    </div>
  );
}


const styles = {
  container: {
    maxWidth: '900px',
    margin: '40px auto',
    padding: '25px',
    border: '1px solid #e0e0e0',
    borderRadius: '10px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    backgroundColor: '#ffffff',
    fontFamily: 'Arial, sans-serif',
    lineHeight: '1.6',
    color: '#333',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '35px',
  },
  heading: {
    textAlign: 'center',
    color: '#1a202c',
    fontSize: '2.5em',
    flexGrow: 1,
  },
  logoutButton: {
    padding: '8px 15px',
    fontSize: '1em',
    borderRadius: '5px',
    border: '1px solid #dc3545',
    backgroundColor: '#dc3545',
    color: 'white',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease',
  },
  subHeading: {
    color: '#4a5568',
    borderBottom: '1px solid #ebf4ff',
    paddingBottom: '12px',
    marginBottom: '25px',
    fontSize: '1.8em',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '40px',
    gap: '20px',
  },
  button: {
    padding: '14px 30px',
    fontSize: '18px',
    borderRadius: '8px',
    border: '2px solid #3b82f6',
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease',
    fontWeight: '600',
  },
  buttonHover: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    borderColor: '#2563eb',
  },
  activeButton: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    borderColor: '#3b82f6',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  },
  inputGroup: {
    border: '1px solid #cbd5e0',
    borderRadius: '8px',
    padding: '25px',
    backgroundColor: '#f8fafc',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 'bold',
    color: '#2d3748',
    fontSize: '0.95em',
  },
  input: {
    width: '100%',
    padding: '12px',
    marginTop: '6px',
    marginBottom: '18px',
    border: '1px solid #a0aec0',
    borderRadius: '6px',
    boxSizing: 'border-box',
    fontSize: '1.05em',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  },
  inputFocus: {
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.25)',
    outline: 'none',
  },
  textarea: {
    width: '100%',
    padding: '12px',
    marginTop: '6px',
    marginBottom: '18px',
    border: '1px solid #a0aec0',
    borderRadius: '6px',
    boxSizing: 'border-box',
    fontSize: '1.05em',
    resize: 'vertical',
    minHeight: '60px',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  },
  textareaFocus: {
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.25)',
    outline: 'none',
  },
  radioGroup: {
    display: 'flex',
    gap: '20px',
    marginTop: '8px',
    marginBottom: '18px',
  },
  submitButton: {
    padding: '15px 35px',
    fontSize: '20px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#10b981',
    color: 'white',
    cursor: 'pointer',
    marginTop: '30px',
    alignSelf: 'center',
    width: 'fit-content',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
    fontWeight: '700',
  },
  submitButtonHover: {
    backgroundColor: '#059669',
    transform: 'translateY(-1px)',
  },
  comingSoon: {
    textAlign: 'center',
    padding: '60px',
    border: '2px dashed #93c5fd',
    borderRadius: '10px',
    marginTop: '30px',
    backgroundColor: '#e0f2fe',
    color: '#1e40af',
    fontSize: '1.2em',
  }
};