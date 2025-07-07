// components/TeacherVerificationTable.js
"use client";
import { useState, useEffect } from "react";
import {
  collection,
  query,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function TeacherVerificationTable() {
  const [pendingUpdates, setPendingUpdates] = useState([]);
  const [declineMessage, setDeclineMessage] = useState("");
  const [selectedUpdateId, setSelectedUpdateId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Helper to format field names
  const formatFieldName = (field) => {
    const fieldMap = {
      cgpa: "CGPA",
      attendance: "Attendance",
      PLM: "PLM Score",
      name: "Name",
      section: "Section",
      email: "Email"
    };
    return fieldMap[field] || field.charAt(0).toUpperCase() + field.slice(1);
  };

  // Helper to format achievement values
const formatAchievementValue = (value) => {
  if (typeof value === "string" && value.includes("~")) {
    const parts = value.split("~");
    const [name, link, verified, timestamp] = parts; // Handle 4 parts
    return `${name} (${verified === "1" ? "Verified" : "Unverified"})`;
  }
  return value;
};


  // Helper to render detailed changes
  const renderDetailedChanges = (updates, original) => {
    const changes = [];
    Object.entries(updates || {}).forEach(([field, newValue]) => {
      const oldValue = original?.[field] || "N/A";
      if (field === "achievementsMap" && typeof newValue === "object") {
        Object.entries(newValue).forEach(([achKey, achValue]) => {
          const oldAchValue = original?.achievementsMap?.[achKey] || "N/A";
          changes.push({
            field: `Achievement: ${achKey}`,
            oldValue: formatAchievementValue(oldAchValue),
            newValue: formatAchievementValue(achValue),
            isAchievement: true
          });
        });
      } else {
        changes.push({
          field: formatFieldName(field),
          oldValue: oldValue,
          newValue: newValue,
          isAchievement: false
        });
      }
    });
    return changes;
  };

  // Fetch pending updates
  const fetchPendingUpdates = async () => {
  setIsLoading(true);
  setError("");
  try {
    const q = query(collection(db, "PendingUpdates"));
    const querySnapshot = await getDocs(q);
    const updates = [];
    
    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      
      // Only include if updates map is not empty
      const updatesMap = data.updates || {};
      const hasUpdates = Object.keys(updatesMap).length > 0;
      
      if (hasUpdates) {
        const studentDocRef = doc(db, "User", data.regNo);
        const studentDocSnap = await getDoc(studentDocRef);
        if (studentDocSnap.exists()) {
          const studentData = studentDocSnap.data();
          updates.push({
            id: docSnap.id,
            regNo: data.regNo,
            section: studentData?.section || "N/A",
            updates: data.updates || {},
            original: data.original || {},
            timestamp: data.timestamp
          });
        }
      }
    }
    setPendingUpdates(updates);
  } catch (error) {
    setError("Failed to load pending updates. " + error.message);
  } finally {
    setIsLoading(false);
  }
};


  const handleApprove = async (updateId, regNo) => {
  setError("");
  setSuccess("");
  try {
    const update = pendingUpdates.find((u) => u.id === updateId);
    if (!update) return;
    
    // Apply updates to the User document
    const studentRef = doc(db, "User", regNo);
    await updateDoc(studentRef, update.updates);
    
    // Clear the original and updates maps instead of deleting the document
    const pendingRef = doc(db, "PendingUpdates", updateId);
    await updateDoc(pendingRef, {
      updates: {},      // Clear updates map
      original: {},     // Clear original map
      status: "approved",
      approvedAt: new Date().toISOString()
    });
    
    // Remove from local state since it no longer has pending updates
    setPendingUpdates((prev) => prev.filter((u) => u.id !== updateId));
    setSuccess(`Update for ${regNo} approved successfully!`);
    setTimeout(fetchPendingUpdates, 1000);
  } catch (error) {
    setError("Failed to approve update: " + error.message);
  }
};


  const handleDecline = async (updateId) => {
  setError("");
  setSuccess("");
  try {
    const pendingRef = doc(db, "PendingUpdates", updateId);
    await updateDoc(pendingRef, {
      updates: {},      // Clear updates map
      original: {},     // Clear original map
      status: "declined",
      message: declineMessage || "Update declined by teacher",
      declinedAt: new Date().toISOString()
    });
    
    // Remove from local state since it no longer has pending updates
    setPendingUpdates((prev) => prev.filter((u) => u.id !== updateId));
    setDeclineMessage("");
    setSelectedUpdateId("");
    setSuccess(`Update declined successfully!`);
    setTimeout(fetchPendingUpdates, 1000);
  } catch (error) {
    setError("Failed to decline update: " + error.message);
  }
};


  useEffect(() => {
    fetchPendingUpdates();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg font-medium">Loading pending updates...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
  {/* Animated Background Elements */}
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
    <div className="absolute bottom-20 left-20 w-64 h-64 bg-[#3a5b72] rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-pulse delay-1000"></div>
  </div>

  {/* Floating Geometric Shapes */}
  <div className="absolute top-20 left-20 w-4 h-4 bg-[#0c4da2] transform rotate-45 animate-bounce delay-300"></div>
  <div className="absolute top-40 right-32 w-6 h-6 bg-[#3a5b72] rounded-full animate-bounce delay-700"></div>
  <div className="absolute bottom-40 left-32 w-5 h-5 bg-blue-400 transform rotate-45 animate-bounce delay-1000"></div>

  <div className="relative z-10 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-blue-100 overflow-hidden m-4">
    {/* Header with gradient accent */}
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72]"></div>
    
    <div className="p-8">
      {/* Title Section */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72] rounded-full flex items-center justify-center shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-[#0c4da2] relative">
          Pending Student Updates
          <div className="absolute -bottom-2 left-0 w-3/4 h-1 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72] rounded-full"></div>
        </h1>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50/90 backdrop-blur-sm border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-xl shadow-lg">
          <div className="font-medium">{error}</div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50/90 backdrop-blur-sm border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-r-xl shadow-lg">
          <div className="font-medium">{success}</div>
        </div>
      )}

      {/* Table Container - keeping original table structure */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Registration</th>
                <th className="p-3 text-left">Section</th>
                <th className="p-3 text-left w-1/2">Changes</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingUpdates.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center p-4">
                    No pending updates found
                  </td>
                </tr>
              ) : (
                pendingUpdates.map((update) => {
                  const detailedChanges = renderDetailedChanges(
                    update.updates,
                    update.original
                  );
                  return (
                    <tr key={update.id} className="border-t hover:bg-gray-50">
                      <td className="p-3 font-medium">{update.regNo}</td>
                      <td className="p-3">{update.section}</td>
                      <td className="p-3">
                        <div className="space-y-3">
                          {detailedChanges.map((change, idx) => (
                            <div
                              key={idx}
                              className="border-l-2 border-blue-200 pl-3 mb-2"
                            >
                              <div className="font-medium text-sm text-gray-700 mb-1">
                                {change.field}
                              </div>
                              <div className="flex flex-col space-y-1">
                                <div className="flex items-center">
                                  <span className="text-xs text-gray-500 w-16">
                                    From:
                                  </span>
                                  <span className="line-through text-red-600 text-sm">
                                    {change.oldValue}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <span className="text-xs text-gray-500 w-16">
                                    To:
                                  </span>
                                  <span className="text-green-600 font-medium text-sm">
                                    {change.newValue}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex flex-col space-y-2">
                          <button
                            onClick={() => handleApprove(update.id, update.regNo)}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUpdateId(update.id);
                              setDeclineMessage("");
                            }}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                          >
                            Decline
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Enhanced with theme */}
      {selectedUpdateId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-blue-100 p-8 max-w-md w-full relative overflow-hidden">
            {/* Modal gradient accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72]"></div>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72] rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-[#0c4da2]">
                Decline Updates for {selectedUpdateId}
              </h2>
            </div>
            
            <textarea
              value={declineMessage}
              onChange={(e) => setDeclineMessage(e.target.value)}
              placeholder="Reason for declining..."
              className="w-full p-4 border-2 border-blue-200 rounded-xl bg-white/90 backdrop-blur-sm focus:border-[#0c4da2] focus:outline-none transition-colors duration-300 mb-6"
              rows={3}
            />
            
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setSelectedUpdateId("")}
                className="px-6 py-3 bg-white/90 backdrop-blur-sm text-[#0c4da2] font-bold rounded-xl shadow-lg border-2 border-[#0c4da2] hover:bg-[#0c4da2] hover:text-white transform hover:-translate-y-0.5 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDecline(selectedUpdateId)}
                className="px-6 py-3 bg-red-500 text-white font-bold rounded-xl shadow-lg hover:bg-red-600 transform hover:-translate-y-0.5 transition-all duration-300"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
</div>

  );
}
