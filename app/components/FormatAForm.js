// P_Matrix/app/components/FormatAForm.js
"use client";

import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, addDoc, doc, setDoc, getDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';

const FormatAForm = ({ prefilledRegistrationNumber }) => {
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false); 
    const [initialFormData, setInitialFormData] = useState({}); 
    const [hasPendingChanges, setHasPendingChanges] = useState(false); 
    const [formDataA, setFormDataA] = useState({
        registrationNumber: '', fullName: '', gender: '', nriStudent: '', dateOfBirth: '',
        department: '', specialization: '', section: '', srmistMailId: '', personalMailId: '',
        mobileNumber: '', alternateNumber: '', fatherMobile: '', fatherEmailId: '',
        motherMobile: '', motherEmailId: '', guardianContact: '', facultyAdvisorName: '',
        languagesKnown: '', tenthPercentage: '', tenthMediumOfInstruction: '',
        tenthBoardOfStudies: '', studiedDiploma: '', twelfthPercentage: '',
        twelfthMediumOfInstruction: '', twelfthBoardOfStudies: '', cgpaUptoSixthSem: '',
        numberOfStanding: '', historyOfArrears: '', githubProfileLink: '', codingPractice: '',
        internshipExperience: '', internshipExperienceMonths: '', industrialTrainingCompleted: '',
        programmingSkillset: '', standardCertificationCourses: '', applicationDevelopmentExperience: '',
        currentApplicationName: '', fsdExperience: '', currentFsdName: '', codingCompetition: '',
        hackathons: '', nameOfHackathons: '', otherCodingEventAwards: '', inhouseProjects: '',
        achievements: '', professionalBodiesMembership: '', assessmentMarks: '', careerOption: '',
        dreamCompanyPlacement: '', placementRankingMarks: '', file10th12thMarksheetUrl: '',
    });

    useEffect(() => {
        if (prefilledRegistrationNumber && formDataA.registrationNumber === '') {
            setFormDataA(prevData => ({
                ...prevData,
                registrationNumber: prefilledRegistrationNumber
            }));
        }

        const fetchDataAndCheckPending = async () => {
            if (prefilledRegistrationNumber) {
                setLoading(true);
                try {
                    
                    const docRef = doc(db, "User", prefilledRegistrationNumber, "FormA", prefilledRegistrationNumber);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        const cleanedData = { ...data };
                        delete cleanedData.timestamp;
                        setFormDataA(cleanedData);
                        setInitialFormData(cleanedData);
                        setIsEditing(false); 
                        console.log("Existing Format A data loaded:", cleanedData);
                    } else {
                        console.log("No existing Format A data found for this registration number. Allowing initial submission.");
                        setIsEditing(true);
                        setFormDataA(prevData => ({
                            ...prevData,
                            registrationNumber: prefilledRegistrationNumber
                        }));
                    }

                    const pendingUpdatesRef = collection(db, "PendingUpdates");
                    
                    const q = query(pendingUpdatesRef,
                        where("regNo", "==", prefilledRegistrationNumber),
                        where("formType", "==", "FormA"),
                        where("status", "==", "pending")
                    );
                    const querySnapshot = await getDocs(q);
                    if (!querySnapshot.empty) {
                        setHasPendingChanges(true);
                        console.log("Found pending changes for this student and FormA.");
                    } else {
                        setHasPendingChanges(false);
                    }

                } catch (error) {
                    console.error("Error fetching existing document or checking pending updates:", error);
                    alert("Error loading existing data or checking pending updates.");
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchDataAndCheckPending();
    }, [prefilledRegistrationNumber]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormDataA((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleEdit = (e) => {
        e.preventDefault();
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setFormDataA(initialFormData);
    };

    const handleSubmitA = async (e) => {
        e.preventDefault();
        console.log("handleSubmitA called!");
        setLoading(true);

        if (!formDataA.registrationNumber) {
            alert("Registration Number is required to save Format A data.");
            setLoading(false);
            return;
        }

        if (!formDataA.registrationNumber.startsWith("RA")) {
            alert("Registration Number must start with 'RA'.");
            setLoading(false);
            return;
        }

        const updates = {};
        const original = {};
        let hasChanges = false;

        for (const key in formDataA) {
            if (key !== 'timestamp' && formDataA[key] !== initialFormData[key]) {
                updates[key] = formDataA[key];
                original[key] = initialFormData[key] || ''; 
                hasChanges = true;
            }
        }

        if (!hasChanges) {
            alert("No changes detected. Exiting edit mode.");
            setIsEditing(false);
            setLoading(false);
            return;
        }

        try {
            
            const pendingDocRef = doc(db, "PendingUpdates", formDataA.registrationNumber); 
            await setDoc(pendingDocRef, { 
                regNo: formDataA.registrationNumber, 
                formType: "FormA",
                updates: updates,
                original: original,
                timestamp: serverTimestamp(),
                status: "pending",
            }, { merge: true }); 

            console.log("Format A changes submitted for approval with ID: ", formDataA.registrationNumber); 
            alert('Your Format A data changes have been submitted for teacher approval.');
            setIsEditing(false); 
            setHasPendingChanges(true); 

        } catch (e) {
            console.error("Error submitting changes for approval: ", e);
            alert('Error submitting changes for approval. Please check console.');
        } finally {
            setLoading(false);
        }
    };

    let inputCounter = 1;

    return (
        <form onSubmit={handleSubmitA} style={styles.form}>
            <h2 style={styles.subHeading}>Format A Details</h2>

            {hasPendingChanges && (
                <div style={styles.pendingMessage}>
                    <p>
                        <span role="img" aria-label="hourglass">⏳</span> Your changes are currently pending teacher approval. You cannot make further edits until approved or declined.
                    </p>
                </div>
            )}

            <div style={styles.inputGroup}>
                <h3 style={styles.groupTitle}>Personal & Contact</h3>
                <label style={styles.label}>
                    {inputCounter++}. Registration Number:
                    <input
                        type="text"
                        name="registrationNumber"
                        value={formDataA.registrationNumber}
                        onChange={handleInputChange}
                        required
                        style={{ ...styles.input, ...styles.lockedInput }} 
                        readOnly 
                    />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. Full Name (AS PER IN ATTENDANCE):
                    <input type="text" name="fullName" value={formDataA.fullName} onChange={handleInputChange} required style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. Gender:
                    <input type="text" name="gender" value={formDataA.gender} onChange={handleInputChange} required style={styles.input} placeholder="e.g., Male, Female, Other" disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. NRI Student:
                    <input type="text" name="nriStudent" value={formDataA.nriStudent} onChange={handleInputChange} required style={styles.input} placeholder="e.g., Yes or No" disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. DATE OF BIRTH:
                    <input type="text" name="dateOfBirth" value={formDataA.dateOfBirth} onChange={handleInputChange} required style={styles.input} placeholder="YYYY-MM-DD" disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. SRMIST Mail ID:
                    <input type="text" name="srmistMailId" value={formDataA.srmistMailId} onChange={handleInputChange} required style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. Personal Mail ID:
                    <input type="text" name="personalMailId" value={formDataA.personalMailId} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. Mobile Number:
                    <input type="text" name="mobileNumber" value={formDataA.mobileNumber} onChange={handleInputChange} required style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. Alternate Number:
                    <input type="text" name="alternateNumber" value={formDataA.alternateNumber} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. Father Mobile:
                    <input type="text" name="fatherMobile" value={formDataA.fatherMobile} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. Father Email ID:
                    <input type="text" name="fatherEmailId" value={formDataA.fatherEmailId} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. Mother Mobile:
                    <input type="text" name="motherMobile" value={formDataA.motherMobile} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. Mother Email ID:
                    <input type="text" name="motherEmailId" value={formDataA.motherEmailId} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. Guardian Contact:
                    <input type="text" name="guardianContact" value={formDataA.guardianContact} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. Name of Faculty Adviser:
                    <input type="text" name="facultyAdvisorName" value={formDataA.facultyAdvisorName} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. Languages Known:
                    <input type="text" name="languagesKnown" value={formDataA.languagesKnown} onChange={handleInputChange} placeholder="e.g., English, Hindi, Tamil" style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
            </div>

            <div style={styles.inputGroup}>
                <h3 style={styles.groupTitle}>Academic Details</h3>
                <label style={styles.label}>
                    {inputCounter++}. Department:
                    <input type="text" name="department" value={formDataA.department} onChange={handleInputChange} required style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. Specialization:
                    <input type="text" name="specialization" value={formDataA.specialization} onChange={handleInputChange} required style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. Section:
                    <input type="text" name="section" value={formDataA.section} onChange={handleInputChange} required style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. 10th Percentage:
                    <input type="text" name="tenthPercentage" value={formDataA.tenthPercentage} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. 10th Medium of Instruction:
                    <input type="text" name="tenthMediumOfInstruction" value={formDataA.tenthMediumOfInstruction} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. 10th Board of Studies:
                    <input type="text" name="tenthBoardOfStudies" value={formDataA.tenthBoardOfStudies} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. Studied Diploma:
                    <input type="text" name="studiedDiploma" value={formDataA.studiedDiploma} onChange={handleInputChange} style={styles.input} placeholder="e.g., Yes or No" disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. 12th Percentage:
                    <input type="text" name="twelfthPercentage" value={formDataA.twelfthPercentage} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. 12th Medium of Instruction:
                    <input type="text" name="twelfthMediumOfInstruction" value={formDataA.twelfthMediumOfInstruction} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. 12th Board of Studies:
                    <input type="text" name="twelfthBoardOfStudies" value={formDataA.twelfthBoardOfStudies} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. Scanned PDF copy of 10th and 12th Marksheet URL (Both in one single Document):
                    <input type="text" name="file10th12thMarksheetUrl" value={formDataA.file10th12thMarksheetUrl} onChange={handleInputChange} placeholder="Enter URL to document" style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. CGPA (Upto 6th Semester):
                    <input type="text" name="cgpaUptoSixthSem" value={formDataA.cgpaUptoSixthSem} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. No of Standing:
                    <input type="text" name="numberOfStanding" value={formDataA.numberOfStanding} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. History of Arrears (Mention if any, else N/A):
                    <input type="text" name="historyOfArrears" value={formDataA.historyOfArrears} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
            </div>

            <div style={styles.inputGroup}>
                <h3 style={styles.groupTitle}>Technical Skills & Experience</h3>
                <label style={styles.label}>
                    {inputCounter++}. Github Profile Link:
                    <input type="text" name="githubProfileLink" value={formDataA.githubProfileLink} onChange={handleInputChange} placeholder="https://github.com/yourprofile" style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. Coding Practice (Platforms/Regularity):
                    <input type="text" name="codingPractice" value={formDataA.codingPractice} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. Internship Experience (Describe briefly):
                    <input type="text" name="internshipExperience" value={formDataA.internshipExperience} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. Internship Experience in Months (FA will collect the Proof):
                    <input type="text" name="internshipExperienceMonths" value={formDataA.internshipExperienceMonths} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. No of Industrial Training Completed, List out Company name, Location, Year and Month (From first Year Till Date) FA KINDLY COLLECT THE CERTIF:
                    <input type="text" name="industrialTrainingCompleted" value={formDataA.industrialTrainingCompleted} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. Programming Skillset (e.g., Python, Java, C++, JavaScript):
                    <input type="text" name="programmingSkillset" value={formDataA.programmingSkillset} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. Standard Certification Courses Completed (Proof is Mandatory. Will be collected by FA):
                    <input type="text" name="standardCertificationCourses" value={formDataA.standardCertificationCourses} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. Application Development Experience (Projects Done):
                    <input type="text" name="applicationDevelopmentExperience" value={formDataA.applicationDevelopmentExperience} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. List Currently Available Application Name (Specify with month and year):
                    <input type="text" name="currentApplicationName" value={formDataA.currentApplicationName} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. FSD Experience (Full Stack Developer):
                    <input type="text" name="fsdExperience" value={formDataA.fsdExperience} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. List Currently available FSD Name (Specify with month and year):
                    <input type="text" name="currentFsdName" value={formDataA.currentFsdName} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. Coding Competition (Won/ Top 3 Team):
                    <input type="text" name="codingCompetition" value={formDataA.codingCompetition} onChange={handleInputChange} placeholder="e.g., Won Xyz Competition" style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. HACKATHONS (Won/ Top 3 Team):
                    <input type="text" name="hackathons" value={formDataA.hackathons} onChange={handleInputChange} placeholder="e.g., Top 3 in Abc Hackathon" style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. NAME OF THE HACKATHONS (WON/ PARTICIPATED WITH MONTH AND YEAR):
                    <input type="text" name="nameOfHackathons" value={formDataA.nameOfHackathons} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. If Participated in any other coding Event, WON Prize/ Award specify with year and month (If not Participated Enter NA):
                    <input type="text" name="otherCodingEventAwards" value={formDataA.otherCodingEventAwards} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. Inhouse Projects (Under any Professor of SRM / Foreign Professor / Reputed Institutions):
                    <input type="text" name="inhouseProjects" value={formDataA.inhouseProjects} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. ACHIEVEMENTS (LAST 3 YEARS, SPECIFY WITH MONTH AND YEAR):
                    <input type="text" name="achievements" value={formDataA.achievements} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. Membership of Professional Bodies:
                    <input type="text" name="professionalBodiesMembership" value={formDataA.professionalBodiesMembership} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
            </div>

            <div style={styles.inputGroup}>
                <h3 style={styles.groupTitle}>Career & Placement</h3>
                <label style={styles.label}>
                    {inputCounter++}. Assessment (SHL / NCET) Marks:
                    <input type="text" name="assessmentMarks" value={formDataA.assessmentMarks} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. Career Option:
                    <input type="text" name="careerOption" value={formDataA.careerOption} onChange={handleInputChange} placeholder="e.g., Software Engineer, Data Scientist, Higher Studies" style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. Dream Company Option for Placement (Mention any one Company with Salary Package more than 10 Lakhs per Annum) (IF HIGHER STUDIES MENTION NA):
                    <input type="text" name="dreamCompanyPlacement" value={formDataA.dreamCompanyPlacement} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. Placement Ranking Marks(100):
                    <input type="text" name="placementRankingMarks" value={formDataA.placementRankingMarks} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
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
    buttonContainer: {
        display: 'flex',
        justifyContent: 'center',
        gap: '15px', // Space between buttons
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
        backgroundColor: '#6c757d', // Grey for cancel
    },
    editButton: {
        padding: '14px 30px',
        fontSize: '18px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: '#007bff', // Blue for edit
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
    pendingMessage: {
        backgroundColor: '#fff3cd',
        border: '1px solid #ffeeba',
        color: '#856404',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        textAlign: 'center',
        fontSize: '1.1em',
        fontWeight: 'bold',
    }
};

export default FormatAForm;