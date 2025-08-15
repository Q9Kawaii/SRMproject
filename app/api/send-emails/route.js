console.log("[API] /api/send-emails hit");
import { adminDb } from "@/lib/firebase-admin";
import { Resend } from "resend";

// Debug environment setup
console.log("Resend API Key:", process.env.RESEND_API_KEY);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  console.log("[API] POST request received at /api/send-emails");

  try {
    const body = await request.json();
    console.log("[API] Request body parsed:", JSON.stringify(body, null, 2));

    const { studentIds, type, imageMap } = body;
    console.log("studentIds:", studentIds);
    console.log("type:", type);
    console.log("imageMap keys:", imageMap ? Object.keys(imageMap) : "no imageMap");

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
      console.log("\n-------------------------------");
      console.log(`[API] Processing student ID: ${id}`);

      try {
        if (!id) {
          console.warn("[SKIP] Missing student ID");
          results.push({ id, status: "failed", reason: "Missing ID" });
          continue;
        }

        const studentSnap = await adminDb.collection("User").doc(id).get();
        console.log(`[API] Firestore get doc for ID ${id} result: exists=${studentSnap.exists}`);

        if (!studentSnap.exists) {
          console.warn(`[SKIP] Student not found for ID: ${id}`);
          results.push({ id, status: "failed", reason: "Student not found" });
          continue;
        }

        const student = studentSnap.data();
        console.log(`[API] Student data:`, JSON.stringify(student, null, 2));

        const requiredFields = ["name", "email", "parentEmail", "faEmail", "regNo", "section"];
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
          Object.entries(subjectData).forEach(([subject, value]) => {
            const parsed = typeof value === "string" ? parseFloat(value) : value;
            if (type === "attendance" && !isNaN(parsed) && parsed < 75) {
              subjectEntries.push(`${subject}: ${parsed}%`);
            }
            if (type === "marks") {
              subjectEntries.push(`${subject}: ${parsed}`);
            }
          });
        }
        console.log(`[API] Subject Entries:`, subjectEntries);

        if (type === "attendance" && subjectEntries.length === 0) {
          console.log(`[SKIP] ${student.name} has no low attendance.`);
          results.push({ id, status: "skipped", reason: "No low attendance" });
          continue;
        }

        const subjectLine = type === "attendance" ? "Attendance Alert" : "Marks Report";
        const subjectColor = type === "attendance" ? "#d93025" : "#1a73e8";
        const messageBody = type === "attendance"
          ? `your attendance is currently below <strong>75%</strong> in the following subject(s):`
          : `your marks for recent assessments are as follows:`;
        const htmlList = subjectEntries.map((item) => `<li>${item}</li>`).join("");

        // Attachment handling
        let attachments = [];
        const regNoKey = (student.regNo ?? "").trim().toLowerCase();
        console.log("[ATTACHMENT CHECK]", { regNo: student.regNo, regNoKey, found: !!imageMap?.[regNoKey] });

        if (regNoKey && imageMap?.[regNoKey]) {
          try {
            const imageUrl = imageMap[regNoKey];
            console.log(`[ATTACHMENT] Fetching image from: ${imageUrl}`);
            const imageResponse = await fetch(imageUrl);

            if (!imageResponse.ok) {
              throw new Error(`Image fetch failed: ${imageResponse.status} ${imageResponse.statusText}`);
            }

            const imageBuffer = await imageResponse.arrayBuffer();
            console.log("[ATTACHMENT] Image buffer byteLength:", imageBuffer.byteLength);

            if (!imageBuffer || imageBuffer.byteLength === 0) throw new Error("Empty image buffer");

            const base64 = Buffer.from(imageBuffer).toString("base64");

            attachments.push({
              filename: `${student.regNo}.jpg`,
              content: base64,
              type: "image/jpeg",
              disposition: "attachment",
            });
            console.log(`[ATTACHMENT] Prepared for ${student.regNo}`);
          } catch (err) {
            console.warn(`[ATTACHMENT FAIL] Couldn't fetch/convert image for ${student.regNo}:`, err.message);
          }
        }

        // Prepare emails
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
          attachments,
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
          attachments,
        };

        const faEmail = {
          from: "School Alerts <noreply@yashdingar.xyz>",
          to: student.faEmail,
          subject: `${subjectLine} - ${student.name} (${student.regNo})`,
          html: `
            <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
              <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                <h2 style="color: ${subjectColor};">${subjectLine} - Academic Alert</h2>
                <p>Dear Faculty Advisor,</p>
                <p>
                  This is to inform you about your advisee, <strong>${student.name}</strong> 
                  (Reg No: <strong>${student.regNo}</strong>, Section: <strong>${student.section}</strong>):
                </p>
                <ul style="padding-left: 20px; color: ${subjectColor};">${htmlList}</ul>
                <p>Please consider providing academic guidance and support to the student.</p>
                <p style="margin-top: 30px;">Best regards,<br/><strong>Academic Monitoring Team</strong></p>
              </div>
            </div>
          `,
          attachments,
        };

        // Send all three emails in sequence and log everything
        console.log(`[SENDING] Trying to deliver emails for ${student.name}`);
        console.log("Student Email Params:", JSON.stringify(studentEmail, null, 2));
        let studentResult, parentResult, faResult;
        
        try {
          studentResult = await resend.emails.send(studentEmail);
          console.log("Student Email Result:", JSON.stringify(studentResult, null, 2));
        } catch (e) {
          studentResult = { error: e.message };
          console.error("[SEND FAIL] Student email:", e);
        }
        await new Promise((r) => setTimeout(r, 600));

        try {
          parentResult = await resend.emails.send(parentEmail);
          console.log("Parent Email Result:", JSON.stringify(parentResult, null, 2));
        } catch (e) {
          parentResult = { error: e.message };
          console.error("[SEND FAIL] Parent email:", e);
        }
        await new Promise((r) => setTimeout(r, 600));

        try {
          faResult = await resend.emails.send(faEmail);
          console.log("FA Email Result:", JSON.stringify(faResult, null, 2));
        } catch (e) {
          faResult = { error: e.message };
          console.error("[SEND FAIL] Faculty Advisor email:", e);
        }

        // Analyze send results
        const studentSent = !!(studentResult?.id);
        const parentSent = !!(parentResult?.id);
        const faSent = !!(faResult?.id);

        console.log(`[RESULT] Student Sent: ${studentSent}, Parent Sent: ${parentSent}, FA Sent: ${faSent}`);
        console.log("[ATTACHMENTS SENT]:", attachments.map((a) => a.filename));

        const failedEmails = [];
        if (!studentSent) failedEmails.push("student");
        if (!parentSent) failedEmails.push("parent");
        if (!faSent) failedEmails.push("fa");

        if (failedEmails.length > 0) {
          console.warn(`[PARTIAL FAIL] ${student.name} - Failed emails:`, failedEmails);
          results.push({
            id,
            status: "partial",
            reason: `Failed to send to: ${failedEmails.join(", ")}`,
            details: { studentResult, parentResult, faResult }
          });
        } else {
          console.log(`[SUCCESS] All emails sent for ${student.name}`);
          results.push({
            id,
            status: "success",
            details: { studentResult, parentResult, faResult }
          });
        }

      } catch (error) {
        console.error(`[ERROR] Sending emails for student ID ${id}:`, error);
        results.push({ id, status: "failed", reason: error.message });
      }

      console.log("---------------------------------------");
    }

    console.log("[API] All processing done. Results:", JSON.stringify(results, null, 2));
    return Response.json({ results });

  } catch (err) {
    console.error("[API] Fatal error:", err);
    return Response.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    );
  }
}
