"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import HamsterLoader from "./HamsterLoader";

export default function StudentsTable() {
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [sendingEmails, setSendingEmails] = useState(false);
  const [filterLowAttendance, setFilterLowAttendance] = useState(false);
  const [sectionFilter, setSectionFilter] = useState("");
  const [sentEmailLog, setSentEmailLog] = useState([]);
  const [regNoFilter, setRegNoFilter] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfImages, setPdfImages] = useState([]);
  const [uploadingPdf, setUploadingPdf] = useState(false);




  const deleteStudent = async (id) => {
    try {
      await deleteDoc(doc(db, "User", id));
      setStudents((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      console.error("Failed to delete student:", error);
      alert("Error deleting student.");
    }
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
  
  // Special case: if "all404" is entered, show all sections
  const matchSection = sectionFilter
    ? sectionFilter.toLowerCase() === "all404" 
      ? true  // Show all sections
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

  const sendEmails = async () => {
    if (!selected.size) return alert("Select students first");

    try {
      const imageMap = {};
pdfImages.forEach(({ regNo, imagePath }) => {
  imageMap[regNo] = imagePath;
});

      setSendingEmails(true);
      const response = await fetch("/api/send-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentIds: Array.from(selected), type: "attendance", imageMap: imageMap, }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to send emails");

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
    setUploadingPdf(true); // Show loader
    const formData = new FormData();
    formData.append("file", pdfFile);

    const res = await fetch("https://pdf-to-images-srmproject.onrender.com/split-pdf", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setPdfImages(data.images); // [{ regNo, imagePath }]
    alert("PDF uploaded and split successfully!");
  } catch (err) {
    console.error("PDF Upload Failed:", err);
    alert("Failed to split PDF.");
  }finally {
    setUploadingPdf(false); // ✅ Hide loader
  }
};


  if (loading) return <div className="p-8 flex justify-center"><HamsterLoader/></div>;

  return (
    
    <div className="relative">
    <input
  type="file"
  accept="application/pdf"
  onChange={(e) => setPdfFile(e.target.files[0])}
  className="border p-2 rounded"
/>
<button
  disabled={!pdfFile}
  onClick={handlePdfUpload}
  className="px-4 py-2 bg-[#0c4da2] text-white rounded hover:bg-purple-700"
>
  Upload PDF & Split
</button>{uploadingPdf && (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
    <div className="bg-white rounded-xl p-8 shadow-lg flex flex-col items-center mx-2">
      <HamsterLoader />
      <span className="mt-4 text-blue-700 font-semibold text-lg">Uploading and processing PDF...</span>
    </div>
  </div>
)}


      {sendingEmails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-8 flex flex-col items-center shadow-lg">
            <HamsterLoader/>
            <span className="text-lg font-semibold text-blue-700 mt-4">
              Sending emails, please wait...
            </span>
          </div>
        </div>
      )}

      <div className="p-6 bg-white rounded shadow">
        <h2 className="text-xl font-bold mb-4">Students</h2>

        <div className="flex flex-wrap gap-4 mb-4">
          <button
            onClick={() => setFilterLowAttendance((v) => !v)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            disabled={sendingEmails}
          >
            {filterLowAttendance
              ? "Show All Students"
              : "Filter Low Attendance (<75%)"}
          </button>

          <button
            onClick={() => {
              if (selected.size === displayedStudents.length) {
                setSelected(new Set());
              } else {
                setSelected(new Set(displayedStudents.map((s) => s.id)));
              }
            }}
            className="px-4 py-2 bg-[#0c4da2]  text-white rounded hover:bg-blue-700"
            disabled={sendingEmails}
          >
            {selected.size === displayedStudents.length
              ? "Deselect All"
              : "Select All"}
          </button>

          <input
            type="text"
            placeholder="Filter by Section (e.g. A, B1)"
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className="border p-2 rounded w-64"
            disabled={sendingEmails}
          />
          <input
  type="text"
  placeholder="Filter by Registration No"
  value={regNoFilter}
  onChange={(e) => setRegNoFilter(e.target.value)}
  className="border p-2 rounded w-64"
  disabled={sendingEmails}
/>

        </div>
        {!sectionFilter ? (
  <p className="text-red-600 font-semibold">
    Please enter a section in the filter box above to view the student table. (Type all404 to show all sections)
  </p>
) : (
  displayedStudents.length === 0 ? (
    <p>
      No students found
      {filterLowAttendance || sectionFilter ? " with applied filters." : "."}
    </p>
  ) : (
          <>
          {/* Display current filter status */}
      <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded">
        <span className="text-blue-700 font-medium">
          {sectionFilter.toLowerCase() === "all404" 
            ? "Showing all sections" 
            : `Filtering by section: ${sectionFilter}`}
        </span>
      </div>
            <div className="overflow-x-auto">
              <table className="min-w-full border mb-4 text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-center">Select</th>
                    <th className="p-2 text-center">Name</th>
                    <th className="p-2 text-center">Reg. No</th>
                    <th className="p-2 text-center">Section</th>
                    <th className="p-2 text-center">Student Email</th>
                    <th className="p-2 text-center">Parent Email</th>
                    <th className="p-2 text-center">Low Attendance Subjects</th>
                    <th className="p-2 text-center">All Subjects Attendance</th>
                    <th className="p-2 text-center">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedStudents.map((s) => (
                    <tr key={s.id} className="border-t">
                      <td className="p-2 text-center">
                        <input
                          type="checkbox"
                          checked={selected.has(s.id)}
                          onChange={() => toggle(s.id)}
                          disabled={sendingEmails}
                        />
                      </td>
                      <td className="p-2 text-center">{s.name}</td>
                      <td className="p-2 text-center">{s.regNo || "—"}</td>
                      <td className="p-2 text-center">{s.section || "—"}</td>
                      <td className="p-2 text-center">{s.email}</td>
                      <td className="p-2 text-center">{s.parentEmail}</td>
                      <td className="p-2 flex flex-col text-center">
                        {s.lowSubjects.length === 0
                          ? "None"
                          : s.lowSubjects.map((ls, i) => (
                              <span
                                key={i}
                                className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded mr-2 mb-1"
                              >
                                {ls}
                              </span>
                            ))}
                      </td>
                      <td className="p-2 text-center">
                        {s.attendance
                          ? Object.entries(s.attendance).map(([subject, percentage], idx) => (
                              <div
                                key={idx}
                                className={
                                  percentage < 75
                                    ? "bg-red-100 text-red-800 px-2 py-1 rounded mr-2 mb-1"
                                    : "text-green-600 bg-green-100 px-2 py-1 rounded mr-2 mb-1"
                                }
                              >
                                {subject}: {percentage}%
                              </div>
                            ))
                          : "—"}
                      </td>
                      
                      <td className="p-2">
                        <button
                          onClick={() => deleteStudent(s.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                          disabled={sendingEmails}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={sendEmails}
              disabled={!selected.size || sendingEmails}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              Send Emails to Selected ({selected.size})
            </button>
            {sentEmailLog.length > 0 && (
              <button
                onClick={downloadEmailLog}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mt-4"
              >
                Download Email Log (PDF)
              </button>
            )}
          </>
  )
        )}
      </div>
    </div>
  );
}