"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc, updateDoc, setDoc } from "firebase/firestore";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import HamsterLoader from "../DashboardComponents/HamsterLoader";

export default function StudentsTable({SectionofFA, nameOfFA}) {
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [sendingEmails, setSendingEmails] = useState(false);
  const [filterLowAttendance, setFilterLowAttendance] = useState(false);
  const [sectionFilter, setSectionFilter] = useState(SectionofFA || "");
  const [sentEmailLog, setSentEmailLog] = useState([]);
  const [regNoFilter, setRegNoFilter] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfImages, setPdfImages] = useState([]);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [pdfProcessingStatus, setPdfProcessingStatus] = useState("");
  const [sendingAALog, setSendingAALog] = useState(false);
  const [aaLogSent, setAALogSent] = useState(false);
  
  // New states for email editing
  const [editingEmailId, setEditingEmailId] = useState(null);
  const [editedEmail, setEditedEmail] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);

  const deleteStudent = async (id) => {
    try {
      await deleteDoc(doc(db, "User", id));
      setStudents((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      console.error("Failed to delete student:", error);
      alert("Error deleting student.");
    }
  };

  // New function to update parent email
  const updateParentEmail = async (studentId, newEmail) => {
    if (!newEmail.trim()) {
      alert("Please enter a valid email address.");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      alert("Please enter a valid email format.");
      return;
    }

    try {
      setSavingEmail(true);
      
      // Update in Firebase
      await updateDoc(doc(db, "User", studentId), {
        parentEmail: newEmail.trim()
      });

      // Update local state
      setStudents((prev) => 
        prev.map(student => 
          student.id === studentId 
            ? { ...student, parentEmail: newEmail.trim() }
            : student
        )
      );

      // Reset editing state
      setEditingEmailId(null);
      setEditedEmail("");
      
      alert("Parent email updated successfully!");
    } catch (error) {
      console.error("Error updating parent email:", error);
      alert("Failed to update email. Please try again.");
    } finally {
      setSavingEmail(false);
    }
  };

  // Function to start editing
  const startEditing = (studentId, currentEmail) => {
    setEditingEmailId(studentId);
    setEditedEmail(currentEmail || "");
  };

  // Function to cancel editing
  const cancelEditing = () => {
    setEditingEmailId(null);
    setEditedEmail("");
  };

  useEffect(() => {
    async function fetchStudents() {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "User"));
        const studentsData = [];
        querySnapshot.forEach((docSnap) => {
          const student = docSnap.data();
          const lowSubjects = [];
          if (student.attendance) {
            Object.entries(student.attendance).forEach(([sub, perc]) => {
              if (perc < 75) lowSubjects.push(`${sub}: ${perc}%`);
            });
          }
          studentsData.push({
            id: docSnap.id,
            ...student,
            lowSubjects,
          });
        });
        setStudents(studentsData);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
      setLoading(false);
    }
    fetchStudents();
  }, []);

  const displayedStudents = students.filter((s) => {
    const matchLow = filterLowAttendance ? s.lowSubjects.length > 0 : true;
    const matchSection = sectionFilter 
      ? sectionFilter.toLowerCase() === "all404" 
        ? true
        : s.section?.toLowerCase().includes(sectionFilter.toLowerCase())
      : true;
    const matchRegNo = regNoFilter
      ? s.regNo?.toLowerCase().includes(regNoFilter.toLowerCase())
      : true;
    return matchLow && matchSection && matchRegNo;
  });

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const sendLogToAA = async () => {
    console.log("🔵 sendLogToAA called");
    console.log("📝 nameOfFA:", nameOfFA);
    console.log("📝 SectionofFA:", SectionofFA);

    try {
      const selectedStudents = students
        .filter(s => selected.has(s.id))
        .map(s => s.name);
      
      const docName = `${nameOfFA}___${SectionofFA}`;
      
      const logData = {
        log: {
          students: selectedStudents,
          timestamp: new Date().toISOString()
        }
      };
      
      await setDoc(doc(db, "EmailLogForAA", docName), logData);
      
      setAALogSent(true);
      setTimeout(() => setAALogSent(false), 3000);
      
    } catch (error) {
      console.error("Error sending log to AA:", error);
    }
  };

  const sendEmails = async () => {
    if (!selected.size) return alert("Select students first");

    try {
      const imageMap = {};
      pdfImages.forEach(({ regNo, imagePath }) => {
        const normalizedKey = regNo.trim().toLowerCase();
        imageMap[normalizedKey] = imagePath;
      });

      const studentIds = [...selected];
      const type = "attendance";

      setSendingEmails(true);
      console.log("🚀 Sending imageMap with keys:", Object.keys(imageMap));

      const response = await fetch("/api/send-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentIds,
          type,
          imageMap,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to send emails");

      await sendLogToAA();

      const now = new Date();
      const timeString = now.toLocaleString();
      const logData = students.filter(s => selected.has(s.id)).map(s => ({
        name: s.name,
        regNo: s.regNo,
        section: s.section,
        studentEmail: s.email,
        parentEmail: s.parentEmail,
        lowSubjects: s.lowSubjects.join(", "),
        sentTime: timeString,
      }));
      setSentEmailLog(logData);
      alert("Emails sent successfully!");
      setSelected(new Set());
    } catch (error) {
      console.error("Error sending emails:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setSendingEmails(false);
    }
  };

  const downloadEmailLog = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Attendance Email Log", 14, 22);
    autoTable(doc, {
      startY: 30,
      head: [['Name', 'Reg No', 'Section', 'Student Email', 'Parent Email', 'Low Subjects', 'Sent Time']],
      body: sentEmailLog.map(entry => [
        entry.name,
        entry.regNo,
        entry.section,
        entry.studentEmail,
        entry.parentEmail,
        entry.lowSubjects,
        entry.sentTime
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [30, 64, 175], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });
    doc.save("attendance-email-log.pdf");
  };

  const handlePdfUpload = async () => {
    if (!pdfFile) return alert("Please select a PDF first.");
    try {
      setUploadingPdf(true);
      setPdfProcessingStatus("Uploading PDF...");
      
      const formData = new FormData();
      formData.append("file", pdfFile);

      setPdfProcessingStatus("Processing PDF with smart page selection...");
      
      const res = await fetch("https://pdf-to-images-fastapi-backend.onrender.com/split-pdf", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      
      if (data.status === "error") {
        throw new Error(data.message);
      }
      
      setPdfImages(data.images);
      setPdfProcessingStatus(`Successfully processed ${data.totalStudents} students`);
      
      setTimeout(() => setPdfProcessingStatus(""), 5000);
      alert("PDF uploaded and split successfully!");
    } catch (err) {
      console.error("PDF Upload Failed:", err);
      setPdfProcessingStatus("Failed to process PDF: " + err.message);
      alert("Failed to split PDF: " + err.message);
    } finally {
      setUploadingPdf(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8 flex justify-center items-center">
      <HamsterLoader/>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      {/* PDF Upload Section */}
      <div className="mb-8 p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-3">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800">Upload Letter To Parent</h3>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex-1">
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setPdfFile(e.target.files[0])}
              className="w-full border-2 border-dashed border-gray-300 rounded-xl p-4 text-sm text-gray-600 hover:border-blue-400 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <button
            disabled={!pdfFile || uploadingPdf}
            onClick={handlePdfUpload}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed"
          >
            {uploadingPdf ? "Processing..." : "Upload PDF & Split"}
          </button>
        </div>
        
        {pdfProcessingStatus && (
          <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-xl">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-3"></div>
              <span className="text-blue-700 font-medium">{pdfProcessingStatus}</span>
            </div>
          </div>
        )}
        
        {pdfImages.length > 0 && (
          <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-xl">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-green-700 font-semibold">
                {pdfImages.length} student records processed and ready for email attachments
              </span>
            </div>
          </div>
        )}
      </div>

      {/* PDF Upload Loading Modal */}
      {uploadingPdf && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center mx-4 max-w-md">
            <HamsterLoader />
            <span className="mt-6 text-blue-700 font-semibold text-lg text-center">
              Uploading and processing PDF...
            </span>
          </div>
        </div>
      )}

      {/* AA Log Success Message */}
      {aaLogSent && (
        <div className="fixed top-6 right-6 bg-green-500 text-white px-6 py-4 rounded-xl shadow-lg z-50 animate-slide-in-right">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Log sent to AA successfully!
          </div>
        </div>
      )}

      {/* Email Sending Modal */}
      {sendingEmails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center shadow-2xl mx-4 max-w-md">
            <HamsterLoader/>
            <span className="text-xl font-bold text-blue-700 mt-6 text-center">
              Sending emails, please wait...
            </span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            Students Management
          </h2>
          <p className="text-blue-100 mt-1">Manage attendance alerts and communications</p>
        </div>

        {/* Controls */}
        <div className="p-6 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <button
              onClick={() => setFilterLowAttendance((v) => !v)}
              className={`px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                filterLowAttendance 
                  ? 'bg-green-500 text-white shadow-lg hover:bg-green-600' 
                  : 'bg-white text-green-600 border-2 border-green-500 hover:bg-green-50'
              }`}
              disabled={sendingEmails}
            >
              {filterLowAttendance ? "Show All Students" : "Filter Low Attendance (<75%)"}
            </button>

            <button
              onClick={() => {
                if (selected.size === displayedStudents.length) {
                  setSelected(new Set());
                } else {
                  setSelected(new Set(displayedStudents.map((s) => s.id)));
                }
              }}
              className="px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              disabled={sendingEmails}
            >
              {selected.size === displayedStudents.length ? "Deselect All" : "Select All"}
            </button>

            <input
              type="text"
              placeholder="Filter by Section (e.g. A, B1)"
              value={SectionofFA}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="border-2 border-gray-300 p-3 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              disabled={sendingEmails}
              readOnly
            />

            <input
              type="text"
              placeholder="Filter by Registration No"
              value={regNoFilter}
              onChange={(e) => setRegNoFilter(e.target.value)}
              className="border-2 border-gray-300 p-3 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              disabled={sendingEmails}
            />
          </div>

          {/* Filter Status */}
          {sectionFilter && (
            <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-xl">
              <span className="text-blue-700 font-medium">
                {sectionFilter.toLowerCase() === "all404" 
                  ? "Showing all sections" 
                  : `Filtering by section: ${sectionFilter}`}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {!sectionFilter ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-red-600 font-semibold text-lg">
                Please enter a section in the filter box above to view the student table.
              </p>
            </div>
          ) : displayedStudents.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">
                No students found{filterLowAttendance || sectionFilter ? " with applied filters." : "."}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-4 py-4 text-center text-sm font-bold text-gray-700 border-b border-gray-200">Select</th>
                      <th className="px-4 py-4 text-center text-sm font-bold text-gray-700 border-b border-gray-200">Name</th>
                      <th className="px-4 py-4 text-center text-sm font-bold text-gray-700 border-b border-gray-200">Reg. No</th>
                      <th className="px-4 py-4 text-center text-sm font-bold text-gray-700 border-b border-gray-200">Parent Email</th>
                      <th className="px-4 py-4 text-center text-sm font-bold text-gray-700 border-b border-gray-200">All Subjects Attendance</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {displayedStudents.map((s, index) => (
                      <tr key={s.id} className={`hover:bg-gray-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                        <td className="px-4 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={selected.has(s.id)}
                            onChange={() => toggle(s.id)}
                            disabled={sendingEmails}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                          />
                        </td>
                        <td className="px-4 py-4 text-center font-medium text-gray-900">{s.name}</td>
                        <td className="px-4 py-4 text-center text-gray-600">{s.regNo || "—"}</td>
                        
                        {/* Updated Parent Email Column with Edit Functionality */}
                        <td className="px-4 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {editingEmailId === s.id ? (
                              // Edit Mode
                              <div className="flex items-center gap-2">
                                <input
                                  type="email"
                                  value={editedEmail}
                                  onChange={(e) => setEditedEmail(e.target.value)}
                                  className="px-2 py-1 border border-blue-300 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 min-w-[200px]"
                                  placeholder="Enter parent email"
                                  disabled={savingEmail}
                                />
                                <button
                                  onClick={() => updateParentEmail(s.id, editedEmail)}
                                  disabled={savingEmail}
                                  className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-all duration-200 disabled:bg-gray-400"
                                >
                                  {savingEmail ? "Saving..." : "Save"}
                                </button>
                                <button
                                  onClick={cancelEditing}
                                  disabled={savingEmail}
                                  className="px-3 py-1 bg-gray-500 text-white rounded-lg text-xs font-semibold hover:bg-gray-600 transition-all duration-200"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              // Display Mode
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600 min-w-[150px]">
                                  {s.parentEmail || "No email set"}
                                </span>
                                <button
                                  onClick={() => startEditing(s.id, s.parentEmail)}
                                  disabled={sendingEmails || editingEmailId !== null}
                                  className="px-2 py-1 bg-blue-100 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-200 transition-all duration-200 disabled:bg-gray-100 disabled:text-gray-400"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-4 text-center">
                          <div className="flex flex-wrap gap-1 justify-center">
                            {s.attendance
                              ? Object.entries(s.attendance).map(([subject, percentage], idx) => (
                                  <span
                                    key={idx}
                                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                      percentage < 75
                                        ? "bg-red-100 text-red-800 border border-red-200"
                                        : "bg-green-100 text-green-800 border border-green-200"
                                    }`}
                                  >
                                    {subject}: {percentage}%
                                  </span>
                                ))
                              : <span className="text-gray-400">—</span>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mt-6 p-4 bg-gray-50 rounded-xl">
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">{selected.size}</span> of <span className="font-semibold">{displayedStudents.length}</span> students selected
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={sendEmails}
                    disabled={!selected.size || sendingEmails}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Send Emails to Selected ({selected.size})
                  </button>

                  {sentEmailLog.length > 0 && (
                    <button
                      onClick={downloadEmailLog}
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                      Download Email Log (PDF)
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
