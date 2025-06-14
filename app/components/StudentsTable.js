"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";

export default function StudentsTable() {
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [sendingEmails, setSendingEmails] = useState(false);
  const [filterLowAttendance, setFilterLowAttendance] = useState(false);
  const [sectionFilter, setSectionFilter] = useState("");

  const deleteStudent = async (id) => {

    try {
      await deleteDoc(doc(db, "User", id));
      setStudents((prev) => prev.filter((s) => s.id !== id));
      // alert("Student deleted successfully.");
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
    const matchSection = sectionFilter
      ? s.section?.toLowerCase().includes(sectionFilter.toLowerCase())
      : true;
    return matchLow && matchSection;
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
      setSendingEmails(true);
      const response = await fetch("/api/send-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentIds: Array.from(selected) }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send emails");
      }

      alert("Emails sent successfully!");
      setSelected(new Set());
    } catch (error) {
      console.error("Error sending emails:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setSendingEmails(false);
    }
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
          <p>
            No students found
            {filterLowAttendance || sectionFilter ? " with applied filters." : "."}
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full border mb-4 text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2">Select</th>
                    <th className="p-2">Name</th>
                    <th className="p-2">Reg. No</th>
                    <th className="p-2">Section</th>
                    <th className="p-2">Student Email</th>
                    <th className="p-2">Parent Email</th>
                    <th className="p-2">Low Attendance Subjects</th>
                    <th className="p-2">All Subjects Attendance</th>
                    <th className="p-2">Delete</th>
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
                      <td className="p-2">{s.name}</td>
                      <td className="p-2">{s.regNo || "—"}</td>
                      <td className="p-2">{s.section || "—"}</td>
                      <td className="p-2">{s.email}</td>
                      <td className="p-2">{s.parentEmail}</td>
                      <td className="p-2 flex flex-col">
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
                      <td className="p-2">
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
          </>
        )}
      </div>
    </div>
  );
}
