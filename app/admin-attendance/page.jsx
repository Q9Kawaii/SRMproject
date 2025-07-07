"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Upload, Download, AlertTriangle, Check, Clock, Users, Filter, FileText } from 'lucide-react';
import { useSearchParams } from "next/navigation";

// Utility: Get subjects with attendance < 75%

const getLowAttendanceSubjects = (attendanceMap) => {
  if (!attendanceMap || typeof attendanceMap !== 'object') return [];

  return Object.entries(attendanceMap)
    .filter(([_, percent]) => {
      // Convert the percentage string (e.g., "61.54") to a number (e.g., 61.54)
      const numericPercent = parseFloat(String(percent).replace('%', ''));
      // Check if it's a valid number AND if it's less than 75
      return !isNaN(numericPercent) && numericPercent < 75;
    })
    .map(([subject]) => subject);
};

const AdminAttendancePage = () => {
  const searchParams = useSearchParams();
  const secRole = searchParams.get('role') || "FA";
  const [section, setSection] = useState('');
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showLowAttendanceOnly, setShowLowAttendanceOnly] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [processingActions, setProcessingActions] = useState(new Set()); // For granular button loading states
  const [message, setMessage] = useState({ type: '', text: '' }); // For user feedback messages
  const [showConfirmBulkAlert, setShowConfirmBulkAlert] = useState(false); // For custom bulk alert confirmation modal
  

  // Clears messages after a delay
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000); // Message disappears after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Function to fetch and enrich student data based on section
  // This now fetches all necessary absent record details upfront for display
  const handleSectionSearch = async () => {
    if (!section.trim()) {
      setMessage({ type: 'error', text: 'Please enter a section to search.' });
      setStudents([]);
      setFilteredStudents([]);
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' }); // Clear previous messages
    try {
      const res = await fetch('/api/fetch-students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section }),
      });
      
      if (!res.ok) throw new Error('Failed to fetch students');
      const json = await res.json();
      if (!Array.isArray(json.data)) {
        console.error('Expected array in json.data but got:', json);
        throw new Error('Invalid data format from /api/fetch-students');
      }
      const studentsData = json.data;

      // Enrich students data with absent records and attendance info
      const enrichedStudents = await Promise.all(
        studentsData.map(async (student) => {
          try {
            const absentRes = await fetch(`/api/get-absent-records?regNo=${encodeURIComponent(student.regNo)}`);
            const absentRecordsRaw = await absentRes.json();
            
            // --- ADDED/CORRECTED CONSOLE.LOG HERE ---
            console.log(`Absent records for ${student.name} (${student.regNo}):`, absentRecordsRaw);
            // --- END ADDITION/CORRECTION ---

            console.log("Checking attendance for:", student.name, student.attendance);
            const lowAttendanceSubjects = getLowAttendanceSubjects(student.attendance || {});
            console.log("Low attendance for", student.name, "=>", lowAttendanceSubjects);

            return {
              ...student,
              // --- CORRECTED THIS LINE ---
              absentRecords: absentRecordsRaw.records, // <--- IMPORTANT: Access the 'records' property
              // --- END CORRECTION ---
              lowAttendanceSubjects,
              hasLowAttendance: lowAttendanceSubjects.length > 0
            };
          } catch (error) {
            console.error(`Error fetching absent records for ${student.regNo}:`, error);
            return {
              ...student,
              absentRecords: [],
              lowAttendanceSubjects: [],
              hasLowAttendance: false
            };
          }
        })
      );

      setStudents(enrichedStudents);
      setMessage({ type: 'success', text: `Found ${enrichedStudents.length} students in section ${section}.` });

    } catch (error) {
      console.error('Error fetching students:', error);
      setMessage({ type: 'error', text: 'Failed to fetch students. Please check the section name.' });
      setStudents([]);
    } finally {
      setLoading(false);
    }
};
  // Filter students based on attendance threshold
  useEffect(() => {
    if (showLowAttendanceOnly) {
      setFilteredStudents(students.filter(student => student.hasLowAttendance));
    } else {
      setFilteredStudents(students);
    }
  }, [showLowAttendanceOnly, students]); // Re-filter when 'showLowAttendanceOnly' or 'students' changes

  // Handle individual alert
  const handleAlert = async (regNo) => {
    const today = new Date();
    // Format date to DDMMYYYY for the absentRecords key
    const dateStr = today.toLocaleDateString('en-GB').replace(/\//g, '');
    const actionKey = `alert-${regNo}-${dateStr}`;

    // Check if this specific alert action is already processing
    if (processingActions.has(actionKey)) return;

    setProcessingActions(prev => new Set([...prev, actionKey])); // Add to processing set
    setMessage({ type: '', text: '' });

    try {
      await fetch('/api/alert-student', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ regNo, dateStr }),
    });

      setMessage({ type: 'success', text: `Alert successfully raised for ${regNo} on ${dateStr}.` });
      await handleSectionSearch(); // Refresh data to show updated status
    } catch (error) {
      console.error('Error alerting student:', error);
      setMessage({ type: 'error', text: `Failed to alert ${regNo}: ${error.message}.` });
    } finally {
      setProcessingActions(prev => { // Remove from processing set
        const newSet = new Set(prev);
        newSet.delete(actionKey);
        return newSet;
      });
    }
  };

  // Handle bulk alert for low attendance students
  const handleBulkAlert = async () => {
    const lowAttendanceStudents = students.filter(student => student.hasLowAttendance);
    const regNos = lowAttendanceStudents.map(student => student.regNo);

    if (regNos.length === 0) {
      setMessage({ type: 'info', text: 'No students with attendance below 75% found in this section.' });
      return;
    }

    // Show custom confirmation message
    setShowConfirmBulkAlert(true);
  };

  // src/components/AdminAttendancePage.jsx (replace your existing confirmBulkAlert function with this)

const confirmBulkAlert = async () => {
  setShowConfirmBulkAlert(false); // Close confirmation modal
  const lowAttendanceStudents = students.filter(student => student.hasLowAttendance);
  const regNos = lowAttendanceStudents.map(student => student.regNo);
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-GB').replace(/\//g, '');

  setLoading(true); // General loading for bulk action
  setMessage({ type: '', text: '' });

  try {
    const res = await fetch('/api/bulk-alert-students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ regNos, dateStr }),
    });

    // --- IMPORTANT: ADDED THIS CHECK ---
    if (!res.ok) {
      const errorData = await res.json(); // Try to parse error message from server
      throw new Error(errorData.message || 'Failed to perform bulk alert.');
    }
    // --- END ADDITION ---

    const responseData = await res.json(); // Get the full response object
    
    // --- IMPORTANT: Access the 'result' property from the responseData ---
    // Your API returns { success: true, result: [...] }
    const resultsArray = responseData.result; 
    
    console.log("Bulk alert API response (parsed array):", resultsArray); 
    // --- END IMPORTANT CHANGE ---

    let successCount = 0;
    let failCount = 0;

    // --- IMPORTANT: Iterate over 'resultsArray' and use 'result' as the loop variable ---
    resultsArray.forEach(result => { 
      if (result.success) { 
        successCount++;
      } else {
        failCount++;
        console.error(`Failed to alert ${result.regNo}: ${result.error}`); 
      }
    });
    // --- END IMPORTANT CHANGE ---

    setMessage({ type: 'success', text: `Bulk alert completed. Success: ${successCount}, Failed: ${failCount}.` });
    await handleSectionSearch(); // Refresh data to show updated alert statuses
  } catch (error) {
    console.error('Error in bulk alert:', error);
    setMessage({ type: 'error', text: 'An unexpected error occurred during bulk alerting: ' + error.message });
  } finally {
    setLoading(false);
  }
};


  // Handle FA approval
  const handleFAApproval = async (regNo, dateStr) => {
    const actionKey = `fa-${regNo}-${dateStr}`;
    if (processingActions.has(actionKey)) return;

    setProcessingActions(prev => new Set([...prev, actionKey]));
    setMessage({ type: '', text: '' });

    try {
      await fetch('/api/approve-fa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ regNo, dateStr }),
    });

      setMessage({ type: 'success', text: `FA approval for ${regNo} on ${dateStr} successful.` });
      await handleSectionSearch(); // Refresh data
    } catch (error) {
      console.error('Error in FA approval:', error);
      setMessage({ type: 'error', text: `Failed to approve FA for ${regNo} on ${dateStr}: ${error.message}.` });
    } finally {
      setProcessingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(actionKey);
        return newSet;
      });
    }
  };

  // Handle AA approval
  const handleAAApproval = async (regNo, dateStr) => {
    const actionKey = `aa-${regNo}-${dateStr}`;
    if (processingActions.has(actionKey)) return;

    setProcessingActions(prev => new Set([...prev, actionKey]));
    setMessage({ type: '', text: '' });

    try {
      await fetch('/api/approve-aa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ regNo, dateStr }),
    });

      setMessage({ type: 'success', text: `AA approval for ${regNo} on ${dateStr} successful.` });
      await handleSectionSearch(); // Refresh data
    } catch (error) {
      console.error('Error in AA approval:', error);
      setMessage({ type: 'error', text: `Failed to approve AA for ${regNo} on ${dateStr}: ${error.message}.` });
    } finally {
      setProcessingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(actionKey);
        return newSet;
      });
    }
  };

  // Handle PDF download - NOW CALLS BACKEND API
  const handleDownloadReport = async () => {
    if (!section || !selectedMonth) {
      setMessage({ type: 'error', text: 'Please enter a section and select a month to download the report.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' }); // Clear previous messages

    try {
      // Construct the URL for your Next.js API endpoint
      // IMPORTANT: Assume your Next.js API route is at /api/download-report.
      // You MUST create this file (e.g., pages/api/download-report.js) in your Next.js project.
      const apiUrl = `/api/download-report?section=${encodeURIComponent(section)}&month=${encodeURIComponent(selectedMonth)}`;

      const response = await fetch(apiUrl);

      if (response.status === 204) { // 204 No Content if no data was found by the backend
        setMessage({ type: 'info', text: 'No absent records found for the selected section and month to generate a report.' });
        setLoading(false);
        return;
      }

      if (!response.ok) {
        // Attempt to read the error message from the response body if available
        const errorText = await response.text();
        throw new Error(`Server responded with status ${response.status}: ${errorText || 'Unknown error'}`);
      }

      // If successful, trigger the download in the browser
      // The server sends the PDF as a binary blob, which the browser can then download.
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); // Create a temporary anchor element
      a.href = url;
      a.download = `Attendance_Report_${section}_${selectedMonth}.pdf`; // Suggest a filename
      document.body.appendChild(a); // Append to body (required for Firefox)
      a.click(); // Programmatically click the anchor to trigger download
      a.remove(); // Clean up the temporary anchor element
      window.URL.revokeObjectURL(url); // Release the object URL

      setMessage({ type: 'success', text: 'PDF report download initiated successfully!' });

    } catch (error) {
      console.error('Error downloading report:', error);
      setMessage({ type: 'error', text: `Failed to download report: ${error.message}. Please try again.` });
    } finally {
      setLoading(false);
    }
  };

  // Helper to get attendance percentage pill color
  const getAttendanceColor = (percentage) => {
    if (percentage >= 85) return 'bg-green-100 text-green-800';
    if (percentage >= 75) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  // Helper to get status badge for an individual absent record
  const getRecordStatusBadge = (record) => {
    // This assumes the record object has boolean properties for faApproved, aaApproved, and resolved
    // as parsed by the getAbsentRecords function in attendanceLogic.js
    if (record.resolved) {
      return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs flex items-center gap-1"><Check size={12} />Resolved</span>;
    } else if (record.faApproved) {
      return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center gap-1">FA Approved</span>;
    } else if (record.aaApproved) {
      // This state implies AA approved without FA, which might be a business rule violation depending on flow
      return <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs flex items-center gap-1">AA Approved (FA Pending)</span>;
    } else {
      return <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs flex items-center gap-1"><AlertTriangle size={12} />Pending</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-sm p-6 mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Attendance Management</h1>
              <p className="text-gray-600 mt-1">Admin Dashboard - <span className="font-medium text-blue-600">{secRole}</span> View</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.open('https://university-portal-pink.vercel.app/', '_blank')}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              <Upload size={20} />
              <span>Upload Attendance</span>
            </motion.button>
          </div>
        </motion.div>

        {/* User Feedback Message */}
        <AnimatePresence>
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`p-4 rounded-lg mb-4 text-sm font-medium shadow-md ${
                message.type === 'success' ? 'bg-green-100 text-green-800' :
                message.type === 'error' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bulk Alert Confirmation Modal */}
        <AnimatePresence>
          {showConfirmBulkAlert && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full text-center"
              >
                <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Bulk Alert</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to send alerts to all students with attendance below 75% in section <span className="font-semibold">{section}</span>?
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setShowConfirmBulkAlert(false)}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmBulkAlert}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Confirm Alert
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm p-6 mb-6"
        >
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="section-search" className="block text-gray-700 text-sm font-semibold mb-2">
                Enter Section
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-transparent transition-all duration-200">
                <Search className="text-gray-400 ml-3" size={20} />
                <input
                  type="text"
                  id="section-search"
                  className="flex-1 p-3 bg-transparent outline-none text-gray-700 placeholder-gray-400"
                  placeholder="e.g., A, B, C"
                  value={section}
                  onChange={(e) => setSection(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && handleSectionSearch()}
                />
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSectionSearch}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-md"
            >
              {loading ? 'Searching...' : 'Search Students'}
            </motion.button>

            {students.length > 0 && (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowLowAttendanceOnly(!showLowAttendanceOnly)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors shadow-md ${
                    showLowAttendanceOnly
                      ? 'bg-red-100 text-red-800 hover:bg-red-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Filter size={16} />
                  <span>{showLowAttendanceOnly ? 'Show All Students' : 'Filter Below 75%'}</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBulkAlert}
                  disabled={loading || filteredStudents.filter(s => s.hasLowAttendance).length === 0}
                  className="flex items-center space-x-2 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 shadow-md"
                >
                  <AlertTriangle size={16} />
                  <span>Alert All Below 75%</span>
                </motion.button>

                <div className="flex items-end space-x-2 ml-auto min-w-[250px]"> {/* ml-auto pushes it to the right */}
                  <div className="flex-1">
                    <label htmlFor="month-select" className="block text-gray-700 text-sm font-semibold mb-2">
                      Report Month
                    </label>
                    <select
                      id="month-select"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    >
                      <option value="">Select Month</option>
                      {Array.from({ length: 12 }, (_, i) => {
                        const monthNum = (i + 1).toString().padStart(2, '0');
                        const currentYear = new Date().getFullYear();
                        const optionValue = `${monthNum}${currentYear}`; // e.g., 062025
                        const monthName = new Date(currentYear, i, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
                        return <option key={optionValue} value={optionValue}>{monthName}</option>;
                      })}
                    </select>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDownloadReport}
                    disabled={loading || !selectedMonth || filteredStudents.length === 0}
                    className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 shadow-md"
                  >
                    <Download size={16} />
                    <span>Download PDF</span>
                  </motion.button>
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Students Table */}
        <AnimatePresence mode="wait">
          {loading && !students.length ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center items-center h-48 bg-white rounded-lg shadow-sm"
            >
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
              <p className="ml-4 text-gray-600 text-lg">Loading student data...</p>
            </motion.div>
          ) : filteredStudents.length === 0 && section.trim() ? (
            <motion.div
              key="no-students"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12 bg-white rounded-lg shadow-sm"
            >
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {showLowAttendanceOnly
                  ? `No students with attendance below 75% in section '${section}'.`
                  : `No students found in section '${section}'. Please check the section name or try a different one.`}
              </p>
            </motion.div>
          ) : filteredStudents.length > 0 && (
            <motion.div
              key="student-table"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-lg shadow-sm overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reg. No</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Low Att. Subjects</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">All Subjects Att.</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Absent Details & Controls</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStudents.map((student, index) => (
                      <motion.tr
                        key={student.regNo}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.regNo}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.section}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:underline cursor-pointer">
                          <a href={`mailto:${student.email}`}>{student.email}</a>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:underline cursor-pointer">
                          <a href={`mailto:${student.parentEmail}`}>{student.parentEmail}</a>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {student.lowAttendanceSubjects.length > 0 ? (
                              student.lowAttendanceSubjects.map((subject) => (
                                <span key={subject} className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                                  {subject}
                                </span>
                              ))
                            ) : (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">None</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(student.attendance || {}).map(([subject, percentage]) => (
                              <span key={subject} className={`px-2 py-1 rounded-full text-xs ${getAttendanceColor(percentage)}`}>
                                {subject}: {percentage}%
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="space-y-3">
                            {student.absentRecords && student.absentRecords.length > 0 ? (
                              // Iterate over each absent record for this student
                              student.absentRecords.map((record, recIndex) => (
                                <div key={record.date} className="p-3 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
                                  <div className="flex justify-between items-center mb-1">
                                    <p className="font-semibold text-gray-800 text-base flex items-center gap-1">
                                      <FileText size={16} /> Date: {record.date}
                                    </p>
                                    {/* Display status badge for this specific record */}
                                    {getRecordStatusBadge(record)}
                                  </div>
                                  <p className="text-sm text-gray-600 mb-1">Reason: {record.reason || '—'}</p>
                                  <div className="text-xs text-gray-500 space-y-0.5 mb-2">
                                    <p className="flex items-center gap-1"><Clock size={12} /> Alerted: {record.alertTimestamp || '—'}</p>
                                    <p className="flex items-center gap-1"><Clock size={12} /> FA Time: {record.faTimestamp || '—'}</p>
                                    <p className="flex items-center gap-1"><Clock size={12} /> AA Time: {record.aaTimestamp || '—'}</p>
                                  </div>
                                  <div className="mt-2 flex gap-2">
                                    <motion.button
                                      whileHover={{ scale: secRole === 'FA' && !record.faApproved ? 1.05 : 1 }}
                                      whileTap={{ scale: secRole === 'FA' && !record.faApproved ? 0.95 : 1 }}
                                      onClick={() => handleFAApproval(student.regNo, record.date)}
                                      // Disable if already approved by FA, or if current role is not FA
                                      // or if this specific action is being processed
                                      disabled={record.faApproved || secRole !== 'FA' || processingActions.has(`fa-${student.regNo}-${record.date}`)}
                                      className={`px-3 py-1 text-xs font-medium rounded-md transition-all duration-200 shadow-sm
                                        ${record.faApproved || secRole !== 'FA'
                                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                          : 'bg-blue-500 text-white hover:bg-blue-600 transform hover:scale-105'
                                        }`}
                                    >
                                      {processingActions.has(`fa-${student.regNo}-${record.date}`) ? 'Approving...' : (record.faApproved ? 'FA Approved' : 'FA Approve')}
                                    </motion.button>
                                    <motion.button
                                      whileHover={{ scale: secRole === 'AA' && !record.aaApproved ? 1.05 : 1 }}
                                      whileTap={{ scale: secRole === 'AA' && !record.aaApproved ? 0.95 : 1 }}
                                      onClick={() => handleAAApproval(student.regNo, record.date)}
                                      // Disable if already approved by AA, or if current role is not AA
                                      // or if this specific action is being processed
                                      disabled={record.aaApproved || secRole !== 'AA' || processingActions.has(`aa-${student.regNo}-${record.date}`)}
                                      className={`px-3 py-1 text-xs font-medium rounded-md transition-all duration-200 shadow-sm
                                        ${record.aaApproved || secRole !== 'AA'
                                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                          : 'bg-purple-600 text-white hover:bg-purple-700 transform hover:scale-105'
                                        }`}
                                    >
                                      {processingActions.has(`aa-${student.regNo}-${record.date}`) ? 'Approving...' : (record.aaApproved ? 'AA Approved' : 'AA Approve')}
                                    </motion.button>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-gray-500">No active absent alerts.</p>
                            )}
                            {/* Alert button for a new alert for today's date */}
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleAlert(student.regNo)}
                              // Use today's date for the action key for the alert button
                              disabled={
                                processingActions.has(`alert-${student.regNo}-${new Date().toLocaleDateString('en-GB').replace(/\//g, '')}`) ||
                                // --- ADD THIS LINE FOR DISABLING ---
                                !student.hasLowAttendance // Disable if attendance is NOT low (i.e., >= 75%)
                              }
                              className={`px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-all duration-200 transform mt-2 ${
                                // --- UPDATE THIS LINE FOR STYLING ---
                                !student.hasLowAttendance || processingActions.has(`alert-${student.regNo}-${new Date().toLocaleDateString('en-GB').replace(/\//g, '')}`)
                                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed' // Grey out if not low attendance or processing
                                  : 'bg-red-500 text-white hover:bg-red-600 hover:scale-105' // Active red if low attendance and not processing
                              }`}
                            >
                              {processingActions.has(`alert-${student.regNo}-${new Date().toLocaleDateString('en-GB').replace(/\//g, '')}`) ? 'Alerting...' : 'Alert Student'}
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
          {/* Empty State for no students found */}
          {/* {!loading && filteredStudents.length === 0 && section.trim() && (
            <motion.div
              key="no-students"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12 bg-white rounded-lg shadow-sm"
            >
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {showLowAttendanceOnly
                  ? `No students with attendance below 75% in section '${section}'.`
                  : `No students found in section '${section}'. Please check the section name or try a different one.`}
              </p>
            </motion.div>
          )} */}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminAttendancePage;
