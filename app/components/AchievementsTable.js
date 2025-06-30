// components/UserAchievementsTable.js
"use client";
import { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function UserAchievementsTable() {
  const [users, setUsers] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [sectionFilter, setSectionFilter] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch all users and their achievements
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "User"));
        const userData = querySnapshot.docs
          .map(doc => {
            const data = doc.data();
            return {
              registration: doc.id,
              section: data.section || "N/A",
              achievementsMap: data.achievementsMap || {}
            };
          })
          .filter(user => {
            const values = Object.values(user.achievementsMap);
            return values.some(val => {
              const parts = val.split("~");
              return parts[2] !== "1"; // not verified
            });
          });
        setUsers(userData);
        setFilteredUsers(userData);
      } catch (err) {
        setError("Failed to load user data: " + err.message);
      }
    };

    fetchUsers();
  }, []);

  // Apply section filter whenever sectionFilter changes
  useEffect(() => {
    if (!sectionFilter) {
      setFilteredUsers([]);
      return;
    }

    if (sectionFilter.toLowerCase() === "all404") {
      // Show all sections
      setFilteredUsers(users);
      setError("");
    } else {
      // Filter by section
      const filtered = users.filter(user => 
        user.section.toLowerCase().includes(sectionFilter.toLowerCase())
      );
      setFilteredUsers(filtered);
      
      if (filtered.length === 0) {
        setError(`No users found in section: ${sectionFilter}`);
      } else {
        setError("");
      }
    }
  }, [sectionFilter, users]);

  // Handle achievement verification
  const handleVerify = async (registration, key) => {
    setLoadingId(`${registration}-${key}`);
    
    try {
      const user = users.find(u => u.registration === registration);
      if (!user) return;

      const value = user.achievementsMap[key];
      const [name, link] = value.split("~");
      const newString = [name, link, "1", new Date().toISOString()].join("~");

      // Update Firestore
      const userRef = doc(db, "User", registration);
      await updateDoc(userRef, {
        [`achievementsMap.${key}`]: newString,
      });

      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(u => {
          if (u.registration === registration) {
            const updatedMap = {
              ...u.achievementsMap,
              [key]: newString
            };
            
            // Check if user still has unverified achievements
            const hasUnverified = Object.values(updatedMap).some(val => {
              const parts = val.split("~");
              return parts[2] !== "1";
            });
            
            return {
              ...u,
              achievementsMap: updatedMap,
              // Remove user if no unverified achievements remain
              shouldDisplay: hasUnverified
            };
          }
          return u;
        })
      );
      
      setSuccess(`Achievement verified for ${registration}!`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to verify achievement: " + err.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Achievement Verification</h1>
        
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Section Filter (Required)
          </label>
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Enter section (e.g., 'A') or 'all404' for all sections"
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="flex-1 border p-3 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => setSectionFilter("")}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 p-3 rounded-r"
            >
              Clear
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            You must enter a section to view achievements. Type ll404 to show all sections.
          </p>
        </div>

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

        {!sectionFilter ? (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-yellow-700">
            <p className="font-medium">Please enter a section to view achievements.</p>
            <p className="text-sm mt-1">
              Type a section code e.g. A, B, C or &all404 to show all sections.
            </p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 text-blue-700">
            No unverified achievements found for the selected section.
          </div>
        ) : (
          <div className="space-y-6">
            {filteredUsers.map(({ registration, section, achievementsMap }) => (
              <div key={registration} className="bg-white p-4 rounded-lg border">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Registration: {registration}</h2>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    Section: {section}
                  </span>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full border">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-3 text-left">Achievement</th>
                        <th className="p-3 text-left">Evidence</th>
                        <th className="p-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(achievementsMap).map(([key, value]) => {
                        const [name, link, verified, timestamp] = value.split("~");
                        const uniqueId = `${registration}-${key}`;
                        
                        return (
                          <tr key={key} className="border-t hover:bg-gray-50">
                            <td className="p-3 font-medium">{name}</td>
                            <td className="p-3">
                              <a
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline flex items-center"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                                </svg>
                                View Evidence
                              </a>
                            </td>
                            <td className="p-3 text-center">
                              {verified === "1" ? (
                                <span className="text-green-600 font-medium">
                                  Verified
                                  <br />
                                  <span className="text-xs text-gray-500">
                                    {timestamp && new Date(timestamp).toLocaleString()}
                                  </span>
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleVerify(registration, key)}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
                                  disabled={loadingId === uniqueId}
                                >
                                  {loadingId === uniqueId ? "Verifying..." : "Verify"}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
