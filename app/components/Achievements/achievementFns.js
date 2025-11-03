import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, deleteDoc, arrayUnion, arrayRemove, runTransaction } from "firebase/firestore";
import { db } from "@/lib/firebase"; // Your initialized firebase client

//! Fetch basic student info
export async function getBasicStudentInfo(regNo) {
  try {
    const userRef = doc(db, "User", regNo);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return { success: false, message: "Student not found", data: {} };
    }

    const data = userSnap.data();

    return {
      success: true,
      message: "Student basic info fetched",
      data: {
        name: data.name || "",
        regNo: data.regNo || regNo,
        section: data.section || ""
      }
    };
  } catch (err) {
    console.error("Error fetching basic student info:", err);
    return { success: false, message: "Error fetching data", data: {} };
  }
}


//! Fetch full achievements for a student

// Fetch student doc from User collection
// Return full achievements map (now arrays per category)
export async function getStudentAchievements(regNo) {
  try {
    const userRef = doc(db, "User", regNo);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return { success: false, message: "Student not found", data: {} };
    }

    const data = userSnap.data();
    // Directly return achievements, assuming they conform to the new array structure.
    // Ensure that your approval process correctly stores them as arrays.
    const achievements = data.achievements || {};

    return {
      success: true,
      message: "Achievements fetched",
      data: {
        name: data.name,
        regNo: data.regNo,
        section: data.section,
        achievements: achievements
      }
    };
  } catch (err) {
    console.error("Error fetching student achievements:", err);
    return { success: false, message: "Error fetching data", data: {} };
  }
}
//! Submit new or edit pending achievements
export async function submitPendingAchievement(regNo, category, achievementData) {
  try {
    const pendingRef = doc(db, "pendingAchievements", regNo);
    const pendingSnap = await getDoc(pendingRef);

    let pendingItems = [];
    if (pendingSnap.exists()) {
      pendingItems = pendingSnap.data().pendingItems || [];
    }
    
    // Check if an item with the same ID already exists in pendingItems for the same category
    const existingIndex = pendingItems.findIndex(
      item => item.id === achievementData.id && item.category === category
    );

    const { id, ...cleanData } = achievementData;
    const newOrUpdatedPendingItem = {
      id,
      category,
      data: cleanData,
      submissionDate: new Date().toISOString()
    };

    if (existingIndex !== -1) {
      // If it's an update, REPLACE the existing item at its index
      pendingItems[existingIndex] = newOrUpdatedPendingItem;
    } else {
      // It's a brand new pending item, add it to the array
      pendingItems.push(newOrUpdatedPendingItem);
    }

    await setDoc(pendingRef, {
      pendingItems: pendingItems, // Store as an array
      // Initialize remarks array if the document is new, otherwise keep existing
      remarks: pendingSnap.exists() ? pendingSnap.data().remarks || [] : [] 
    }, { merge: true }); // Use merge:true to not overwrite other fields if any

    return { success: true, message: "Pending achievement saved." };
  } catch (err) {
    console.error("Error saving pending achievement:", err);
    return { success: false, message: "Error saving data." };
  }
}

//! Fetch achievements by student regNo or full section

// If type === "regNo" → return single student's full profile + achievements
// If type === "section" → return an array of all students in that section, each with:
//      name, regNo, section, achievements (now arrays)
export async function getUserOrSectionAchievements(identifier, type) {
  try {
    const usersRef = collection(db, "User");

    if (type === "regNo") {
      const userRef = doc(db, "User", identifier);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return { success: false, message: "Student not found", data: {} };
      }

      const data = userSnap.data();
      const achievements = data.achievements || {}; // Directly return, assuming new array structure

      return {
        success: true,
        message: "Student data fetched",
        data: {
          name: data.name || "",
          regNo: data.regNo || identifier,
          section: data.section || "",
          achievements: achievements
        }
      };
    }

    if (type === "section") {
      const q = query(usersRef, where("section", "==", identifier));
      const querySnap = await getDocs(q);

      const students = [];
      querySnap.forEach((docSnap) => {
        const data = docSnap.data();
        const achievements = data.achievements || {}; // Directly return, assuming new array structure
        students.push({
          name: data.name || "",
          regNo: data.regNo || docSnap.id,
          section: data.section || identifier,
          achievements: achievements
        });
      });

      return {
        success: true,
        message: "Section data fetched",
        data: students
      };
    }

    return { success: false, message: "Invalid query type", data: {} };

  } catch (err) {
    console.error("Error fetching user/section data:", err);
    return { success: false, message: "Error fetching data", data: {} };
  }
}

//! Fetch pending updates either for a student or for a section
export async function getPendingUpdates(identifier, type) {
  try {
    const pendingRef = collection(db, "pendingAchievements");

    if (type === "regNo") {
      const docRef = doc(pendingRef, identifier);
      const snap = await getDoc(docRef);

      if (!snap.exists()) {
        const basicInfo = await getBasicStudentInfo(identifier);
        const studentData = basicInfo.success ? basicInfo.data : { regNo: identifier, name: "Unknown", section: "Unknown" };

        return {
          success: true,
          // Remove the message property entirely
          data: {
            ...studentData,
            pendingItems: [],
            remarks: [] // Add this line
          }
        };
      }

      // If document exists, this part remains the same
      const basicInfo = await getBasicStudentInfo(identifier);

      return {
        success: true,
        message: "Pending update found",
        data: {
          ...basicInfo.data,
          pendingItems: snap.data().pendingItems || [],
          remarks: snap.data().remarks || [] // Add this line
        }
      };
    }

    if (type === "section") {
      const querySnap = await getDocs(pendingRef);
      const pendingList = [];

      for (const docSnap of querySnap.docs) {
        const regNo = docSnap.id;
        const basicInfo = await getBasicStudentInfo(regNo);

        if (
          basicInfo.success &&
          basicInfo.data.section === identifier
        ) {
          const studentPendingItems = docSnap.data().pendingItems || [];
          if (studentPendingItems.length > 0) {
            const studentRemarks = docSnap.data().remarks || []; // Add this line before push
            pendingList.push({
              ...basicInfo.data,
              pendingItems: studentPendingItems,
              remarks: studentRemarks // Add this line
            });
          }
        }
      }

      return {
        success: true,
        message: "Pending updates for section fetched",
        data: pendingList
      };
    }

    return { success: false, message: "Invalid query type", data: {} };

  } catch (err) {
    console.error("Error fetching pending updates:", err);
    return { success: false, message: "Error fetching data", data: { pendingItems: [], remarks: [] } };
  }
}
//! Approve and apply ALL pending updates to main User doc
// MODIFIED: This function now approves all pending items and clears the pendingItems array.
// It also accepts an optional 'remarks' field to add a message during approval.
export async function approvePendingUpdate(regNo, remarks = '') { // Added optional remarks parameter
  try {
    const pendingRef = doc(db, "pendingAchievements", regNo);
    const userRef = doc(db, "User", regNo);

    await runTransaction(db, async (transaction) => {

      const pendingSnap = await transaction.get(pendingRef);

      if (!pendingSnap.exists()) {
        throw new Error("No pending update found to approve.");
      }

      const pendingData = pendingSnap.data();
      const pendingItems = pendingData.pendingItems || [];
      const currentRemarks = pendingData.remarks || []; // Get existing remarks

      if (pendingItems.length === 0) {
        // If pendingItems is already empty, just return or update remarks if provided
        if (remarks.trim() !== '') {
            const updatedRemarksArray = [...currentRemarks, remarks];
            transaction.update(pendingRef, { remarks: updatedRemarksArray });
            return;
        }
        return;
      }

      let userSnap = await transaction.get(userRef);
      if (!userSnap.exists()) {
        const basicInfo = await getBasicStudentInfo(regNo);
        transaction.set(userRef, {
          regNo: regNo,
          name: basicInfo?.data?.name || 'Unknown Student',
          section: basicInfo?.data?.section || 'Unknown Section',
          achievements: {}
        });
        userSnap = await transaction.get(userRef);
      }

      const userData = userSnap.data();
      const currentAchievements = userData.achievements || {};
      const updatedAchievements = { ...currentAchievements };

      for (const pendingItem of pendingItems) {
        const { id, category, data } = pendingItem;

        if (!updatedAchievements[category]) {
          updatedAchievements[category] = [];
        } else if (!Array.isArray(updatedAchievements[category])) {
          console.warn(`Category '${category}' was not an array! Fixing.`);
          updatedAchievements[category] = [updatedAchievements[category]];
        }

        const existingIndex = updatedAchievements[category].findIndex((ach) => ach.id === id);
        if (existingIndex !== -1) {
          updatedAchievements[category][existingIndex] = { ...data, id };
        } else {
          updatedAchievements[category].push({ ...data, id });
        }
      }

      transaction.update(userRef, { achievements: updatedAchievements });

      // After successful approval, clear pendingItems and add the new remark if provided
      const finalRemarks = remarks.trim() !== '' ? [...currentRemarks, remarks] : currentRemarks;
      
      // If there are no pendingItems and no remarks, we can consider deleting the document
      // However, per our existing logic, we only clear pendingItems here, and remarks
      // are handled by dismissRemark. So we just update.
      transaction.update(pendingRef, {
        pendingItems: [],
        remarks: finalRemarks // Update remarks here
      });
    });

    return { success: true, message: "All pending updates approved and applied." };
  } catch (err) {
    console.error("[approvePendingUpdate] ❌ Error:", err);
    return { success: false, message: `Failed to approve update: ${err.message}` };
  }
}

//! Reject ALL pending updates
// This function will remove all pendingItems and add the new remark to the remarks array.
export async function rejectPendingUpdate(regNo, remarks) {
  try {
    const pendingRef = doc(db, "pendingAchievements", regNo);

    await runTransaction(db, async (transaction) => {

      const pendingSnap = await transaction.get(pendingRef);

      if (!pendingSnap.exists()) {
        // If no pending document exists, we can't reject anything.
        return;
      }

      // Check if remarks were provided.
      if (!remarks || remarks.trim() === '') {
        // If no remarks are provided, simply delete the document as requested.
        transaction.delete(pendingRef);
        return;
      }
      
      const pendingData = pendingSnap.data();
      const remarksArray = pendingData.remarks || [];

      // Add the new remark string to the existing or new remarks array
      const updatedRemarksArray = [...remarksArray, remarks];
      
      // Clear the pendingItems array and update the remarks array
      transaction.update(pendingRef, {
        pendingItems: [],
        remarks: updatedRemarksArray,
      });
    });

    return { success: true, message: "All pending updates rejected and remarked." };
  } catch (err) {
    console.error("Error rejecting pending update:", err);
    return { success: false, message: `Failed to reject pending update: ${err.message}` };
  }
}

//! New: Dismiss all remarks
// This function will clear the entire remarks array.
// If the pendingItems array is also empty, it will delete the entire document.
export async function dismissRemark(regNo) {
  try {
    const pendingRef = doc(db, "pendingAchievements", regNo);

    await runTransaction(db, async (transaction) => {
      const pendingSnap = await transaction.get(pendingRef);
      if (!pendingSnap.exists()) {
        throw new Error("No pending document found to dismiss remarks.");
      }

      const pendingData = pendingSnap.data();
      const pendingItems = pendingData.pendingItems || [];

      // If pendingItems is empty, and we are about to clear the remarks,
      // we can delete the whole document.
      if (pendingItems.length === 0) {
        transaction.delete(pendingRef);
      } else {
        // Otherwise, just clear the remarks array and keep the pendingItems.
        transaction.update(pendingRef, { remarks: [] });
      }
    });

    return { success: true, message: "Remarks dismissed successfully." };
  } catch (err) {
    console.error("Error dismissing remark:", err);
    return { success: false, message: `Failed to dismiss remarks: ${err.message}` };
  }
}


//! New: Delete an approved achievement directly from the User collection
export async function deleteApprovedAchievement(regNo, category, achievementId) {
  try {
    const userRef = doc(db, "User", regNo);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return { success: false, message: "User not found." };
    }

    const userData = userSnap.data();
    const currentAchievements = userData.achievements || {};

    if (!currentAchievements[category] || !Array.isArray(currentAchievements[category])) {
      return { success: false, message: `Category '${category}' not found or not an array.` };
    }

    const initialLength = currentAchievements[category].length;
    // Filter out the achievement to be deleted
    currentAchievements[category] = currentAchievements[category].filter(
      (ach) => ach.id !== achievementId
    );

    if (currentAchievements[category].length === initialLength) {
      return { success: false, message: "Achievement not found within the specified category." };
    }

    // Update the user document with the modified achievements object
    await updateDoc(userRef, {
      achievements: currentAchievements
    });

    return { success: true, message: "Achievement deleted successfully." };
  } catch (err) {
    console.error("Error deleting approved achievement:", err);
    return { success: false, message: "Failed to delete achievement." };
  }
}


export async function getAllStudentsAchievements() {
    try {
        const usersRef = collection(db, "User");
        const querySnap = await getDocs(usersRef);

        const students = [];
        querySnap.forEach((docSnap) => {
            const data = docSnap.data();
            const achievements = data.achievements || {};
            students.push({
                name: data.name || "",
                regNo: data.regNo || docSnap.id,
                section: data.section || "",
                achievements: achievements
            });
        });

        return {
            success: true,
            message: "All student data fetched",
            data: students
        };
    } catch (err) {
        console.error("Error fetching all student data:", err);
        return { success: false, message: "Error fetching all data", data: [] };
    }
}

//! Approve a SINGLE achievement from pending items
// NEW: This function approves only one achievement by its ID
export async function approveSingleAchievement(regNo, achievementId, remarks = '') {
  try {
    const pendingRef = doc(db, "pendingAchievements", regNo);
    const userRef = doc(db, "User", regNo);

    await runTransaction(db, async (transaction) => {
      const pendingSnap = await transaction.get(pendingRef);

      if (!pendingSnap.exists()) {
        throw new Error("No pending update found to approve.");
      }

      const pendingData = pendingSnap.data();
      const pendingItems = pendingData.pendingItems || [];
      
      // Find the specific achievement to approve
      const achievementIndex = pendingItems.findIndex(item => item.id === achievementId);
      
      if (achievementIndex === -1) {
        throw new Error("Achievement not found in pending items.");
      }

      const achievementToApprove = pendingItems[achievementIndex];
      const { id, category, data } = achievementToApprove;

      // Get or create user document
      let userSnap = await transaction.get(userRef);
      if (!userSnap.exists()) {
        const basicInfo = await getBasicStudentInfo(regNo);
        transaction.set(userRef, {
          regNo: regNo,
          name: basicInfo?.data?.name || 'Unknown Student',
          section: basicInfo?.data?.section || 'Unknown Section',
          achievements: {}
        });
        userSnap = await transaction.get(userRef);
      }

      const userData = userSnap.data();
      const currentAchievements = userData.achievements || {};
      const updatedAchievements = { ...currentAchievements };

      // Add the approved achievement to the user's achievements
      if (!updatedAchievements[category]) {
        updatedAchievements[category] = [];
      } else if (!Array.isArray(updatedAchievements[category])) {
        console.warn(`Category '${category}' was not an array! Fixing.`);
        updatedAchievements[category] = [updatedAchievements[category]];
      }

      const existingIndex = updatedAchievements[category].findIndex((ach) => ach.id === id);
      if (existingIndex !== -1) {
        updatedAchievements[category][existingIndex] = { ...data, id };
      } else {
        updatedAchievements[category].push({ ...data, id });
      }

      transaction.update(userRef, { achievements: updatedAchievements });

      // Remove the approved achievement from pendingItems
      const updatedPendingItems = pendingItems.filter(item => item.id !== achievementId);
      
      // Update remarks if provided
      const currentRemarks = pendingData.remarks || [];
      const finalRemarks = remarks.trim() !== '' ? [...currentRemarks, remarks] : currentRemarks;

      // If no pending items remain and no remarks, delete the document, otherwise update
      if (updatedPendingItems.length === 0 && finalRemarks.length === 0) {
        transaction.delete(pendingRef);
      } else {
        transaction.update(pendingRef, {
          pendingItems: updatedPendingItems,
          remarks: finalRemarks
        });
      }
    });

    return { success: true, message: "Achievement approved successfully." };
  } catch (err) {
    console.error("[approveSingleAchievement] ❌ Error:", err);
    return { success: false, message: `Failed to approve achievement: ${err.message}` };
  }
}

//! Reject a SINGLE achievement from pending items
// NEW: This function rejects only one achievement by its ID
export async function rejectSingleAchievement(regNo, achievementId, remarks = '') {
  try {
    const pendingRef = doc(db, "pendingAchievements", regNo);

    await runTransaction(db, async (transaction) => {
      const pendingSnap = await transaction.get(pendingRef);

      if (!pendingSnap.exists()) {
        throw new Error("No pending document found.");
      }

      const pendingData = pendingSnap.data();
      const pendingItems = pendingData.pendingItems || [];
      
      // Find the specific achievement to reject
      const achievementIndex = pendingItems.findIndex(item => item.id === achievementId);
      
      if (achievementIndex === -1) {
        throw new Error("Achievement not found in pending items.");
      }

      // Remove the rejected achievement from pendingItems
      const updatedPendingItems = pendingItems.filter(item => item.id !== achievementId);
      
      // Update remarks if provided
      const currentRemarks = pendingData.remarks || [];
      const finalRemarks = remarks.trim() !== '' ? [...currentRemarks, remarks] : currentRemarks;

      // If no pending items remain and no remarks, delete the document, otherwise update
      if (updatedPendingItems.length === 0 && finalRemarks.length === 0) {
        transaction.delete(pendingRef);
      } else {
        transaction.update(pendingRef, {
          pendingItems: updatedPendingItems,
          remarks: finalRemarks
        });
      }
    });

    return { success: true, message: "Achievement rejected successfully." };
  } catch (err) {
    console.error("[rejectSingleAchievement] ❌ Error:", err);
    return { success: false, message: `Failed to reject achievement: ${err.message}` };
  }
}