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
  XCircle,
  TrendingUp,
  Award,
  Target,
  Activity
} from 'lucide-react';

const StudentAttendancePage = ({ studentRegNo }) => {
  // State Management (keeping all existing state)
  const [attendanceData, setAttendanceData] = useState({});
  const [absentRecords, setAbsentRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [processingActions, setProcessingActions] = useState(new Set());
  const [showNewAlertModal, setShowNewAlertModal] = useState(false);
  const [newAlerts, setNewAlerts] = useState([]);
  const [reasonInputs, setReasonInputs] = useState({});

  // Helper Functions (keeping all existing functions)
  const getAttendanceColor = (percentage) => {
    const numericPercent = parseFloat(String(percentage).replace('%', ''));
    if (isNaN(numericPercent)) return 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-600 border-gray-200 shadow-sm';
    if (numericPercent >= 85) return 'bg-gradient-to-br from-emerald-50 to-green-100 text-emerald-700 border-emerald-200 shadow-emerald-100';
    if (numericPercent >= 75) return 'bg-gradient-to-br from-amber-50 to-yellow-100 text-amber-700 border-amber-200 shadow-amber-100';
    return 'bg-gradient-to-br from-rose-50 to-red-100 text-rose-700 border-rose-200 shadow-rose-100';
  };

  const getRecordStatusBadge = (record) => {
    if (record.resolved) {
      return (
        <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-full text-xs font-semibold shadow-lg shadow-emerald-200">
          <CheckCircle size={12} />
          Resolved
        </span>
      );
    } else if (record.faApproved && record.aaApproved) {
      return (
        <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full text-xs font-semibold shadow-lg shadow-blue-200">
          <Check size={12} />
          Approved
        </span>
      );
    } else if (record.faApproved) {
      return (
        <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full text-xs font-semibold shadow-lg shadow-indigo-200">
          <Clock size={12} />
          FA Approved
        </span>
      );
    } else if (record.aaApproved) {
      return (
        <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-full text-xs font-semibold shadow-lg shadow-purple-200">
          <Clock size={12} />
          AA Approved
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-full text-xs font-semibold shadow-lg shadow-amber-200">
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

  // API Functions (keeping all existing API functions)
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

  // Effects (keeping all existing effects)
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white/80 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-white/30"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-gradient-to-r from-blue-200 to-purple-200 border-t-blue-600 rounded-full mx-auto mb-6"
          />
          <motion.div
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="space-y-2"
          >
            <p className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Loading Attendance Data
            </p>
            <p className="text-slate-600">Please wait while we fetch your information...</p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50">
      {/* Enhanced Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-xl border-b border-white/30 sticky top-0 z-40 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-14 h-14 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 rounded-3xl flex items-center justify-center shadow-xl shadow-blue-200"
              >
                <Activity className="text-white" size={28} />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Attendance Dashboard
                </h1>
                <p className="text-slate-600 text-sm">Monitor your academic progress</p>
              </div>
            </div>
            
            <motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  onClick={refreshData}
  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 shadow-xl shadow-blue-200 font-semibold"
>
  <RefreshCw size={18} />
  Refresh
</motion.button>

          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Enhanced Message Display */}
        <AnimatePresence>
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              className={`p-6 rounded-3xl shadow-2xl backdrop-blur-xl border ${
                message.type === 'success' 
                  ? 'bg-gradient-to-r from-emerald-50 to-green-100 text-emerald-700 border-emerald-200 shadow-emerald-200' 
                  : 'bg-gradient-to-r from-rose-50 to-red-100 text-rose-700 border-rose-200 shadow-rose-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                >
                  {message.type === 'success' ? <CheckCircle size={24} /> : <XCircle size={24} />}
                </motion.div>
                <span className="font-semibold text-lg">{message.text}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Attendance Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-100/50 to-purple-100/50 rounded-full -translate-y-20 translate-x-20"></div>
          <div className="relative">
            <div className="flex items-center gap-4 mb-8">
              <motion.div 
                whileHover={{ scale: 1.1 }}
                className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg"
              >
                <TrendingUp className="text-white" size={24} />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Attendance Overview</h2>
                <p className="text-slate-600">Your academic performance summary</p>
              </div>
            </div>

            {Object.keys(attendanceData).length === 0 ? (
              <div className="text-center py-12">
                <motion.div
                  animate={{ bounce: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-4"
                >
                  <BookOpen size={32} className="text-gray-500" />
                </motion.div>
                <p className="text-slate-500 text-lg">No attendance data available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(attendanceData).map(([subject, percentage], index) => (
                  <motion.div
                    key={subject}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className={`p-6 rounded-3xl border-2 transition-all duration-500 hover:shadow-2xl relative overflow-hidden ${getAttendanceColor(percentage)}`}
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-full -translate-y-10 translate-x-10"></div>
                    <div className="relative">
                      <div className="font-bold text-base mb-2">{subject}</div>
                      <div className="text-4xl font-black mb-2">{percentage}%</div>
                      <div className="w-full bg-white/50 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${parseFloat(String(percentage).replace('%', ''))}%` }}
                          transition={{ delay: index * 0.2, duration: 1 }}
                          className="h-2 bg-current rounded-full"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Enhanced Active Alerts */}
        {activeAlerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-amber-100/50 to-orange-100/50 rounded-full -translate-y-16 -translate-x-16"></div>
            <div className="relative">
              <div className="flex items-center gap-4 mb-8">
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  animate={{ pulse: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg"
                >
                  <Bell className="text-white" size={24} />
                </motion.div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-slate-800">Active Alerts</h2>
                  <p className="text-slate-600">Attendance issues requiring attention</p>
                </div>
                <motion.span 
                  whileHover={{ scale: 1.1 }}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-full text-sm font-bold shadow-lg"
                >
                  {activeAlerts.length} Alert{activeAlerts.length > 1 ? 's' : ''}
                </motion.span>
              </div>

              <div className="space-y-6">
                {activeAlerts.map((record, index) => (
                  <motion.div
                    key={`${record.date}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-r from-white to-blue-50 rounded-3xl p-6 border-2 border-blue-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-100/30 to-purple-100/30 rounded-full -translate-y-12 translate-x-12"></div>
                    <div className="relative">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex items-center gap-3 text-slate-700">
                              <Calendar size={18} />
                              <span className="font-bold text-lg">{formatDate(record.date)}</span>
                            </div>
                            {getRecordStatusBadge(record)}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="bg-white/70 rounded-2xl p-4 border border-slate-200">
                              <span className="text-slate-500 font-medium">Alerted:</span>
                              <div className="text-slate-700 font-semibold mt-1">{formatTimestamp(record.alertTimestamp)}</div>
                            </div>
                            <div className="flex gap-6">
                              <div className="flex items-center gap-2">
                                <span className="text-slate-500 font-medium">FA:</span>
                                {record.faApproved ? (
                                  <Check size={16} className="text-emerald-600" />
                                ) : (
                                  <Clock size={16} className="text-amber-600" />
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-slate-500 font-medium">AA:</span>
                                {record.aaApproved ? (
                                  <Check size={16} className="text-emerald-600" />
                                ) : (
                                  <Clock size={16} className="text-amber-600" />
                                )}
                              </div>
                            </div>
                          </div>

                          {record.reason && record.reason !== '—' ? (
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border-2 border-blue-200">
                              <span className="text-blue-600 text-sm font-bold">Submitted Reason:</span>
                              <p className="text-slate-700 mt-2 font-medium">{record.reason}</p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <motion.div 
                                animate={{ pulse: [1, 1.05, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-4"
                              >
                                <span className="text-amber-700 font-bold flex items-center gap-2">
                                  <AlertTriangle size={16} />
                                  Reason Required
                                </span>
                              </motion.div>
                              <div className="space-y-3">
                                <textarea
                                  value={reasonInputs[record.date] || ''}
                                  onChange={(e) => setReasonInputs(prev => ({
                                    ...prev,
                                    [record.date]: e.target.value
                                  }))}
                                  placeholder="Please provide a detailed reason for your absence..."
                                  className="w-full p-4 border-2 border-slate-300 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 resize-none transition-all duration-300 bg-white/80 backdrop-blur-sm font-medium"
                                  rows={4}
                                />
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => submitReason(record.date, reasonInputs[record.date] || '')}
                                  disabled={processingActions.has(`submit-${record.date}`) || !reasonInputs[record.date]?.trim()}
                                  className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl shadow-blue-200 font-bold"
                                >
                                  {processingActions.has(`submit-${record.date}`) ? (
                                    <motion.div
                                      animate={{ rotate: 360 }}
                                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                    />
                                  ) : (
                                    <Send size={18} />
                                  )}
                                  Submit Reason
                                </motion.button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Enhanced Past Alerts */}
        {pastAlerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-emerald-100/30 to-teal-100/30 rounded-full -translate-y-20 translate-x-20"></div>
            <div className="relative">
              <div className="flex items-center gap-4 mb-8">
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg"
                >
                  <Award className="text-white" size={24} />
                </motion.div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-slate-800">Resolved Alerts</h2>
                  <p className="text-slate-600">Successfully handled attendance issues</p>
                </div>
                <motion.span 
                  whileHover={{ scale: 1.1 }}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full text-sm font-bold shadow-lg"
                >
                  {pastAlerts.length} Resolved
                </motion.span>
              </div>

              <div className="space-y-4">
                {pastAlerts.map((record, index) => (
                  <motion.div
                    key={`${record.date}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02, opacity: 1 }}
                    className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-3xl p-6 border-2 border-emerald-200 opacity-80 hover:opacity-100 transition-all duration-300 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-100/30 to-teal-100/30 rounded-full -translate-y-10 translate-x-10"></div>
                    <div className="relative">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex items-center gap-3 text-slate-700">
                              <Calendar size={16} />
                              <span className="font-bold">{formatDate(record.date)}</span>
                            </div>
                            {getRecordStatusBadge(record)}
                          </div>

                          {record.reason && record.reason !== '—' && (
                            <div className="bg-white/80 rounded-2xl p-4 border-2 border-emerald-200">
                              <span className="text-emerald-600 text-sm font-bold">Reason:</span>
                              <p className="text-slate-700 mt-2 font-medium">{record.reason}</p>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
                            <div className="bg-white/60 rounded-xl p-3">
                              <span className="font-medium">FA Approved:</span>
                              <div className="font-semibold mt-1">{formatTimestamp(record.faTimestamp)}</div>
                            </div>
                            <div className="bg-white/60 rounded-xl p-3">
                              <span className="font-medium">AA Approved:</span>
                              <div className="font-semibold mt-1">{formatTimestamp(record.aaTimestamp)}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Enhanced Empty State */}
        {absentRecords.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-16 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-teal-50/50"></div>
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
              >
                <Target className="text-white" size={40} />
              </motion.div>
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <h3 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
                  Perfect Attendance!
                </h3>
                <p className="text-slate-600 text-lg max-w-md mx-auto">
                  Outstanding! You have no attendance alerts. Your dedication to academic excellence is commendable.
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Enhanced New Alert Modal */}
      <AnimatePresence>
        {showNewAlertModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full p-8 border border-white/30 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-100/30 to-orange-100/30 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative text-center">
                <motion.div
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
                >
                  <Bell className="text-white" size={36} />
                </motion.div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">New Attendance Alert!</h3>
                <p className="text-slate-600 mb-6 text-lg">
                  You have {newAlerts.length} new attendance alert{newAlerts.length > 1 ? 's' : ''} for:
                </p>
                <div className="space-y-3 mb-8">
                  {newAlerts.map((alert, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-4"
                    >
                      <span className="font-bold text-amber-700 text-lg">{formatDate(alert.date)}</span>
                    </motion.div>
                  ))}
                </div>
                <p className="text-slate-600 text-sm mb-8 bg-blue-50 rounded-2xl p-4 border border-blue-200">
                  Please review your alerts below and submit reasons if required.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={acknowledgeNewAlerts}
                  className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 shadow-xl shadow-blue-200 font-bold text-lg"
                >
                  <CheckCircle size={24} />
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
