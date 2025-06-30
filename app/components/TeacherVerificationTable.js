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
      const [name, link, verified] = parts;
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
      const studentRef = doc(db, "User", regNo);
      await updateDoc(studentRef, update.updates);
      const pendingRef = doc(db, "PendingUpdates", updateId);
      await deleteDoc(pendingRef);
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
        status: "declined",
        message: declineMessage || "Update declined by teacher"
      });
      setPendingUpdates((prev) => prev.filter((u) => u.id !== updateId));
      setDeclineMessage("");
      setSelectedUpdateId("");
      setSuccess(`Update for ${updateId} declined successfully!`);
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
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Pending Student Updates</h1>
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
          {success}
        </div>
      )}
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
      {selectedUpdateId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">
              Decline Updates for {selectedUpdateId}
            </h2>
            <textarea
              value={declineMessage}
              onChange={(e) => setDeclineMessage(e.target.value)}
              placeholder="Reason for declining..."
              className="w-full p-2 border rounded mb-4"
              rows={3}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setSelectedUpdateId("")}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDecline(selectedUpdateId)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
