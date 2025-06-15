import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { studentIds, type } = await request.json();

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return Response.json({ error: "No students selected" }, { status: 400 });
    }

    if (!["attendance", "marks"].includes(type)) {
      return Response.json({ error: "Invalid type" }, { status: 400 });
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

        const requiredFields = ["name", "email", "parentEmail", "regNo", "section"];
        if (type === "attendance") requiredFields.push("attendance");
        if (type === "marks") requiredFields.push("marks");

        const missingFields = requiredFields.filter(field => !student[field]);
        if (missingFields.length > 0) {
          results.push({ id, status: "failed", reason: `Missing fields: ${missingFields.join(", ")}` });
          continue;
        }

        const subjectData = student[type]; // attendance or marks
        const subjectEntries = [];

        if (subjectData && typeof subjectData === "object") {
          for (const [subject, value] of Object.entries(subjectData)) {
            const parsed = typeof value === "string" ? parseFloat(value) : value;

            if (type === "attendance" && !isNaN(parsed) && parsed < 75) {
              subjectEntries.push(`${subject}: ${parsed}%`);
            }

            if (type === "marks") {
              subjectEntries.push(`${subject}: ${parsed}`);
            }
          }
        }

        if (type === "attendance" && subjectEntries.length === 0) {
          results.push({ id, status: "skipped", reason: "No low attendance" });
          continue;
        }

        const subjectLine =
          type === "attendance" ? "Attendance Alert" : "Marks Report";

        const subjectColor = type === "attendance" ? "#d93025" : "#1a73e8";

        const messageBody =
          type === "attendance"
            ? `your attendance is currently below <strong>75%</strong> in the following subject(s):`
            : `your marks for recent assessments are as follows:`;

        const htmlList = subjectEntries.map(item => `<li>${item}</li>`).join("");

        const studentEmail = {
          from: "School Alerts <noreply@yashdingar.xyz>",
          to: student.email,
          subject: subjectLine,
          html: `
            <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
              <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                <h2 style="color: ${subjectColor};">${subjectLine}</h2>
                <p>Dear <strong>${student.name}</strong>,</p>
                <p>This is to inform you that ${messageBody}</p>
                <ul style="padding-left: 20px; color: ${subjectColor};">${htmlList}</ul>
                <p>
                  <strong>Registration No:</strong> ${student.regNo}<br/>
                  <strong>Section:</strong> ${student.section}
                </p>
                <p>Please take note and act accordingly.</p>
                <p style="margin-top: 30px;">Regards,<br/><strong>Academic Monitoring Team</strong></p>
              </div>
            </div>
          `,
        };

        const parentEmail = {
          from: "School Alerts <noreply@yashdingar.xyz>",
          to: student.parentEmail,
          subject: `${subjectLine} for ${student.name}`,
          html: `
            <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
              <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                <h2 style="color: ${subjectColor};">${subjectLine} for ${student.name}</h2>
                <p>Dear Parent/Guardian,</p>
                <p>
                  This is to inform you that your ward, <strong>${student.name}</strong> (Reg No: <strong>${student.regNo}</strong>, Section: <strong>${student.section}</strong>),
                  has the following details:
                </p>
                <ul style="padding-left: 20px; color: ${subjectColor};">${htmlList}</ul>
                <p>Please take necessary steps and support your ward accordingly.</p>
                <p style="margin-top: 30px;">Sincerely,<br/><strong>Academic Monitoring Team</strong></p>
              </div>
            </div>
          `,
        };

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
