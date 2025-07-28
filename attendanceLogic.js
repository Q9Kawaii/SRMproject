// attendanceLogic.js
import { adminDb as db } from './lib/firebase-admin.js';
import puppeteer from 'puppeteer';

// import fs from 'fs';
// import path from 'path';
// const fontkit = require('fontkit');
// import pkg from 'pdfkit'; // Correct fix for ESM import
// const PDFDocument = pkg;


// const db = admin.firestore();
const studentsCollection = db.collection("User"); 

// Utility to format timestamp
export const getTimestamp = () => {
  const now = new Date();
  return now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).replace(" ", "") + now.toLocaleDateString("en-GB").replace(/\//g, '');
};

// ========== Core Functions ==========

// Fetch students by section
export async function fetchStudentsBySection(section) {
  try {
    const snapshot = await studentsCollection.where("section", "==", section).get();
    const students = [];
    snapshot.forEach(doc => {
      students.push({ regNo: doc.id, ...doc.data() });
    });
    return students;
  } catch (error) {
    console.error(`Error in fetchStudentsBySection for section ${section}:`, error);
    throw new Error(`Failed to fetch students data: ${error.message}`); // Re-throw for API route to catch
  }
}

export async function alertStudent(regNo, dateStr) {
  try {
    const ref = studentsCollection.doc(regNo);
    const doc = await ref.get();
    if (!doc.exists) throw new Error("Student not found");

    const newAlert = `0~0~~NA~NA~${getTimestamp()}`;
    await ref.set(
      {
        absentRecords: {
          [dateStr]: newAlert,
        },
      },
      { merge: true }
    );
  } catch (error) {
    console.error(`Error alerting student ${regNo} on ${dateStr}:`, error);
    throw new Error(`Failed to alert student: ${error.message}`);
  }
}
export async function getAttendanceMapForStudent(regNo) {
  try {
    // Example: Fetch student's attendance from Firestore
    // You'll need to adjust this logic based on how your attendance data is structured in Firestore
    const studentRef = db.collection('User').doc(regNo); // Assuming 'User' collection holds student data
    const doc = await studentRef.get();

    if (!doc.exists) {
      console.log(`No student found with regNo: ${regNo}`);
      return {}; // Return empty object if student not found
    }

    const data = doc.data();
    const attendanceMap = data.attendance || {}; // Assuming attendance data is directly under a 'attendance' field
                                                // This should be the map like { "Math": "90%", "Physics": "85%" }
    return attendanceMap;

  } catch (error) {
    console.error(`Error fetching attendance map for ${regNo}:`, error);
    throw new Error(`Failed to fetch attendance map: ${error.message}`);
  }
}
// Submit reason for a specific date
export async function submitReason(regNo, dateStr, reason) {
  try {
    const ref = studentsCollection.doc(regNo);
    const doc = await ref.get();
    if (!doc.exists) throw new Error("Student not found");

    const records = doc.data().absentRecords || {};
    const record = records[dateStr];
    if (!record) throw new Error("Alert not raised for this date"); // More specific error message

    const parts = record.split("~");
    parts[2] = reason; // Replace reason
    const updated = parts.join("~");

    await ref.update({
      [`absentRecords.${dateStr}`]: updated,
    });
  } catch (error) {
    console.error(`Error submitting reason for ${regNo} on ${dateStr}:`, error);
    throw new Error(`Failed to submit reason: ${error.message}`);
  }
}

// Approve by FA
export async function approveFA(regNo, dateStr) {
  try {
    const ref = studentsCollection.doc(regNo);
    const doc = await ref.get();
    if (!doc.exists) throw new Error("Student not found");

    const record = doc.data().absentRecords?.[dateStr];
    if (!record) throw new Error("Alert not found for this date to approve FA"); // More specific error message

    const parts = record.split("~");
    parts[0] = "1";
    parts[3] = getTimestamp(); // FA timestamp
    const updated = parts.join("~");

    await ref.update({
      [`absentRecords.${dateStr}`]: updated,
    });
  } catch (error) {
    console.error(`Error approving FA for ${regNo} on ${dateStr}:`, error);
    throw new Error(`Failed to approve FA: ${error.message}`);
  }
}

// Approve by AA
export async function approveAA(regNo, dateStr) {
  try {
    const ref = studentsCollection.doc(regNo);
    const doc = await ref.get();
    if (!doc.exists) throw new Error("Student not found");

    const record = doc.data().absentRecords?.[dateStr];
    if (!record) throw new Error("Alert not found for this date to approve AA"); // More specific error message

    const parts = record.split("~");
    parts[1] = "1";
    parts[4] = getTimestamp(); // AA timestamp
    const updated = parts.join("~");

    await ref.update({
      [`absentRecords.${dateStr}`]: updated,
    });
  } catch (error) {
    console.error(`Error approving AA for ${regNo} on ${dateStr}:`, error);
    throw new Error(`Failed to approve AA: ${error.message}`);
  }
}

// Fetch and parse all absent records for a student

export async function getAbsentRecords(regNo) {
  try {
    const studentRef = db.collection('User').doc(regNo);
    const doc = await studentRef.get();

    if (!doc.exists) {
      console.log(`No student found with regNo: ${regNo}`);
      return [];
    }

    const data = doc.data();
    const rawAbsentRecordsMap = data.absentRecords || {}; // This is the map from Firestore

    const parsedRecords = [];

    // Iterate over the entries in the map: [date, delimited_string]
    for (const [dateKey, delimitedString] of Object.entries(rawAbsentRecordsMap)) {
      if (typeof delimitedString === 'string' && delimitedString.includes('~')) {
        const parts = delimitedString.split('~');

        // Expecting 6 parts based on the confirmed structure
        if (parts.length >= 6) {
          const faApprovedRaw = parts[0]; // '0' or '1'
          const aaApprovedRaw = parts[1]; // '0' or '1'

          const faApproved = faApprovedRaw === '1';
          const aaApproved = aaApprovedRaw === '1';

          // Derived 'resolved' status: true if both FA and AA are approved
          const resolved = faApproved && aaApproved;

          const reason = parts[2].trim() !== 'NA' ? parts[2].trim() : '';
          const faTimestamp = parts[3].trim() !== 'NA' ? parts[3].trim() : '';
          const aaTimestamp = parts[4].trim() !== 'NA' ? parts[4].trim() : '';
          const alertTimestamp = parts[5].trim() !== 'NA' ? parts[5].trim() : '';

          // Using the raw dateKey as it is DDMMYYYY
          const formattedDate = dateKey;

          parsedRecords.push({
            date: formattedDate,
            resolved: resolved, // Derived property
            faApproved: faApproved,
            aaApproved: aaApproved,
            reason: reason,
            faTimestamp: faTimestamp,
            aaTimestamp: aaTimestamp,
            alertTimestamp: alertTimestamp,
          });
        } else {
          console.warn(`Absent record for ${dateKey} has too few parts (${parts.length}). Expected 6: ${delimitedString}`);
        }
      } else {
        console.warn(`Absent record for ${dateKey} is not a valid delimited string: ${delimitedString}`);
      }
    }

    // Optional: Sort records by date (newest first, for example)
    parsedRecords.sort((a, b) => {
      // Assuming date is DDMMYYYY
      const dateA = new Date(a.date.substring(4,8), a.date.substring(2,4) - 1, a.date.substring(0,2));
      const dateB = new Date(b.date.substring(4,8), b.date.substring(2,4) - 1, b.date.substring(0,2));
      return dateB.getTime() - dateA.getTime();
    });


    return parsedRecords; // This array will be sent as JSON to the frontend
  } catch (error) {
    console.error(`Error fetching or parsing absent records for ${regNo}:`, error);
    return []; // Return empty array on error
  }
}

// For client-side PDF export: return data grouped by section
// This function remains to prepare data for generatePdfReport on the server
// attendanceLogic.js (replace your existing downloadSectionReport function with this)

// Ensure 'db' and 'getAbsentRecords' are accessible in this scope.

// For server-side PDF export: return data grouped by section
// This function prepares data for generatePdfReport on the server
export async function downloadSectionReport(section, month) {
  try {
    const students = await fetchStudentsBySection(section); // This fetches raw student data
    const report = [];

    for (const student of students) {
      const regNo = student.regNo;
      const name = student.name;

      // --- CRITICAL CHANGE HERE ---
      // Fetch and parse absent records for this specific student using getAbsentRecords
      const parsedAbsentRecords = await getAbsentRecords(regNo);
      // --- END CRITICAL CHANGE ---

      for (const record of parsedAbsentRecords) { // Now 'parsedAbsentRecords' is an array and iterable
        // Check if the record's date matches the selected month (MMYYYY)
        if (record.date && record.date.substring(2, 8) === month) { // Example: "01072025" -> "072025" for month "072025"
          report.push({
            regNo,
            name,
            date: record.date,
            reason: record.reason,
            faApproved: record.faApproved ? "Yes" : "No", // Convert boolean to "Yes"/"No" for report
            aaApproved: record.aaApproved ? "Yes" : "No", // Convert boolean to "Yes"/"No" for report
            faTime: record.faTimestamp,
            aaTime: record.aaTimestamp,
            alertTime: record.alertTimestamp,
          });
        }
      }
    }
    return report; // backend can convert to PDF using pdfkit
  } catch (error) {
    console.error(`Error preparing section report for ${section} in ${month}:`, error);
    throw new Error(`Failed to prepare section report: ${error.message}`);
  }
}// attendanceLogic.js (replace your existing bulkAlertStudents function with this)

/**
 * Bulk alert multiple students for the same date, skipping those who already have an alert for that day.
 * @param {Array<string>} regNos - List of registration numbers.
 * @param {string} dateStr - The absent date in DDMMYYYY format.
 * @returns {Promise<Array<{ regNo: string, success: boolean, error?: string, message?: string }>>}
 */
export async function bulkAlertStudents(regNos, dateStr) {
  const results = [];

  for (const regNo of regNos) {
    try {
      const studentRef = db.collection('User').doc(regNo); // Ensure 'User' matches your Firestore collection name
      const doc = await studentRef.get();

      if (!doc.exists) {
        console.warn(`Student with RegNo ${regNo} not found for bulk alert.`);
        results.push({ regNo, success: false, error: `Student ${regNo} not found` });
        continue; // Skip to the next student
      }

      const data = doc.data();
      const absentRecords = data.absentRecords || {};

      // --- NEW LOGIC: Check if an alert for this date already exists ---
      if (absentRecords[dateStr]) {
        // An alert for this specific date already exists. Skip alerting this student.
        console.log(`Skipping bulk alert for ${regNo} on ${dateStr}: Alert already exists for today.`);
        results.push({ regNo, success: true, message: 'Skipped: Alert already exists for today' });
        continue; // Move to the next student without calling alertStudent
      }
      // --- END NEW LOGIC ---

      // If no alert exists for this date, proceed with calling the original alertStudent function
      await alertStudent(regNo, dateStr);
      results.push({ regNo, success: true, message: 'Alert created successfully' });

    } catch (err) {
      console.error(`Error during bulk alert for ${regNo}:`, err);
      results.push({ regNo, success: false, error: err.message });
    }
  }

  return results;
}


// Helper functions for formatting dates/approvals (these can be reused as they are pure JS)
function formatDateTime(dateTimeStr) {
  if (!dateTimeStr || dateTimeStr === '—' || dateTimeStr === '') {
    return { date: '—', time: '—', display: '—' };
  }

  try {
    let dateStr, timeStr;

    if (dateTimeStr.includes('T')) {
      // ISO format
      const dt = new Date(dateTimeStr);
      dateStr = dt.toLocaleDateString('en-GB');
      timeStr = dt.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } else if (dateTimeStr.match(/\d{2}:\d{2}[ap]m\d{8}/i)) {
      // Format like "12:01pm01072025"
      const timeMatch = dateTimeStr.match(/(\d{2}:\d{2}[ap]m)/i);
      const dateMatch = dateTimeStr.match(/(\d{8})$/);

      if (timeMatch && dateMatch) {
        timeStr = timeMatch[1];
        const dateNum = dateMatch[1];
        const day = dateNum.substring(0, 2);
        const month = dateNum.substring(2, 4);
        const year = dateNum.substring(4, 8);
        dateStr = `${day}/${month}/${year}`;
      } else {
        return { date: dateTimeStr, time: '', display: dateTimeStr };
      }
    } else {
      return { date: dateTimeStr, time: '', display: dateTimeStr };
    }

    return {
      date: dateStr,
      time: timeStr,
      display: `${dateStr}\n${timeStr}`
    };
  } catch (error) {
    return { date: dateTimeStr, time: '', display: dateTimeStr };
  }
}

function formatApprovalInfo(status, dateTime) {
  const statusText = status ? (status.toLowerCase() === 'yes' ? 'Approved' :
    status.toLowerCase() === 'no' ? 'Rejected' : 'Pending') : 'Pending';

  if (!dateTime || dateTime === '—') {
    return { status: statusText, datetime: '—' };
  }

  const formatted = formatDateTime(dateTime);
  return {
    status: statusText,
    datetime: formatted.display
  };
}


// NEW: Helper function to generate HTML for the PDF report
function generateReportHtml(reportData, section, month) {
  // Enhanced color palette for modern design (as CSS variables)
  const colors = {
    primary: '#6366f1',       // Modern indigo
    secondary: '#4f46e5',     // Deeper indigo
    accent: '#8b5cf6',        // Purple accent
    text: '#1f2937',          // Rich dark gray
    lightText: '#6b7280',     // Medium gray
    background: '#f8fafc',    // Subtle light gray
    cardBg: '#ffffff',        // Pure white
    success: '#10b981',       // Modern green
    warning: '#f59e0b',       // Warm amber
    error: '#ef4444',         // Modern red
    border: '#e5e7eb',        // Light border
    shadow: 'rgba(0, 0, 0, 0.06)' // Subtle shadow
  };

  const monthName = new Date(parseInt(month.substring(2, 6)), parseInt(month.substring(0, 2)) - 1, 1)
    .toLocaleString('en-US', { month: 'long', year: 'numeric' });

  const now = new Date();
  const generatedDateTime = `Generated on ${now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })} at ${now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })}`;

  const columns = [
    { header: 'Reg No', width: '80px', key: 'regNo', align: 'center' },
    { header: 'Name', width: '100px', key: 'name', align: 'left' },
    { header: 'Alert Time', width: '70px', key: 'alertTime', align: 'center' },
    { header: 'Reason', width: '100px', key: 'reason', align: 'left' },
    { header: 'FA Approval', width: '90px', key: 'faApproval', align: 'center' },
    { header: 'AA Approval', width: '90px', key: 'aaApproval', align: 'center' }
  ];

  // Generate table rows
  const tableRowsHtml = reportData.map((item, index) => {
    const isEven = index % 2 === 0;
    const bgColor = isEven ? colors.background : colors.cardBg;

    const alertDateTime = formatDateTime(item.alertTime);
    const faInfo = formatApprovalInfo(item.faApproved, item.faTime);
    const aaInfo = formatApprovalInfo(item.aaApproved, item.aaTime);

    const faStatusColor = faInfo.status === 'Approved' ? colors.success :
      faInfo.status === 'Rejected' ? colors.error : colors.warning;
    const aaStatusColor = aaInfo.status === 'Approved' ? colors.success :
      aaInfo.status === 'Rejected' ? colors.error : colors.warning;

    return `
      <div class="table-row" style="background-color: ${bgColor};">
        <div class="cell reg-no">${String(item.regNo || '—')}</div>
        <div class="cell name">${String(item.name || '—')}</div>
        <div class="cell alert-time">
          ${alertDateTime.date !== '—' ? `<span>${alertDateTime.date}</span>` : '<span>—</span>'}
          ${alertDateTime.time !== '—' && alertDateTime.time ? `<span style="font-size: 8px; color: ${colors.lightText};">${alertDateTime.time}</span>` : ''}
        </div>
        <div class="cell reason">${String(item.reason || '—')}</div>
        <div class="cell approval fa-approval" style="color: ${faStatusColor};">
          <span>${faInfo.status}</span>
          ${faInfo.datetime !== '—' ? `<span style="font-size: 8px; color: ${colors.lightText};">${faInfo.datetime}</span>` : ''}
        </div>
        <div class="cell approval aa-approval" style="color: ${aaStatusColor};">
          <span>${aaInfo.status}</span>
          ${aaInfo.datetime !== '—' ? `<span style="font-size: 8px; color: ${colors.lightText};">${aaInfo.datetime}</span>` : ''}
        </div>
      </div>
    `;
  }).join('');


  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Attendance Report - ${section} - ${monthName}</title>
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
        <style>
            @page {
                size: A4;
                margin: 25mm;
            }
            body {
                font-family: 'Roboto', sans-serif;
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                color: ${colors.text};
                background-color: ${colors.background};
                -webkit-print-color-adjust: exact; /* For printing background colors */
            }
            :root {
                --primary-color: ${colors.primary};
                --secondary-color: ${colors.secondary};
                --accent-color: ${colors.accent};
                --text-color: ${colors.text};
                --light-text-color: ${colors.lightText};
                --background-color: ${colors.background};
                --card-bg-color: ${colors.cardBg};
                --success-color: ${colors.success};
                --warning-color: ${colors.warning};
                --error-color: ${colors.error};
                --border-color: ${colors.border};
                --shadow-color: ${colors.shadow};
            }

            .header-section {
                position: relative;
                height: 140px;
                background: linear-gradient(to right, var(--primary-color), var(--secondary-color) 60%, var(--accent-color) 100%);
                padding: 40px 25px 0 40px;
                color: var(--card-bg-color);
                overflow: hidden;
            }
            .header-section h1 {
                font-family: 'RobotoBold', sans-serif;
                font-size: 32px;
                margin: 0;
                line-height: 1;
            }
            .header-section h2 {
                font-size: 18px;
                margin-top: 10px;
                margin-bottom: 0;
                opacity: 0.95;
            }
            .header-section h3 {
                font-size: 16px;
                margin-top: 5px;
                margin-bottom: 0;
                opacity: 0.9;
            }
            .header-section .timestamp {
                position: absolute;
                top: 110px;
                right: 40px;
                font-size: 11px;
                opacity: 0.85;
                text-align: right;
                width: 220px;
            }
            .floating-circle {
                position: absolute;
                border-radius: 50%;
                opacity: 0.1;
            }
            .circle-1 { top: 40px; right: 80px; width: 60px; height: 60px; background-color: var(--accent-color); }
            .circle-2 { top: 70px; right: 50px; width: 30px; height: 30px; background-color: var(--primary-color); opacity: 0.15; }
            .circle-3 { top: 100px; left: 60px; width: 40px; height: 40px; background-color: var(--accent-color); opacity: 0.08; }

            .content-area {
                padding: 25px;
            }

            .table-container {
                box-shadow: 0 4px 12px var(--shadow-color);
                border-radius: 12px;
                overflow: hidden;
                border: 1px solid var(--border-color);
            }

            .table-header {
                display: flex;
                background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
                color: var(--card-bg-color);
                font-family: 'RobotoBold', sans-serif;
                font-size: 12px;
                padding: 18px 15px; /* Adjusted padding */
            }
            .table-header .cell {
                flex-shrink: 0;
                text-align: center;
                box-sizing: border-box;
                padding: 0 5px; /* Internal padding for header text */
            }
            .table-header .cell:nth-child(1) { width: ${columns[0].width}; text-align: ${columns[0].align}; }
            .table-header .cell:nth-child(2) { width: ${columns[1].width}; text-align: ${columns[1].align}; }
            .table-header .cell:nth-child(3) { width: ${columns[2].width}; text-align: ${columns[2].align}; }
            .table-header .cell:nth-child(4) { width: ${columns[3].width}; text-align: ${columns[3].align}; }
            .table-header .cell:nth-child(5) { width: ${columns[4].width}; text-align: ${columns[4].align}; }
            .table-header .cell:nth-child(6) { width: ${columns[5].width}; text-align: ${columns[5].align}; }

            .table-row {
                display: flex;
                align-items: center;
                padding: 8px 15px; /* Adjusted padding */
                border-bottom: 1px solid var(--border-color);
                position: relative;
            }
            .table-row:last-child {
                border-bottom: none;
            }
            .table-row::before {
                content: '';
                position: absolute;
                left: 0;
                top: 0;
                bottom: 0;
                width: 4px;
                background-color: var(--accent-color);
                border-radius: 2px;
                opacity: 0.6;
            }
            .table-row .cell {
                flex-shrink: 0;
                font-size: 10px;
                line-height: 1.4;
                padding: 0 5px;
                box-sizing: border-box;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: normal; /* Allow wrapping */
                word-break: break-word; /* Break long words */
                display: flex;
                flex-direction: column;
                justify-content: center;
            }
            .table-row .cell span {
                display: block;
            }
            .table-row .reg-no {
                font-family: 'RobotoBold', sans-serif;
                font-size: 11px;
                color: var(--primary-color);
                width: ${columns[0].width};
                text-align: ${columns[0].align};
            }
            .table-row .name {
                font-family: 'RobotoBold', sans-serif;
                font-size: 10px;
                width: ${columns[1].width};
                text-align: ${columns[1].align};
            }
            .table-row .alert-time {
                width: ${columns[2].width};
                text-align: ${columns[2].align};
            }
            .table-row .reason {
                width: ${columns[3].width};
                text-align: ${columns[3].align};
            }
            .table-row .approval {
                width: ${columns[4].width};
                text-align: ${columns[4].align};
            }
            .table-row .aa-approval {
                width: ${columns[5].width};
                text-align: ${columns[5].align};
            }

            /* Page Number Card */
            .page-number-card {
                position: absolute;
                bottom: 40px;
                right: 25px; /* Adjusted to be consistent with main content margin */
                width: 60px;
                height: 25px;
                border-radius: 12px;
                background-color: var(--primary-color);
                opacity: 0.1;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 9px;
                font-family: 'RobotoBold', sans-serif;
                color: var(--primary-color);
            }
            .page-number-card-text {
                opacity: 1; /* Ensure text is fully opaque */
            }

            /* Print-specific styles for page breaks */
            .table-row {
                page-break-inside: avoid;
            }
            .table-header {
                page-break-after: avoid;
            }
            .content-area {
                page-break-after: always; /* Force a new page after content area if needed */
            }
            @media print {
                html, body {
                    height: auto;
                }
                .page-number-card {
                    /* Puppeteer handles page numbers automatically with displayHeaderFooter */
                    /* So we don't need to render this in the main HTML */
                    display: none;
                }
            }
        </style>
    </head>
    <body>
        <div class="header-section">
            <div class="floating-circle circle-1"></div>
            <div class="floating-circle circle-2"></div>
            <div class="floating-circle circle-3"></div>
            <h1>ATTENDANCE REPORT</h1>
            <h2>Section: ${section}</h2>
            <h3>${monthName}</h3>
            <div class="timestamp">${generatedDateTime}</div>
        </div>

        <div class="content-area">
            <div class="table-container">
                <div class="table-header">
                    ${columns.map(col => `<div class="cell">${col.header}</div>`).join('')}
                </div>
                <div class="table-body">
                    ${tableRowsHtml}
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
}


export async function generatePdfReport(section, month) {
  let browser;
  try {
    const reportData = await downloadSectionReport(section, month);

    if (reportData.length === 0) {
      return null; // Return null if no data to generate a report
    }

    // Define colors here so they are accessible to the footerTemplate
    const colors = {
      primary: '#6366f1',       // Modern indigo
      secondary: '#4f46e5',     // Deeper indigo
      accent: '#8b5cf6',        // Purple accent
      text: '#1f2937',          // Rich dark gray
      lightText: '#6b7280',     // Medium gray
      background: '#f8fafc',    // Subtle light gray
      cardBg: '#ffffff',        // Pure white
      success: '#10b981',       // Modern green
      warning: '#f59e0b',       // Warm amber
      error: '#ef4444',         // Modern red
      border: '#e5e7eb',        // Light border
      shadow: 'rgba(0, 0, 0, 0.06)' // Subtle shadow
    };

    // Generate the HTML content
    const htmlContent = generateReportHtml(reportData, section, month);

    // Launch Puppeteer browser
    browser = await puppeteer.launch({ headless: "new" }); // Use 'headless: "new"' for the new headless mode
    const page = await browser.newPage();

    // Set the HTML content
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' }); // Wait for network to be idle

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true, // Crucial for background colors and gradients
      margin: {
        top: '25mm',
        right: '25mm',
        bottom: '25mm',
        left: '25mm',
      },
      // Add header and footer for page numbers (more reliable than custom HTML)
      displayHeaderFooter: true,
      headerTemplate: '<div style="font-size: 8px; width: 100%; text-align: center; margin-bottom: 5px;"></div>', // Empty header
      footerTemplate: `
        <div style="font-family: 'RobotoBold', sans-serif; font-size: 9px; width: 100%; text-align: center; color: ${colors.primary};">
          <span class="pageNumber"></span> / <span class="totalPages"></span>
        </div>
      `,
    });

    return pdfBuffer;

  } catch (error) {
    console.error('Error generating PDF report with Puppeteer:', error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}