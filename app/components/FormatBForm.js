// P_Matrix/app/components/FormatBForm.js
"use client";

import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, addDoc, doc, setDoc, getDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import ScoreBox from './Score';
const FormatBForm = ({ prefilledRegistrationNumber }) => {
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [initialFormData, setInitialFormData] = useState({});
    const [hasPendingChanges, setHasPendingChanges] = useState(false);
    const [formDataB, setFormDataB] = useState({
        registrationNumber: '',
        studentName: '',
        department: '',
        specialization: '',
        section: '',
        facultyAdvisorName: '',

        twelfthPercentagePoints: '',
        tenthPercentagePoints: '', 

        cgpaPoints: '',

        githubContributionsPoints: '',
        githubFrequencyPoints: '',
        communityProjectsPoints: '',
        collaborationsPoints: '',

        codingPracticeCPoints: '', 
        codingPracticeQuestionsPoints: '',

        internshipIITNITSRMPoints: '',
        internshipFortune500Points: '',
        internshipSmallCompaniesPoints: '',
        internshipLessThan3MonthsPoints: '',
        internshipPaidPoints: '',

        certificationCiscoPoints: '',
        certificationNPTELPoints: '',
        certificationCourseraPoints: '',
        certificationPgmmgCertPoints: '',
        certificationUdemyElabPoints: '',

        projectsIITDRDOPoints: '',
        projectsGovtPoints: '',
        projectsMobileWebAppPoints: '',
        projectsMiniProjectPoints: '',

        fsdProjectPoints: '',

        codingCompetitionFirstPoints: '',
        codingCompetitionSecondPoints: '',
        codingCompetitionThirdPoints: '',
        codingCompetitionParticipatedPoints: '',

        inhouseEachProjectPoints: '',

        professionalBodiesMembershipPoints: '',

        assessmentMarksPoints: '',

        totalPoints: '',
    });

    useEffect(() => {
        if (prefilledRegistrationNumber && formDataB.registrationNumber === '') {
            setFormDataB(prevData => ({
                ...prevData,
                registrationNumber: prefilledRegistrationNumber
            }));
        }

        const fetchDataAndCheckPending = async () => {
            if (prefilledRegistrationNumber) {
                setLoading(true);
                try {
                    const docRef = doc(db, "User", prefilledRegistrationNumber, "FormB", prefilledRegistrationNumber);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        const cleanedData = { ...data };
                        delete cleanedData.timestamp;

                        
                        const formBKeys = Object.keys(formDataB); 
                        const filteredData = {};
                        for (const key of formBKeys) {
                            if (cleanedData.hasOwnProperty(key)) {
                                filteredData[key] = cleanedData[key];
                            }
                        }

                        setFormDataB(filteredData);
                        setInitialFormData(filteredData); 
                        setIsEditing(false);
                        console.log("Existing Format B data loaded:", filteredData);
                    } else {
                        console.log("No existing Format B data found for this registration number. Allowing initial submission.");
                        setIsEditing(true);
                        setFormDataB(prevData => ({
                            ...prevData,
                            registrationNumber: prefilledRegistrationNumber
                        }));
                    }

                    const pendingUpdatesRef = collection(db, "PendingUpdates");
                    const q = query(pendingUpdatesRef,
                        where("regNo", "==", prefilledRegistrationNumber),
                        where("formType", "==", "FormB"),
                        where("status", "==", "pending")
                    );
                    const querySnapshot = await getDocs(q);
                    if (!querySnapshot.empty) {
                        setHasPendingChanges(true);
                        console.log("Found pending changes for this student and FormB.");
                    } else {
                        setHasPendingChanges(false);
                    }

                } catch (error) {
                    console.error("Error fetching existing document or checking pending updates for Format B:", error);
                    alert("Error loading existing data or checking pending updates for Format B.");
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchDataAndCheckPending();
    }, [prefilledRegistrationNumber]);

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        const inputValue = type === 'number' && value !== '' ? parseFloat(value) : value;

        setFormDataB((prevData) => ({
            ...prevData,
            [name]: inputValue,
        }));
    };

    const handleEdit = (e) => {
        e.preventDefault();
        if (!hasPendingChanges) {
            setIsEditing(true);
        } else {
            alert("Cannot edit. There are pending changes awaiting teacher approval.");
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setFormDataB(initialFormData);
    };

    const handleSubmitB = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!formDataB.registrationNumber) {
            alert("Registration Number is required to save Format B data.");
            setLoading(false);
            return;
        }

        if (!formDataB.registrationNumber.startsWith("RA")) {
            alert("Registration Number must start with 'RA'.");
            setLoading(false);
            return;
        }

        
        const formatBDataToSave = {};
        for (const key in formDataB) {
            
            if (formDataB.hasOwnProperty(key)) {
                formatBDataToSave[key] = formDataB[key];
            }
        }
        delete formatBDataToSave.timestamp; 

        const updates = {};
        const original = {};
        let hasChanges = false;

        for (const key in formatBDataToSave) {
            if (formatBDataToSave.hasOwnProperty(key) && formatBDataToSave[key] !== initialFormData[key]) {
                updates[key] = formatBDataToSave[key];
                original[key] = initialFormData[key] || ''; 
                hasChanges = true;
            }
        }

        if (!hasChanges && isEditing) {
            alert("No changes detected. Exiting edit mode.");
            setIsEditing(false);
            setLoading(false);
            return;
        }

        try {
            const formBDocSnap = await getDoc(doc(db, "User", formDataB.registrationNumber, "FormB", formDataB.registrationNumber));

            if (formBDocSnap.exists()) {
                const pendingDocRef = doc(db, "PendingUpdates", formDataB.registrationNumber); 
                await setDoc(pendingDocRef, {
                    regNo: formDataB.registrationNumber,
                    formType: "FormB",
                    updates: updates, 
                    original: original, 
                    timestamp: serverTimestamp(),
                    status: "pending",
                }, { merge: true }); 

                console.log("Format B changes submitted for approval for ID: ", formDataB.registrationNumber);
                alert('Your Format B data changes have been submitted for teacher approval.');
                setIsEditing(false);
                setHasPendingChanges(true);
            } else {
                const studentDocRef = doc(db, "User", formDataB.registrationNumber);
                await setDoc(studentDocRef, {
                    studentName: formDataB.studentName,
                    department: formDataB.department,
                    lastFormatBSubmission: serverTimestamp()
                }, { merge: true }); 

                const formatBDocRef = doc(db, "User", formDataB.registrationNumber, "FormB", formDataB.registrationNumber);
                await setDoc(formatBDocRef, {
                    ...formatBDataToSave, 
                    timestamp: serverTimestamp(),
                });

                console.log(`Format B data for ${formDataB.registrationNumber} created directly.`);
                alert('Format B Data Submitted Successfully!');
                setIsEditing(false);
                setInitialFormData(formatBDataToSave); 
                setHasPendingChanges(false);
            }

        } catch (e) {
            console.error("Error submitting changes for approval or initial save: ", e);
            alert('Error submitting data. Please check console.');
        } finally {
            setLoading(false);
        }
    };

    let inputCounter = 1;

    return (
        <form onSubmit={handleSubmitB} style={styles.form}>
            <h2 style={styles.subHeading}>Format B Details</h2>

            {hasPendingChanges && (
                <div style={styles.pendingMessage}>
                    <p>
                        <span role="img" aria-label="hourglass">⏳</span> Your changes are currently pending teacher approval. You cannot make further edits until approved or declined.
                    </p>
                </div>
            )}

            <div style={styles.inputGroup}>
                <h3 style={styles.groupTitle}>Section 1: Basic Details</h3>
                <label style={styles.label}>
                    {inputCounter++}. Registration Number:
                    <input
                        type="text"
                        name="registrationNumber"
                        value={formDataB.registrationNumber}
                        onChange={handleInputChange}
                        required
                        style={{ ...styles.input, ...styles.lockedInput }}
                        readOnly
                    />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. Student Name:
                    <input type="text" name="studentName" value={formDataB.studentName} onChange={handleInputChange} required style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. Department:
                    <input type="text" name="department" value={formDataB.department} onChange={handleInputChange} required style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. Specialization:
                    <input type="text" name="specialization" value={formDataB.specialization} onChange={handleInputChange} required style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. Section:
                    <input type="text" name="section" value={formDataB.section} onChange={handleInputChange} required style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. Faculty Advisor Name:
                    <input type="text" name="facultyAdvisorName" value={formDataB.facultyAdvisorName} onChange={handleInputChange} required style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
            </div>

            <div style={styles.inputGroup}>
                <h3 style={styles.groupTitle}>Section 2: 12th Percentage & 10th Percentage (Enter Points)</h3>
                <label style={styles.label}>
                    {inputCounter++}. 12th % (Max 2.5 Points):
                    <input type="number" name="twelfthPercentagePoints" value={formDataB.twelfthPercentagePoints} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. 10th % (Max 2.5 Points):
                    <input type="number" name="tenthPercentagePoints" value={formDataB.tenthPercentagePoints} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
            </div>

            <div style={styles.inputGroup}>
                <h3 style={styles.groupTitle}>Section 3: CGPA (Enter Points)</h3>
                <label style={styles.label}>
                    {inputCounter++}. CGPA (Max 5 Points):
                    <input type="number" name="cgpaPoints" value={formDataB.cgpaPoints} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
            </div>

            <div style={styles.inputGroup}>
                <h3 style={styles.groupTitle}>Section 4: Github Profile (Enter Points)</h3>
                <label style={styles.label}>
                    {inputCounter++}. No of Contributions / Repositories (Max 5 Points):
                    <input type="number" name="githubContributionsPoints" value={formDataB.githubContributionsPoints} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. Frequency of Contributions / Repositories - Monthly (Max 2 Points):
                    <input type="number" name="githubFrequencyPoints" value={formDataB.githubFrequencyPoints} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. Projects Done for Community (Max 3 Points):
                    <input type="number" name="communityProjectsPoints" value={formDataB.communityProjectsPoints} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. No of Collaborations (Max 5 Points):
                    <input type="number" name="collaborationsPoints" value={formDataB.collaborationsPoints} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
            </div>

            <div style={styles.inputGroup}>
                <h3 style={styles.groupTitle}>Section 5: Coding Practice Platform (Enter Points)</h3>
                
                <label style={styles.label}>
                    {inputCounter++}. C (Max 5 Points):
                    <input type="number" name="codingPracticeCPoints" value={formDataB.codingPracticeCPoints} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. No of Medium and Difficult Questions Solved (Max 5 Points):
                    <input type="number" name="codingPracticeQuestionsPoints" value={formDataB.codingPracticeQuestionsPoints} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
            </div>

            <div style={styles.inputGroup}>
                <h3 style={styles.groupTitle}>Section 6: Internships (Enter Points)</h3>
                <label style={styles.label}>
                    {inputCounter++}. IIT, NIT, SRM Internship Cycle (Max 5 Points):
                    <input type="number" name="internshipIITNITSRMPoints" value={formDataB.internshipIITNITSRMPoints} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. Fortune 500 Companies (Max 4 Points):
                    <input type="number" name="internshipFortune500Points" value={formDataB.internshipFortune500Points} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. Small Companies (Max 3 Points):
                    <input type="number" name="internshipSmallCompaniesPoints" value={formDataB.internshipSmallCompaniesPoints} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. Less than 3 Months (Max 2 Points):
                    <input type="number" name="internshipLessThan3MonthsPoints" value={formDataB.internshipLessThan3MonthsPoints} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. Paid Intern (Max 1 Point):
                    <input type="number" name="internshipPaidPoints" value={formDataB.internshipPaidPoints} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
            </div>

            <div style={styles.inputGroup}>
                <h3 style={styles.groupTitle}>Section 7: Skillset & Standard Certifications (Enter Points)</h3>
                <label style={styles.label}>
                    {inputCounter++}. CISCO, CCNA, CCNP, MCNA, MCNP, Matlab, Redhat, IBM (Max 5 Points):
                    <input type="number" name="certificationCiscoPoints" value={formDataB.certificationCiscoPoints} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. NPTEL (Max 3 Points):
                    <input type="number" name="certificationNPTELPoints" value={formDataB.certificationNPTELPoints} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. Coursera (Max 2 Points):
                    <input type="number" name="certificationCourseraPoints" value={formDataB.certificationCourseraPoints} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. Programming Cert (Max 1 Point):
                    <input type="number" name="certificationPgmmgCertPoints" value={formDataB.certificationPgmmgCertPoints} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. Udemy / Elab (Max 0.5 Points):
                    <input type="number" name="certificationUdemyElabPoints" value={formDataB.certificationUdemyElabPoints} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
            </div>

            <div style={styles.inputGroup}>
                <h3 style={styles.groupTitle}>Section 8: Projects Done (Enter Points)</h3>
                <label style={styles.label}>
                    {inputCounter++}. IIT, NIT, DRDO Projects (Max 5 Points):
                    <input type="number" name="projectsIITDRDOPoints" value={formDataB.projectsIITDRDOPoints} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. Govt Projects (Max 4 Points):
                    <input type="number" name="projectsGovtPoints" value={formDataB.projectsGovtPoints} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. Mobile & Web App Projects (Max 3 Points):
                    <input type="number" name="projectsMobileWebAppPoints" value={formDataB.projectsMobileWebAppPoints} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. Mini Project (Max 2 Points):
                    <input type="number" name="projectsMiniProjectPoints" value={formDataB.projectsMiniProjectPoints} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
            </div>

            <div style={styles.inputGroup}>
                <h3 style={styles.groupTitle}>Section 9: Full Stack Developer (Enter Points)</h3>
                <label style={styles.label}>
                    {inputCounter++}. FSD Project (Max 5 Points):
                    <input type="number" name="fsdProjectPoints" value={formDataB.fsdProjectPoints} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
            </div>

            <div style={styles.inputGroup}>
                <h3 style={styles.groupTitle}>Section 10: Coding Competition & Hackathons Won (Enter Points)</h3>
                <label style={styles.label}>
                    {inputCounter++}. First Prize (Max 5 Points):
                    <input type="number" name="codingCompetitionFirstPoints" value={formDataB.codingCompetitionFirstPoints} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. Second Prize (Max 4 Points):
                    <input type="number" name="codingCompetitionSecondPoints" value={formDataB.codingCompetitionSecondPoints} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. Third Prize (Max 3 Points):
                    <input type="number" name="codingCompetitionThirdPoints" value={formDataB.codingCompetitionThirdPoints} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. Participated (Max 2 Points):
                    <input type="number" name="codingCompetitionParticipatedPoints" value={formDataB.codingCompetitionParticipatedPoints} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
            </div>

            <div style={styles.inputGroup}>
                <h3 style={styles.groupTitle}>Section 11: Inhouse Projects (Enter Points)</h3>
                <label style={styles.label}>
                    {inputCounter++}. Total Points for Inhouse Projects (Each Project Max 4 Points):
                    <input type="number" name="inhouseEachProjectPoints" value={formDataB.inhouseEachProjectPoints} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                    <p style={styles.infoText}>*Enter your calculated points based on the number of projects.</p>
                </label>
            </div>

            <div style={styles.inputGroup}>
                <h3 style={styles.groupTitle}>Section 12: Membership of Professional Bodies (Enter Points)</h3>
                <label style={styles.label}>
                    {inputCounter++}. Professional Bodies Membership (Enter -2 for deduction, 0 otherwise):
                    <input type="number" name="professionalBodiesMembershipPoints" value={formDataB.professionalBodiesMembershipPoints} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
            </div>

            <div style={styles.inputGroup}>
                <h3 style={styles.groupTitle}>Section 13: Assessment Marks (SHL / NCET)</h3>
                <p style={styles.infoText}>Enter your points based on the following scale:</p>
                <ul style={styles.pointScaleList}>
                    <li>90 to 100 Marks – 10 Points</li>
                    <li>80 to 89 Marks – 09 Points</li>
                    <li>70 to 79 Marks – 08 Points</li>
                    <li>65 to 69 Marks – 07 Points</li>
                    <li>60 to 64 Marks – 06 Points</li>
                    <li>55 to 59 Marks – 05 Points</li>
                    <li>50 to 54 Marks – 04 Points</li>
                    <li>40 to 49 Marks – 03 Points</li>
                    <li>30 to 39 Marks – 02 Points</li>
                    <li>25 to 29 Marks - 01 Points</li>
                    <li>Less than 25 Marks - 0 Points</li>
                </ul>
                <label style={styles.label}>
                    {inputCounter++}. Your Assessment Points:
                    <input type="number" name="assessmentMarksPoints" value={formDataB.assessmentMarksPoints} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
            </div>

            <div style={styles.inputGroup}>
                <h3 style={styles.groupTitle}>Total Score</h3>
                <label style={styles.label}>
                    Total Points (Sum of all points entered from section 2 till 13):
                    <input type="number" name="totalPoints" value={formDataB.totalPoints} onChange={handleInputChange} style={{ ...styles.input, ...styles.totalInput }} disabled={!isEditing || hasPendingChanges} />
                </label>
            </div>

            <div style={styles.buttonContainer}>
                {isEditing && !hasPendingChanges ? (
                    <>
                        <button type="submit" disabled={loading} style={styles.submitButton}>
                            {loading ? 'Submitting for Approval...' : 'Submit Changes for Approval'}
                        </button>
                        <button type="button" onClick={handleCancelEdit} disabled={loading} style={{ ...styles.submitButton, ...styles.cancelButton }}>
                            Cancel
                        </button>
                    </>
                ) : (
                    <button
                        type="button"
                        onClick={handleEdit}
                        disabled={loading || hasPendingChanges}
                        style={{
                            ...styles.editButton,
                            ...(hasPendingChanges && styles.disabledButton)
                        }}
                    >
                        {hasPendingChanges ? 'Changes Pending Approval' : 'Edit Data'}
                    </button>
                )}
                <ScoreBox
                    tenthPercentage={formDataB.tenthPercentage}
                    twelfthPercentage={formDataB.twelfthPercentage}
                    twelfthPercentagePoints={formDataB.twelfthPercentagePoints}
                    tenthPercentagePoints={formDataB.tenthPercentagePoints}
                    cgpaPoints={formDataB.cgpaPoints}
                    githubContributionsPoints={formDataB.githubContributionsPoints}
                    githubFrequencyPoints={formDataB.githubFrequencyPoints}
                    communityProjectsPoints={formDataB.communityProjectsPoints}
                    collaborationsPoints={formDataB.collaborationsPoints}
                    codingPracticeCPoints={formDataB.codingPracticeCPoints}
                    codingPracticeQuestionsPoints={formDataB.codingPracticeQuestionsPoints}
                    internshipIITNITSRMPoints={formDataB.internshipIITNITSRMPoints}
                    internshipFortune500Points={formDataB.internshipFortune500Points}
                    internshipSmallCompaniesPoints={formDataB.internshipSmallCompaniesPoints}
                    internshipLessThan3MonthsPoints={formDataB.internshipLessThan3MonthsPoints}
                    internshipPaidPoints={formDataB.internshipPaidPoints}
                    certificationCiscoPoints={formDataB.certificationCiscoPoints}
                    certificationNPTELPoints={formDataB.certificationNPTELPoints}
                    certificationCourseraPoints={formDataB.certificationCourseraPoints}
                    certificationPgmmgCertPoints={formDataB.certificationPgmmgCertPoints}
                    certificationUdemyElabPoints={formDataB.certificationUdemyElabPoints}
                    projectsIITDRDOPoints={formDataB.projectsIITDRDOPoints}
                    projectsGovtPoints={formDataB.projectsGovtPoints}
                    projectsMobileWebAppPoints={formDataB.projectsMobileWebAppPoints}
                    projectsMiniProjectPoints={formDataB.projectsMiniProjectPoints}
                    fsdProjectPoints={formDataB.fsdProjectPoints}
                    codingCompetitionFirstPoints={formDataB.codingCompetitionFirstPoints}
                    codingCompetitionSecondPoints={formDataB.codingCompetitionSecondPoints}
                    codingCompetitionThirdPoints={formDataB.codingCompetitionThirdPoints}
                    codingCompetitionParticipatedPoints={formDataB.codingCompetitionParticipatedPoints}
                    inhouseEachProjectPoints={formDataB.inhouseEachProjectPoints}
                    professionalBodiesMembershipPoints={formDataB.professionalBodiesMembershipPoints}
                    assessmentMarksPoints={formDataB.assessmentMarksPoints}
                    totalPoints={formDataB.totalPoints}
                />
            </div>
        </form>
    );
};

const styles = {
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '25px',
        marginTop: '30px',
        padding: '20px',
        border: '1px solid #e0e0e0',
        borderRadius: '10px',
        backgroundColor: '#fdfdfd',
        boxShadow: '0 2px 15px rgba(0,0,0,0.05)',
    },
    subHeading: {
        textAlign: 'center',
        color: '#1a202c',
        marginBottom: '20px',
        fontSize: '2em',
        borderBottom: '2px solid #3b82f6',
        paddingBottom: '10px',
    },
    inputGroup: {
        border: '1px solid #cbd5e0',
        borderRadius: '8px',
        padding: '20px',
        backgroundColor: '#fff',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
    },
    groupTitle: {
        color: '#4a5568',
        borderBottom: '1px solid #ebf4ff',
        paddingBottom: '10px',
        marginBottom: '20px',
        fontSize: '1.4em',
    },
    minorGroupTitle: {
        color: '#5a677a',
        fontSize: '1.2em',
        marginBottom: '10px',
        marginLeft: '10px',
    },
    label: {
        display: 'block',
        marginBottom: '12px',
        fontWeight: 'bold',
        color: '#2d3748',
        fontSize: '0.9em',
    },
    input: {
        width: '100%',
        padding: '10px',
        marginTop: '5px',
        border: '1px solid #a0aec0',
        borderRadius: '6px',
        boxSizing: 'border-box',
        fontSize: '1em',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease',
    },
    lockedInput: {
        backgroundColor: '#e9ecef',
        cursor: 'not-allowed',
        borderColor: '#ced4da',
    },
    textarea: {
        width: '100%',
        padding: '10px',
        marginTop: '5px',
        border: '1px solid #a0aec0',
        borderRadius: '6px',
        boxSizing: 'border-box',
        fontSize: '1em',
        resize: 'vertical',
        minHeight: '50px',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    },
    radioGroup: {
        display: 'flex',
        gap: '20px',
        marginTop: '5px',
        marginBottom: '10px',
    },
    radioLabel: {
        display: 'flex',
        alignItems: 'center',
        fontWeight: 'normal',
        color: '#4a5568',
    },
    radioInput: {
        marginRight: '8px',
    },
    buttonContainer: {
        display: 'flex',
        justifyContent: 'center',
        gap: '15px',
        marginTop: '20px',
    },
    submitButton: {
        padding: '14px 30px',
        fontSize: '18px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: '#10b981',
        color: 'white',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease, transform 0.2s ease',
        fontWeight: '600',
    },
    cancelButton: {
        backgroundColor: '#6c757d',
    },
    editButton: {
        padding: '14px 30px',
        fontSize: '18px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: '#007bff',
        color: 'white',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease, transform 0.2s ease',
        fontWeight: '600',
    },
    disabledButton: {
        opacity: 0.6,
        cursor: 'not-allowed',
        backgroundColor: '#cccccc',
    },
    totalInput: {
        fontWeight: 'bold',
    },
    infoText: {
        fontSize: '0.85em',
        color: '#6a7d90',
        marginBottom: '10px',
        marginTop: '-5px',
    },
    pointScaleList: {
        listStyleType: 'decimal',
        marginLeft: '20px',
        marginBottom: '15px',
        fontSize: '0.9em',
        color: '#4a5568',
    },
    pendingMessage: {
        backgroundColor: '#fff3cd',
        border: '1px solid #ffeeba',
        color: '#856404',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        textAlign: 'center',
        fontSize: '0.95em',
        fontWeight: 'bold',
    }
};

export default FormatBForm;
