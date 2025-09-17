// P_Matrix/app/components/TeacherVerificationTable.js
"use client";

import ExportButtonFormA from "./ExportButtonFormA"
import ExportButtonFormB from "./ExportButtonFormB"

import React, { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import {
    deleteField,
    collection,
    query,
    where,
    getDocs,
    doc,
    setDoc,
    updateDoc,
    writeBatch,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';

// Simple SVG Icon Components for modern UI
const RefreshIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '8px' }}>
        <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z" />
        <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z" />
    </svg>
);

const DocumentTextIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '10px', color: '#6c757d' }}>
        <path d="M.5 2A1.5 1.5 0 0 1 2 1.5h11A1.5 1.5 0 0 1 14.5 3v10A1.5 1.5 0 0 1 13 14.5H3A1.5 1.5 0 0 1 1.5 13V3.5a.5.5 0 0 1 1 0V13a.5.5 0 0 0 .5.5h10a.5.5 0 0 0 .5-.5V3a.5.5 0 0 0-.5-.5H2a.5.5 0 0 0-.5.5v-.5z" />
        <path d="M3 12a1 1 0 0 1 1-1h2a1 1 0 0 1 0 2H4a1 1 0 0 1-1-1zm0-3a1 1 0 0 1 1-1h5a1 1 0 0 1 0 2H4a1 1 0 0 1-1-1zm0-3a1 1 0 0 1 1-1h5a1 1 0 0 1 0 2H4a1 1 0 0 1-1-1z" />
    </svg>
);


const TeacherVerificationTable = () => {
    const [pendingUpdates, setPendingUpdates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const formatDisplayValue = (value) => {
        if (value === null || value === undefined || value === '' ||
            (Array.isArray(value) && value.length === 0) ||
            (typeof value === 'object' && ! (value instanceof Timestamp) && Object.keys(value).length === 0)) {
            return <span style={{ color: '#999' }}>N/A</span>;
        }

        if (value instanceof Timestamp) {
            return value.toDate().toLocaleString();
        }

        if (typeof value === 'string' && value.startsWith('http')) {
            return (
                <a href={value} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', textDecoration: 'none' }}>
                    View Link
                </a>
            );
        }

        if (Array.isArray(value)) {
            return (
                <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                    {value.map((item, index) => (
                        <li key={index} style={{ marginBottom: '5px', overflowWrap: 'break-word' }}>
                            {formatDisplayValue(item)}
                        </li>
                    ))}
                </ul>
            );
        }

        if (typeof value === 'object') {
            return (
                <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                    {Object.entries(value).map(([key, val]) => (
                        <li key={key} style={{ overflowWrap: 'break-word' }}>
                            <strong style={{ color: '#555' }}>{key}:</strong> {formatDisplayValue(val)}
                        </li>
                    ))}
                </ul>
            );
        }

        return String(value);
    };

    const fetchPendingUpdates = async () => {
        setLoading(true);
        setError(null);
        try {
            const updatesRef = collection(db, "PendingUpdates");
            const q = query(updatesRef, where("status", "==", "pending"));
            const querySnapshot = await getDocs(q);
            const updatesList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setPendingUpdates(updatesList);
        } catch (err) {
            console.error("Error fetching pending updates:", err);
            setError("Failed to fetch pending updates. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingUpdates();
    }, []);

    const handleApprove = async (pendingUpdateId, regNo, formType, updates, original) => {
        setLoading(true);
        const batch = writeBatch(db);

        try {
            const filteredUpdates = Object.fromEntries(
                Object.entries(updates).filter(([key, value]) => value !== undefined)
            );

            const formDocRef = doc(db, "User", regNo, formType, regNo);
            batch.set(formDocRef, { ...filteredUpdates, timestamp: serverTimestamp() }, { merge: true });

            const studentDocRef = doc(db, "User", regNo);
            batch.set(studentDocRef, { ...filteredUpdates, lastApprovedSubmission: serverTimestamp() }, { merge: true });

            const pendingUpdateRef = doc(db, "PendingUpdates", pendingUpdateId);
            batch.update(pendingUpdateRef, {
                status: "approved",
                approvedAt: serverTimestamp(),
                original: { ...original, ...filteredUpdates },
                updates: deleteField(),
            });

            await batch.commit();
            alert(`Approved ${formType} update for ${regNo}.`);
            fetchPendingUpdates();
        } catch (error) {
            console.error("Error approving update:", error);
            alert("Failed to approve update. Please check console.");
        } finally {
            setLoading(false);
        }
    };

    const handleDecline = async (pendingUpdateId, regNo, formType) => {
        setLoading(true);
        try {
            const pendingUpdateRef = doc(db, "PendingUpdates", pendingUpdateId);
            await updateDoc(pendingUpdateRef, {
                status: "declined",
                declinedAt: serverTimestamp(),
                updates: deleteField(),
            });
            alert(`Declined ${formType} update for ${regNo}.`);
            fetchPendingUpdates();
        } catch (error) {
            console.error("Error declining update:", error);
            alert("Failed to decline update. Please check console.");
        } finally {
            setLoading(false);
        }
    };

    if (loading && pendingUpdates.length === 0) {
        return <div style={styles.message}>Loading pending updates...</div>;
    }

    if (error) {
        return <div style={{...styles.message, ...styles.error }}>{error}</div>;
    }

    return (
        <div style={styles.pageWrapper}>
            <div style={styles.container}>
                <h1 style={styles.heading}>Placement Matrix</h1>
                <div style={styles.headerActions}>
                    <button onClick={fetchPendingUpdates} disabled={loading} style={styles.refreshButton}>
                        <RefreshIcon /> {loading ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>

                {pendingUpdates.length === 0 ? (
                    <div style={styles.noUpdates}>
                        <p>No pending approvals at the moment. All caught up! ✅</p>
                    </div>
                ) : (
                    <div style={styles.updatesGrid}>
                        {pendingUpdates.map((update) => {
                            
                            // START OF NEW LOGIC: Filter for keys with changed values
                            const changedKeys = Object.keys(update.updates || {}).filter(key => {
                                const originalValue = update.original?.[key];
                                const updatedValue = update.updates[key];
                                // Use JSON.stringify for a simple but effective deep comparison
                                return JSON.stringify(originalValue) !== JSON.stringify(updatedValue);
                            });
                            // END OF NEW LOGIC

                            return (
                                <div key={update.id} style={styles.card}>
                                    <div style={styles.cardHeader}>
                                        <DocumentTextIcon />
                                        <h3 style={styles.cardTitle}>{update.formType} Update for <strong>{update.regNo}</strong></h3>
                                    </div>
                                    <p style={styles.cardInfo}>
                                        Submitted: {formatDisplayValue(update.timestamp)}
                                    </p>

                                    <div style={styles.changesSection}>
                                        <h4>Changes Proposed:</h4>
                                        
                                        {/* UPDATED CONDITIONAL RENDERING */}
                                        {changedKeys.length === 0 ? (
                                            <p style={{ color: '#6c757d', fontSize: '0.9em' }}>
                                                No effective changes were submitted for approval.
                                            </p>
                                        ) : (
                                            <ul style={styles.changeList}>
                                                {/* Map over the FILTERED array of keys */}
                                                {changedKeys.map((key) => (
                                                    <li key={key} style={styles.changeItem}>
                                                        <span style={styles.fieldName}>{key}:</span>
                                                        <div style={styles.changeValues}>
                                                            <span style={styles.oldValue}>{formatDisplayValue(update.original?.[key])}</span>
                                                            <span style={styles.arrow}>→</span>
                                                            <span style={styles.newValue}>{formatDisplayValue(update.updates?.[key])}</span>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    <div style={styles.buttonGroup}>
                                        <button
                                            onClick={() => handleDecline(update.id, update.regNo, update.formType)}
                                            disabled={loading}
                                            style={styles.declineButton}
                                        >
                                            Decline
                                        </button>
                                        <button
                                            onClick={() => handleApprove(update.id, update.regNo, update.formType, update.updates, update.original)}
                                            disabled={loading || changedKeys.length === 0} // Also disable approve if no changes
                                            style={(changedKeys.length === 0) ? {...styles.approveButton, ...styles.disabledButton} : styles.approveButton}
                                        >
                                            Approve
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            

      {/* export buttons always visible */}
      <ExportButtonFormA />
      <ExportButtonFormB />
        </div>
    );
};

const styles = {
    pageWrapper: {
        backgroundColor: '#f0f2f5',
        minHeight: '100vh',
        padding: '30px 15px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    container: {
        padding: '30px',
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    },
    heading: {
        textAlign: 'center',
        color: '#212529',
        marginBottom: '10px',
        fontSize: '2.25rem',
        fontWeight: '600',
    },
    headerActions: {
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '30px',
    },
    refreshButton: {
        display: 'inline-flex',
        alignItems: 'center',
        padding: '10px 20px',
        fontSize: '1rem',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
        fontWeight: '500',
        boxShadow: '0 2px 4px rgba(0, 123, 255, 0.2)',
    },
    message: {
        textAlign: 'center',
        fontSize: '1.2em',
        color: '#6c757d',
        marginTop: '50px',
    },
    error: {
        color: '#dc3545',
        fontWeight: 'bold',
    },
    noUpdates: {
        textAlign: 'center',
        fontSize: '1.1em',
        color: '#495057',
        marginTop: '30px',
        padding: '30px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #dee2e6',
    },
    updatesGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
        gap: '25px',
    },
    card: {
        backgroundColor: '#ffffff',
        border: '1px solid #e9ecef',
        borderRadius: '12px',
        padding: '25px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
    },
    cardHeader: {
        display: 'flex',
        alignItems: 'center',
        borderBottom: '1px solid #f1f3f5',
        paddingBottom: '15px',
        marginBottom: '15px',
    },
    cardTitle: {
        color: '#343a40',
        fontSize: '1.25rem',
        margin: '0',
        fontWeight: '600',
    },
    cardInfo: {
        fontSize: '0.875rem',
        color: '#6c757d',
        marginBottom: '20px',
    },
    changesSection: {
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '20px',
        border: '1px solid #e9ecef',
        flexGrow: 1,
    },
    changeList: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
    },
    changeItem: {
        padding: '10px 0',
        borderBottom: '1px solid #e9ecef',
        fontSize: '0.9rem',
    },
    fieldName: {
        fontWeight: 'bold',
        color: '#007bff',
        display: 'block',
        marginBottom: '5px',
    },
    changeValues: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    oldValue: {
        textDecoration: 'line-through',
        color: '#dc3545',
        backgroundColor: '#fbe9e9',
        padding: '2px 6px',
        borderRadius: '4px',
    },
    arrow: {
        color: '#6c757d',
        fontWeight: 'bold',
    },
    newValue: {
        fontWeight: 'bold',
        color: '#28a745',
        backgroundColor: '#eaf6ec',
        padding: '2px 6px',
        borderRadius: '4px',
    },
    buttonGroup: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px',
        marginTop: 'auto',
        paddingTop: '20px',
    },
    approveButton: {
        backgroundColor: '#28a745',
        color: 'white',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '500',
        transition: 'background-color 0.2s ease',
    },
    declineButton: {
        backgroundColor: '#6c757d',
        color: 'white',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '500',
        transition: 'background-color 0.2s ease',
    },
    disabledButton: {
        backgroundColor: '#adb5bd',
        cursor: 'not-allowed',
    }
};

export default TeacherVerificationTable;