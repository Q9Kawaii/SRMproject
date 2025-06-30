"use client";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

const studentEmails = [
  "yashdingar17@gmail.com",
  "yashdingar24@gmail.com",
  "acwithyash@gmail.com",
  "technoslive2020@gmail.com",
  "anuragsujit2005@gmail.com",
  "frostyanand@gmail.com",
  "darknessanonymous37@gmail.com",
  "aa9004@srmist.edu.in",
  "frostyhasbackup1@gmail.com",
];

const sections = ["F1", ];
const subjects = ["Maths", "Physics", "Chemistry", "Biology", "CS"];

function getRandomSubjects() {
  const shuffled = [...subjects].sort(() => 0.5 - Math.random());
  const count = Math.floor(Math.random() * 2) + 2;
  return shuffled.slice(0, count).map(sub => ({
    subject: sub,
    percentage: Math.floor(40 + Math.random() * 60),
    marks: Math.floor(30 + Math.random() * 70),
  }));
}

function getRandomName() {
  const first = ["Arjun", "Neha", "Ravi", "Priya", "Aman", "Sneha", "Karan", "Simran", "Vikram", "Anjali"];
  const last = ["Sharma", "Patel", "Verma", "Singh", "Reddy", "Iyer", "Kapoor", "Nair", "Mishra", "Gupta"];
  return `${first[Math.floor(Math.random() * first.length)]} ${last[Math.floor(Math.random() * last.length)]}`;
}

function getRandomEmail() {
  return studentEmails[Math.floor(Math.random() * studentEmails.length)];
}

function getRandomRegNo() {
  const year = "24";
  const collegeCode = "11003";
  const randomSerial = String(Math.floor(100000 + Math.random() * 900000));
  return `RA${year}${collegeCode}${randomSerial}`;
}

function getRandomSection() {
  return sections[Math.floor(Math.random() * sections.length)];
}

export default function AddStudentForm() {
  const [regNo, setRegNo] = useState("");
  const [section, setSection] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [attendance, setAttendance] = useState([{ subject: "", percentage: "", marks: "" }]);
  const [loading, setLoading] = useState(false);

  const handleAttendanceChange = (idx, field, value) => {
    setAttendance(prev =>
      prev.map((a, i) => (i === idx ? { ...a, [field]: value } : a))
    );
  };

  const addAttendanceField = () =>
    setAttendance(prev => [...prev, { subject: "", percentage: "", marks: "" }]);

  const removeAttendanceField = idx =>
    setAttendance(prev => prev.filter((_, i) => i !== idx));

  const prefillRandom = () => {
    setName(getRandomName());
    setEmail(getRandomEmail());
    setParentEmail("acwithyash@gmail.com");
    setRegNo(getRandomRegNo());
    setSection(getRandomSection());
    setAttendance(getRandomSubjects());
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const attendanceMap = {};
      const marksMap = {};

      attendance.forEach(({ subject, percentage, marks }) => {
        const subj = subject.trim();
        const perc = parseFloat(percentage);
        const mark = parseFloat(marks);

        if (subj && !isNaN(perc)) {
          attendanceMap[subj] = perc;
        }
        if (subj && !isNaN(mark)) {
          marksMap[subj] = mark;
        }
      });

      await setDoc(doc(db, "User", regNo), {
        name,
        email,
        parentEmail,
        attendance: attendanceMap,
        marks: marksMap,
        regNo,
        section,
        createdAt: new Date().toISOString(),
      });

      // Reset form
      setName("");
      setEmail("");
      setParentEmail("");
      setRegNo("");
      setSection("");
      setAttendance([{ subject: "", percentage: "", marks: "" }]);
    } catch (err) {
      alert("Error adding student: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {loading && (
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
              Saving student data...
            </span>
          </div>
        </div>
      )}

      <div className="max-w-xl mx-auto mt-4 flex justify-end">
        <button
          onClick={prefillRandom}
          className="text-sm bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1 rounded"
          disabled={loading}
        >
          Prefill Random
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-6 mb-6 bg-gray-50 rounded shadow max-w-xl mx-auto"
      >
        <h2 className="text-lg font-semibold mb-4">Add Student</h2>
        <div className="mb-2">
          <label className="block mb-1">Name</label>
          <input
            type="text"
            className="border p-2 w-full rounded"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Student Email</label>
          <input
            type="email"
            className="border p-2 w-full rounded"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Parent Email</label>
          <input
            type="email"
            className="border p-2 w-full rounded"
            value={parentEmail}
            onChange={e => setParentEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Registration Number</label>
          <input
            className="border p-2 w-full rounded"
            value={regNo}
            onChange={(e) => setRegNo(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Section</label>
          <input
            className="border p-2 w-full rounded"
            value={section}
            onChange={(e) => setSection(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Attendance per Subject</label>
          {attendance.map((a, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input
                type="text"
                className="border p-2 rounded flex-1"
                placeholder="Subject"
                value={a.subject}
                onChange={e =>
                  handleAttendanceChange(idx, "subject", e.target.value)
                }
                required
                disabled={loading}
              />
              <input
                type="number"
                className="border p-2 rounded w-20"
                placeholder="%"
                min="0"
                max="100"
                value={a.percentage}
                onChange={e =>
                  handleAttendanceChange(idx, "percentage", e.target.value)
                }
                required
                disabled={loading}
              />
              <input
                type="number"
                className="border p-2 rounded w-20"
                placeholder="Marks"
                min="0"
                max="100"
                value={a.marks}
                onChange={e =>
                  handleAttendanceChange(idx, "marks", e.target.value)
                }
                required
                disabled={loading}
              />
              {attendance.length > 1 && (
                <button
                  type="button"
                  className="text-red-600"
                  onClick={() => removeAttendanceField(idx)}
                  disabled={loading}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="text-blue-600 mt-1"
            onClick={addAttendanceField}
            disabled={loading}
          >
            + Add Subject
          </button>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Saving..." : "Add Student"}
        </button>
      </form>
    </div>
  );
}
