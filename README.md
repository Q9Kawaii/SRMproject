# 🎓 Student & Faculty Portal – SRM Placement & Attendance System 12345

A full-featured web portal built using **Next.js**, **Tailwind CSS**, and **Firebase** to simplify and automate several workflows between students, faculty, and academic administrators.

This project aims to eliminate manual processes around placement tracking, attendance verification, and student communication — making life easier for both students and teachers.

---

## 🚀 Features

### 👨‍🎓 Student Portal:
- **Profile Management**: Students can update their personal details, academic info, and placement matrix data.
- **Placement Matrix Scoring**: Automatic calculation of placement matrix marks based on submitted data.
- **Achievements Section**: Add/update achievements (verified by Faculty Advisor).
- **Low Attendance Alerts**: View alerts from faculty and respond with reasons.
- **Approval Flow**: Responses verified by Faculty Advisor (FA) and Academic Advisor (AA) digitally.

### 👩‍🏫 Faculty Portal:
- **Attendance Upload**: Upload attendance PDFs (last 10 days), auto-populated to the database.
- **Low Attendance Filtering**: Easily identify students with low attendance.
- **Email Alerts**: Send alert emails to students and parents with one click.
- **Verify Updates**: Approve/reject students' placement or achievement updates from the dashboard.

---

## 🛠 Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/), [Tailwind CSS](https://tailwindcss.com/)
- **Backend**: [Firebase Auth](https://firebase.google.com/products/auth), [Cloud Firestore](https://firebase.google.com/products/firestore)
- **Other Tools**: jsPDF, autoTable, Resend (email service), Google Drive integration

---

## 📸 Screenshots

_Add relevant screenshots or UI GIFs here to visually showcase the portal._

---

## 📂 Folder Structure (simplified)

```
/pages
  /student       → student dashboard & components
  /teacher       → teacher features (upload, manage)
  /api           → API routes for email alerts, uploads
/components
/lib             → firebase setup, helpers
/public
/styles
```

---

## 📬 Contact

For questions, collaborations, or feedback:  
[LinkedIn](https://www.linkedin.com/in/yash-dingar-946688276/)

---

## 📃 License

This project is built for educational and internal use at **SRM Institute of Science & Technology**.
