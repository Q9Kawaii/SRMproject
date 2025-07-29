// attendanceLogic.js
import { adminDb as db } from './lib/firebase-admin.js';
import PDFDocument from 'pdfkit'; // ✅ Fixed: Use ES6 import instead of require

// Utility to format timestamp
const getTimestamp = () => {
  const now = new Date();
  return now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).replace(" ", "") + now.toLocaleDateString("en-GB").replace(/\//g, '');
};

const studentsCollection = db.collection("User"); 

// ========== Core Functions ==========

// Fetch students by section
async function fetchStudentsBySection(section) {
  try {
    const snapshot = await studentsCollection.where("section", "==", section).get();
    const students = [];
    snapshot.forEach(doc => {
      students.push({ regNo: doc.id, ...doc.data() });
    });
    return students;
  } catch (error) {
    console.error(`Error in fetchStudentsBySection for section ${section}:`, error);
    throw new Error(`Failed to fetch students data: ${error.message}`);
  }
}

async function alertStudent(regNo, dateStr) {
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

async function getAttendanceMapForStudent(regNo) {
  try {
    const studentRef = db.collection('User').doc(regNo);
    const doc = await studentRef.get();

    if (!doc.exists) {
      console.log(`No student found with regNo: ${regNo}`);
      return {};
    }

    const data = doc.data();
    const attendanceMap = data.attendance || {};
    return attendanceMap;

  } catch (error) {
    console.error(`Error fetching attendance map for ${regNo}:`, error);
    throw new Error(`Failed to fetch attendance map: ${error.message}`);
  }
}

// Submit reason for a specific date
async function submitReason(regNo, dateStr, reason) {
  try {
    const ref = studentsCollection.doc(regNo);
    const doc = await ref.get();
    if (!doc.exists) throw new Error("Student not found");

    const records = doc.data().absentRecords || {};
    const record = records[dateStr];
    if (!record) throw new Error("Alert not raised for this date");

    const parts = record.split("~");
    parts[2] = reason;
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
async function approveFA(regNo, dateStr) {
  try {
    const ref = studentsCollection.doc(regNo);
    const doc = await ref.get();
    if (!doc.exists) throw new Error("Student not found");

    const record = doc.data().absentRecords?.[dateStr];
    if (!record) throw new Error("Alert not found for this date to approve FA");

    const parts = record.split("~");
    parts[0] = "1";
    parts[3] = getTimestamp();
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
async function approveAA(regNo, dateStr) {
  try {
    const ref = studentsCollection.doc(regNo);
    const doc = await ref.get();
    if (!doc.exists) throw new Error("Student not found");

    const record = doc.data().absentRecords?.[dateStr];
    if (!record) throw new Error("Alert not found for this date to approve AA");

    const parts = record.split("~");
    parts[1] = "1";
    parts[4] = getTimestamp();
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
async function getAbsentRecords(regNo) {
  try {
    const studentRef = db.collection('User').doc(regNo);
    const doc = await studentRef.get();

    if (!doc.exists) {
      console.log(`No student found with regNo: ${regNo}`);
      return [];
    }

    const data = doc.data();
    const rawAbsentRecordsMap = data.absentRecords || {};
    const parsedRecords = [];

    for (const [dateKey, delimitedString] of Object.entries(rawAbsentRecordsMap)) {
      if (typeof delimitedString === 'string' && delimitedString.includes('~')) {
        const parts = delimitedString.split('~');

        if (parts.length >= 6) {
          const faApprovedRaw = parts[0];
          const aaApprovedRaw = parts[1];

          const faApproved = faApprovedRaw === '1';
          const aaApproved = aaApprovedRaw === '1';
          const resolved = faApproved && aaApproved;

          const reason = parts[2].trim() !== 'NA' ? parts[2].trim() : '';
          const faTimestamp = parts[3].trim() !== 'NA' ? parts[3].trim() : '';
          const aaTimestamp = parts[4].trim() !== 'NA' ? parts[4].trim() : '';
          const alertTimestamp = parts[5].trim() !== 'NA' ? parts[5].trim() : '';

          const formattedDate = dateKey;

          parsedRecords.push({
            date: formattedDate,
            resolved: resolved,
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

    parsedRecords.sort((a, b) => {
      const dateA = new Date(a.date.substring(4,8), a.date.substring(2,4) - 1, a.date.substring(0,2));
      const dateB = new Date(b.date.substring(4,8), b.date.substring(2,4) - 1, b.date.substring(0,2));
      return dateB.getTime() - dateA.getTime();
    });

    return parsedRecords;
  } catch (error) {
    console.error(`Error fetching or parsing absent records for ${regNo}:`, error);
    return [];
  }
}

async function downloadSectionReport(section, month) {
  try {
    const students = await fetchStudentsBySection(section);
    const report = [];

    for (const student of students) {
      const regNo = student.regNo;
      const name = student.name;

      const parsedAbsentRecords = await getAbsentRecords(regNo);

      for (const record of parsedAbsentRecords) {
        if (record.date && record.date.substring(2, 8) === month) {
          report.push({
            regNo,
            name,
            date: record.date,
            reason: record.reason,
            faApproved: record.faApproved ? "Yes" : "No",
            aaApproved: record.aaApproved ? "Yes" : "No",
            faTime: record.faTimestamp,
            aaTime: record.aaTimestamp,
            alertTime: record.alertTimestamp,
          });
        }
      }
    }
    return report;
  } catch (error) {
    console.error(`Error preparing section report for ${section} in ${month}:`, error);
    throw new Error(`Failed to prepare section report: ${error.message}`);
  }
}

async function bulkAlertStudents(regNos, dateStr) {
  const results = [];

  for (const regNo of regNos) {
    try {
      const studentRef = db.collection('User').doc(regNo);
      const doc = await studentRef.get();

      if (!doc.exists) {
        console.warn(`Student with RegNo ${regNo} not found for bulk alert.`);
        results.push({ regNo, success: false, error: `Student ${regNo} not found` });
        continue;
      }

      const data = doc.data();
      const absentRecords = data.absentRecords || {};

      if (absentRecords[dateStr]) {
        console.log(`Skipping bulk alert for ${regNo} on ${dateStr}: Alert already exists for today.`);
        results.push({ regNo, success: true, message: 'Skipped: Alert already exists for today' });
        continue;
      }

      await alertStudent(regNo, dateStr);
      results.push({ regNo, success: true, message: 'Alert created successfully' });

    } catch (err) {
      console.error(`Error during bulk alert for ${regNo}:`, err);
      results.push({ regNo, success: false, error: err.message });
    }
  }

  return results;
}

async function generatePdfReport(section, month) {
  try {
    const reportData = await downloadSectionReport(section, month);

    if (reportData.length === 0) {
      return null;
    }

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 25,
        bufferPages: true
      });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // Enhanced color palette for modern design
      const colors = {
        primary: '#6366f1',
        secondary: '#4f46e5',
        accent: '#8b5cf6',
        text: '#1f2937',
        lightText: '#6b7280',
        background: '#f8fafc',
        cardBg: '#ffffff',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        border: '#e5e7eb',
        shadow: '#00000010'
      };

      // Helper functions for enhanced design
      function drawCard(x, y, width, height, radius = 12) {
        doc.roundedRect(x + 3, y + 3, width, height, radius)
           .fillColor(colors.shadow)
           .fill();
        
        doc.roundedRect(x, y, width, height, radius)
           .fillColor(colors.cardBg)
           .strokeColor(colors.border)
           .lineWidth(1)
           .fillAndStroke();
      }

      function addModernGradientHeader(startY, height) {
        const gradient = doc.linearGradient(0, startY, doc.page.width, startY + height);
        gradient.stop(0, colors.primary);
        gradient.stop(0.6, colors.secondary);
        gradient.stop(1, colors.accent);
        doc.rect(0, startY, doc.page.width, height).fill(gradient);
      }

      function addFloatingElements() {
        doc.circle(doc.page.width - 80, 40, 30)
           .fillColor(colors.accent)
           .fillOpacity(0.1)
           .fill();
        
        doc.circle(doc.page.width - 50, 70, 15)
           .fillColor(colors.primary)
           .fillOpacity(0.15)
           .fill();
        
        doc.circle(60, 100, 20)
           .fillColor(colors.accent)
           .fillOpacity(0.08)
           .fill();
      }

      // Header Section
      addModernGradientHeader(0, 140);
      addFloatingElements();
      
      doc.fillColor(colors.cardBg)
         .fillOpacity(1)
         .fontSize(32)
         .font('Helvetica-Bold')
         .text('ATTENDANCE REPORT', 40, 40, { align: 'left' });

      doc.fontSize(18)
         .fillColor(colors.cardBg)
         .fillOpacity(0.95)
         .text(`Section: ${section}`, 40, 80);

      const monthName = new Date(parseInt(month.substring(2,6)), parseInt(month.substring(0,2)) - 1, 1)
                               .toLocaleString('en-US', { month: 'long', year: 'numeric' });
      doc.fontSize(16)
         .fillOpacity(0.9)
         .text(monthName, 40, 105);

      const now = new Date();
      doc.fontSize(11)
         .fillColor(colors.cardBg)
         .fillOpacity(0.85)
         .text(`Generated on ${now.toLocaleDateString('en-US', { 
           weekday: 'long', 
           year: 'numeric', 
           month: 'long', 
           day: 'numeric' 
         })} at ${now.toLocaleTimeString('en-US', { 
           hour: '2-digit', 
           minute: '2-digit' 
         })}`, 
         doc.page.width - 250, 110, { align: 'right', width: 220 });

      doc.y = 160;

      // Table Design
      const pageWidth = doc.page.width - 50;
      const startX = 25;
      
      const columns = [
        { header: 'Reg No', width: 80, key: 'regNo' },
        { header: 'Name', width: 100, key: 'name' }, 
        { header: 'Alert Time', width: 70, key: 'alertTime' }, 
        { header: 'Reason', width: 100, key: 'reason' }, 
        { header: 'FA Approval', width: 90, key: 'faApproval' }, 
        { header: 'AA Approval', width: 90, key: 'aaApproval' } 
      ];

      function drawModernTableHeaders(y) {
        drawCard(startX, y, pageWidth, 50, 12);
        
        const headerGradient = doc.linearGradient(startX, y, startX, y + 50);
        headerGradient.stop(0, colors.primary);
        headerGradient.stop(1, colors.secondary);
        
        doc.roundedRect(startX, y, pageWidth, 50, 12)
           .fill(headerGradient);

        doc.fontSize(12)
           .font('Helvetica-Bold')
           .fillColor(colors.cardBg);

        let currentX = startX + 15;
        columns.forEach(col => {
          doc.text(col.header, currentX, y + 18, { 
            width: col.width - 10,
            align: 'center' 
          });
          currentX += col.width;
        });

        return y + 60;
      }

      function formatDateTime(dateTimeStr) {
        if (!dateTimeStr || dateTimeStr === '—' || dateTimeStr === '') {
          return { date: '—', time: '—', display: '—' };
        }
        
        try {
          let dateStr, timeStr;
          
          if (dateTimeStr.includes('T')) {
            const dt = new Date(dateTimeStr);
            dateStr = dt.toLocaleDateString('en-GB');
            timeStr = dt.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            });
          } else if (dateTimeStr.match(/\d{2}:\d{2}[ap]m\d{8}/i)) {
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

      function drawModernDataRow(item, y, isEven = false) {
        const rowHeight = 65;
        
        const bgColor = isEven ? colors.background : colors.cardBg;
        drawCard(startX, y, pageWidth, rowHeight, 8);
        
        doc.roundedRect(startX, y, pageWidth, rowHeight, 8)
           .fillColor(bgColor)
           .fill();

        doc.roundedRect(startX, y, 4, rowHeight, 2)
           .fillColor(colors.accent)
           .fillOpacity(0.6)
           .fill();

        doc.fillOpacity(1)
           .fontSize(10)
           .font('Helvetica')
           .fillColor(colors.text);

        let currentX = startX + 15;

        // Reg No
        doc.font('Helvetica-Bold')
           .fontSize(11)
           .fillColor(colors.primary)
           .text(String(item.regNo || '—'), currentX, y + 12, { 
             width: columns[0].width - 20, 
             align: 'center' 
           });
        currentX += columns[0].width;

        // Name
        doc.font('Helvetica-Bold')
           .fontSize(10)
           .fillColor(colors.text);
        const nameText = String(item.name || '—');
        doc.text(nameText, currentX, y + 12, { 
          width: columns[1].width - 20, 
          align: 'left',
          lineGap: 2
        });
        currentX += columns[1].width;

        // Alert Time
        const alertDateTime = formatDateTime(item.alertTime);
        doc.fontSize(9)
           .font('Helvetica')
           .fillColor(colors.text);
        
        if (alertDateTime.date !== '—') {
          doc.text(alertDateTime.date, currentX, y + 8, { 
            width: columns[2].width - 20, 
            align: 'center' 
          });
          if (alertDateTime.time !== '—' && alertDateTime.time) {
            doc.fontSize(8)
               .fillColor(colors.lightText)
               .text(alertDateTime.time, currentX, y + 25, { 
                 width: columns[2].width - 20, 
                 align: 'center' 
               });
          }
        } else {
          doc.text('—', currentX, y + 22, { 
            width: columns[2].width - 20, 
            align: 'center' 
          });
        }
        currentX += columns[2].width;

        // Reason
        doc.fontSize(9)
           .font('Helvetica')
           .fillColor(colors.text);
        const reasonText = String(item.reason || '—');
        doc.text(reasonText, currentX, y + 12, { 
          width: columns[3].width - 20, 
          align: 'left',
          lineGap: 1,
          ellipsis: true
        });
        currentX += columns[3].width;

        // FA Approval
        const faInfo = formatApprovalInfo(item.faApproved, item.faTime);
        const faStatusColor = faInfo.status === 'Approved' ? colors.success : 
                             faInfo.status === 'Rejected' ? colors.error : colors.warning;
        
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .fillColor(faStatusColor)
           .text(faInfo.status, currentX, y + 8, { 
             width: columns[4].width - 20, 
             align: 'center' 
           });
        
        if (faInfo.datetime !== '—') {
          doc.fontSize(8)
             .font('Helvetica')
             .fillColor(colors.lightText)
             .text(faInfo.datetime, currentX, y + 25, { 
               width: columns[4].width - 20, 
               align: 'center' 
             });
        }
        currentX += columns[4].width;

        // AA Approval
        const aaInfo = formatApprovalInfo(item.aaApproved, item.aaTime);
        const aaStatusColor = aaInfo.status === 'Approved' ? colors.success : 
                             aaInfo.status === 'Rejected' ? colors.error : colors.warning;
        
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .fillColor(aaStatusColor)
           .text(aaInfo.status, currentX, y + 8, { 
             width: columns[5].width - 20, 
             align: 'center' 
           });
        
        if (aaInfo.datetime !== '—') {
          doc.fontSize(8)
             .font('Helvetica')
             .fillColor(colors.lightText)
             .text(aaInfo.datetime, currentX, y + 25, { 
               width: columns[5].width - 20, 
               align: 'center' 
             });
        }

        return y + rowHeight + 8;
      }

      // Draw the table
      let currentY = drawModernTableHeaders(doc.y + 20);
      currentY += 5;

      const minContentHeight = 80;
      reportData.forEach((item, index) => {
        if (currentY + minContentHeight > doc.page.height - doc.page.margins.bottom) {
          doc.addPage();
          currentY = doc.page.margins.top;
          currentY = drawModernTableHeaders(currentY) + 5;
        }

        currentY = drawModernDataRow(item, currentY, index % 2 === 0);
      });

      // Add page numbers
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        
        const pageNumX = doc.page.width - 80;
        const pageNumY = doc.page.height - 40;
        
        doc.roundedRect(pageNumX, pageNumY, 60, 25, 12)
           .fillColor(colors.primary)
           .fillOpacity(0.1)
           .fill();
        
        doc.fontSize(9)
           .font('Helvetica-Bold')
           .fillColor(colors.primary)
           .fillOpacity(1)
           .text(`${i + 1} / ${pageCount}`, pageNumX, pageNumY + 8, { 
             align: 'center', 
             width: 60 
           });
      }

      doc.end();
    });
  } catch (error) {
    console.error('Error generating PDF report:', error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
}

// ✅ Fixed: Use ES6 exports instead of CommonJS
export {
  fetchStudentsBySection,
  alertStudent,
  submitReason,
  approveFA,
  approveAA,
  getAbsentRecords,
  downloadSectionReport,
  bulkAlertStudents,
  getAttendanceMapForStudent,
  generatePdfReport,
  getLowAttendanceSubjects,
};