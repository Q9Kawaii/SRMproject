"use client";

import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, doc, setDoc, getDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';

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
        dreamCompanyPlacement: '', file10th12thMarksheetUrl: '',
    });

    // Initialize proof links with default structure
    const defaultProofLinks = {
        personalAndContact: [''],
        academicDetails: [''],
        collegeAcademics: [''],
        technicalSkills: [''],
        internships: [''],
        codingAndHackathons: [''],
        achievements: [''],
        twelfth: [''],
        tenth: [''],
        courses: [''],
        appdev: [''],
        fullstack: [''],
        codecomp: [''],
        hackathon: [''],
        inhouse: [''],
        member: [''],
        careerAndPlacement: [''],
    };

    const [proofLinks, setProofLinks] = useState(defaultProofLinks);

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
                        
                        // Load existing proof links if they exist, otherwise use defaults
                        if (data.proofLinks) {
                            // Merge with defaults to ensure all sections exist
                            const mergedProofLinks = { ...defaultProofLinks, ...data.proofLinks };
                            setProofLinks(mergedProofLinks);
                        }
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

    // Handlers for proof links
    const handleProofLinkChange = (section, index, value) => {
        setProofLinks(prevLinks => {
            const newLinks = [...prevLinks[section]];
            newLinks[index] = value;
            return { ...prevLinks, [section]: newLinks };
        });
    };

    const addProofLink = (section) => {
        setProofLinks(prevLinks => ({
            ...prevLinks,
            [section]: [...prevLinks[section], '']
        }));
    };

    const removeProofLink = (section, index) => {
        setProofLinks(prevLinks => {
            const newLinks = prevLinks[section].filter((_, i) => i !== index);
            // Ensure at least one empty field remains
            if (newLinks.length === 0) {
                newLinks.push('');
            }
            return { ...prevLinks, [section]: newLinks };
        });
    };

    const handleEdit = (e) => {
        e.preventDefault();
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setFormDataA(initialFormData);
        // Reset proof links to initial state
        setProofLinks(initialFormData.proofLinks || defaultProofLinks);
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
        
        // Clean proof links by removing empty strings
        const cleanedProofLinks = {};
        for (const [section, links] of Object.entries(proofLinks)) {
            cleanedProofLinks[section] = links.filter(link => link.trim() !== '');
        }
        
        // Combine formDataA and cleaned proofLinks for comparison
        const currentData = { ...formDataA, proofLinks: cleanedProofLinks };
        const initialCombinedData = { ...initialFormData, proofLinks: initialFormData.proofLinks || {} };

        for (const key in currentData) {
            // Special handling for proofLinks, which is an object
            if (key === 'proofLinks') {
                if (JSON.stringify(currentData.proofLinks) !== JSON.stringify(initialCombinedData.proofLinks)) {
                    updates.proofLinks = currentData.proofLinks;
                    original.proofLinks = initialCombinedData.proofLinks;
                    hasChanges = true;
                }
            } else if (key !== 'timestamp' && currentData[key] !== initialCombinedData[key]) {
                updates[key] = currentData[key];
                original[key] = initialCombinedData[key] || ''; 
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

    // Helper function to render proof links section
    const renderProofLinksSection = (sectionKey, title) => {
        const hasValidLinks = proofLinks[sectionKey].some(link => link.trim() !== '');
        
        return (
            <div style={styles.proofSection}>
                <h4 style={styles.proofTitle}>{title}:</h4>
                {isEditing && !hasPendingChanges ? (
                    // Show input fields when editing
                    <div style={styles.proofEditContainer}>
                        {proofLinks[sectionKey].map((link, index) => (
                            <div key={index} style={styles.proofInputWrapper}>
                                <div style={styles.proofInputContainer}>
                                    <input
                                        type="text"
                                        value={link}
                                        onChange={(e) => handleProofLinkChange(sectionKey, index, e.target.value)}
                                        placeholder="Enter proof URL"
                                        style={styles.proofInput}
                                    />
                                    {proofLinks[sectionKey].length > 1 && (
                                        <button 
                                            type="button" 
                                            onClick={() => removeProofLink(sectionKey, index)}
                                            style={styles.removeButton}
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={() => addProofLink(sectionKey)} style={styles.addButton}>
                            <span style={styles.addIcon}>+</span> Add proof link
                        </button>
                    </div>
                ) : (
                    // Show clickable links or "No links added" when not editing
                    <div style={styles.proofViewContainer}>
                        {hasValidLinks ? (
                            proofLinks[sectionKey]
                                .filter(link => link.trim() !== '')
                                .map((link, index) => (
                                    <div key={index} style={styles.linkWrapper}>
                                        <a
                                            href={link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={styles.linkDisplay}
                                        >
                                            🔗 {link}
                                        </a>
                                    </div>
                                ))
                        ) : (
                            <div style={styles.noLinksMessage}>
                                📝 No proof links added yet. Click Edit Data to add links.
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    let inputCounter = 1;

    return (
        <div style={styles.container}>
            <form onSubmit={handleSubmitA} style={styles.form}>
                <div style={styles.header}>
                    <h2 style={styles.subHeading}>📋 Format A Details</h2>
                    <div style={styles.headerUnderline}></div>
                </div>

                <div style={styles.buttonContainer}>
                    {isEditing && !hasPendingChanges ? (
                        <>
                            <button type="submit" disabled={loading} style={styles.submitButton}>
                                {loading ? (
                                    <>
                                        <span style={styles.spinner}></span>
                                        Submitting for Approval...
                                    </>
                                ) : (
                                    <>
                                        <span style={styles.buttonIcon}>✓</span>
                                        Submit Changes for Approval
                                    </>
                                )}
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
                            <span style={styles.buttonIcon}>
                                {hasPendingChanges ? '⏳' : '✏️'}
                            </span>
                            {hasPendingChanges ? 'Changes Pending Approval' : 'Edit Data'}
                        </button>
                    )}
                </div>

                {hasPendingChanges && (
                    <div style={styles.pendingMessage}>
                        <div style={styles.pendingIcon}>⏳</div>
                        <div>
                            <h4 style={styles.pendingTitle}>Changes Pending Approval</h4>
                            <p style={styles.pendingText}>Your changes are currently pending teacher approval. You cannot make further edits until approved or declined.</p>
                        </div>
                    </div>
                )}

                <div style={styles.inputGroup}>
                    <h3 style={styles.groupTitle}>
                        <span style={styles.groupIcon}>👤</span>
                        Personal & Contact Information
                    </h3>
                    <div style={styles.fieldsContainer}>
                        <label style={styles.label}>
                            <span style={styles.labelNumber}>{inputCounter++}.</span>
                            <span style={styles.labelText}>Registration Number</span>
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
                            <span style={styles.labelNumber}>{inputCounter++}.</span>
                            <span style={styles.labelText}>Full Name (AS PER IN ATTENDANCE)</span>
                            <input 
                                type="text" 
                                name="fullName" 
                                value={formDataA.fullName} 
                                onChange={handleInputChange} 
                                required 
                                style={styles.input} 
                                disabled={!isEditing || hasPendingChanges} 
                            />
                        </label>
                        <div style={styles.row}>
                            <label style={styles.labelHalf}>
                                <span style={styles.labelNumber}>{inputCounter++}.</span>
                                <span style={styles.labelText}>Gender</span>
                                <input 
                                    type="text" 
                                    name="gender" 
                                    value={formDataA.gender} 
                                    onChange={handleInputChange} 
                                    required 
                                    style={styles.input} 
                                    placeholder="e.g., Male, Female, Other" 
                                    disabled={!isEditing || hasPendingChanges} 
                                />
                            </label>
                            <label style={styles.labelHalf}>
                                <span style={styles.labelNumber}>{inputCounter++}.</span>
                                <span style={styles.labelText}>NRI Student</span>
                                <input 
                                    type="text" 
                                    name="nriStudent" 
                                    value={formDataA.nriStudent} 
                                    onChange={handleInputChange} 
                                    required 
                                    style={styles.input} 
                                    placeholder="Yes or No" 
                                    disabled={!isEditing || hasPendingChanges} 
                                />
                            </label>
                        </div>
                        <label style={styles.label}>
                            <span style={styles.labelNumber}>{inputCounter++}.</span>
                            <span style={styles.labelText}>Date of Birth (DD.MM.YYYY)</span>
                            <input 
                                type="text" 
                                name="dateOfBirth" 
                                value={formDataA.dateOfBirth} 
                                onChange={handleInputChange} 
                                required 
                                style={styles.input} 
                                placeholder="YYYY-MM-DD" 
                                disabled={!isEditing || hasPendingChanges} 
                            />
                        </label>
                        <div style={styles.row}>
                            <label style={styles.labelHalf}>
                                <span style={styles.labelNumber}>{inputCounter++}.</span>
                                <span style={styles.labelText}>Department</span>
                                <input 
                                    type="text" 
                                    name="department" 
                                    value={formDataA.department} 
                                    onChange={handleInputChange} 
                                    required 
                                    style={styles.input} 
                                    disabled={!isEditing || hasPendingChanges} 
                                />
                            </label>
                            <label style={styles.labelHalf}>
                                <span style={styles.labelNumber}>{inputCounter++}.</span>
                                <span style={styles.labelText}>Specialization</span>
                                <input 
                                    type="text" 
                                    name="specialization" 
                                    value={formDataA.specialization} 
                                    onChange={handleInputChange} 
                                    required 
                                    style={styles.input} 
                                    disabled={!isEditing || hasPendingChanges} 
                                />
                            </label>
                        </div>
                        <label style={styles.label}>
                            <span style={styles.labelNumber}>{inputCounter++}.</span>
                            <span style={styles.labelText}>Section</span>
                            <input 
                                type="text" 
                                name="section" 
                                value={formDataA.section} 
                                onChange={handleInputChange} 
                                required 
                                style={styles.input} 
                                disabled={!isEditing || hasPendingChanges} 
                            />
                        </label>
                        <div style={styles.row}>
                            <label style={styles.labelHalf}>
                                <span style={styles.labelNumber}>{inputCounter++}.</span>
                                <span style={styles.labelText}>SRMIST Mail ID</span>
                                <input 
                                    type="text" 
                                    name="srmistMailId" 
                                    value={formDataA.srmistMailId} 
                                    onChange={handleInputChange} 
                                    required 
                                    style={styles.input} 
                                    disabled={!isEditing || hasPendingChanges} 
                                />
                            </label>
                            <label style={styles.labelHalf}>
                                <span style={styles.labelNumber}>{inputCounter++}.</span>
                                <span style={styles.labelText}>Personal Mail ID</span>
                                <input 
                                    type="text" 
                                    name="personalMailId" 
                                    value={formDataA.personalMailId} 
                                    onChange={handleInputChange} 
                                    style={styles.input} 
                                    disabled={!isEditing || hasPendingChanges} 
                                />
                            </label>
                        </div>
                        <div style={styles.row}>
                            <label style={styles.labelHalf}>
                                <span style={styles.labelNumber}>{inputCounter++}.</span>
                                <span style={styles.labelText}>Mobile Number (Contact + WhatsApp)</span>
                                <input 
                                    type="text" 
                                    name="mobileNumber" 
                                    value={formDataA.mobileNumber} 
                                    onChange={handleInputChange} 
                                    required 
                                    style={styles.input} 
                                    disabled={!isEditing || hasPendingChanges} 
                                />
                            </label>
                            <label style={styles.labelHalf}>
                                <span style={styles.labelNumber}>{inputCounter++}.</span>
                                <span style={styles.labelText}>Alternate Number</span>
                                <input 
                                    type="text" 
                                    name="alternateNumber" 
                                    value={formDataA.alternateNumber} 
                                    onChange={handleInputChange} 
                                    style={styles.input} 
                                    disabled={!isEditing || hasPendingChanges} 
                                />
                            </label>
                        </div>
                        <div style={styles.row}>
                            <label style={styles.labelHalf}>
                                <span style={styles.labelNumber}>{inputCounter++}.</span>
                                <span style={styles.labelText}>Father Mobile</span>
                                <input 
                                    type="text" 
                                    name="fatherMobile" 
                                    value={formDataA.fatherMobile} 
                                    onChange={handleInputChange} 
                                    style={styles.input} 
                                    disabled={!isEditing || hasPendingChanges} 
                                />
                            </label>
                            <label style={styles.labelHalf}>
                                <span style={styles.labelNumber}>{inputCounter++}.</span>
                                <span style={styles.labelText}>Father Email ID</span>
                                <input 
                                    type="text" 
                                    name="fatherEmailId" 
                                    value={formDataA.fatherEmailId} 
                                    onChange={handleInputChange} 
                                    style={styles.input} 
                                    disabled={!isEditing || hasPendingChanges} 
                                />
                            </label>
                        </div>
                        <div style={styles.row}>
                            <label style={styles.labelHalf}>
                                <span style={styles.labelNumber}>{inputCounter++}.</span>
                                <span style={styles.labelText}>Mother Mobile</span>
                                <input 
                                    type="text" 
                                    name="motherMobile" 
                                    value={formDataA.motherMobile} 
                                    onChange={handleInputChange} 
                                    style={styles.input} 
                                    disabled={!isEditing || hasPendingChanges} 
                                />
                            </label>
                            <label style={styles.labelHalf}>
                                <span style={styles.labelNumber}>{inputCounter++}.</span>
                                <span style={styles.labelText}>Mother Email ID</span>
                                <input 
                                    type="text" 
                                    name="motherEmailId" 
                                    value={formDataA.motherEmailId} 
                                    onChange={handleInputChange} 
                                    style={styles.input} 
                                    disabled={!isEditing || hasPendingChanges} 
                                />
                            </label>
                        </div>
                        <div style={styles.row}>
                            <label style={styles.labelHalf}>
                                <span style={styles.labelNumber}>{inputCounter++}.</span>
                                <span style={styles.labelText}>Guardian Contact Number</span>
                                <input 
                                    type="text" 
                                    name="guardianContact" 
                                    value={formDataA.guardianContact} 
                                    onChange={handleInputChange} 
                                    style={styles.input} 
                                    disabled={!isEditing || hasPendingChanges} 
                                />
                            </label>
                            <label style={styles.labelHalf}>
                                <span style={styles.labelNumber}>{inputCounter++}.</span>
                                <span style={styles.labelText}>Name of Faculty Adviser</span>
                                <input 
                                    type="text" 
                                    name="facultyAdvisorName" 
                                    value={formDataA.facultyAdvisorName} 
                                    onChange={handleInputChange} 
                                    style={styles.input} 
                                    disabled={!isEditing || hasPendingChanges} 
                                />
                            </label>
                        </div>
                        <label style={styles.label}>
                            <span style={styles.labelNumber}>{inputCounter++}.</span>
                            <span style={styles.labelText}>Languages Known</span>
                            <input 
                                type="text" 
                                name="languagesKnown" 
                                value={formDataA.languagesKnown} 
                                onChange={handleInputChange} 
                                placeholder="e.g., English, Hindi, Tamil" 
                                style={styles.input} 
                                disabled={!isEditing || hasPendingChanges} 
                            />
                        </label>
                    </div>
                    {renderProofLinksSection('personalAndContact', 'Proof Links for Personal & Contact')}
                </div>
                
                <div style={styles.inputGroup}>
                    <h3 style={styles.groupTitle}>
                        <span style={styles.groupIcon}>🎓</span>
                        Academic Details
                    </h3>
                    <div style={styles.fieldsContainer}>
                        <div style={styles.row}>
                            <label style={styles.labelThird}>
                                <span style={styles.labelNumber}>{inputCounter++}.</span>
                                <span style={styles.labelText}>10th Percentage</span>
                                <input 
                                    type="text" 
                                    name="tenthPercentage" 
                                    value={formDataA.tenthPercentage} 
                                    onChange={handleInputChange} 
                                    style={styles.input} 
                                    disabled={!isEditing || hasPendingChanges} 
                                />
                            </label>
                            <label style={styles.labelThird}>
                                <span style={styles.labelNumber}>{inputCounter++}.</span>
                                <span style={styles.labelText}>10th Medium of Instruction</span>
                                <input 
                                    type="text" 
                                    name="tenthMediumOfInstruction" 
                                    value={formDataA.tenthMediumOfInstruction} 
                                    onChange={handleInputChange} 
                                    style={styles.input} 
                                    disabled={!isEditing || hasPendingChanges} 
                                />
                            </label>
                            <label style={styles.labelThird}>
                                <span style={styles.labelNumber}>{inputCounter++}.</span>
                                <span style={styles.labelText}>10th Board of Studies</span>
                                <input 
                                    type="text" 
                                    name="tenthBoardOfStudies" 
                                    value={formDataA.tenthBoardOfStudies} 
                                    onChange={handleInputChange} 
                                    style={styles.input} 
                                    disabled={!isEditing || hasPendingChanges} 
                                />
                            </label>
                        </div>
                        {renderProofLinksSection('tenth', 'Proof Links for 10th Percentage')}

                        <div style={styles.row}>
                            <label style={styles.labelHalf}>
                                <span style={styles.labelNumber}>{inputCounter++}.</span>
                                <span style={styles.labelText}>Studied Diploma</span>
                                <input 
                                    type="text" 
                                    name="studiedDiploma" 
                                    value={formDataA.studiedDiploma} 
                                    onChange={handleInputChange} 
                                    style={styles.input} 
                                    placeholder="Yes or No" 
                                    disabled={!isEditing || hasPendingChanges} 
                                />
                            </label>
                            <label style={styles.labelHalf}>
                                <span style={styles.labelNumber}>{inputCounter++}.</span>
                                <span style={styles.labelText}>12th / Diploma Percentage</span>
                                <input 
                                    type="text" 
                                    name="twelfthPercentage" 
                                    value={formDataA.twelfthPercentage} 
                                    onChange={handleInputChange} 
                                    style={styles.input} 
                                    disabled={!isEditing || hasPendingChanges} 
                                />
                            </label>
                        </div>
                        {renderProofLinksSection('twelfth', 'Proof Links for 12th/Diploma')}

                        <div style={styles.row}>
                            <label style={styles.labelHalf}>
                                <span style={styles.labelNumber}>{inputCounter++}.</span>
                                <span style={styles.labelText}>12th Medium of Instruction</span>
                                <input 
                                    type="text" 
                                    name="twelfthMediumOfInstruction" 
                                    value={formDataA.twelfthMediumOfInstruction} 
                                    onChange={handleInputChange} 
                                    style={styles.input} 
                                    disabled={!isEditing || hasPendingChanges} 
                                />
                            </label>
                            <label style={styles.labelHalf}>
                                <span style={styles.labelNumber}>{inputCounter++}.</span>
                                <span style={styles.labelText}>12th Board of Studies</span>
                                <input 
                                    type="text" 
                                    name="twelfthBoardOfStudies" 
                                    value={formDataA.twelfthBoardOfStudies} 
                                    onChange={handleInputChange} 
                                    style={styles.input} 
                                    disabled={!isEditing || hasPendingChanges} 
                                />
                            </label>
                        </div>
                        <label style={styles.label}>
                            <span style={styles.labelNumber}>{inputCounter++}.</span>
                            <span style={styles.labelText}>Scanned PDF copy of 10th and 12th Marksheet URL (Both in one single Document)</span>
                            <input 
                                type="text" 
                                name="file10th12thMarksheetUrl" 
                                value={formDataA.file10th12thMarksheetUrl} 
                                onChange={handleInputChange} 
                                placeholder="Enter URL to document" 
                                style={styles.input} 
                                disabled={!isEditing || hasPendingChanges} 
                            />
                        </label>
                    </div>
                    {renderProofLinksSection('academicDetails', 'Proof Links for Academic Details')}
                </div>

                <div style={styles.inputGroup}>
                    <h3 style={styles.groupTitle}>
                        <span style={styles.groupIcon}>🏫</span>
                        College Academics
                    </h3>
                    <div style={styles.fieldsContainer}>
                        <div style={styles.row}>
                            <label style={styles.labelThird}>
                                <span style={styles.labelNumber}>{inputCounter++}.</span>
                                <span style={styles.labelText}>CGPA (Upto 6th Semester)</span>
                                <input 
                                    type="text" 
                                    name="cgpaUptoSixthSem" 
                                    value={formDataA.cgpaUptoSixthSem} 
                                    onChange={handleInputChange} 
                                    style={styles.input} 
                                    disabled={!isEditing || hasPendingChanges} 
                                />
                            </label>
                            <label style={styles.labelThird}>
                                <span style={styles.labelNumber}>{inputCounter++}.</span>
                                <span style={styles.labelText}>No of Standing Arrears</span>
                                <input 
                                    type="text" 
                                    name="numberOfStanding" 
                                    value={formDataA.numberOfStanding} 
                                    onChange={handleInputChange} 
                                    style={styles.input} 
                                    disabled={!isEditing || hasPendingChanges} 
                                />
                            </label>
                            <label style={styles.labelThird}>
                                <span style={styles.labelNumber}>{inputCounter++}.</span>
                                <span style={styles.labelText}>History of Arrears (Backlogs)</span>
                                <input 
                                    type="text" 
                                    name="historyOfArrears" 
                                    value={formDataA.historyOfArrears} 
                                    onChange={handleInputChange} 
                                    style={styles.input} 
                                    disabled={!isEditing || hasPendingChanges} 
                                />
                            </label>
                        </div>
                    </div>
                    {renderProofLinksSection('collegeAcademics', 'Proof Links for College Academics')}
                </div>

                <div style={styles.inputGroup}>
                    <h3 style={styles.groupTitle}>
                        <span style={styles.groupIcon}>💻</span>
                        Technical Skills
                    </h3>
                    <div style={styles.fieldsContainer}>
                        <label style={styles.label}>
                            <span style={styles.labelNumber}>{inputCounter++}.</span>
                            <span style={styles.labelText}>Github Profile Link</span>
                            <input 
                                type="text" 
                                name="githubProfileLink" 
                                value={formDataA.githubProfileLink} 
                                onChange={handleInputChange} 
                                placeholder="https://github.com/yourprofile" 
                                style={styles.input} 
                                disabled={!isEditing || hasPendingChanges} 
                            />
                        </label>
                        <label style={styles.label}>
                            <span style={styles.labelNumber}>{inputCounter++}.</span>
                            <span style={styles.labelText}>Coding Practice Platform (Give in Order)</span>
                            <input 
                                type="text" 
                                name="codingPractice" 
                                value={formDataA.codingPractice} 
                                onChange={handleInputChange} 
                                style={styles.input} 
                                disabled={!isEditing || hasPendingChanges} 
                            />
                        </label>
                        <label style={styles.label}>
                            <span style={styles.labelNumber}>{inputCounter++}.</span>
                            <span style={styles.labelText}>Programming Skillset</span>
                            <input 
                                type="text" 
                                name="programmingSkillset" 
                                value={formDataA.programmingSkillset} 
                                onChange={handleInputChange} 
                                style={styles.input} 
                                disabled={!isEditing || hasPendingChanges} 
                            />
                        </label>
                    </div>
                    {renderProofLinksSection('technicalSkills', 'Proof Links for Technical Skills')}
                </div>

                <div style={styles.inputGroup}>
                    <h3 style={styles.groupTitle}>
                        <span style={styles.groupIcon}>🏆</span>
                        Certifications
                    </h3>
                    <div style={styles.fieldsContainer}>
                        <label style={styles.label}>
                            <span style={styles.labelNumber}>{inputCounter++}.</span>
                            <span style={styles.labelText}>Standard Certification Courses Completed (Proof is Mandatory. Will be collected by FA)</span>
                            <input 
                                type="text" 
                                name="standardCertificationCourses" 
                                value={formDataA.standardCertificationCourses} 
                                onChange={handleInputChange} 
                                style={styles.input} 
                                disabled={!isEditing || hasPendingChanges} 
                            />
                        </label>
                    </div>
                    {renderProofLinksSection('courses', 'Proof Links for Certifications')}
                </div>

                <div style={styles.inputGroup}>
                    <h3 style={styles.groupTitle}>
                        <span style={styles.groupIcon}>📱</span>
                        App Development
                    </h3>
                    <div style={styles.fieldsContainer}>
                        <label style={styles.label}>
                            <span style={styles.labelNumber}>{inputCounter++}.</span>
                            <span style={styles.labelText}>Application Development Experience (Projects Done)</span>
                            <input 
                                type="text" 
                                name="applicationDevelopmentExperience" 
                                value={formDataA.applicationDevelopmentExperience} 
                                onChange={handleInputChange} 
                                style={styles.input} 
                                disabled={!isEditing || hasPendingChanges} 
                            />
                        </label>
                        <label style={styles.label}>
                            <span style={styles.labelNumber}>{inputCounter++}.</span>
                            <span style={styles.labelText}>List Currently Available Application Name (Specify with month and year)</span>
                            <input 
                                type="text" 
                                name="currentApplicationName" 
                                value={formDataA.currentApplicationName} 
                                onChange={handleInputChange} 
                                style={styles.input} 
                                disabled={!isEditing || hasPendingChanges} 
                            />
                        </label>
                    </div>
                    {renderProofLinksSection('appdev', 'Proof Links for App Development')}
                </div>

                <div style={styles.inputGroup}>
                    <h3 style={styles.groupTitle}>
                        <span style={styles.groupIcon}>🌐</span>
                        Full Stack Development
                    </h3>
                    <div style={styles.fieldsContainer}>
                        <label style={styles.label}>
                            <span style={styles.labelNumber}>{inputCounter++}.</span>
                            <span style={styles.labelText}>FSD Experience (Full Stack Developer)</span>
                            <input 
                                type="text" 
                                name="fsdExperience" 
                                value={formDataA.fsdExperience} 
                                onChange={handleInputChange} 
                                style={styles.input} 
                                disabled={!isEditing || hasPendingChanges} 
                            />
                        </label>
                        <label style={styles.label}>
                            <span style={styles.labelNumber}>{inputCounter++}.</span>
                            <span style={styles.labelText}>List Currently available FSD Name (Specify with month and year)</span>
                            <input 
                                type="text" 
                                name="currentFsdName" 
                                value={formDataA.currentFsdName} 
                                onChange={handleInputChange} 
                                style={styles.input} 
                                disabled={!isEditing || hasPendingChanges} 
                            />
                        </label>
                    </div>
                    {renderProofLinksSection('fullstack', 'Proof Links for Full Stack Development')}
                </div>

                <div style={styles.inputGroup}>
                    <h3 style={styles.groupTitle}>
                        <span style={styles.groupIcon}>💼</span>
                        Internships
                    </h3>
                    <div style={styles.fieldsContainer}>
                        <label style={styles.label}>
                            <span style={styles.labelNumber}>{inputCounter++}.</span>
                            <span style={styles.labelText}>Internship Experience</span>
                            <input 
                                type="text" 
                                name="internshipExperience" 
                                value={formDataA.internshipExperience} 
                                onChange={handleInputChange} 
                                style={styles.input} 
                                disabled={!isEditing || hasPendingChanges} 
                            />
                        </label>
                        <label style={styles.label}>
                            <span style={styles.labelNumber}>{inputCounter++}.</span>
                            <span style={styles.labelText}>Internship Experience in Months (FA will collect the Proof)</span>
                            <input 
                                type="text" 
                                name="internshipExperienceMonths" 
                                value={formDataA.internshipExperienceMonths} 
                                onChange={handleInputChange} 
                                style={styles.input} 
                                disabled={!isEditing || hasPendingChanges} 
                            />
                        </label>
                        <label style={styles.label}>
                            <span style={styles.labelNumber}>{inputCounter++}.</span>
                            <span style={styles.labelText}>No of Industrial Training Completed, List out Company name, Location, Year and Month (From first Year Till Date)</span>
                            <input 
                                type="text" 
                                name="industrialTrainingCompleted" 
                                value={formDataA.industrialTrainingCompleted} 
                                onChange={handleInputChange} 
                                style={styles.input} 
                                disabled={!isEditing || hasPendingChanges} 
                            />
                        </label>
                    </div>
                    {renderProofLinksSection('internships', 'Proof Links for Internships')}
                </div>
                
                <div style={styles.inputGroup}>
                    <h3 style={styles.groupTitle}>
                        <span style={styles.groupIcon}>🏅</span>
                        Coding Competitions and Hackathons
                    </h3>
                    <div style={styles.fieldsContainer}>
                        <label style={styles.label}>
                            <span style={styles.labelNumber}>{inputCounter++}.</span>
                            <span style={styles.labelText}>Coding Competition (Won/ Top 3 Team)</span>
                            <input 
                                type="text" 
                                name="codingCompetition" 
                                value={formDataA.codingCompetition} 
                                onChange={handleInputChange} 
                                placeholder="e.g., Won Xyz Competition" 
                                style={styles.input} 
                                disabled={!isEditing || hasPendingChanges} 
                            />
                        </label>
                        <label style={styles.label}>
                            <span style={styles.labelNumber}>{inputCounter++}.</span>
                            <span style={styles.labelText}>HACKATHONS (Won/ Top 3 Team)</span>
                            <input 
                                type="text" 
                                name="hackathons" 
                                value={formDataA.hackathons} 
                                onChange={handleInputChange} 
                                placeholder="e.g., Top 3 in Abc Hackathon" 
                                style={styles.input} 
                                disabled={!isEditing || hasPendingChanges} 
                            />
                        </label>
                        <label style={styles.label}>
                            <span style={styles.labelNumber}>{inputCounter++}.</span>
                            <span style={styles.labelText}>NAME OF THE HACKATHONS (WON/ PARTICIPATED WITH MONTH AND YEAR)</span>
                            <input 
                                type="text" 
                                name="nameOfHackathons" 
                                value={formDataA.nameOfHackathons} 
                                onChange={handleInputChange} 
                                style={styles.input} 
                                disabled={!isEditing || hasPendingChanges} 
                            />
                        </label>
                        <label style={styles.label}>
                            <span style={styles.labelNumber}>{inputCounter++}.</span>
                            <span style={styles.labelText}>If Participated in any other coding Event, WON Prize/ Award specify with year and month (If not Participated Enter NA)</span>
                            <input 
                                type="text" 
                                name="otherCodingEventAwards" 
                                value={formDataA.otherCodingEventAwards} 
                                onChange={handleInputChange} 
                                style={styles.input} 
                                disabled={!isEditing || hasPendingChanges} 
                            />
                        </label>
                    </div>
                    {renderProofLinksSection('codingAndHackathons', 'Proof Links for Coding Competitions & Hackathons')}
                </div>
                
                <div style={styles.inputGroup}>
                    <h3 style={styles.groupTitle}>
                        <span style={styles.groupIcon}>🔬</span>
                        Inhouse Projects
                    </h3>
                    <div style={styles.fieldsContainer}>
                        <label style={styles.label}>
                            <span style={styles.labelNumber}>{inputCounter++}.</span>
                            <span style={styles.labelText}>Inhouse Projects (Under any Professor of SRM / Foreign Professor / Reputed Institutions)</span>
                            <input 
                                type="text" 
                                name="inhouseProjects" 
                                value={formDataA.inhouseProjects} 
                                onChange={handleInputChange} 
                                style={styles.input} 
                                disabled={!isEditing || hasPendingChanges} 
                            />
                        </label>
                    </div>
                    {renderProofLinksSection('inhouse', 'Proof Links for Inhouse Projects')}
                </div>

                <div style={styles.inputGroup}>
                    <h3 style={styles.groupTitle}>
                        <span style={styles.groupIcon}>🌟</span>
                        Achievements
                    </h3>
                    <div style={styles.fieldsContainer}>
                        <label style={styles.label}>
                            <span style={styles.labelNumber}>{inputCounter++}.</span>
                            <span style={styles.labelText}>ACHIEVEMENTS (LAST 3 YEARS, SPECIFY WITH MONTH AND YEAR)</span>
                            <input 
                                type="text" 
                                name="achievements" 
                                value={formDataA.achievements} 
                                onChange={handleInputChange} 
                                style={styles.input} 
                                disabled={!isEditing || hasPendingChanges} 
                            />
                        </label>
                    </div>
                    {renderProofLinksSection('achievements', 'Proof Links for Achievements')}
                </div>

                <div style={styles.inputGroup}>
                    <h3 style={styles.groupTitle}>
                        <span style={styles.groupIcon}>🏛️</span>
                        Membership of Professional Bodies
                    </h3>
                    <div style={styles.fieldsContainer}>
                        <label style={styles.label}>
                            <span style={styles.labelNumber}>{inputCounter++}.</span>
                            <span style={styles.labelText}>Membership of Professional Bodies</span>
                            <input 
                                type="text" 
                                name="professionalBodiesMembership" 
                                value={formDataA.professionalBodiesMembership} 
                                onChange={handleInputChange} 
                                style={styles.input} 
                                disabled={!isEditing || hasPendingChanges} 
                            />
                        </label>
                    </div>
                    {renderProofLinksSection('member', 'Proof Links for Professional Membership')}
                </div>

                <div style={styles.inputGroup}>
                    <h3 style={styles.groupTitle}>
                        <span style={styles.groupIcon}>🚀</span>
                        Career & Placement
                    </h3>
                    <div style={styles.fieldsContainer}>
                        <label style={styles.label}>
                            <span style={styles.labelNumber}>{inputCounter++}.</span>
                            <span style={styles.labelText}>Assessment (SHL / NCET) Marks</span>
                            <input 
                                type="text" 
                                name="assessmentMarks" 
                                value={formDataA.assessmentMarks} 
                                onChange={handleInputChange} 
                                style={styles.input} 
                                disabled={!isEditing || hasPendingChanges} 
                            />
                        </label>
                        <label style={styles.label}>
                            <span style={styles.labelNumber}>{inputCounter++}.</span>
                            <span style={styles.labelText}>Career Option</span>
                            <input 
                                type="text" 
                                name="careerOption" 
                                value={formDataA.careerOption} 
                                onChange={handleInputChange} 
                                placeholder="e.g., Software Engineer, Data Scientist, Higher Studies" 
                                style={styles.input} 
                                disabled={!isEditing || hasPendingChanges} 
                            />
                        </label>
                        <label style={styles.label}>
                            <span style={styles.labelNumber}>{inputCounter++}.</span>
                            <span style={styles.labelText}>Dream Company for Placement</span>
                            <input 
                                type="text" 
                                name="dreamCompanyPlacement" 
                                value={formDataA.dreamCompanyPlacement} 
                                onChange={handleInputChange} 
                                style={styles.input} 
                                disabled={!isEditing || hasPendingChanges} 
                            />
                        </label>
                    </div>
                    {renderProofLinksSection('careerAndPlacement', 'Proof Links for Career & Placement')}
                </div>

                
            </form>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
        padding: '0',
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: '0',
        boxShadow: 'none',
    },
    header: {
        textAlign: 'center',
        marginBottom: '40px',
    },
    subHeading: {
        color: '#1a365d',
        marginBottom: '16px',
        fontSize: '2.5rem',
        fontWeight: '700',
        letterSpacing: '-0.025em',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
    },
    headerUnderline: {
        width: '100px',
        height: '4px',
        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
        margin: '0 auto',
        borderRadius: '2px',
    },
    inputGroup: {
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        transition: 'all 0.3s ease',
    },
    groupTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        color: '#2d3748',
        borderBottom: '2px solid #e2e8f0',
        paddingBottom: '16px',
        marginBottom: '32px',
        fontSize: '1.5rem',
        fontWeight: '600',
        letterSpacing: '-0.025em',
    },
    groupIcon: {
        fontSize: '1.5rem',
        padding: '8px',
        backgroundColor: '#f7fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
    },
    fieldsContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
    },
    row: {
        display: 'flex',
        gap: '20px',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
    },
    label: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        flex: '1',
        minWidth: '300px',
    },
    labelHalf: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        flex: '1',
        minWidth: '250px',
    },
    labelThird: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        flex: '1',
        minWidth: '200px',
    },
    labelNumber: {
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#667eea',
        backgroundColor: '#edf2f7',
        padding: '4px 8px',
        borderRadius: '6px',
        alignSelf: 'flex-start',
        minWidth: 'fit-content',
    },
    labelText: {
        fontSize: '0.95rem',
        fontWeight: '600',
        color: '#4a5568',
        lineHeight: '1.4',
    },
    input: {
        width: '100%',
        padding: '14px 16px',
        fontSize: '1rem',
        border: '2px solid #e2e8f0',
        borderRadius: '12px',
        backgroundColor: '#ffffff',
        transition: 'all 0.2s ease',
        outline: 'none',
        boxSizing: 'border-box',
    },
    lockedInput: {
        backgroundColor: '#f7fafc',
        borderColor: '#cbd5e0',
        color: '#718096',
        cursor: 'not-allowed',
    },
    proofSection: {
        marginTop: '32px',
        padding: '24px',
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
    },
    proofTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '20px',
        color: '#4a5568',
        fontSize: '1.1rem',
        fontWeight: '600',
        '&::before': {
            content: '🔗',
            fontSize: '1.2rem',
        },
    },
    proofEditContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    proofViewContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    proofInputWrapper: {
        marginBottom: '0',
    },
    proofInputContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    proofInput: {
        flex: '1',
        padding: '12px 16px',
        fontSize: '0.95rem',
        border: '2px solid #e2e8f0',
        borderRadius: '8px',
        backgroundColor: '#ffffff',
        transition: 'all 0.2s ease',
        outline: 'none',
    },
    addButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 20px',
        fontSize: '0.95rem',
        fontWeight: '600',
        borderRadius: '8px',
        border: '2px solid #667eea',
        backgroundColor: '#ffffff',
        color: '#667eea',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        alignSelf: 'flex-start',
    },
    addIcon: {
        fontSize: '1.1rem',
        fontWeight: 'bold',
    },
    removeButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '36px',
        height: '36px',
        fontSize: '18px',
        fontWeight: 'bold',
        borderRadius: '8px',
        border: '2px solid #e53e3e',
        backgroundColor: '#fed7d7',
        color: '#e53e3e',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        flexShrink: 0,
    },
    linkWrapper: {
        marginBottom: '8px',
    },
    linkDisplay: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 16px',
        color: '#3182ce',
        textDecoration: 'none',
        backgroundColor: '#ebf8ff',
        border: '1px solid #bee3f8',
        borderRadius: '8px',
        fontSize: '0.9rem',
        transition: 'all 0.2s ease',
        wordBreak: 'break-all',
    },
    noLinksMessage: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '16px',
        color: '#718096',
        backgroundColor: '#f7fafc',
        border: '1px dashed #cbd5e0',
        borderRadius: '8px',
        fontStyle: 'italic',
        textAlign: 'center',
        fontSize: '0.9rem',
    },
    buttonContainer: {
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        marginTop: '40px',
        flexWrap: 'wrap',
    },
    submitButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px 32px',
        fontSize: '1.1rem',
        fontWeight: '600',
        borderRadius: '12px',
        border: 'none',
        background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
        color: '#ffffff',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 12px rgba(72, 187, 120, 0.3)',
        minWidth: '200px',
        justifyContent: 'center',
    },
    cancelButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px 32px',
        fontSize: '1.1rem',
        fontWeight: '600',
        borderRadius: '12px',
        border: 'none',
        background: 'linear-gradient(135deg, #a0aec0 0%, #718096 100%)',
        color: '#ffffff',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 12px rgba(160, 174, 192, 0.3)',
        minWidth: '120px',
        justifyContent: 'center',
    },
    editButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px 32px',
        fontSize: '1.1rem',
        fontWeight: '600',
        borderRadius: '12px',
        border: 'none',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#ffffff',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
        minWidth: '180px',
        justifyContent: 'center',
    },
    disabledButton: {
        opacity: '0.6',
        cursor: 'not-allowed',
        background: 'linear-gradient(135deg, #cbd5e0 0%, #a0aec0 100%)',
        boxShadow: 'none',
    },
    buttonIcon: {
        fontSize: '1.2rem',
    },
    spinner: {
        width: '20px',
        height: '20px',
        border: '2px solid #ffffff30',
        borderTop: '2px solid #ffffff',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
    pendingMessage: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        backgroundColor: '#fffbeb',
        border: '1px solid #fed7aa',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '32px',
        boxShadow: '0 4px 6px -1px rgba(251, 191, 36, 0.1)',
    },
    pendingIcon: {
        fontSize: '2rem',
        flexShrink: 0,
    },
    pendingTitle: {
        margin: '0 0 8px 0',
        color: '#92400e',
        fontSize: '1.2rem',
        fontWeight: '600',
    },
    pendingText: {
        margin: '0',
        color: '#92400e',
        fontSize: '1rem',
        lineHeight: '1.5',
    },
};

// Add CSS animation for spinner
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .form-input:focus {
        border-color: #667eea !important;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
    }
    
    .add-button:hover {
        background-color: #667eea !important;
        color: #ffffff !important;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }
    
    .remove-button:hover {
        background-color: #e53e3e !important;
        color: #ffffff !important;
        transform: translateY(-1px);
    }
    
    .submit-button:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(72, 187, 120, 0.4) !important;
    }
    
    .cancel-button:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(160, 174, 192, 0.4) !important;
    }
    
    .edit-button:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4) !important;
    }
    
    .link-display:hover {
        background-color: #bee3f8 !important;
        transform: translateY(-1px);
    }
    
    .input-group:hover {
        box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
    }
`;
document.head.appendChild(styleSheet);

export default FormatAForm;