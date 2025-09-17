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
    // New state for proof links
        const [proofLinksB, setproofLinksB] = useState({
            tenthtwelfthpercent: [''],
            github: [''],
            codingplatform: [''],
            certifications: [''],
            internships: [''],
            projectsdone: [''],
            fsd: [''],
            inhouse: [''],
            membership: [''],
            hackathons: [''],
            twelfthB: [''],
            tenthB: [''],
            IITNIT: [''],
            Fortune500: [''],
            SmallComp: [''],
            Lessthan3: [''],
            paidIntern: [''],
            cisco: [''],
            nptel: [''],
            coursera: [''],
            prgcert: [''],
            udemy: [''],
            IITNITproj: [''],
            GovtProj: [''],
            Mobileapp: [''],
            MiniProj: [''],
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

    // ✅ Load proof links if they exist
    if (data.proofLinksB) {
        setproofLinksB(data.proofLinksB);
    }

    setIsEditing(false);
    console.log("Existing Format B data loaded:", filteredData);
}
 else {
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

    // New handlers for proof links
    const handleProofLinkChange = (section, index, value) => {
        setproofLinksB(prevLinks => {
            const newLinks = [...prevLinks[section]];
            newLinks[index] = value;
            return { ...prevLinks, [section]: newLinks };
        });
    };
    const addProofLink = (section) => {
        setproofLinksB(prevLinks => ({
            ...prevLinks,
            [section]: [...prevLinks[section], '']
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
        // Reset proof links to initial state
        setproofLinksB(initialFormData.proofLinksB || {
            personalAndContact: [''],
            academicDetails: [''],
            collegeAcademics: [''],
            technicalSkills: [''],
            internships: [''],
            codingAndHackathons: [''],
            achievements: [''],
            careerAndPlacement: [''],
    });
    }
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

        // Combine formDataA and proofLinksB for comparison
        const currentData = { ...formDataB, proofLinksB: proofLinksB };
        const initialCombinedData = { ...initialFormData, proofLinksB: initialFormData.proofLinksB || {} };

        for (const key in currentData) {
            // Special handling for proofLinksB, which is an object
            if (key === 'proofLinksB') {
                if (JSON.stringify(currentData.proofLinksB) !== JSON.stringify(initialCombinedData.proofLinksB)) {
                    updates.proofLinksB = currentData.proofLinksB;
                    original.proofLinksB = initialCombinedData.proofLinksB;
                    hasChanges = true;
                }
            } else if (key !== 'timestamp' && currentData[key] !== initialCombinedData[key]) {
                updates[key] = currentData[key];
                original[key] = initialCombinedData[key] || ''; 
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

            <div style={styles.buttonContainer}>
                {isEditing && !hasPendingChanges ? (
                    <>
                        <button type="submit" disabled={loading} style={styles.submitButton}>
                            {loading ? 'Submitting for Approval...' : 'Submit Changes for Approval'}
                        </button>
                    </>
                ) : (
                <>
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
                </>
                )}
            </div>

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
                        style={{ ...styles.input, }}
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
                <h3 style={styles.groupTitle}>Section 2: 12th Percentage & 10th Percentage</h3>
                <label style={styles.label}>
                    {inputCounter++}. 12th % :
                    <input type="number" name="twelfthPercentagePoints" value={formDataB.twelfthPercentagePoints} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                {/* Proof links for Academic Details */}
                <h4 style={styles.proofTitle}>Proof Links for 12th Marks:</h4>
                {proofLinksB.twelfthB.map((link, index) => (
                    <div key={index} style={styles.proofInputWrapper}>
                        <input
                            type="text"
                            value={link}
                            onChange={(e) => handleProofLinkChange('twelfthB', index, e.target.value)}
                            placeholder="Enter proof URL"
                            style={styles.input}
                            disabled={!isEditing || hasPendingChanges}
                        />
                    </div>
                ))}
                <label style={styles.label}>
                    {inputCounter++}. 10th % :
                    <input type="number" name="tenthPercentagePoints" value={formDataB.tenthPercentagePoints} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                {/* Proof links for Academic Details */}
                <h4 style={styles.proofTitle}>Proof Links for 10th Marks:</h4>
                {proofLinksB.tenthB.map((link, index) => (
                    <div key={index} style={styles.proofInputWrapper}>
                        <input
                            type="text"
                            value={link}
                            onChange={(e) => handleProofLinkChange('tenthB', index, e.target.value)}
                            placeholder="Enter proof URL"
                            style={styles.input}
                            disabled={!isEditing || hasPendingChanges}
                        />
                    </div>
                ))}
                
            </div>

            <div style={styles.inputGroup}>
                <h3 style={styles.groupTitle}>Section 3: CGPA</h3>
                <label style={styles.label}>
                    {inputCounter++}. CGPA:
                    <input type="number" name="cgpaPoints" value={formDataB.cgpaPoints} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
            </div>

            <div style={styles.inputGroup}>
                <h3 style={styles.groupTitle}>Section 4: Github Profile</h3>
                <label style={styles.label}>
                    {inputCounter++}. No of Contributions / Repositories :
                    <input type="number" name="githubContributionsPoints" value={formDataB.githubContributionsPoints} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. Frequency of Contributions / Repositories - Monthly:
                    <input type="number" name="githubFrequencyPoints" value={formDataB.githubFrequencyPoints} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. Projects Done for Community:
                    <input type="number" name="communityProjectsPoints" value={formDataB.communityProjectsPoints} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. No of Collaborations:
                    <input type="number" name="collaborationsPoints" value={formDataB.collaborationsPoints} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                {/* Proof links for Academic Details */}
                <h4 style={styles.proofTitle}>Proof Links for Github Profile:</h4>
                {proofLinksB.github.map((link, index) => (
                    <div key={index} style={styles.proofInputWrapper}>
                        <input
                            type="text"
                            value={link}
                            onChange={(e) => handleProofLinkChange('github', index, e.target.value)}
                            placeholder="Enter proof URL"
                            style={styles.input}
                            disabled={!isEditing || hasPendingChanges}
                        />
                    </div>
                ))}
                {isEditing && !hasPendingChanges && (
                    <button type="button" onClick={() => addProofLink('github')} style={styles.addButton}>
                        + Add another proof link
                    </button>
                )}
            </div>

            
            <div style={styles.inputGroup}>
                <h3 style={styles.groupTitle}>Section 6: Internships</h3>
                <label style={styles.label}>
                    {inputCounter++}. IIT, NIT, SRM Internship Cycle:
                    <input type="number" name="internshipIITNITSRMPoints" value={formDataB.internshipIITNITSRMPoints} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                {/* Proof links for Academic Details */}
                <h4 style={styles.proofTitle}>Proof Links for IIT, NIT, SRM Internships:</h4>
                {proofLinksB.IITNIT.map((link, index) => (
                    <div key={index} style={styles.proofInputWrapper}>
                        <input
                            type="text"
                            value={link}
                            onChange={(e) => handleProofLinkChange('IITNIT', index, e.target.value)}
                            placeholder="Enter proof URL"
                            style={styles.input}
                            disabled={!isEditing || hasPendingChanges}
                        />
                    </div>
                ))}
                {isEditing && !hasPendingChanges && (
                    <button type="button" onClick={() => addProofLink('IITNIT')} style={styles.addButton}>
                        + Add another proof link
                    </button>
                )}
                <label style={styles.label}>
                    {inputCounter++}. Fortune 500 Companies:
                    <input type="number" name="internshipFortune500Points" value={formDataB.internshipFortune500Points} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                {/* Proof links for Academic Details */}
                <h4 style={styles.proofTitle}>Proof Links for Fortune 500 Companies:</h4>
                {proofLinksB.Fortune500.map((link, index) => (
                    <div key={index} style={styles.proofInputWrapper}>
                        <input
                            type="text"
                            value={link}
                            onChange={(e) => handleProofLinkChange('Fortune500', index, e.target.value)}
                            placeholder="Enter proof URL"
                            style={styles.input}
                            disabled={!isEditing || hasPendingChanges}
                        />
                    </div>
                ))}
                {isEditing && !hasPendingChanges && (
                    <button type="button" onClick={() => addProofLink('Fortune500')} style={styles.addButton}>
                        + Add another proof link
                    </button>
                )}
                <label style={styles.label}>
                    {inputCounter++}. Small Companies:
                    <input type="number" name="internshipSmallCompaniesPoints" value={formDataB.internshipSmallCompaniesPoints} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                {/* Proof links for Academic Details */}
                <h4 style={styles.proofTitle}>Proof Links for Small Companies:</h4>
                {proofLinksB.SmallComp.map((link, index) => (
                    <div key={index} style={styles.proofInputWrapper}>
                        <input
                            type="text"
                            value={link}
                            onChange={(e) => handleProofLinkChange('SmallComp', index, e.target.value)}
                            placeholder="Enter proof URL"
                            style={styles.input}
                            disabled={!isEditing || hasPendingChanges}
                        />
                    </div>
                ))}
                {isEditing && !hasPendingChanges && (
                    <button type="button" onClick={() => addProofLink('SmallComp')} style={styles.addButton}>
                        + Add another proof link
                    </button>
                )}
                <label style={styles.label}>
                    {inputCounter++}. Less than 3 Months:
                    <input type="number" name="internshipLessThan3MonthsPoints" value={formDataB.internshipLessThan3MonthsPoints} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                {/* Proof links for Academic Details */}
                <h4 style={styles.proofTitle}>Proof Links for Less Than 3 Months:</h4>
                {proofLinksB.Lessthan3.map((link, index) => (
                    <div key={index} style={styles.proofInputWrapper}>
                        <input
                            type="text"
                            value={link}
                            onChange={(e) => handleProofLinkChange('Lessthan3', index, e.target.value)}
                            placeholder="Enter proof URL"
                            style={styles.input}
                            disabled={!isEditing || hasPendingChanges}
                        />
                    </div>
                ))}
                {isEditing && !hasPendingChanges && (
                    <button type="button" onClick={() => addProofLink('Lessthan3')} style={styles.addButton}>
                        + Add another proof link
                    </button>
                )}
                <label style={styles.label}>
                    {inputCounter++}. Paid Intern:
                    <input type="number" name="internshipPaidPoints" value={formDataB.internshipPaidPoints} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                {/* Proof links for Academic Details */}
                <h4 style={styles.proofTitle}>Proof Links for Paid Internships:</h4>
                {proofLinksB.paidIntern.map((link, index) => (
                    <div key={index} style={styles.proofInputWrapper}>
                        <input
                            type="text"
                            value={link}
                            onChange={(e) => handleProofLinkChange('paidIntern', index, e.target.value)}
                            placeholder="Enter proof URL"
                            style={styles.input}
                            disabled={!isEditing || hasPendingChanges}
                        />
                    </div>
                ))}
                {isEditing && !hasPendingChanges && (
                    <button type="button" onClick={() => addProofLink('paidIntern')} style={styles.addButton}>
                        + Add another proof link
                    </button>
                )}
            {/* Proof links for Academic Details */}
                <h4 style={styles.proofTitle}>Proof Links for Github Profile:</h4>
                {proofLinksB.internships.map((link, index) => (
                    <div key={index} style={styles.proofInputWrapper}>
                        <input
                            type="text"
                            value={link}
                            onChange={(e) => handleProofLinkChange('internships', index, e.target.value)}
                            placeholder="Enter proof URL"
                            style={styles.input}
                            disabled={!isEditing || hasPendingChanges}
                        />
                    </div>
                ))}
                {isEditing && !hasPendingChanges && (
                    <button type="button" onClick={() => addProofLink('internships')} style={styles.addButton}>
                        + Add another proof link
                    </button>
                )}
            </div>

            <div style={styles.inputGroup}>
                <h3 style={styles.groupTitle}>Section 7: Skillset & Standard Certifications </h3>
                <label style={styles.label}>
                    {inputCounter++}. CISCO, CCNA, CCNP, MCNA, MCNP, Matlab, Redhat, IBM :
                    <input type="number" name="certificationCiscoPoints" value={formDataB.certificationCiscoPoints} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                {/* Proof links for Academic Details */}
                <h4 style={styles.proofTitle}>Proof Links for Cisco, Ccna etc:</h4>
                {proofLinksB.cisco.map((link, index) => (
                    <div key={index} style={styles.proofInputWrapper}>
                        <input
                            type="text"
                            value={link}
                            onChange={(e) => handleProofLinkChange('cisco', index, e.target.value)}
                            placeholder="Enter proof URL"
                            style={styles.input}
                            disabled={!isEditing || hasPendingChanges}
                        />
                    </div>
                ))}
                {isEditing && !hasPendingChanges && (
                    <button type="button" onClick={() => addProofLink('cisco')} style={styles.addButton}>
                        + Add another proof link
                    </button>
                )}
                <label style={styles.label}>
                    {inputCounter++}. NPTEL:
                    <input type="number" name="certificationNPTELPoints" value={formDataB.certificationNPTELPoints} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                {/* Proof links for Academic Details */}
                <h4 style={styles.proofTitle}>Proof Links for NPTEL:</h4>
                {proofLinksB.nptel.map((link, index) => (
                    <div key={index} style={styles.proofInputWrapper}>
                        <input
                            type="text"
                            value={link}
                            onChange={(e) => handleProofLinkChange('nptel', index, e.target.value)}
                            placeholder="Enter proof URL"
                            style={styles.input}
                            disabled={!isEditing || hasPendingChanges}
                        />
                    </div>
                ))}
                {isEditing && !hasPendingChanges && (
                    <button type="button" onClick={() => addProofLink('nptel')} style={styles.addButton}>
                        + Add another proof link
                    </button>
                )}
                <label style={styles.label}>
                    {inputCounter++}. Coursera:
                    <input type="number" name="certificationCourseraPoints" value={formDataB.certificationCourseraPoints} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                {/* Proof links for Academic Details */}
                <h4 style={styles.proofTitle}>Proof Links for Coursera:</h4>
                {proofLinksB.coursera.map((link, index) => (
                    <div key={index} style={styles.proofInputWrapper}>
                        <input
                            type="text"
                            value={link}
                            onChange={(e) => handleProofLinkChange('coursera', index, e.target.value)}
                            placeholder="Enter proof URL"
                            style={styles.input}
                            disabled={!isEditing || hasPendingChanges}
                        />
                    </div>
                ))}
                {isEditing && !hasPendingChanges && (
                    <button type="button" onClick={() => addProofLink('coursera')} style={styles.addButton}>
                        + Add another proof link
                    </button>
                )}
                <label style={styles.label}>
                    {inputCounter++}. Programming Cert:
                    <input type="number" name="certificationPgmmgCertPoints" value={formDataB.certificationPgmmgCertPoints} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                {/* Proof links for Academic Details */}
                <h4 style={styles.proofTitle}>Proof Links for Programming Certification:</h4>
                {proofLinksB.prgcert.map((link, index) => (
                    <div key={index} style={styles.proofInputWrapper}>
                        <input
                            type="text"
                            value={link}
                            onChange={(e) => handleProofLinkChange('prgcert', index, e.target.value)}
                            placeholder="Enter proof URL"
                            style={styles.input}
                            disabled={!isEditing || hasPendingChanges}
                        />
                    </div>
                ))}
                {isEditing && !hasPendingChanges && (
                    <button type="button" onClick={() => addProofLink('prgcert')} style={styles.addButton}>
                        + Add another proof link
                    </button>
                )}
                <label style={styles.label}>
                    {inputCounter++}. Udemy / Elab:
                    <input type="number" name="certificationUdemyElabPoints" value={formDataB.certificationUdemyElabPoints} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                {/* Proof links for Academic Details */}
                <h4 style={styles.proofTitle}>Proof Links for Udemy/ELAB:</h4>
                {proofLinksB.udemy.map((link, index) => (
                    <div key={index} style={styles.proofInputWrapper}>
                        <input
                            type="text"
                            value={link}
                            onChange={(e) => handleProofLinkChange('udemy', index, e.target.value)}
                            placeholder="Enter proof URL"
                            style={styles.input}
                            disabled={!isEditing || hasPendingChanges}
                        />
                    </div>
                ))}
                {isEditing && !hasPendingChanges && (
                    <button type="button" onClick={() => addProofLink('udemy')} style={styles.addButton}>
                        + Add another proof link
                    </button>
                )}
                
            </div>

            <div style={styles.inputGroup}>
                <h3 style={styles.groupTitle}>Section 8: Projects Done</h3>
                <label style={styles.label}>
                    {inputCounter++}. IIT, NIT, DRDO Projects:
                    <input type="number" name="projectsIITDRDOPoints" value={formDataB.projectsIITDRDOPoints} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                {/* Proof links for Academic Details */}
                <h4 style={styles.proofTitle}>Proof Links for IIT, NIT, DRDO:</h4>
                {proofLinksB.IITNITproj.map((link, index) => (
                    <div key={index} style={styles.proofInputWrapper}>
                        <input
                            type="text"
                            value={link}
                            onChange={(e) => handleProofLinkChange('IITNITproj', index, e.target.value)}
                            placeholder="Enter proof URL"
                            style={styles.input}
                            disabled={!isEditing || hasPendingChanges}
                        />
                    </div>
                ))}
                {isEditing && !hasPendingChanges && (
                    <button type="button" onClick={() => addProofLink('IITNITproj')} style={styles.addButton}>
                        + Add another proof link
                    </button>
                )}
                <label style={styles.label}>
                    {inputCounter++}. Govt Projects:
                    <input type="number" name="projectsGovtPoints" value={formDataB.projectsGovtPoints} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                {/* Proof links for Academic Details */}
                <h4 style={styles.proofTitle}>Proof Links for Government Projects:</h4>
                {proofLinksB.GovtProj.map((link, index) => (
                    <div key={index} style={styles.proofInputWrapper}>
                        <input
                            type="text"
                            value={link}
                            onChange={(e) => handleProofLinkChange('GovtProj', index, e.target.value)}
                            placeholder="Enter proof URL"
                            style={styles.input}
                            disabled={!isEditing || hasPendingChanges}
                        />
                    </div>
                ))}
                {isEditing && !hasPendingChanges && (
                    <button type="button" onClick={() => addProofLink('GovtProj')} style={styles.addButton}>
                        + Add another proof link
                    </button>
                )}
                <label style={styles.label}>
                    {inputCounter++}. Mobile & Web App Projects :
                    <input type="number" name="projectsMobileWebAppPoints" value={formDataB.projectsMobileWebAppPoints} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                {/* Proof links for Academic Details */}
                <h4 style={styles.proofTitle}>Proof Links for Mobile Apps:</h4>
                {proofLinksB.Mobileapp.map((link, index) => (
                    <div key={index} style={styles.proofInputWrapper}>
                        <input
                            type="text"
                            value={link}
                            onChange={(e) => handleProofLinkChange('Mobileapp', index, e.target.value)}
                            placeholder="Enter proof URL"
                            style={styles.input}
                            disabled={!isEditing || hasPendingChanges}
                        />
                    </div>
                ))}
                {isEditing && !hasPendingChanges && (
                    <button type="button" onClick={() => addProofLink('MobileApp')} style={styles.addButton}>
                        + Add another proof link
                    </button>
                )}
                <label style={styles.label}>
                    {inputCounter++}. Mini Project :
                    <input type="number" name="projectsMiniProjectPoints" value={formDataB.projectsMiniProjectPoints} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                {/* Proof links for Academic Details */}
                <h4 style={styles.proofTitle}>Proof Links for Mini Projects:</h4>
                {proofLinksB.MiniProj.map((link, index) => (
                    <div key={index} style={styles.proofInputWrapper}>
                        <input
                            type="text"
                            value={link}
                            onChange={(e) => handleProofLinkChange('MiniProj', index, e.target.value)}
                            placeholder="Enter proof URL"
                            style={styles.input}
                            disabled={!isEditing || hasPendingChanges}
                        />
                    </div>
                ))}
                {isEditing && !hasPendingChanges && (
                    <button type="button" onClick={() => addProofLink('MiniProj')} style={styles.addButton}>
                        + Add another proof link
                    </button>
                )}
                
            </div>

            <div style={styles.inputGroup}>
                <h3 style={styles.groupTitle}>Section 9: Full Stack Developer </h3>
                <label style={styles.label}>
                    {inputCounter++}. FSD Project :
                    <input type="number" name="fsdProjectPoints" value={formDataB.fsdProjectPoints} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                {/* Proof links for Academic Details */}
                <h4 style={styles.proofTitle}>Proof Links for Full Stack Development:</h4>
                {proofLinksB.fsd.map((link, index) => (
                    <div key={index} style={styles.proofInputWrapper}>
                        <input
                            type="text"
                            value={link}
                            onChange={(e) => handleProofLinkChange('fsd', index, e.target.value)}
                            placeholder="Enter proof URL"
                            style={styles.input}
                            disabled={!isEditing || hasPendingChanges}
                        />
                    </div>
                ))}
                {isEditing && !hasPendingChanges && (
                    <button type="button" onClick={() => addProofLink('fsd')} style={styles.addButton}>
                        + Add another proof link
                    </button>
                )}
            </div>

            <div style={styles.inputGroup}>
                <h3 style={styles.groupTitle}>Section 10: Coding Competition & Hackathons Won </h3>
                <label style={styles.label}>
                    {inputCounter++}. First Prize :
                    <input type="number" name="codingCompetitionFirstPoints" value={formDataB.codingCompetitionFirstPoints} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. Second Prize :
                    <input type="number" name="codingCompetitionSecondPoints" value={formDataB.codingCompetitionSecondPoints} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. Third Prize :
                    <input type="number" name="codingCompetitionThirdPoints" value={formDataB.codingCompetitionThirdPoints} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                <label style={styles.label}>
                    {inputCounter++}. Participated :
                    <input type="number" name="codingCompetitionParticipatedPoints" value={formDataB.codingCompetitionParticipatedPoints} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                {/* Proof links for Academic Details */}
                <h4 style={styles.proofTitle}>Proof Links for Hackathons:</h4>
                {proofLinksB.hackathons.map((link, index) => (
                    <div key={index} style={styles.proofInputWrapper}>
                        <input
                            type="text"
                            value={link}
                            onChange={(e) => handleProofLinkChange('hackathons', index, e.target.value)}
                            placeholder="Enter proof URL"
                            style={styles.input}
                            disabled={!isEditing || hasPendingChanges}
                        />
                    </div>
                ))}
                {isEditing && !hasPendingChanges && (
                    <button type="button" onClick={() => addProofLink('hackathons')} style={styles.addButton}>
                        + Add another proof link
                    </button>
                )}
            </div>

            <div style={styles.inputGroup}>
                <h3 style={styles.groupTitle}>Section 11: Inhouse Projects</h3>
                <label style={styles.label}>
                    {inputCounter++}. Inhouse Projects:
                    <input type="number" name="inhouseEachProjectPoints" value={formDataB.inhouseEachProjectPoints} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                    </label>
                    {/* Proof links for Academic Details */}
                <h4 style={styles.proofTitle}>Proof Links for Inhouse Projects:</h4>
                {proofLinksB.inhouse.map((link, index) => (
                    <div key={index} style={styles.proofInputWrapper}>
                        <input
                            type="text"
                            value={link}
                            onChange={(e) => handleProofLinkChange('inhouse', index, e.target.value)}
                            placeholder="Enter proof URL"
                            style={styles.input}
                            disabled={!isEditing || hasPendingChanges}
                        />
                    </div>
                ))}
                {isEditing && !hasPendingChanges && (
                    <button type="button" onClick={() => addProofLink('inhouse')} style={styles.addButton}>
                        + Add another proof link
                    </button>
                )}
            </div>

            <div style={styles.inputGroup}>
                <h3 style={styles.groupTitle}>Section 12: Membership of Professional Bodies </h3>
                <label style={styles.label}>
                    {inputCounter++}. Professional Bodies Membership:
                    <input type="number" name="professionalBodiesMembershipPoints" value={formDataB.professionalBodiesMembershipPoints} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
                {/* Proof links for Academic Details */}
                <h4 style={styles.proofTitle}>Proof Links for Membership:</h4>
                {proofLinksB.membership.map((link, index) => (
                    <div key={index} style={styles.proofInputWrapper}>
                        <input
                            type="text"
                            value={link}
                            onChange={(e) => handleProofLinkChange('membership', index, e.target.value)}
                            placeholder="Enter proof URL"
                            style={styles.input}
                            disabled={!isEditing || hasPendingChanges}
                        />
                    </div>
                ))}
                {isEditing && !hasPendingChanges && (
                    <button type="button" onClick={() => addProofLink('membership')} style={styles.addButton}>
                        + Add another proof link
                    </button>
                )}
                
            </div>

            <div style={styles.inputGroup}>
                <h3 style={styles.groupTitle}>Section 13: Assessment Marks (SHL / NCET)</h3>
                
                <ul style={styles.pointScaleList}>
                    <li>90 to 100 Marks – 10 </li>
                    <li>80 to 89 Marks – 09 </li>
                    <li>70 to 79 Marks – 08 </li>
                    <li>65 to 69 Marks – 07 </li>
                    <li>60 to 64 Marks – 06 </li>
                    <li>55 to 59 Marks – 05 </li>
                    <li>50 to 54 Marks – 04 </li>
                    <li>40 to 49 Marks – 03 </li>
                    <li>30 to 39 Marks – 02 </li>
                    <li>25 to 29 Marks - 01 </li>
                    <li>Less than 25 Marks - 0 </li>
                </ul>
                <label style={styles.label}>
                    {inputCounter++}. Your Assessment Marks:
                    <input type="number" name="assessmentMarksPoints" value={formDataB.assessmentMarksPoints} onChange={handleInputChange} style={styles.input} disabled={!isEditing || hasPendingChanges} />
                </label>
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
    buttonContainer: {
        display: 'flex',
        justifyContent: 'center',
        gap: '15px', // Space between buttons
        marginTop: '20px',
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
    proofTitle: {
        marginTop: '20px',
        color: '#4a5568',
        fontSize: '1.1em',
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
    proofInputWrapper: {
        marginBottom: '10px',
    },
    addButton: {
        marginTop: '10px',
        padding: '8px 15px',
        fontSize: '1em',
        borderRadius: '5px',
        border: '1px solid #3b82f6',
        backgroundColor: '#f0f8ff',
        color: '#3b82f6',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
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