console.log("[API] /api/send-emails hit");
import { adminDb } from "@/lib/firebase-admin";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
console.log("Resend API Key:", process.env.RESEND_API_KEY);


export async function POST(request) {
  try {
    const { studentIds, type } = await request.json();

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      console.warn("[API] No students selected");
      return Response.json({ error: "No students selected" }, { status: 400 });
    }

    if (!["attendance", "marks"].includes(type)) {
      console.warn("[API] Invalid email type:", type);
      return Response.json({ error: "Invalid type" }, { status: 400 });
    }

    const results = [];

    for (const id of studentIds) {
      try {
        if (!id) {
          console.warn("[SKIP] Missing student ID");
          results.push({ id, status: "failed", reason: "Missing ID" });
          continue;
        }

        const studentSnap = await adminDb.collection("User").doc(id).get();


        if (!studentSnap.exists) {
          console.warn(`[SKIP] Student not found for ID: ${id}`);
          results.push({ id, status: "failed", reason: "Student not found" });
          continue;
        }

        const student = studentSnap.data();
        const requiredFields = ["name", "email", "parentEmail", "regNo", "section"];
        if (type === "attendance") requiredFields.push("attendance");
        if (type === "marks") requiredFields.push("marks");

        const missingFields = requiredFields.filter((field) => !student[field]);
        if (missingFields.length > 0) {
          console.warn(`[SKIP] ${student.name} missing:`, missingFields);
          results.push({ id, status: "failed", reason: `Missing fields: ${missingFields.join(", ")}` });
          continue;
        }

        const subjectData = student[type];
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
          console.log(`[SKIP] ${student.name} has no low attendance.`);
          results.push({ id, status: "skipped", reason: "No low attendance" });
          continue;
        }

        const subjectLine = type === "attendance" ? "Attendance Alert" : "Marks Report";
        const subjectColor = type === "attendance" ? "#d93025" : "#1a73e8";

        const messageBody =
          type === "attendance"
            ? `your attendance is currently below <strong>75%</strong> in the following subject(s):`
            : `your marks for recent assessments are as follows:`;

        const htmlList = subjectEntries.map((item) => `<li>${item}</li>`).join("");

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

        const studentRes = await resend.emails.send(studentEmail);
        const parentRes = await resend.emails.send(parentEmail);

        console.log(`[EMAIL] Student Email (${student.email}):`, studentRes);
        console.log(`[EMAIL] Parent Email (${student.parentEmail}):`, parentRes);

        if (!studentRes?.id || !parentRes?.id) {
          console.warn(`[SEND FAIL] ${student.name}`, {
            studentId: studentRes?.id,
            parentId: parentRes?.id,
          });
          results.push({
            id,
            status: "failed",
            reason: `Send failed. studentId: ${!!studentRes?.id}, parentId: ${!!parentRes?.id}`,
          });
          continue;
        }

        results.push({ id, status: "success" });

      } catch (error) {
        console.error(`[ERROR] Sending email for student ID ${id}:`, error);
        results.push({ id, status: "failed", reason: error.message });
      }
    }

    return Response.json({ results });
  } catch (err) {
    console.error("[API] Fatal error:", err);
    return Response.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    );
  }
}