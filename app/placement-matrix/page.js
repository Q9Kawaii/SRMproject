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
            if (
              userData.role === 'student' &&
              currentUser.email?.endsWith('@srmist.edu.in')
            ) {
              const displayName = currentUser.displayName;
              const regNumMatch = displayName
                ? displayName.match(/\((RA\d{13})\)/)
                : null;
              if (regNumMatch && regNumMatch[1]) {
                setPrefilledRegNum(regNumMatch[1].toUpperCase());
              }
            }
          }
        }
      } catch (error) {
        setError('Failed to load user data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleBackToDashboard = () => {
    setIsSubmitting(true);
    router.push('/');
  };
  const handleRefresh = () => {
    window.location.reload();
  };
  const handleFormatSelection = (format) => {
    if (isSubmitting) return;
    setSelectedFormat(format);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-lg text-slate-600 font-medium">Loading Placement Matrix...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl sm:max-w-4xl md:max-w-5xl mx-auto my-5 p-6 bg-white rounded-xl shadow-lg border border-slate-200 min-h-[75vh]">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-slate-100">
        <button
          onClick={handleBackToDashboard}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-600 font-medium hover:bg-slate-50 transition-colors disabled:opacity-60"
        >
          <span>←</span>
          Back
        </button>
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2 select-none">
          <span className="text-lg md:text-2xl">📊</span>
          Placement Matrix
        </h1>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-600 font-medium hover:bg-slate-50 transition-colors"
        >
          <span>🔄</span>
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-100 border border-red-300 rounded-lg p-4 mb-6">
          <span>⚠️</span>
          <span className="text-red-700 font-medium">{error}</span>
        </div>
      )}

      {/* Teacher View */}
      {userRole === 'teacher' ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg md:text-xl font-bold text-slate-700">Verification Panel</h2>
            <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs md:text-sm font-medium">Teacher</span>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg mb-6 border-l-4 border-blue-400 flex items-start gap-2 text-sm">
            <span className="text-lg">💡</span>
            <span className="text-slate-600">
              Review and verify student placement form submissions below.
            </span>
          </div>
          <TeacherVerificationTable />
          <div className="mt-8 p-6 bg-slate-50 rounded-lg border border-slate-200 shadow">
            <h3 className="text-base font-bold text-slate-700 mb-1 text-center flex items-center justify-center gap-2">
              <span>📥</span> Export Options
            </h3>
            <div className="flex gap-4 justify-center mt-3 flex-wrap">
              <ExportButtonFormA />
              <ExportButtonFormB />
            </div>
          </div>
        </>
      ) : (
        /* Student View */
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg md:text-xl font-bold text-slate-700">Your Placement Forms</h2>
            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs md:text-sm font-medium">Student</span>
          </div>
          <div className="bg-green-50 p-4 rounded-lg mb-6 border-l-4 border-green-400 flex items-start gap-2 text-sm">
            <span className="text-lg">📝</span>
            <span className="text-slate-600">
              Choose a format below to fill out your placement information.<br className="hidden sm:block" />
              All fields are required for complete submission.
            </span>
          </div>

          {/* Format Selection Buttons */}
          <div className="flex justify-center mb-6 gap-4 flex-wrap">
            <button
              onClick={() => handleFormatSelection('A')}
              disabled={isSubmitting}
              className={`
                flex flex-col items-center min-w-[140px] md:min-w-[180px] px-5 py-3 rounded-lg border-2 transition-all font-semibold text-blue-700
                ${selectedFormat === 'A'
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg -translate-y-1'
                  : 'bg-blue-50 border-blue-400 hover:bg-blue-100'}
                ${isSubmitting ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              Format A
              <div className={`mt-1 text-xs ${selectedFormat === 'A' ? 'text-white' : 'text-blue-700/80'}`}>
                Academic & Technical Focus
              </div>
            </button>
            <button
              onClick={() => handleFormatSelection('B')}
              disabled={isSubmitting}
              className={`
                flex flex-col items-center min-w-[140px] md:min-w-[180px] px-5 py-3 rounded-lg border-2 transition-all font-semibold text-blue-700
                ${selectedFormat === 'B'
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg -translate-y-1'
                  : 'bg-blue-50 border-blue-400 hover:bg-blue-100'}
                ${isSubmitting ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              Format B
              <div className={`mt-1 text-xs ${selectedFormat === 'B' ? 'text-white' : 'text-blue-700/80'}`}>
                Comprehensive Portfolio
              </div>
            </button>
          </div>

          {/* Selected Form */}
          <div className={selectedFormat ? "mt-2 p-4 bg-slate-50 rounded-lg border border-slate-200" : ""}>
            {selectedFormat === 'A' && (
              <FormatAForm prefilledRegistrationNumber={prefilledRegNum} />
            )}
            {selectedFormat === 'B' && (
              <FormatBForm prefilledRegistrationNumber={prefilledRegNum} />
            )}
          </div>
        </>
      )}
    </div>
  );
}
