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

  <div className="relative z-10 space-y-8 p-4">
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-blue-100 overflow-hidden">
      {/* Header with gradient accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72]"></div>
      
      <div className="p-8">
        {/* Title Section */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72] rounded-full flex items-center justify-center shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-[#0c4da2] relative">
            Achievement Verification
            <div className="absolute -bottom-2 left-0 w-3/4 h-1 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72] rounded-full"></div>
          </h1>
        </div>
        
        {/* Section Filter */}
        <div className="mb-8">
          <label className="block text-[#0c4da2] font-bold mb-3 text-lg">
            Section Filter (Required)
          </label>
          <div className="flex items-center bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
            <input
              type="text"
              placeholder="Enter section (e.g., 'A') or 'all404' for all sections"
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="flex-1 p-4 bg-transparent focus:outline-none text-gray-800 placeholder-gray-500"
            />
            <button
              onClick={() => setSectionFilter("")}
              className="bg-gradient-to-r from-[#3a5b72] to-[#0c4da2] hover:from-[#0c4da2] hover:to-[#3a5b72] text-white px-6 py-4 font-medium transition-all duration-300"
            >
              Clear
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-3 bg-white/60 backdrop-blur-sm rounded-xl px-4 py-2 inline-block">
            You must enter a section to view achievements. Type all404 to show all sections.
          </p>
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

        {/* Content Display */}
        {!sectionFilter ? (
          <div className="bg-yellow-50/90 backdrop-blur-sm border-l-4 border-yellow-400 p-6 text-yellow-700 rounded-r-2xl shadow-lg">
            <p className="font-bold text-lg mb-2">Please enter a section to view achievements.</p>
            <p className="text-sm">
              Type a section code e.g. A, B, C or all404 to show all sections.
            </p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-blue-50/90 backdrop-blur-sm border-l-4 border-blue-400 p-6 text-blue-700 rounded-r-2xl shadow-lg">
            <p className="font-medium">No unverified achievements found for the selected section.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredUsers.map(({ registration, section, achievementsMap }) => (
              <div key={registration} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                {/* Student Header */}
                <div className="bg-gradient-to-r from-[#0c4da2] to-[#3a5b72] p-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Registration: {registration}</h2>
                    <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
                      Section: {section}
                    </span>
                  </div>
                </div>
                
                {/* Table Container - keeping original table structure */}
                <div className="p-6">
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
</div>

  );
}
