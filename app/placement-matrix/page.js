"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FormatAForm from '../components/FormatAForm';
import FormatBForm from '../components/FormatBForm';
import TeacherVerificationTable from '../components/TeacherVerificationTable-2'; 
import { auth, db } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import ExportButtonFormA from '../components/ExportButtonFormA';
import ExportButtonFormB from '../components/ExportButtonFormB';

export default function HomePage() {
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [prefilledRegNum, setPrefilledRegNum] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          const userDocRef = doc(db, "UsersLogin", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setUserRole(userData.role);

            // Extract registration number for students
            if (userData.role === 'student' && currentUser.email.endsWith('@srmist.edu.in')) {
              const displayName = currentUser.displayName;
              const regNumMatch = displayName ? displayName.match(/\((RA\d{13})\)/) : null;
              
              if (regNumMatch && regNumMatch[1]) {
                setPrefilledRegNum(regNumMatch[1].toUpperCase());
                console.log(`Successfully Extracted Registration Number: ${regNumMatch[1].toUpperCase()}`);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load user data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleBackToDashboard = () => {
    setIsSubmitting(true);
    if (userRole === 'teacher') {
      router.push('/');
    } else {
      router.push('/');
    }
  };

  const handleFormatSelection = (format) => {
    if (isSubmitting) return;
    setSelectedFormat(format);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">Loading Placement Matrix...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button 
          onClick={handleBackToDashboard}
          disabled={isSubmitting}
          style={{
            ...styles.backButton,
            opacity: isSubmitting ? 0.6 : 1,
            cursor: isSubmitting ? 'not-allowed' : 'pointer'
          }}
        >
          ← Back to Dashboard
        </button>
        <h1 style={styles.heading}>Placement Matrix</h1>
      </div>

      {error && (
        <div style={styles.errorBanner}>
          <p style={styles.errorText}>{error}</p>
        </div>
      )}

      {userRole === 'teacher' ? (
        <>
          <h2 style={styles.subHeading}>Teacher Verification Panel</h2>
          <div style={styles.teacherInfo}>
            <p>Review and verify student placement form submissions below.</p>
          </div>
          <TeacherVerificationTable />
          <div style={styles.exportSection}>
            <h3 style={styles.exportHeading}>Export Options</h3>
            <div style={styles.exportButtons}>
              <ExportButtonFormA/>
              <ExportButtonFormB/>
            </div>
          </div>
        </>
      ) : (
        <>
          <h2 style={styles.subHeading}>Student Placement Forms</h2>
          <div style={styles.studentInfo}>
            <p>Choose a format below to fill out your placement information. All fields are required for complete submission.</p>
          </div>
          
          <div style={styles.buttonContainer}>
            <button
              onClick={() => handleFormatSelection('A')}
              disabled={isSubmitting}
              style={{
                ...styles.button,
                ...(selectedFormat === 'A' && styles.activeButton),
                opacity: isSubmitting ? 0.6 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
            >
              Format A
              <div style={styles.buttonDescription}>Academic & Technical Focus</div>
            </button>
            <button
              onClick={() => handleFormatSelection('B')}
              disabled={isSubmitting}
              style={{
                ...styles.button,
                ...(selectedFormat === 'B' && styles.activeButton),
                opacity: isSubmitting ? 0.6 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
            >
              Format B
              <div style={styles.buttonDescription}>Comprehensive Portfolio</div>
            </button>
          </div>

          {selectedFormat === 'A' && (
            <div style={styles.formContainer}>
              <FormatAForm prefilledRegistrationNumber={prefilledRegNum} />
            </div>
          )}
          {selectedFormat === 'B' && (
            <div style={styles.formContainer}>
              <FormatBForm prefilledRegistrationNumber={prefilledRegNum} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '40px auto',
    padding: '30px',
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    boxShadow: '0 6px 25px rgba(0,0,0,0.1)',
    backgroundColor: '#ffffff',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    lineHeight: '1.6',
    color: '#333',
    minHeight: '80vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px',
    paddingBottom: '20px',
    borderBottom: '2px solid #f0f0f0',
  },
  heading: {
    textAlign: 'center',
    color: '#1a202c',
    fontSize: '2.8em',
    fontWeight: '700',
    flexGrow: 1,
    margin: '0 20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  backButton: {
    padding: '10px 18px',
    fontSize: '0.95em',
    borderRadius: '8px',
    border: '1px solid #6b7280',
    backgroundColor: '#f9fafb',
    color: '#374151',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontWeight: '500',
  },
  subHeading: {
    color: '#4a5568',
    borderBottom: '2px solid #e2e8f0',
    paddingBottom: '15px',
    marginBottom: '30px',
    fontSize: '1.9em',
    fontWeight: '600',
  },
  teacherInfo: {
    backgroundColor: '#f7fafc',
    padding: '15px 20px',
    borderRadius: '8px',
    marginBottom: '25px',
    borderLeft: '4px solid #4299e1',
  },
  studentInfo: {
    backgroundColor: '#f0fff4',
    padding: '15px 20px',
    borderRadius: '8px',
    marginBottom: '25px',
    borderLeft: '4px solid #48bb78',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '50px',
    gap: '25px',
    flexWrap: 'wrap',
  },
  button: {
    padding: '18px 35px',
    fontSize: '18px',
    borderRadius: '10px',
    border: '2px solid #3b82f6',
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontWeight: '600',
    position: 'relative',
    minWidth: '200px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    borderColor: '#3b82f6',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)',
  },
  buttonDescription: {
    fontSize: '12px',
    marginTop: '5px',
    opacity: 0.8,
    fontWeight: '400',
  },
  formContainer: {
    marginTop: '30px',
    padding: '25px',
    backgroundColor: '#fafafa',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
  },
  exportSection: {
    marginTop: '40px',
    padding: '25px',
    backgroundColor: '#f8fafc',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
  },
  exportHeading: {
    fontSize: '1.4em',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '20px',
    textAlign: 'center',
  },
  exportButtons: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  errorBanner: {
    backgroundColor: '#fed7d7',
    border: '1px solid #fc8181',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '25px',
  },
  errorText: {
    color: '#c53030',
    margin: 0,
    fontWeight: '500',
  },
};
