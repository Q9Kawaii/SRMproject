"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function MarksTable() {
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [sendingEmails, setSendingEmails] = useState(false);
  const [sectionFilter, setSectionFilter] = useState("");
  const [sentEmailLog, setSentEmailLog] = useState([]); // PDF log state

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
          studentsData.push({ id: docSnap.id, ...student });
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
    return sectionFilter
      ? s.section?.toLowerCase().includes(sectionFilter.toLowerCase())
      : true;
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
    setSendingEmails(true);
    try {
      const response = await fetch("/api/send-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentIds: Array.from(selected), type: "marks" }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to send emails");

      // Build log data
      const now = new Date();
      const timeString = now.toLocaleString();
      const logData = students
        .filter(s => selected.has(s.id))
        .map(s => ({
          name: s.name,
          regNo: s.regNo,
          section: s.section,
          studentEmail: s.email,
          parentEmail: s.parentEmail,
          marks: s.marks
            ? Object.entries(s.marks)
                .map(([subject, markObj]) =>
                  typeof markObj === "object"
                    ? `${subject}: ${markObj.marks} (${markObj.percentage}%)`
                    : `${subject}: ${markObj}`
                )
                .join(", ")
            : "—",
          sentTime: timeString,
        }));

      setSentEmailLog(logData);
      alert("Marks emails sent successfully!");
      setSelected(new Set());
    } catch (error) {
      console.error('Error sending emails:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setSendingEmails(false);
    }
  };

  // PDF download function
  const downloadMarksLog = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Marks Email Log", 14, 22);
    autoTable(doc, {
      startY: 30,
      head: [['Name', 'Reg No', 'Section', 'Student Email', 'Parent Email', 'Marks', 'Sent Time']],
      body: sentEmailLog.map(entry => [
        entry.name,
        entry.regNo,
        entry.section,
        entry.studentEmail,
        entry.parentEmail,
        entry.marks,
        entry.sentTime
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [30, 64, 175], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });
    doc.save("marks-email-log.pdf");
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="relative">
      {sendingEmails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-8 flex flex-col items-center shadow-lg">
            <svg
              className="animate-spin h-10 w-10 text-blue-600 mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
            <span className="text-lg font-semibold text-blue-700">
              Sending emails, please wait...
            </span>
          </div>
        </div>
      )}

      <div className="p-6 bg-white rounded shadow">
        <h2 className="text-xl font-bold mb-4">Students</h2>

        <div className="flex flex-wrap gap-4 mb-4">
          <button
            onClick={() => {
              if (selected.size === displayedStudents.length) {
                setSelected(new Set());
              } else {
                setSelected(new Set(displayedStudents.map((s) => s.id)));
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
        </div>

        {displayedStudents.length === 0 ? (
          <p>No students found{sectionFilter ? " with applied filter." : "."}</p>
        ) : (
          <>
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
                    <th className="p-2 text-center">Marks</th>
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
                        {s.marks
                          ? Object.entries(s.marks).map(([subject, markObj], idx) => (
                              <div
                                key={idx}
                                className={`px-2 py-1 rounded mr-2 mb-1 text-xs inline-block ${
                                  typeof markObj === "object" && markObj.marks < 40
                                    ? "bg-red-100 text-red-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {subject}:{" "}
                                {typeof markObj === "object"
                                  ? `${markObj.marks} (${markObj.percentage}%)`
                                  : markObj}
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
                onClick={downloadMarksLog}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mt-4"
              >
                Download Marks Email Log (PDF)
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
