// components/achievementFns.js
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, deleteDoc } from "firebase/firestore";
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
// Return full achievements map
// If doc doesn't exist → return {}
export async function getStudentAchievements(regNo) {
  try {
    const userRef = doc(db, "User", regNo);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return { success: false, message: "Student not found", data: {} };
    }

    const data = userSnap.data();
    return {
      success: true,
      message: "Achievements fetched",
      data: {
        name: data.name,
        regNo: data.regNo,
        section: data.section,
        achievements: data.achievements || {}
      }
    };
  } catch (err) {
    console.error("Error fetching student achievements:", err);
    return { success: false, message: "Error fetching data", data: {} };
  }
}

//! Submit or update pending achievements

// Save/overwrite a doc in pendingAchievements
// Creates it if not exists

export async function submitPendingAchievement(regNo, updates) {
  try {
    const pendingRef = doc(db, "pendingAchievements", regNo);
    await setDoc(pendingRef, {
      achievements: updates
    }, { merge: true });

    return { success: true, message: "Pending achievement saved." };
  } catch (err) {
    console.error("Error saving pending achievement:", err);
    return { success: false, message: "Error saving data." };
  }
}


//! Fetch achievements by student regNo or full section

// If type === "regNo" → return single student's full profile + achievements
// If type === "section" → return an array of all students in that section, each with:
//     name, regNo, section, achievements
// Includes:
// Auto-handling missing fields
// Works even if achievements is empty
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
      return {
        success: true,
        message: "Student data fetched",
        data: {
          name: data.name || "",
          regNo: data.regNo || identifier,
          section: data.section || "",
          achievements: data.achievements || {}
        }
      };
    }

    if (type === "section") {
      const q = query(usersRef, where("section", "==", identifier));
      const querySnap = await getDocs(q);

      const students = [];
      querySnap.forEach((docSnap) => {
        const data = docSnap.data();
        students.push({
          name: data.name || "",
          regNo: data.regNo || docSnap.id,
          section: data.section || identifier,
          achievements: data.achievements || {}
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

// If type === "regNo" → get one student’s pending updates
// If type === "section" → get all students’ pending updates from that section
// Each result includes: regNo, name, section, achievements

export async function getPendingUpdates(identifier, type) {
  try {
    const pendingRef = collection(db, "pendingAchievements");

    if (type === "regNo") {
      const docRef = doc(pendingRef, identifier);
      const snap = await getDoc(docRef);

      if (!snap.exists()) {
        return { success: false, message: "No pending update found", data: {} };
      }

      const basicInfo = await getBasicStudentInfo(identifier);

      return {
        success: true,
        message: "Pending update found",
        data: {
          ...basicInfo.data,
          achievements: snap.data().achievements || {}
        }
      };
    }

    if (type === "section") {
      const querySnap = await getDocs(pendingRef); // We now fetch all and filter manually

      const pendingList = [];

      for (const docSnap of querySnap.docs) {
        const regNo = docSnap.id;
        const basicInfo = await getBasicStudentInfo(regNo);

        if (
          basicInfo.success &&
          basicInfo.data.section === identifier // Only include if section matches
        ) {
          pendingList.push({
            ...basicInfo.data,
            achievements: docSnap.data().achievements || {}
          });
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
    return { success: false, message: "Error fetching data", data: {} };
  }
}


//! Approve and apply pending update to main User doc

// Get pending doc by regNo
// If exists:
// Merge its achievements into main User document’s achievements
// Delete pending doc
// We’ll deep merge category-wise, not overwrite the entire achievements object. This ensures only submitted fields get updated.
export async function approvePendingUpdate(regNo) {
  try {
    const pendingRef = doc(db, "pendingAchievements", regNo);
    const pendingSnap = await getDoc(pendingRef);

    if (!pendingSnap.exists()) {
      return { success: false, message: "No pending update found" };
    }

    const pendingData = pendingSnap.data();
    const pendingAchievements = pendingData.achievements || {};

    const userRef = doc(db, "User", regNo);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return { success: false, message: "User not found in main collection" };
    }

    const userData = userSnap.data();
    const currentAchievements = userData.achievements || {};

    // Deep merge: update only the changed fields
    const updatedAchievements = { ...currentAchievements };

    for (const category in pendingAchievements) {
      if (!updatedAchievements[category]) {
        updatedAchievements[category] = {};
      }

      for (const key in pendingAchievements[category]) {
        updatedAchievements[category][key] = pendingAchievements[category][key];
      }
    }

    // Update user doc with merged achievements
    await updateDoc(userRef, {
      achievements: updatedAchievements
    });

    // Delete pending document
    await deleteDoc(pendingRef);

    return { success: true, message: "Update approved and applied." };

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
