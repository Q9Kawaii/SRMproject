"use client";

import React, { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import ExportButtonFormA from "./ExportButtonFormA";
import ExportButtonFormB from "./ExportButtonFormB";

// Mapping object for translating database keys to user-friendly names
const displayNameMapping = {
  // Format A Keys
  personalAndContact: "Personal Details",
  academicDetails: "Academic Details",
  collegeAcademics: "College Academic Details (CGPA, Arrear)",
  technicalSkills: "Technical Skills",
  internships: "Internship Proof",
  codingAndHackathons: "Hackathons+",
  achievements: "Achievements",
  twelfth: "12th / Diploma Percentage",
  tenth: "10th Percentage",
  courses: "Online Course",
  appdev: "App Development",
  fullstack: "FullStack Project",
  codecomp: "Coding Competition",
  hackathon: "Hackathon Proof",
  inhouse: "Inhouse Project",
  member: "Professional Body Membership",
  careerAndPlacement: "Career and Placement",
  
  // Format B Keys
  tenthtwelfthpercent: "Tenth+",
  github: "Github",
  codingplatform: "Coding Platform",
  certifications: "Certificate",
  internships: "Internship",
  projectsdone: "Projects Done",
  fsd: "FullStack Development",
  membership: "Professional Body Membership",
  hackathons: "Hackathon",
  twelfthB: "12th/Diploma Percentage",
  tenthB: "Tenth Percentage",
  IITNIT: "IIT, NIT, SRM Internship",
  Fortune500: "Fortune 500 Company Internship",
  SmallComp: "Small Company Internship",
  Lessthan3: "Less than 3 months Internship",
  paidIntern: "Paid Internship",
  cisco: "Certifications",
  nptel: "NPTEL",
  coursera: "Coursera",
  prgcert: "Programming Certs",
  udemy: "Udemy/Elab",
  IITNITproj: "IIT, NIT, DRDO Projects",
  GovtProj: "Government Projects",
  Mobileapp: "Mobile Application",
  MiniProj: "Mini Project",
};

const ApprovedProofs = () => {
  const [approvedData, setApprovedData] = useState([]);
  const [openRegNo, setOpenRegNo] = useState(null);

  useEffect(() => {
    const fetchApproved = async () => {
      const q = query(collection(db, "PendingUpdates"), where("status", "==", "approved"));
      const querySnapshot = await getDocs(q);
      const results = [];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const regNo = data.regNo || "Unknown Reg No";
        const proofLinksMap = data.original?.proofLinks || {};
        const proofLinksBMap = data.original?.proofLinksB || {};

        const linksA = [];
        const linksB = [];

        const extractLinks = (linksMap, targetArray) => {
          for (const [section, linksArray] of Object.entries(linksMap)) {
            if (Array.isArray(linksArray)) {
              linksArray.forEach((link) => {
                if (typeof link === "string" && link.trim().startsWith("http")) {
                  // Use the mapping object to get the display name
                  const displayName = displayNameMapping[section] || section;
                  targetArray.push({
                    section: displayName,
                    url: link.trim(),
                  });
                }
              });
            }
          }
        };

        extractLinks(proofLinksMap, linksA);
        extractLinks(proofLinksBMap, linksB);

        if (linksA.length > 0 || linksB.length > 0) {
          results.push({ regNo, linksA, linksB });
        }
      });

      setApprovedData(results);
    };

    fetchApproved();
  }, []);

  const handleRegNoClick = (regNo) => {
    setOpenRegNo(openRegNo === regNo ? null : regNo);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Approved Proof Links</h2>
      {approvedData.length === 0 ? (
        <p style={styles.noData}>No approved proofs found.</p>
      ) : (
        approvedData.map((student, index) => (
          <div key={index} style={styles.card}>
            <button
              style={styles.regNoButton}
              onClick={() => handleRegNoClick(student.regNo)}
            >
              Reg No: {student.regNo}
            </button>
            {openRegNo === student.regNo && (
              <div style={styles.categoryContainer}>
                {student.linksA.length > 0 && (
                  <div style={styles.categorySection}>
                    <h4 style={styles.categoryHeading}>Format A</h4>
                    <ul style={styles.linkList}>
                      {student.linksA.map((link, i) => (
                        <li key={i} style={styles.linkItem}>
                          <strong>{link.section}:</strong>{" "}
                          <a href={link.url} target="_blank" rel="noopener noreferrer" style={styles.link}>
                            {link.url}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {student.linksB.length > 0 && (
                  <div style={styles.categorySection}>
                    <h4 style={styles.categoryHeading}>Format B</h4>
                    <ul style={styles.linkList}>
                      {student.linksB.map((link, i) => (
                        <li key={i} style={styles.linkItem}>
                          <strong>{link.section}:</strong>{" "}
                          <a href={link.url} target="_blank" rel="noopener noreferrer" style={styles.link}>
                            {link.url}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      )}
       <div style={{ display: "flex", justifyContent: "center", marginTop: "30px", gap: "20px" }}>
                <ExportButtonFormA />
                <ExportButtonFormB />
            </div>
    </div>
  );
};

const styles = {
  container: {
    marginTop: "40px",
    padding: "25px",
    border: "1px solid #e0e0e0",
    borderRadius: "10px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    backgroundColor: "#f9fafb",
  },
  heading: {
    fontSize: "24px",
    marginBottom: "20px",
    color: "#1e3a8a",
  },
  card: {
    marginBottom: "25px",
    padding: "20px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
  },
  regNoButton: {
    fontSize: "18px",
    color: "#111827",
    cursor: "pointer",
    background: "none",
    border: "none",
    padding: "0",
    margin: "0",
    textAlign: "left",
    fontWeight: "bold",
    marginBottom: "12px",
  },
  categoryContainer: {
    marginTop: "10px",
  },
  categorySection: {
    marginBottom: "20px",
  },
  categoryHeading: {
    fontSize: "16px",
    color: "#334155",
    marginTop: "0",
    marginBottom: "10px",
    borderBottom: "1px solid #e2e8f0",
    paddingBottom: "5px",
  },
  linkList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  linkItem: {
    marginBottom: "10px",
  },
  link: {
    color: "#2563eb",
    textDecoration: "underline",
    wordBreak: "break-all",
  },
  noData: {
    color: "#6b7280",
  },
};

export default ApprovedProofs;