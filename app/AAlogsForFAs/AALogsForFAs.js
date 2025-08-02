"use client";
import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Adjust the import path as needed
import { ChevronDown, ChevronUp, Users, Clock, User, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AALogsForFAs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedBoxes, setExpandedBoxes] = useState({});
  const router = useRouter();

  useEffect(() => {
    fetchEmailLogs();
  }, []);

  const handleBack = () => {
    router.back(); // Goes back to the previous page
    // Or use router.push('/dashboard') if you want to go to a specific page
  };

  const fetchEmailLogs = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "EmailLogForAA"));
      const logsData = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const docId = doc.id;
        
        // Parse FA name and section from document ID
        // Assuming format: "{fa name}{fa section}" (e.g., "JohnF1")
        // You might need to adjust this parsing logic based on your actual format
        let faName = '';
        let faSection = '';
        
        // Try to extract section (assuming it's at the end)
        const match = docId.match(/^(.+?)([A-Z]\d*)$/);
        if (match) {
          faName = match[1];
          faSection = match[2];
        } else {
          // Fallback if pattern doesn't match
          faName = docId;
          faSection = 'Unknown';
        }

        if (data.log && data.log.students) {
          logsData.push({
            id: docId,
            faName,
            faSection,
            students: data.log.students,
            timestamp: data.log.timestamp,
            studentCount: data.log.students.length
          });
        }
      });

      // Sort by timestamp (most recent first)
      logsData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setLogs(logsData);
    } catch (error) {
      console.error("Error fetching email logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (logId) => {
    setExpandedBoxes(prev => ({
      ...prev,
      [logId]: !prev[logId]
    }));
  };

  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return timestamp;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 hover:shadow-md transition-all duration-200 text-gray-700 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Back</span>
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Faculty Email Logs
          </h1>
          <p className="text-gray-600">
            View email logs sent by faculty members to students and parents
          </p>
        </div>

        {/* Logs Container */}
        {logs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Email Logs Found
            </h3>
            <p className="text-gray-500">
              No email logs have been submitted by faculty members yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {logs.map((log) => (
              <div 
                key={log.id} 
                className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200"
              >
                {/* Log Header */}
                <div 
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                  onClick={() => toggleExpanded(log.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* FA Info */}
                      <div className="flex items-center space-x-2">
                        <User className="w-5 h-5 text-blue-600" />
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {log.faName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Section: {log.faSection}
                          </p>
                        </div>
                      </div>

                      {/* Student Count */}
                      <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-700">
                          {log.studentCount} students
                        </span>
                      </div>

                      {/* Timestamp */}
                      <div className="flex items-center space-x-2 text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">
                          {formatTimestamp(log.timestamp)}
                        </span>
                      </div>
                    </div>

                    {/* Expand/Collapse Icon */}
                    <div className="flex items-center">
                      {expandedBoxes[log.id] ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Student List */}
                {expandedBoxes[log.id] && (
                  <div className="border-t border-gray-200 p-6 bg-gray-50">
                    <h4 className="font-medium text-gray-900 mb-4">
                      Students ({log.studentCount}):
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {log.students.map((student, index) => (
                        <div 
                          key={index}
                          className="bg-white px-3 py-2 rounded border border-gray-200 text-sm text-gray-700 hover:bg-blue-50 transition-colors duration-150"
                        >
                          {student}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          Total logs: {logs.length} | 
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
}
