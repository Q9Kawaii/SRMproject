import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, deleteDoc, arrayUnion, arrayRemove } from "firebase/firestore";
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

// Now, 'updates' will be a single achievement object, including its unique ID
// Example 'updates': { id: 'uuid123', category: 'Participations', 'Event Name': 'Hackathon', ... }

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

    if (existingIndex !== -1) {
      // If it's an update to an existing pending item (e.g., student edited it again before approval)
      const { id, ...cleanData } = achievementData;
pendingItems.push({
  id,
  category,
  data: cleanData,
  submissionDate: new Date().toISOString()
});
    } else {
      // It's a brand new pending item (either new submission or edit of an approved one)
      const { id, ...cleanData } = achievementData;
pendingItems.push({
  id,
  category,
  data: cleanData,
  submissionDate: new Date().toISOString()
});
    }

    await setDoc(pendingRef, {
      pendingItems: pendingItems // Store as an array
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

// //! Fetch pending updates either for a student or for a section

// // Now fetches 'pendingItems' array instead of 'achievements' object
// export async function getPendingUpdates(identifier, type) {
//   try {
//     const pendingRef = collection(db, "pendingAchievements");

//     if (type === "regNo") {
//       const docRef = doc(pendingRef, identifier);
//       const snap = await getDoc(docRef);

//       if (!snap.exists()) {
//         return { success: false, message: "No pending update found", data: [] }; // Return empty array for no pending
//       }

//       const basicInfo = await getBasicStudentInfo(identifier);

//       return {
//         success: true,
//         message: "Pending update found",
//         data: {
//           ...basicInfo.data,
//           pendingItems: snap.data().pendingItems || [] // Get the array
//         }
//       };
//     }

//     if (type === "section") {
//       const querySnap = await getDocs(pendingRef);

//       const pendingList = [];

//       for (const docSnap of querySnap.docs) {
//         const regNo = docSnap.id;
//         const basicInfo = await getBasicStudentInfo(regNo);

//         if (
//           basicInfo.success &&
//           basicInfo.data.section === identifier
//         ) {
//           const studentPendingItems = docSnap.data().pendingItems || [];
//           if (studentPendingItems.length > 0) { // Only add if there are actual pending items
//             pendingList.push({
//               ...basicInfo.data,
//               pendingItems: studentPendingItems
//             });
//           }
//         }
//       }

//       return {
//         success: true,
//         message: "Pending updates for section fetched",
//         data: pendingList
//       };
//     }

//     return { success: false, message: "Invalid query type", data: {} };

//   } catch (err) {
//     console.error("Error fetching pending updates:", err);
//     return { success: false, message: "Error fetching data", data: {} };
//   }
// }

// achievementFns.js

// Make sure you have the necessary imports at the top of your file:
// import { db } from './firebaseConfig'; // Or wherever your Firestore instance is
// import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
// import { getBasicStudentInfo } from './achievementFns'; // Or the correct path to getBasicStudentInfo if it's in another file

//! Fetch pending updates either for a student or for a section
export async function getPendingUpdates(identifier, type) {
  try {
    const pendingRef = collection(db, "pendingAchievements");

    if (type === "regNo") {
      const docRef = doc(pendingRef, identifier);
      const snap = await getDoc(docRef);

      if (!snap.exists()) {
        // --- THIS IS THE NEW / MODIFIED BLOCK ---
        const basicInfo = await getBasicStudentInfo(identifier); // Still attempt to get basic info

        // Ensure basicInfo.data is available; otherwise, default to a minimal structure
        const studentData = basicInfo.success ? basicInfo.data : { regNo: identifier, name: "Unknown", section: "Unknown" };

        return {
          success: true, // IMPORTANT: Changed from 'false' to 'true'. This indicates a successful lookup, even if no document was found.
          message: "No pending update found for this student",
          data: { // IMPORTANT: Data is now an object for consistency
            ...studentData, // Includes basic student info
            pendingItems: [] // CRITICAL: Ensures 'pendingItems' is an empty array when no document exists
          }
        };
        // --- END OF NEW / MODIFIED BLOCK ---
      }

      // If document exists, this part remains largely the same,
      // ensuring 'pendingItems' is an array from the Firestore data.
      const basicInfo = await getBasicStudentInfo(identifier);

      return {
        success: true,
        message: "Pending update found",
        data: {
          ...basicInfo.data, // Include student's basic info
          pendingItems: snap.data().pendingItems || [] // Get the array of pending items from the document
        }
      };
    }

    if (type === "section") {
      // This section remains unchanged as its previous logic already returned
      // an array of objects suitable for the Admin Dashboard's section view.
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
          if (studentPendingItems.length > 0) { // Only add if there are actual pending items
            pendingList.push({
              ...basicInfo.data,
              pendingItems: studentPendingItems
            });
          }
        }
      }

      return {
        success: true,
        message: "Pending updates for section fetched",
        data: pendingList // This is an array of student objects, each with a pendingItems array
      };
    }

    // Fallback for invalid type
    return { success: false, message: "Invalid query type", data: {} };

  } catch (err) {
    console.error("Error fetching pending updates:", err);
    // --- THIS IS THE NEW / MODIFIED BLOCK FOR CATCH ---
    // Ensure that even on an error, the 'data' structure is consistent
    return { success: false, message: "Error fetching data", data: { pendingItems: [] } };
    // --- END OF NEW / MODIFIED BLOCK ---
  }
}

//! Approve and apply pending update to main User doc

// Iterates through pendingItems and applies each individually
export async function approvePendingUpdate(regNo) {
  try {
    const pendingRef = doc(db, "pendingAchievements", regNo);
    const pendingSnap = await getDoc(pendingRef);

    if (!pendingSnap.exists()) {
  return { success: true, message: "No pending update to approve. Already done." };
}

    const pendingItems = pendingSnap.data().pendingItems || [];
    if (pendingItems.length === 0) {
      await deleteDoc(pendingRef); // Clean up if somehow empty array
      return { success: true, message: "No pending items to approve." };
    }

    const userRef = doc(db, "User", regNo);
    // CHANGE THIS LINE: from const to let
    let userSnap = await getDoc(userRef); // <--- Changed from const to let

    // If user does not exist, create a basic user document
    if (!userSnap.exists()) {
      const basicInfo = await getBasicStudentInfo(regNo); // Attempt to get info if user exists in another context
      await setDoc(userRef, {
        regNo: regNo,
        name: basicInfo.data.name || 'Unknown Student', // Placeholder if no info
        section: basicInfo.data.section || 'Unknown Section', // Placeholder
        achievements: {} // Initialize as empty object of arrays
      });
      // Re-fetch snapshot after creation
      const newUserSnap = await getDoc(userRef);
      userSnap = newUserSnap; // Update userSnap reference (now allowed)
    }

    const userData = userSnap.data();
    const currentAchievements = userData.achievements || {}; // This is the object of arrays

    const updatedAchievements = { ...currentAchievements };

    for (const pendingItem of pendingItems) {
      const { id, category, data } = pendingItem;

      if (!id || !category || !data) {
    console.warn(`⛔ Skipping malformed pending item for ${regNo}:`, pendingItem);
    continue;
  }

      // Ensure the category array exists
      if (!updatedAchievements[category]) {
        updatedAchievements[category] = [];
      } else if (!Array.isArray(updatedAchievements[category])) {
         console.warn(`Category '${category}' for ${regNo} was not an array. Converting.`);
         updatedAchievements[category] = [updatedAchievements[category]];
      }

      // Find if an item with this ID already exists in the approved achievements for this category
      const existingAchievementIndex = updatedAchievements[category].findIndex(
        (ach) => ach.id === id
      );

      if (existingAchievementIndex !== -1) {
        // This is an EDIT: Replace the existing achievement with the new data
        updatedAchievements[category][existingAchievementIndex] = { ...data, id };
      } else {
        // This is a NEW achievement: Add it to the array
        updatedAchievements[category].push({ ...data, id });
      }
    }

    // Update user doc with merged achievements
    await updateDoc(userRef, {
      achievements: updatedAchievements
    });

    // Delete pending document for this student
    await deleteDoc(pendingRef);

    return { success: true, message: "All pending updates approved and applied." };

  } catch (err) {
    console.error("Error approving update:", err);
    return { success: false, message: "Failed to approve update" };
  }
}


//! Reject pending update: simply deletes the student's entry in pendingAchievements
export async function rejectPendingUpdate(regNo) {
  try {
    const pendingRef = doc(db, "pendingAchievements", regNo);
    const snap = await getDoc(pendingRef);

    if (!snap.exists()) {
      return { success: false, message: "No pending update found to reject." };
    }

    await deleteDoc(pendingRef);
    return { success: true, message: "Pending update rejected and removed." };
  } catch (err) {
    console.error("Error rejecting pending update:", err);
    return { success: false, message: "Failed to reject pending update." };
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