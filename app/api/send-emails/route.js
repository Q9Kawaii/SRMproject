import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { studentIds } = await request.json();
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return Response.json({ error: "No students selected" }, { status: 400 });
    }

    const results = [];

    for (const id of studentIds) {
      try {
        const studentRef = doc(db, "User", id);
        const studentSnap = await getDoc(studentRef);
        if (!studentSnap.exists()) {
          results.push({ id, status: "failed", reason: "Student not found" });
          continue;
        }

        const student = studentSnap.data();

        // Validate required fields
        const requiredFields = ["name", "email", "parentEmail", "attendance", "regNo", "section"];
        const missingFields = requiredFields.filter(field => !student[field]);
        if (missingFields.length > 0) {
          results.push({ id, status: "failed", reason: `Missing fields: ${missingFields.join(", ")}` });
          continue;
        }

        // Find low attendance subjects
        const lowSubjects = [];
        if (student.attendance && typeof student.attendance === "object") {
          for (const [subject, perc] of Object.entries(student.attendance)) {
            const percentage = typeof perc === "string" ? parseFloat(perc) : perc;
            if (!isNaN(percentage) && percentage < 75) {
              lowSubjects.push(`${subject}: ${percentage}%`);
            }
          }
        }

        if (lowSubjects.length === 0) {
          results.push({ id, status: "skipped", reason: "No low attendance" });
          continue;
        }

        // Email HTML
        const htmlList = lowSubjects.map(s => `<li>${s}</li>`).join("");
        const studentEmail = {
          from: "School Alerts <noreply@yashdingar.xyz>",
          to: student.email,
          subject: "Low Attendance Warning",
          html: `
  <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
      <h2 style="color: #1a73e8;">Attendance Alert</h2>
      <p>Dear <strong>${student.name}</strong>,</p>
      <p>
        This is to inform you that your attendance is currently below <strong>75%</strong> in the following subject(s):
      </p>
      <ul style="padding-left: 20px; color: #d93025;">
        ${htmlList}
      </ul>
      <p>
        <strong>Registration No:</strong> ${student.regNo}<br/>
        <strong>Section:</strong> ${student.section}
      </p>
      <p>Please take necessary action and reach out to your subject teachers.</p>
      <p style="margin-top: 30px;">Regards,<br/><strong>Attendance Monitoring Team</strong></p>
    </div>
  </div>
`
        };

        const parentEmail = {
          from: "School Alerts <noreply@yashdingar.xyz>",
          to: student.parentEmail,
          subject: `Attendance Alert for ${student.name}`,
          html: `
  <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
      <h2 style="color: #d93025;">Attendance Alert for ${student.name}</h2>
      <p>Dear Parent/Guardian,</p>
      <p>
        This is to inform you that your ward, <strong>${student.name}</strong> (Reg No: <strong>${student.regNo}</strong>, Section: <strong>${student.section}</strong>), 
        has attendance below <strong>75%</strong> in the following subject(s):
      </p>
      <ul style="padding-left: 20px; color: #d93025;">
        ${htmlList}
      </ul>
      <p>We request you to kindly discuss this with your ward and encourage regular attendance.</p>
      <p style="margin-top: 30px;">Sincerely,<br/><strong>Attendance Monitoring Team</strong></p>
    </div>
  </div>
`
        };

        // Send emails in parallel
        await Promise.all([
          resend.emails.send(studentEmail),
          resend.emails.send(parentEmail),
        ]);

        results.push({ id, status: "success" });

      } catch (error) {
        results.push({ id, status: "failed", reason: error.message });
      }
    }

    return Response.json({ results });
  } catch (err) {
    console.error("[API] Error:", err);
    return Response.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    );
  }
}
