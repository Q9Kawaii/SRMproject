// P_Matrix/app/components/TeacherVerificationTable.js
"use client";

import React, { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, doc, writeBatch, serverTimestamp, updateDoc, deleteField, Timestamp } from 'firebase/firestore';


 const TeacherVerificationTable = () => {
     const [pendingUpdates, setPendingUpdates] = useState([]);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState(null);


     const formatDisplayValue = (value) => {
    if (value === null || value === undefined || value === '' || 
        (Array.isArray(value) && value.length === 0) || 
        (typeof value === 'object' && Object.keys(value).length === 0)) {
        return 'N/A';
    }

    if (value instanceof Timestamp) {
        return value.toDate().toLocaleString();
    }

    if (typeof value === 'string' && value.startsWith('http')) {
        return (
            <a href={value} target="_blank" rel="noopener noreferrer" style={{ color: '#2980b9' }}>
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
            <ul style={{ marginLeft: '1em', paddingLeft: '0.5em' }}>
                {Object.entries(value).map(([key, val]) => (
                    <li key={key} style={{ overflowWrap: 'break-word' }}>
                        <strong>{key}:</strong> {formatDisplayValue(val)}
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
        // Filter out undefined values to prevent Firestore errors
        const filteredUpdates = Object.fromEntries(
            Object.entries(updates).filter(([key, value]) => value !== undefined)
        );

        // 1. Update form doc
        const formDocRef = doc(db, "User", regNo, formType, regNo);
        batch.set(formDocRef, { ...filteredUpdates, timestamp: serverTimestamp() }, { merge: true });

        // 2. Update main user doc
        const studentDocRef = doc(db, "User", regNo);
        batch.set(studentDocRef, { ...filteredUpdates, lastApprovedSubmission: serverTimestamp() }, { merge: true });

        // 3. Update PendingUpdates status
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


     if (loading) {
         return <div style={styles.loading}>Loading pending updates...</div>;
     }

     if (error) {
         return <div style={styles.error}>{error}</div>;
     }

     return (
         <div style={styles.container}>
             <h2 style={styles.heading}>Teacher Verification Panel</h2>
             <button onClick={fetchPendingUpdates} disabled={loading} style={styles.refreshButton}>
                 {loading ? 'Refreshing...' : 'Refresh Pending Updates'}
             </button>
             {pendingUpdates.length === 0 ? (
                 <p style={styles.noUpdates}>No pending updates for now.</p>
             ) : (
                 <div style={styles.updatesGrid}>
                     {pendingUpdates.map((update) => (
                         <div key={update.id} style={styles.card}>
                             <h3 style={styles.cardTitle}>{update.formType} Update for {update.regNo}</h3>
                             <p style={styles.cardInfo}>
                                 Submitted: {formatDisplayValue(update.timestamp)}
                             </p>

                             <div style={styles.changesSection}>
                                 <h4>Changes Proposed:</h4>
                                 {Object.keys(update.updates).length === 0 ? (
                                     <p>No specific field changes recorded (might be initial submission or minor change).</p>
                                 ) : (
                                     <ul style={styles.changeList}>
                                         {Object.keys(update.updates).map((key) => (
                                             <li key={key} style={styles.changeItem}>
                                                 <span style={styles.fieldName}>{key}:</span>
                                                 <span style={styles.oldValue}>{formatDisplayValue(update.original?.[key])}</span>
                                                 <span style={styles.arrow}>→</span>
                                                 <span style={styles.newValue}>{formatDisplayValue(update.updates?.[key])}</span>
                                             </li>
                                         ))}
                                     </ul>

                                 )}
                             </div>

                             <div style={styles.buttonGroup}>
                                 <button
                                     onClick={() => handleApprove(update.id, update.regNo, update.formType, update.updates, update.original)}
                                     disabled={loading}
                                     style={styles.approveButton}
                                 >
                                     Approve
                                 </button>
                                 <button
                                     onClick={() => handleDecline(update.id, update.regNo, update.formType)}
                                     disabled={loading}
                                     style={styles.declineButton}
                                 >
                                     Decline
                                 </button>
                             </div>
                         </div>
                     ))}
                     <div style={{ display: "flex", justifyContent: "center", marginTop: "30px", gap: "20px" }}>
           
            </div>
                 </div>
             )}
         </div>
     );
 };

 const styles = {
     container: {
         padding: '20px',
         maxWidth: '1200px',
         margin: '30px auto',
         backgroundColor: '#f9f9f9',
         borderRadius: '10px',
         boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
         fontFamily: 'Arial, sans-serif',
     },
     heading: {
         textAlign: 'center',
         color: '#2c3e50',
         marginBottom: '25px',
         fontSize: '2.5em',
         borderBottom: '3px solid #3498db',
         paddingBottom: '15px',
     },
     refreshButton: {
         display: 'block',
         margin: '0 auto 20px auto',
         padding: '10px 20px',
         fontSize: '1em',
         backgroundColor: '#2ecc71',
         color: 'white',
         border: 'none',
         borderRadius: '5px',
         cursor: 'pointer',
         transition: 'background-color 0.3s ease',
     },
     refreshButtonHover: {
         backgroundColor: '#27ae60',
     },
     loading: {
         textAlign: 'center',
         fontSize: '1.2em',
         color: '#555',
         marginTop: '50px',
     },
     error: {
         textAlign: 'center',
         fontSize: '1.2em',
         color: '#e74c3c',
         marginTop: '50px',
         fontWeight: 'bold',
     },
     noUpdates: {
         textAlign: 'center',
         fontSize: '1.2em',
         color: '#7f8c8d',
         marginTop: '30px',
         padding: '20px',
         backgroundColor: '#ecf0f1',
         borderRadius: '8px',
     },
     updatesGrid: {
         display: 'grid',
         gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
         gap: '25px',
     },
     card: {
         backgroundColor: '#ffffff',
         border: '1px solid #e0e0e0',
         borderRadius: '10px',
         padding: '20px',
         boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
         display: 'flex',
         flexDirection: 'column',
         justifyContent: 'space-between',
     },
     cardTitle: {
         color: '#34495e',
         fontSize: '1.5em',
         marginBottom: '10px',
         borderBottom: '1px solid #eee',
         paddingBottom: '8px',
         overflowWrap: 'break-word',
     },
     cardInfo: {
         fontSize: '0.9em',
         color: '#7f8c8d',
         marginBottom: '15px',
         overflowWrap: 'break-word',
     },
     changesSection: {
         backgroundColor: '#f8f8f8',
         borderRadius: '8px',
         padding: '15px',
         marginBottom: '15px',
         border: '1px dashed #dcdcdc',
     },
     changeList: {
         listStyle: 'none',
         padding: 0,
         margin: 0,
     },
     changeItem: {
         marginBottom: '8px',
         fontSize: '0.9em',
         lineHeight: '1.4',
         overflowWrap: 'break-word',
     },
     fieldName: {
         fontWeight: 'bold',
         color: '#3498db',
         marginRight: '5px',
     },
     oldValue: {
         textDecoration: 'line-through',
         color: '#e74c3c',
         marginRight: '5px',
         overflowWrap: 'break-word',
     },
     arrow: {
         margin: '0 5px',
         color: '#7f8c8d',
     },
     newValue: {
         fontWeight: 'bold',
         color: '#2ecc71',
         overflowWrap: 'break-word',
     },
     buttonGroup: {
         display: 'flex',
         justifyContent: 'space-around',
         marginTop: '20px',
     },
     approveButton: {
         backgroundColor: '#28a745',
         color: 'white',
         padding: '10px 20px',
         border: 'none',
         borderRadius: '5px',
         cursor: 'pointer',
         fontSize: '1em',
         transition: 'background-color 0.3s ease',
     },
     approveButtonHover: {
         backgroundColor: '#218838',
     },
     declineButton: {
         backgroundColor: '#dc3545',
         color: 'white',
         padding: '10px 20px',
         border: 'none',
         borderRadius: '5px',
         cursor: 'pointer',
         fontSize: '1em',
         transition: 'background-color 0.3s ease',
     },
     declineButtonHover: {
         backgroundColor: '#c82333',
     },
 };

 export default TeacherVerificationTable;