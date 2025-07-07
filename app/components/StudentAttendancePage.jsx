"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  Check, 
  Clock, 
  FileText, 
  User, 
  Calendar,
  RefreshCw,
  X,
  Send,
  BookOpen,
  Bell,
  CheckCircle,
  XCircle
} from 'lucide-react';

const StudentAttendancePage = ({ studentRegNo }) => {
  // State Management
  const [attendanceData, setAttendanceData] = useState({});
  const [absentRecords, setAbsentRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [processingActions, setProcessingActions] = useState(new Set());
  const [showNewAlertModal, setShowNewAlertModal] = useState(false);
  const [newAlerts, setNewAlerts] = useState([]);
  const [reasonInputs, setReasonInputs] = useState({});

  // Helper Functions
  const getAttendanceColor = (percentage) => {
    const numericPercent = parseFloat(String(percentage).replace('%', ''));
    if (isNaN(numericPercent)) return 'bg-gray-100 text-gray-600 border-gray-200';
    if (numericPercent >= 85) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (numericPercent >= 75) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  const getRecordStatusBadge = (record) => {
    if (record.resolved) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium border border-emerald-200">
          <CheckCircle size={12} />
          Resolved
        </span>
      );
    } else if (record.faApproved && record.aaApproved) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-200">
          <Check size={12} />
          Approved
        </span>
      );
    } else if (record.faApproved) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium border border-indigo-200">
          <Clock size={12} />
          FA Approved
        </span>
      );
    } else if (record.aaApproved) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-xs font-medium border border-purple-200">
          <Clock size={12} />
          AA Approved
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-xs font-medium border border-amber-200">
          <AlertTriangle size={12} />
          Pending
        </span>
      );
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr.length !== 8) return dateStr;
    const day = dateStr.substring(0, 2);
    const month = dateStr.substring(2, 4);
    const year = dateStr.substring(4, 8);
    return `${day}/${month}/${year}`;
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp || timestamp === 'NA') return 'Not available';
    return timestamp.replace(/(\d{2}:\d{2}[ap]m)(\d{8})/, '$1 on $2');
  };

  const checkForNewAlerts = (records) => {
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    const acknowledgedAlerts = JSON.parse(localStorage.getItem('acknowledgedAlerts') || '[]');
    
    const newAlertsFound = records.filter(record => {
      if (acknowledgedAlerts.includes(record.date)) return false;
      
      try {
        const alertTime = parseAlertTimestamp(record.alertTimestamp);
        return alertTime > oneDayAgo;
      } catch {
        return false;
      }
    });

    if (newAlertsFound.length > 0) {
      setNewAlerts(newAlertsFound);
      setShowNewAlertModal(true);
    }
  };

  const parseAlertTimestamp = (timestamp) => {
    if (!timestamp) return 0;
    const match = timestamp.match(/(\d{2}:\d{2})[ap]m(\d{8})/);
    if (!match) return 0;
    
    const [, time, dateStr] = match;
    const day = parseInt(dateStr.substring(0, 2));
    const month = parseInt(dateStr.substring(2, 4)) - 1;
    const year = parseInt(dateStr.substring(4, 8));
    const [hours, minutes] = time.split(':').map(Number);
    
    return new Date(year, month, day, hours, minutes).getTime();
  };

  const acknowledgeNewAlerts = () => {
    const acknowledgedAlerts = JSON.parse(localStorage.getItem('acknowledgedAlerts') || '[]');
    const newAcknowledged = [...acknowledgedAlerts, ...newAlerts.map(alert => alert.date)];
    localStorage.setItem('acknowledgedAlerts', JSON.stringify(newAcknowledged));
    setShowNewAlertModal(false);
    setNewAlerts([]);
  };

  // API Functions
  const fetchAttendanceData = async () => {
    try {
      const response = await fetch(`/api/get-attendance?regNo=${studentRegNo}`);
      const data = await response.json();
      
      if (data.success) {
        setAttendanceData(data.attendanceMap || {});
      } else {
        throw new Error(data.message || 'Failed to fetch attendance data');
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      showMessage('error', 'Failed to load attendance data');
    }
  };

  const fetchAbsentRecords = async () => {
    try {
      const response = await fetch(`/api/get-absent-records?regNo=${studentRegNo}`);
      const data = await response.json();
      
      if (data.success) {
        setAbsentRecords(data.records || []);
        checkForNewAlerts(data.records || []);
      } else {
        throw new Error(data.message || 'Failed to fetch absent records');
      }
    } catch (error) {
      console.error('Error fetching absent records:', error);
      showMessage('error', 'Failed to load absent records');
    }
  };

  const submitReason = async (dateStr, reason) => {
    if (!reason.trim()) {
      showMessage('error', 'Please provide a reason');
      return;
    }

    const actionKey = `submit-${dateStr}`;
    setProcessingActions(prev => new Set(prev).add(actionKey));

    try {
      const response = await fetch('/api/submit-reason', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          regNo: studentRegNo,
          dateStr,
          reason: reason.trim()
        })
      });

      const data = await response.json();

      if (data.success) {
        showMessage('success', 'Reason submitted successfully');
        setReasonInputs(prev => ({ ...prev, [dateStr]: '' }));
        await fetchAbsentRecords(); // Refresh records
      } else {
        throw new Error(data.message || 'Failed to submit reason');
      }
    } catch (error) {
      console.error('Error submitting reason:', error);
      showMessage('error', 'Failed to submit reason');
    } finally {
      setProcessingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(actionKey);
        return newSet;
      });
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const refreshData = async () => {
    setLoading(true);
    await Promise.all([fetchAttendanceData(), fetchAbsentRecords()]);
    setLoading(false);
  };

  // Effects
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchAttendanceData(), fetchAbsentRecords()]);
      setLoading(false);
    };

    if (studentRegNo) {
      loadData();
    }
  }, [studentRegNo]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAbsentRecords();
    }, 30000);

    return () => clearInterval(interval);
  }, [studentRegNo]);

  // Separate active and past alerts
  const activeAlerts = absentRecords.filter(record => !record.resolved);
  const pastAlerts = absentRecords.filter(record => record.resolved);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"
          />
          <p className="text-slate-600 font-medium">Loading your attendance data...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/70 backdrop-blur-sm border-b border-slate-200/50 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <User className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Student Dashboard</h1>
                <p className="text-slate-600 font-medium">ID: {studentRegNo}</p>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={refreshData}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              <RefreshCw size={16} />
              Refresh
            </motion.button>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Message Display */}
        <AnimatePresence>
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.95 }}
              className={`p-4 rounded-2xl shadow-lg ${
                message.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {message.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                {message.text}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Attendance Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-slate-200/50 p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center">
              <BookOpen className="text-white" size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Attendance Summary</h2>
          </div>

          {Object.keys(attendanceData).length === 0 ? (
            <p className="text-slate-500 text-center py-8">No attendance data available</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(attendanceData).map(([subject, percentage]) => (
                <motion.div
                  key={subject}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className={`p-4 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg ${getAttendanceColor(percentage)}`}
                >
                  <div className="font-semibold text-sm mb-1">{subject}</div>
                  <div className="text-2xl font-bold">{percentage}%</div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Active Alerts */}
        {activeAlerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-slate-200/50 p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center">
                <Bell className="text-white" size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Active Alerts</h2>
              <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                {activeAlerts.length}
              </span>
            </div>

            <div className="space-y-4">
              {activeAlerts.map((record, index) => (
                <motion.div
                  key={`${record.date}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2 text-slate-700">
                          <Calendar size={16} />
                          <span className="font-semibold">{formatDate(record.date)}</span>
                        </div>
                        {getRecordStatusBadge(record)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-500">Alerted:</span>
                          <span className="ml-2 text-slate-700">{formatTimestamp(record.alertTimestamp)}</span>
                        </div>
                        <div className="flex gap-4">
                          <div className="flex items-center gap-1">
                            <span className="text-slate-500">FA:</span>
                            {record.faApproved ? (
                              <Check size={14} className="text-emerald-600" />
                            ) : (
                              <Clock size={14} className="text-amber-600" />
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-slate-500">AA:</span>
                            {record.aaApproved ? (
                              <Check size={14} className="text-emerald-600" />
                            ) : (
                              <Clock size={14} className="text-amber-600" />
                            )}
                          </div>
                        </div>
                      </div>

                      {record.reason && record.reason !== '—' ? (
                        <div className="bg-white/70 rounded-xl p-3 border border-slate-200">
                          <span className="text-slate-500 text-sm">Reason:</span>
                          <p className="text-slate-700 mt-1">{record.reason}</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                            <span className="text-amber-700 text-sm font-medium">⚠️ Reason required</span>
                          </div>
                          <div className="space-y-2">
                            <textarea
                              value={reasonInputs[record.date] || ''}
                              onChange={(e) => setReasonInputs(prev => ({
                                ...prev,
                                [record.date]: e.target.value
                              }))}
                              placeholder="Please provide a reason for your absence..."
                              className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
                              rows={3}
                            />
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => submitReason(record.date, reasonInputs[record.date] || '')}
                              disabled={processingActions.has(`submit-${record.date}`) || !reasonInputs[record.date]?.trim()}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl"
                            >
                              {processingActions.has(`submit-${record.date}`) ? (
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                                />
                              ) : (
                                <Send size={16} />
                              )}
                              Submit Reason
                            </motion.button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Past Alerts */}
        {pastAlerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-slate-200/50 p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center">
                <FileText className="text-white" size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Resolved Alerts</h2>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                {pastAlerts.length}
              </span>
            </div>

            <div className="space-y-4">
              {pastAlerts.map((record, index) => (
                <motion.div
                  key={`${record.date}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200 opacity-75 hover:opacity-100 transition-all duration-300"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2 text-slate-700">
                          <Calendar size={16} />
                          <span className="font-semibold">{formatDate(record.date)}</span>
                        </div>
                        {getRecordStatusBadge(record)}
                      </div>

                      {record.reason && record.reason !== '—' && (
                        <div className="bg-white/70 rounded-xl p-3 border border-slate-200">
                          <span className="text-slate-500 text-sm">Reason:</span>
                          <p className="text-slate-700 mt-1">{record.reason}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
                        <div>
                          <span>FA Approved:</span>
                          <span className="ml-2">{formatTimestamp(record.faTimestamp)}</span>
                        </div>
                        <div>
                          <span>AA Approved:</span>
                          <span className="ml-2">{formatTimestamp(record.aaTimestamp)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {absentRecords.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-slate-200/50 p-12 text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-white" size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Perfect Attendance!</h3>
            <p className="text-slate-600">You have no attendance alerts. Keep up the great work!</p>
          </motion.div>
        )}
      </div>

      {/* New Alert Modal */}
      <AnimatePresence>
        {showNewAlertModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Bell className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">New Attendance Alert!</h3>
                <p className="text-slate-600 mb-6">
                  You have {newAlerts.length} new attendance alert{newAlerts.length > 1 ? 's' : ''} for:
                </p>
                <div className="space-y-2 mb-6">
                  {newAlerts.map((alert, index) => (
                    <div key={index} className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                      <span className="font-semibold text-amber-700">{formatDate(alert.date)}</span>
                    </div>
                  ))}
                </div>
                <p className="text-slate-600 text-sm mb-6">
                  Please review your alerts below and submit reasons if required.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={acknowledgeNewAlerts}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                >
                  <X size={20} />
                  Got it, thanks!
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentAttendancePage;