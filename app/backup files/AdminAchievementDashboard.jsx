import React, { useState, useEffect, useCallback } from 'react';
// import { useRouter } from 'next/router'; // Uncomment if using Next.js Pages Router
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import {
    Search, CheckCircle, Clock, BookOpen, Trophy, Star, Users, DollarSign,
    Briefcase, FileText, Heart, Download, ArrowLeft, Check, X
} from 'lucide-react';

// Import Excel related libraries directly
import * as XLSX from 'exceljs';
import { saveAs } from 'file-saver';


const CATEGORIES_CONFIG = {
    'Participations': {
        icon: BookOpen,
        color: 'bg-blue-500',
        fields: [
            { name: 'Reg Number', type: 'text', required: true, disabled: true },
            { name: 'Student Name', type: 'text', required: true, disabled: true },
            { name: 'Section', type: 'text', required: true, disabled: true },
            { name: 'Event Name', type: 'text', required: true },
            { name: 'Technical/Extra-curricular', type: 'text', required: true },
            { name: 'Event Date (DD/MM/YYYY)', type: 'date', required: true },
            { name: 'Organization conducted', type: 'text', required: true },
            { name: 'Place of the event attended', type: 'text', required: true },
            { name: 'Link for Proof of Participation/Prize winner (certificate in PDF only)', type: 'url', required: false, hint: 'Provide a valid URL to the certificate (PDF only)' }
        ]
    },
    'PrizeWinners Technical': {
        icon: Trophy,
        color: 'bg-purple-500',
        fields: [
            { name: 'Reg Number', type: 'text', required: true, disabled: true },
            { name: 'Student Name', type: 'text', required: true, disabled: true },
            { name: 'Section', type: 'text', required: true, disabled: true },
            { name: 'Event Name', type: 'text', required: true },
            { name: 'Event Date (DD/MM/YYYY)', type: 'date', required: true },
            { name: 'Organization conducted', type: 'text', required: true },
            { name: 'Place of the event attended', type: 'text', required: true },
            { name: 'National / International', type: 'text', required: false },
            { name: 'Prize (First/Sec/..)', type: 'text', required: true },
            { name: 'Prize Amount', type: 'number', required: false },
            { name: 'Link for Proof of Participation/Prize winner (certificate in PDF only)', type: 'url', required: false, hint: 'Provide a valid URL to the certificate (PDF only)' }
        ]
    },
    'PrizeWinners Extra Curricular': {
        icon: Star,
        color: 'bg-pink-500',
        fields: [
            { name: 'Reg Number', type: 'text', required: true, disabled: true },
            { name: 'Student Name', type: 'text', required: true, disabled: true },
            { name: 'Section', type: 'text', required: true, disabled: true },
            { name: 'Event Name', type: 'text', required: true },
            { name: 'Event Date (DD/MM/YYYY)', type: 'date', required: true },
            { name: 'Organization conducted', type: 'text', required: true },
            { name: 'Place of the event attended', type: 'text', required: true },
            { name: 'National / International', type: 'text', required: false },
            { name: 'Prize (First/Sec/..)', type: 'text', required: true },
            { name: 'Prize Amount', type: 'number', required: false },
            { name: 'Link for Proof of Participation/Prize winner (certificate in PDF only)', type: 'url', required: false, hint: 'Provide a valid URL to the certificate (PDF only)' }
        ]
    },
    'Online Courses': {
        icon: BookOpen,
        color: 'bg-green-500',
        fields: [
            { name: 'Reg Number', type: 'text', required: true, disabled: true },
            { name: 'Student Name', type: 'text', required: true, disabled: true },
            { name: 'Section', type: 'text', required: true, disabled: true },
            { name: 'Name of the Course Platform', type: 'text', required: true },
            { name: 'Course Name', type: 'text', required: true },
            { name: 'Date (DD/MM/YYYY)', type: 'date', required: true },
            { name: 'Link for Proof of Certificate (Pdf only)', type: 'url', required: false, hint: 'Provide a valid URL to the certificate (PDF only)' }
        ]
    },
    'Sports Activities': {
        icon: Trophy,
        color: 'bg-orange-500',
        fields: [
            { name: 'Reg Number', type: 'text', required: true, disabled: true },
            { name: 'Student Name', type: 'text', required: true, disabled: true },
            { name: 'Section', type: 'text', required: true, disabled: true },
            { name: 'Sports Name', type: 'text', required: true },
            { name: 'Event Date (DD/MM/YYYY)', type: 'date', required: true },
            { name: 'Organization Conducted', type: 'text', required: true },
            { name: 'Place of Sport', type: 'text', required: true },
            { name: 'National / International', type: 'text', required: false },
            { name: 'Prize (First/Sec..)', type: 'text', required: false },
            { name: 'Link for Proof of Participation/Prize winner (Certificate in PDF only)', type: 'url', required: false, hint: 'Provide a valid URL to the certificate (PDF only)' }
        ]
    },
    'Membership': {
        icon: Users,
        color: 'bg-indigo-500',
        fields: [
            { name: 'Reg Number', type: 'text', required: true, disabled: true },
            { name: 'Student Name', type: 'text', required: true, disabled: true },
            { name: 'Section', type: 'text', required: true, disabled: true },
            { name: 'Name of the Membership Body', type: 'text', required: true },
            { name: 'Membership ID/Number', type: 'text', required: true },
            { name: 'Membership Type (Student, Professional, Lifetime, etc.)', type: 'text', required: true },
            { name: 'Membership Start Date (DD/MM/YYYY)', type: 'date', required: true },
            { name: 'Membership End Date (DD/MM/YYYY)', type: 'date', required: false },
            { name: 'Link of proof for Membership ( in PDF only)', type: 'url', required: false, hint: 'Provide a valid URL to the certificate (PDF only)' }
        ]
    },
    'Scholarship': {
        icon: DollarSign,
        color: 'bg-yellow-500',
        fields: [
            { name: 'Reg Number', type: 'text', required: true, disabled: true },
            { name: 'Student Name', type: 'text', required: true, disabled: true },
            { name: 'Section', type: 'text', required: true, disabled: true },
            { name: 'Student Mobile Number', type: 'tel', required: false },
            { name: 'Type of Scholarship / Freeship (Merit/Defense)', type: 'text', required: true },
            { name: 'Amount of Scolarship', type: 'number', required: true },
            { name: 'Name of Organization Provide Scholarship', type: 'text', required: true },
            { name: 'Link for the proof of Merit based scholarship (rank certificate in PDF)', type: 'url', required: false, hint: 'Provide a valid URL to the certificate (PDF only)' },
            { name: 'Link for the Proof of Scholarship/Freeship Certificate in PDF', type: 'url', required: false, hint: 'Provide a valid URL to the certificate (PDF only)' }
        ]
    },
    'Internship': {
        icon: Briefcase,
        color: 'bg-teal-500',
        fields: [
            { name: 'Reg Number', type: 'text', required: true, disabled: true },
            { name: 'Student Name', type: 'text', required: true, disabled: true },
            { name: 'Section', type: 'text', required: true, disabled: true },
            { name: 'Internship Company/University Name', type: 'text', required: true },
            { name: 'Duration (in Months)', type: 'number', required: true },
            { name: 'Start Date (DD/MM/YYYY)', type: 'date', required: true },
            { name: 'End Date (DD/MM/YYYY)', type: 'date', required: false },
            { name: 'Mention Paid or Unpaid', type: 'text', required: true },
            { name: 'Salary Amount (in INR)', type: 'number', required: false },
            { name: 'Mode (Online/Offliine)', type: 'text', required: true },
            { name: 'Link of Offer Letter (Certificate in PDF only)', type: 'url', required: false, hint: 'Provide a valid URL to the offer letter/certificate (PDF only)' }
        ]
    },
    'Publication-Patent': {
        icon: FileText,
        color: 'bg-red-500',
        fields: [
            { name: 'Reg Number', type: 'text', required: true, disabled: true },
            { name: 'Student Name', type: 'text', required: true, disabled: true },
            { name: 'Section', type: 'text', required: true, disabled: true },
            { name: 'Paper/Patent Title', type: 'text', required: true },
            { name: 'Patent Number', type: 'text', required: false },
            { name: 'Organization Conducted', type: 'text', required: true },
            { name: 'Month and Year of Publishing', type: 'text', required: true, hint: 'e.g., January 2024' },
            { name: 'Published in Scopus / SCI', type: 'text', required: false },
            { name: 'Impact Factor /SNIP', type: 'text', required: false },
            { name: 'Link of Proof (paper/patent in IPR copy in PDF)', type: 'url', required: false, hint: 'Provide a valid URL to the paper/patent (PDF only)' }
        ]
    },
    'Outreach Activities': {
        icon: Heart,
        color: 'bg-rose-500',
        fields: [
            { name: 'Reg Number', type: 'text', required: true, disabled: true },
            { name: 'Student Name', type: 'text', required: true, disabled: true },
            { name: 'Section', type: 'text', required: true, disabled: true },
            { name: 'Outreach Title', type: 'text', required: true },
            { name: 'Date (DD/MM/YYYY)', type: 'date', required: true },
            { name: 'Organization in which outreach conducted', type: 'text', required: true },
            { name: 'Place where Outreach Conducte', type: 'text', required: true },
            { name: 'Outcome', type: 'text', required: false },
            { name: 'Link for Proof of outreach (certificate and Geotag photo in PDF only)', type: 'url', required: false, hint: 'Provide a valid URL to the certificate/photo (PDF only)' }
        ]
    }
};

export default function AdminAchievementDashboard() {
    // const router = useRouter(); // Uncomment if using Next.js Pages Router

    const [selectedSearchType, setSelectedSearchType] = useState('regNo'); // 'regNo' | 'section' | 'batch'
    const [searchIdentifier, setSearchIdentifier] = useState(''); // User input for regNo or section
    const [displayMode, setDisplayMode] = useState('approved'); // 'approved' | 'pending' | 'pending_detail'
    const [searchResults, setSearchResults] = useState([]); // Stores fetched student data
    const [selectedCategory, setSelectedCategory] = useState(Object.keys(CATEGORIES_CONFIG)[0]); // Active category for approved view
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedStudentForPendingView, setSelectedStudentForPendingView] = useState(null); // Full student object for pending detail

    // --- Utility Functions (moved here) ---

    const formatDateToDDMMYYYY = useCallback((dateValue) => {
        if (!dateValue) return '';

        if (typeof dateValue === 'string' && ((dateValue.includes('-') && dateValue.includes('T')) || dateValue.match(/^\d{4}-\d{2}-\d{2}/))) {
            try {
                const date = new Date(dateValue);
                if (!isNaN(date.getTime())) {
                    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
                }
            } catch (e) {
                console.error("Date parsing error:", e);
            }
        }
        if (typeof dateValue === 'number') {
            const date = new Date(dateValue);
            if (!isNaN(date.getTime())) {
                return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
            }
        }
        return dateValue;
    }, []);

    const exportAchievementsToExcel = useCallback(async () => {
        if (!searchResults || searchResults.length === 0) {
            toast.error('No data to download for current criteria.');
            return;
        }

        const wb = new XLSX.Workbook();

        Object.keys(CATEGORIES_CONFIG).forEach(category => {
            const config = CATEGORIES_CONFIG[category];
            const headers = ['Reg Number', 'Student Name', 'Section', ...config.fields.filter(f => !['Reg Number', 'Student Name', 'Section', 'id'].includes(f.name)).map(f => f.name)];

            const categoryRows = [];

            searchResults.forEach(student => {
                const studentAchievementsForCategory = student.achievements?.[category] || [];
                studentAchievementsForCategory.forEach(achievement => {
                    const rowData = {};
                    rowData['Reg Number'] = student.regNo;
                    rowData['Student Name'] = student.name;
                    rowData['Section'] = student.section;

                    config.fields.forEach(field => {
                        if (!['Reg Number', 'Student Name', 'Section', 'id'].includes(field.name)) {
                            let value = achievement[field.name];
                            if (field.type === 'date' && value) {
                                value = formatDateToDDMMYYYY(value);
                            }
                            rowData[field.name] = value || '';
                        }
                    });
                    categoryRows.push(rowData);
                });
            });

            if (categoryRows.length > 0) {
                const ws = wb.addWorksheet(category);

                const topText = [
                    ['Student Achievements Data - Category: ' + category],
                    ['Generated on: ' + new Date().toLocaleDateString('en-GB')],
                    ['Searched by: ' + (selectedSearchType === 'regNo' ? 'Registration Number' : selectedSearchType === 'section' ? 'Section' : 'All Students') + (searchIdentifier ? ` (${searchIdentifier})` : '')],
                    []
                ];
                ws.addRows(topText);

                ws.addRow(headers);
                ws.getRow(ws.lastRow.number).font = { bold: true };

                categoryRows.forEach(row => {
                    ws.addRow(headers.map(header => row[header]));
                });

                ws.columns.forEach((column, i) => {
                    let maxLength = 0;
                    column.eachCell({ includeEmpty: true }, (cell) => {
                        const columnHeader = headers[i];
                        const cellValue = cell.value ? cell.value.toString() : '';
                        maxLength = Math.max(maxLength, cellValue.length, columnHeader.length);
                    });
                    column.width = maxLength < 12 ? 12 : maxLength + 2;
                });
            }
        });

        if (wb.worksheets.length === 0) {
            toast.error('No approved achievements found for download based on your search criteria in any category.');
            return;
        }

        const fileName = `${selectedSearchType}_${searchIdentifier || 'all'}_achievements_${new Date().toISOString().slice(0, 10)}.xlsx`;
        try {
            const buffer = await wb.xlsx.writeBuffer();
            saveAs(new Blob([buffer], { type: 'application/octet-stream' }), fileName);
            toast.success('Excel file downloaded successfully!');
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            toast.error('Failed to download Excel file.');
        }
    }, [searchResults, selectedSearchType, searchIdentifier, formatDateToDDMMYYYY]); // Added formatDateToDDMMYYYY dependency

    // --- End Utility Functions ---

    const apiCall = useCallback(async (url, data) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const responseData = await response.json();
            if (!response.ok || !responseData.success) {
                throw new Error(responseData.message || `HTTP error! Status: ${response.status}`);
            }
            toast.success(responseData.message || 'Operation successful!');
            return responseData;
        } catch (err) {
            console.error('API Call Error:', err);
            setError(err.message || 'An unexpected error occurred.');
            toast.error(err.message || 'Operation failed!');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchData = useCallback(async () => {
        setSearchResults([]);

        let url = '';
        let payload = {};
        let tempResults = [];

        try {
            if (displayMode === 'approved') {
                if (selectedSearchType === 'regNo' || selectedSearchType === 'section') {
                    if (!searchIdentifier && selectedSearchType !== 'batch') {
                        toast.error(`Please enter a ${selectedSearchType === 'regNo' ? 'Registration Number' : 'Section'}.`);
                        return;
                    }
                    url = '/api/get-user-or-section-achievements';
                    payload = { identifier: searchIdentifier, type: selectedSearchType };
                    const response = await apiCall(url, payload);
                    if (response && response.data) {
                        tempResults = Array.isArray(response.data) ? response.data : [response.data];
                    }
                } else if (selectedSearchType === 'batch') {
                    url = '/api/get-all-students-achievements';
                    payload = {};
                    const response = await apiCall(url, payload);
                    if (response && response.data) {
                        tempResults = response.data;
                    }
                }
            } else if (displayMode === 'pending') {
                if (selectedSearchType === 'regNo' || selectedSearchType === 'section') {
                    if (!searchIdentifier && selectedSearchType !== 'batch') {
                        toast.error(`Please enter a ${selectedSearchType === 'regNo' ? 'Registration Number' : 'Section'}.`);
                        return;
                    }
                    url = '/api/get-pending-updates';
                    payload = { identifier: searchIdentifier, type: selectedSearchType };
                    const response = await apiCall(url, payload);
                    if (response && response.data) {
                        const studentsWithPending = Array.isArray(response.data) ? response.data : [response.data];
                        tempResults = studentsWithPending.filter(s => s.pendingItems && s.pendingItems.length > 0);
                    }
                } else if (selectedSearchType === 'batch') {
                    const allStudentsResponse = await apiCall('/api/get-all-students-achievements', {});
                    if (allStudentsResponse && allStudentsResponse.data) {
                        const allStudentRegNos = allStudentsResponse.data.map(s => s.regNo);
                        const pendingPromises = allStudentRegNos.map(regNo =>
                            apiCall('/api/get-pending-updates', { identifier: regNo, type: 'regNo' })
                        );
                        const pendingResponses = await Promise.all(pendingPromises);
                        tempResults = pendingResponses
                            .filter(res => res && res.data && res.data.pendingItems && res.data.pendingItems.length > 0)
                            .map(res => res.data);
                    }
                }
            }
            setSearchResults(tempResults);

            if (tempResults.length === 0 && !error) {
                toast.info('No data found for your search criteria.');
            }

        } catch (err) {
            setSearchResults([]);
        }
    }, [displayMode, selectedSearchType, searchIdentifier, apiCall, error]);

    const handleSearch = useCallback((e) => {
        e.preventDefault();
        fetchData();
    }, [fetchData]);

    const handleDisplayModeChange = useCallback((mode) => {
        setDisplayMode(mode);
        setSelectedStudentForPendingView(null);
        setSearchResults([]);
        if (selectedSearchType === 'batch' || searchIdentifier) {
            fetchData();
        }
    }, [selectedSearchType, searchIdentifier, fetchData]);

    const handleStudentCardClick = useCallback((student) => {
        setSelectedStudentForPendingView(student);
        setDisplayMode('pending_detail');
    }, []);

    const handleBackToPendingList = useCallback(() => {
        setSelectedStudentForPendingView(null);
        setDisplayMode('pending');
        fetchData();
    }, [fetchData]);

    const handleApproveReject = useCallback(async (actionType) => {
        if (!selectedStudentForPendingView) return;

        const url = actionType === 'approve' ? '/api/approve-pending-update' : '/api/reject-pending-update';
        const payload = { regNo: selectedStudentForPendingView.regNo };

        const response = await apiCall(url, payload);
        if (response && response.success) {
            toast.success(`Student's pending achievements ${actionType === 'approve' ? 'approved' : 'rejected'} successfully!`);
            handleBackToPendingList();
        }
    }, [selectedStudentForPendingView, apiCall, handleBackToPendingList]);

    const handleDownloadExcel = useCallback(() => {
        exportAchievementsToExcel(); // Call the internal function
    }, [exportAchievementsToExcel]); // Now depends on the internal function itself


    useEffect(() => {
        if (selectedSearchType === 'batch' || searchIdentifier) {
             fetchData();
        } else {
             setSearchResults([]);
        }
    }, [selectedSearchType, searchIdentifier, displayMode, fetchData]);

    useEffect(() => {
        setError(null);
    }, [searchIdentifier, displayMode]);

    return (
        <div className="min-h-screen p-6 bg-gray-50 font-sans antialiased">
            <Toaster />

            {/* Search and Filter Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8 p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
            >
                <form onSubmit={handleSearch} className="space-y-4">
                    <div className="flex items-center space-x-4">
                        <label className="text-gray-700 font-semibold text-lg mr-2">Search By:</label>
                        <div className="flex items-center space-x-4">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="searchType"
                                    value="regNo"
                                    checked={selectedSearchType === 'regNo'}
                                    onChange={() => setSelectedSearchType('regNo')}
                                    className="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-gray-700">Reg No</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="searchType"
                                    value="section"
                                    checked={selectedSearchType === 'section'}
                                    onChange={() => setSelectedSearchType('section')}
                                    className="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-gray-700">Section</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="searchType"
                                    value="batch"
                                    checked={selectedSearchType === 'batch'}
                                    onChange={() => setSelectedSearchType('batch')}
                                    className="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-gray-700">Batch (All Students)</span>
                            </label>
                        </div>
                    </div>

                    <input
                        type="text"
                        placeholder={selectedSearchType === 'regNo' ? 'Enter Registration Number' : selectedSearchType === 'section' ? 'Enter Section (e.g., A, B)' : 'Search not applicable for Batch'}
                        value={searchIdentifier}
                        onChange={(e) => setSearchIdentifier(e.target.value)}
                        disabled={selectedSearchType === 'batch'}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    <motion.button
                        type="submit"
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300 flex items-center justify-center gap-2 w-full md:w-auto"
                        disabled={loading || (selectedSearchType !== 'batch' && !searchIdentifier)}
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            <Search className="h-5 w-5" />
                        )}
                        Search
                    </motion.button>
                </form>
            </motion.div>

            {/* Display Mode Toggle Buttons */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="flex justify-center gap-4 mb-8"
            >
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDisplayModeChange('approved')}
                    className={`px-8 py-3 rounded-lg text-lg font-semibold transition-all duration-300 flex items-center gap-2 ${displayMode === 'approved' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                    <CheckCircle className="h-6 w-6" /> Student Achievements
                </motion.button>
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDisplayModeChange('pending')}
                    className={`px-8 py-3 rounded-lg text-lg font-semibold transition-all duration-300 flex items-center gap-2 ${displayMode === 'pending' || displayMode === 'pending_detail' ? 'bg-orange-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                    <Clock className="h-6 w-6" /> Pending Achievements
                </motion.button>
            </motion.div>

            {/* Main Content Area - Conditional Rendering with AnimatePresence */}
            <AnimatePresence mode="wait">
                {loading && (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex justify-center items-center h-48"
                    >
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="ml-4 text-gray-700 text-lg">Loading data...</p>
                    </motion.div>
                )}

                {error && !loading && (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex justify-center items-center h-48 text-red-600 text-lg font-semibold"
                    >
                        Error: {error}
                    </motion.div>
                )}

                {!loading && !error && searchResults.length === 0 && (selectedSearchType === 'batch' || searchIdentifier) && (
                    <motion.div
                        key="no-data"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex justify-center items-center h-48 text-gray-600 text-lg"
                    >
                        No achievements found for this search.
                    </motion.div>
                )}

                {/* APPROVED ACHIEVEMENTS VIEW */}
                {!loading && !error && searchResults.length > 0 && displayMode === 'approved' && (
                    <motion.div
                        key="approved-view"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Category Navigation Bar */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="flex flex-wrap gap-2 mb-6 p-4 bg-white rounded-lg shadow-md overflow-x-auto custom-scrollbar"
                        >
                            {Object.keys(CATEGORIES_CONFIG).map((categoryName) => {
                                const config = CATEGORIES_CONFIG[categoryName];
                                const IconComponent = config.icon;
                                return (
                                    <motion.button
                                        key={categoryName}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setSelectedCategory(categoryName)}
                                        className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-[1.02] ${selectedCategory === categoryName ? `${config.color} text-white shadow-md transform scale-105` : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                    >
                                        {IconComponent && <IconComponent className="h-4 w-4 mr-1" />}
                                        {categoryName}
                                    </motion.button>
                                );
                            })}
                        </motion.div>

                        {/* Approved Achievements Table */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="bg-white rounded-lg shadow-md overflow-hidden"
                        >
                            <div className="overflow-x-auto max-h-[70vh] relative custom-scrollbar">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Reg Number</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Student Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Section</th>
                                            {CATEGORIES_CONFIG[selectedCategory].fields.filter(f => !['Reg Number', 'Student Name', 'Section', 'id'].includes(f.name)).map(field => (
                                                <th key={field.name} className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{field.name}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {searchResults.flatMap(student => {
                                            const categoryAchievements = student.achievements?.[selectedCategory] || [];
                                            if (categoryAchievements.length === 0) {
                                                return [];
                                            }
                                            return categoryAchievements.map((achievement, idx) => (
                                                <motion.tr
                                                    key={`${student.regNo}-${selectedCategory}-${idx}`}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                                                    className="hover:bg-gray-50 transition-colors duration-150"
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.regNo}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{student.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{student.section}</td>
                                                    {CATEGORIES_CONFIG[selectedCategory].fields.filter(f => !['Reg Number', 'Student Name', 'Section', 'id'].includes(f.name)).map(field => (
                                                        <td key={field.name} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                            {field.type === 'url' && achievement[field.name] ? (
                                                                <a href={achievement[field.name]} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link</a>
                                                            ) : field.type === 'date' && achievement[field.name] ? (
                                                                formatDateToDDMMYYYY(achievement[field.name])
                                                            ) : (
                                                                achievement[field.name] || 'N/A'
                                                            )}
                                                        </td>
                                                    ))}
                                                </motion.tr>
                                            ));
                                        })}
                                        {searchResults.length > 0 && searchResults.every(s => !(s.achievements && s.achievements[selectedCategory] && s.achievements[selectedCategory].length > 0)) && (
                                            <tr>
                                                <td colSpan={CATEGORIES_CONFIG[selectedCategory].fields.length + 3} className="px-6 py-4 text-center text-gray-500">
                                                    No achievements found for the "{selectedCategory}" category in this search.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>

                        {/* Download Button for Approved View */}
                        {(selectedSearchType === 'section' || selectedSearchType === 'batch') && searchResults.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.5 }}
                                className="mt-8 text-center"
                            >
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleDownloadExcel}
                                    className="px-8 py-4 bg-green-600 text-white rounded-lg text-lg font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-300 flex items-center justify-center gap-3 mx-auto"
                                    disabled={loading}
                                >
                                    <Download className="h-6 w-6" /> Download All Approved Data
                                </motion.button>
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {/* PENDING ACHIEVEMENTS LIST VIEW */}
                {!loading && !error && searchResults.length > 0 && displayMode === 'pending' && (
                    <motion.div
                        key="pending-list-view"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {searchResults.map((student) => (
                            <motion.div
                                key={student.regNo}
                                whileHover={{ scale: 1.02, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleStudentCardClick(student)}
                                className="bg-white rounded-lg shadow-md p-6 cursor-pointer border-l-4 border-orange-500 transition-all duration-300"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                            >
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">{student.name}</h3>
                                <p className="text-gray-600">Reg No: <span className="font-medium text-gray-800">{student.regNo}</span></p>
                                <p className="text-gray-600">Section: <span className="font-medium text-gray-800">{student.section}</span></p>
                                <p className="mt-4 text-sm font-medium text-orange-600">
                                    <span className="font-bold text-lg mr-1">{student.pendingItems?.length || 0}</span> Pending Achievement(s)
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* PENDING ACHIEVEMENTS DETAIL VIEW */}
                {!loading && !error && displayMode === 'pending_detail' && selectedStudentForPendingView && (
                    <motion.div
                        key="pending-detail-view"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.5 }}
                        className="p-6 bg-white rounded-lg shadow-md"
                    >
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={handleBackToPendingList}
                            className="mb-6 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-200 flex items-center gap-2"
                        >
                            <ArrowLeft className="h-5 w-5" /> Back to Pending List
                        </motion.button>

                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            Pending Achievements for {selectedStudentForPendingView.name} ({selectedStudentForPendingView.regNo})
                        </h2>

                        <div className="flex justify-end gap-4 mb-6">
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleApproveReject('approve')}
                                className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 flex items-center gap-2"
                                disabled={loading}
                            >
                                {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Check className="h-5 w-5" />}
                                Approve All
                            </motion.button>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleApproveReject('reject')}
                                className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 flex items-center gap-2"
                                disabled={loading}
                            >
                                {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <X className="h-5 w-5" />}
                                Reject All
                            </motion.button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {selectedStudentForPendingView.pendingItems.map((item, idx) => {
                                const categoryConfig = CATEGORIES_CONFIG[item.category];
                                return (
                                    <motion.div
                                        key={item.id || idx}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: idx * 0.08 }}
                                        whileHover={{ scale: 1.01, boxShadow: '0 5px 10px -3px rgba(0,0,0,0.1)' }}
                                        className="bg-gray-50 rounded-lg p-6 shadow-sm border border-gray-200 relative overflow-hidden"
                                    >
                                        <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-semibold rounded-bl-lg text-white ${categoryConfig.color}`}>
                                            {item.category}
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-2 mt-2">{item.data['Achievement Name'] || item.data['Event Name'] || item.data['Course Name'] || 'Untitled Achievement'}</h3>
                                        <p className="text-sm text-gray-500 mb-4">Submitted on: {formatDateToDDMMYYYY(item.submissionDate)}</p>

                                        <div className="space-y-2 text-sm text-gray-700">
                                            {categoryConfig.fields.filter(f => !['Reg Number', 'Student Name', 'Section', 'id'].includes(f.name)).map(field => (
                                                <div key={field.name}>
                                                    <span className="font-medium">{field.name}: </span>
                                                    {field.type === 'url' && item.data[field.name] ? (
                                                        <a href={item.data[field.name]} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link</a>
                                                    ) : field.type === 'date' && item.data[field.name] ? (
                                                        formatDateToDDMMYYYY(item.data[field.name])
                                                    ) : (
                                                        item.data[field.name] || 'N/A'
                                                    )}
                                                </div>
                                            ))}
                                            <div className="mt-4 pt-2 border-t border-gray-200">
                                                <span className="font-medium">Status: </span>
                                                <span className="font-bold text-blue-600">{item.status || 'Pending Approval'}</span>
                                            </div>
                                            {item.notes && (
                                                <div>
                                                    <span className="font-medium">Admin Notes: </span>
                                                    <span className="text-gray-600 italic">{item.notes}</span>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}