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

    export default function AdminAchievementDashboard({ secRole, SectionofFA }) {
        // const router = useRouter(); // Uncomment if using Next.js Pages Router

        const [selectedSearchType, setSelectedSearchType] = useState('regNo'); // 'regNo' | 'section' | 'batch'
        const [searchIdentifier, setSearchIdentifier] = useState(''); // User input for regNo or section
        const [displayMode, setDisplayMode] = useState('approved'); // 'approved' | 'pending' | 'pending_detail'
        const [searchResults, setSearchResults] = useState([]); // Stores fetched student data
        const [selectedCategory, setSelectedCategory] = useState(Object.keys(CATEGORIES_CONFIG)[0]); // Active category for approved view
        const [loading, setLoading] = useState(false);
        const [remarkInput, setRemarkInput] = useState(''); // State for the remarks textbox (for Approve All/Reject All)
        const [individualRemarks, setIndividualRemarks] = useState({}); // State for individual achievement remarks { achievementId: "remark text" }
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
                    const studentAchievementsForCategory = student.achievements && Array.isArray(student.achievements[category])
                        ? student.achievements[category]
                        : [];
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

        const apiCall = useCallback(async (url, data, options = {}) => {
    setLoading(true);
    setError(null);
    try {
        console.log("📤 Sending to:", url);
        console.log("📦 Payload:", data);

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        const responseText = await response.text();
        let responseData;
        try {
            responseData = JSON.parse(responseText);
        } catch (e) {
            console.error("❌ Response not JSON:", responseText);
            throw new Error("Server returned invalid JSON");
        }

        if (!response.ok || !responseData.success) {
            throw new Error(responseData.message || `HTTP error! Status: ${response.status}`);
        }

        // Only show success message if not silenced and message exists
        if (responseData.message && !options.silent) {
            toast.success(responseData.message);
        }

        return responseData;
    } catch (err) {
        console.error("🔥 API Call Error:", err);
        if (!options.silent) {
            setError(err.message || "An unexpected error occurred.");
            toast.error(err.message || "Operation failed!");
        }
        return null;
    } finally {
        setLoading(false);
    }
}, []);

    // No dependencies for apiCall, as it's a generic utility

        const fetchData = useCallback(async () => {
            // Only clear results and set loading if this is a primary fetch operation
            // Not necessary if apiCall already handles loading, but can be useful for initial state
            setSearchResults([]);
            setError(null); // Clear previous errors
            // setLoading(true); // Set loading at the start of fetchData

            let url = '';
            let payload = {};
            let tempResults = [];

            try {
                if (displayMode === 'approved') {
                    if (selectedSearchType === 'regNo' || selectedSearchType === 'section') {
                        const effectiveIdentifier =
  selectedSearchType === "section" && secRole === "FA"
    ? SectionofFA
    : searchIdentifier;

if (!effectiveIdentifier) {
    toast.error(
      `Please enter a ${selectedSearchType === 'regNo' ? 'Registration Number' : 'Section'}.`
    );
    setLoading(false);
    return;
}
url = '/api/get-user-or-section-achievements';
payload = { identifier: effectiveIdentifier, type: selectedSearchType };

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
        const effectiveIdentifier =
            selectedSearchType === "section" && secRole === "FA"
                ? SectionofFA
                : searchIdentifier;

        if (!effectiveIdentifier) {
            toast.error(
              `Please enter a ${selectedSearchType === 'regNo' ? 'Registration Number' : 'Section'}.`
            );
            setLoading(false);
            return;
        }
        url = '/api/get-pending-updates';
        payload = { identifier: effectiveIdentifier, type: selectedSearchType };
        const response = await apiCall(url, payload);
        if (response && response.data) {
            const studentsWithPending = Array.isArray(response.data)
                ? response.data
                : (response.data.pendingItems && response.data.pendingItems.length > 0 ? [response.data] : []);
            tempResults = studentsWithPending.filter(s => s.pendingItems && s.pendingItems.length > 0);
        }
    } else if (selectedSearchType === 'batch') {
                        // For batch pending, fetch all students first, then check each for pending updates
                        const allStudentsResponse = await apiCall('/api/get-all-students-achievements', {});
                        if (allStudentsResponse && allStudentsResponse.data) {
                            const allStudentRegNos = allStudentsResponse.data.map(s => s.regNo);
                            const pendingPromises = allStudentRegNos.map(async (regNo) => {
                                const pendingRes = await apiCall('/api/get-pending-updates', { identifier: regNo, type: 'regNo' },{ silent: true });
                                // Ensure structure matches what filter expects: { regNo, pendingItems: [] }
                                // return pendingRes && pendingRes.data ? pendingRes.data : null;
                                if (pendingRes && pendingRes.success && pendingRes.data && Array.isArray(pendingRes.data.pendingItems)) {
                                    // Only return if there are actual pending items, otherwise null it out.
                                    if (pendingRes.data.pendingItems.length > 0) {
                                        return pendingRes.data; // Return the full student object with pendingItems
                                    }
                                }
                                return null; // Return null if not successful, or no pending items
                                });
                            const pendingResponses = await Promise.all(pendingPromises);
                            tempResults = pendingResponses.filter(res => res !== null); // Filter out the nulls first
                        }
                    }
                }
                setSearchResults(tempResults);

                // Only show 'No data found' if no error occurred and results are truly empty
                if (tempResults.length === 0 && !error) { // The 'error' state might be from a previous apiCall failure
                    // Refine this toast to prevent it from showing when loading is in progress
                    // Or, ensure error is explicitly cleared before this check
                    toast.info('No data found for your search criteria.');
                }

            } catch (err) {
                // Error handling is primarily done by apiCall, so this catch might be redundant
                // but good for safety if something unexpected happens outside apiCall
                setSearchResults([]);
                // setError is already set by apiCall, no need to set here again unless for a specific fetchData error
            } finally {
                setLoading(false); // Ensure loading is turned off at the end of fetchData
            }
        }, [displayMode, selectedSearchType, searchIdentifier, apiCall]); // Keep dependencies that truly change the fetch criteria

        const handleSearch = useCallback((e) => {
            e.preventDefault();
            fetchData();
        }, [fetchData]);

        const handleDisplayModeChange = useCallback((mode) => {
            setDisplayMode(mode);
            setSelectedStudentForPendingView(null);
            setSearchResults([]); // Clear results immediately on mode change
            setRemarkInput(''); // Clear remark input on mode change
            setIndividualRemarks({}); // Clear individual remarks on mode change
            // We will now rely on the `handleSearch` or direct calls to `fetchData`
            // based on user interaction, rather than useEffect automatically re-fetching.
            // If you want it to fetch immediately on mode change AND if search criteria is already valid:
            if (selectedSearchType === 'batch' || searchIdentifier) {
                fetchData();
            }
        }, [selectedSearchType, searchIdentifier, fetchData]); // fetchData is a dependency because we're calling it directly

        const handleStudentCardClick = useCallback((student) => {
            setSelectedStudentForPendingView(student);
            setDisplayMode('pending_detail');
            setRemarkInput(''); // Clear remark input when selecting a new student
            setIndividualRemarks({}); // Clear individual remarks when selecting a new student
        }, []);

        const handleBackToPendingList = useCallback(() => {
            setSelectedStudentForPendingView(null);
            setDisplayMode('pending');
            setRemarkInput(''); // Clear remark input when going back
            setIndividualRemarks({}); // Clear individual remarks when going back
            // Re-fetch pending list after going back
            fetchData();
        }, [fetchData]);

        const handleApproveReject = useCallback(async (actionType) => {
            if (!selectedStudentForPendingView) return;

            // REMARK: Remarks are now optional, so no validation check here.
            // We will still send the remarkInput, even if it's an empty string.

            console.log(`[API] Attempting to ${actionType} pending update for regNo: ${selectedStudentForPendingView.regNo}`);
            const url = actionType === 'approve' ? '/api/approve-pending-update' : '/api/reject-pending-update';
            const payload = {
                regNo: selectedStudentForPendingView.regNo,
                remarks: remarkInput // REMARK: Added remarks to the payload, it can be empty string
            };
            const response = await apiCall(url, payload);
            if (response && response.success) {
                toast.success(`Student's pending achievements ${actionType === 'approve' ? 'approved' : 'rejected'} successfully!`);
                setRemarkInput(''); // Clear the textbox after successful action
                handleBackToPendingList(); // This will re-fetch the list
            }
        }, [selectedStudentForPendingView, remarkInput, apiCall, handleBackToPendingList]); // REMARK: Added remarkInput to dependencies

        // NEW: Handle individual achievement approval/rejection
        const handleIndividualApproveReject = useCallback(async (achievementId, actionType) => {
            if (!selectedStudentForPendingView) return;

            const remark = individualRemarks[achievementId] || '';
            const url = actionType === 'approve' ? '/api/approve-single-achievement' : '/api/reject-single-achievement';
            const payload = {
                regNo: selectedStudentForPendingView.regNo,
                achievementId: achievementId,
                remarks: remark
            };

            const response = await apiCall(url, payload);
            if (response && response.success) {
                toast.success(`Achievement ${actionType === 'approve' ? 'approved' : 'rejected'} successfully!`);
                
                // Remove the remark for this achievement from state
                const updatedRemarks = { ...individualRemarks };
                delete updatedRemarks[achievementId];
                setIndividualRemarks(updatedRemarks);

                // Update the pending items in the selected student view (remove the processed item)
                const updatedPendingItems = selectedStudentForPendingView.pendingItems.filter(
                    item => item.id !== achievementId
                );
                
                // Update the selected student view
                setSelectedStudentForPendingView({
                    ...selectedStudentForPendingView,
                    pendingItems: updatedPendingItems
                });

                // If no more pending items, go back to list
                if (updatedPendingItems.length === 0) {
                    setTimeout(() => {
                        handleBackToPendingList();
                    }, 1000);
                }
            }
        }, [selectedStudentForPendingView, individualRemarks, apiCall, handleBackToPendingList]);

        // NEW: Handle individual remark change
        const handleIndividualRemarkChange = useCallback((achievementId, value) => {
            setIndividualRemarks(prev => ({
                ...prev,
                [achievementId]: value
            }));
        }, []);
        const handleDownloadExcel = useCallback(() => {
            exportAchievementsToExcel(); // Call the internal function
        }, [exportAchievementsToExcel]); // Now depends on the internal function itself

        // This useEffect is fine, it just clears error messages when searchIdentifier or displayMode changes
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
                                {/* <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="searchType"
                                        value="batch"
                                        checked={selectedSearchType === 'batch'}
                                        onChange={() => setSelectedSearchType('batch')}
                                        className="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-gray-700">Batch (All Students)</span>
                                </label> */}
                            </div>
                        </div>

                       <input
  type="text"
  placeholder={selectedSearchType === 'regNo'
    ? 'Enter Registration Number'
    : selectedSearchType === 'section'
      ? 'Enter Section (e.g., A, B)'
      : 'Search not applicable for Batch'}
  value={
    selectedSearchType === 'section' && secRole === 'FA'
      ? SectionofFA || ''
      : searchIdentifier
  }
  onChange={
    selectedSearchType === 'section' && secRole === 'FA'
      ? undefined 
      : (e) => setSearchIdentifier(e.target.value)
  }
  readOnly={selectedSearchType === 'section' && secRole === 'FA'}
  disabled={selectedSearchType === 'batch'}
  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
/>

<div className="flex justify-end mt-2">
    <button
      type="submit"
      disabled={
        (selectedSearchType === 'regNo' && !searchIdentifier.trim()) ||
        (selectedSearchType === 'section' && secRole === 'AA' && !searchIdentifier.trim())
      }
      className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:bg-gray-400"
    >
      Search
    </button>
  </div>

                        
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
                                            className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${selectedCategory === categoryName ? `${config.color} text-white shadow-md` : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                        >
                                            <IconComponent className="h-4 w-4 mr-2" /> {categoryName}
                                        </motion.button>
                                    );
                                })}
                            </motion.div>

                            {/* Download Excel Button */}
                            {(selectedSearchType === 'batch' || selectedSearchType === 'section' || searchIdentifier) && searchResults.length > 0 && (
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleDownloadExcel}
                                    className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-300 flex items-center justify-center gap-2 mb-6 w-full md:w-auto"
                                >
                                    <Download className="h-5 w-5" /> Download All Approved Achievements (Excel)
                                </motion.button>
                            )}


                            {/* Display Approved Achievements by Category */}
                            {searchResults.length > 0 && (
                                <div className="space-y-6">
                                    {searchResults.map((student) => (
                                        <div key={student.regNo} className="bg-white p-6 rounded-lg shadow-md">
                                            <h3 className="text-xl font-bold text-gray-800 mb-4">{student.name} ({student.regNo}) - {student.section}</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {Array.isArray(student.achievements?.[selectedCategory]) &&
    student.achievements?.[selectedCategory]?.length > 0 ? (
                                                    student.achievements[selectedCategory].map((achievement, idx) => (
                                                        <motion.div
                                                            key={achievement.id || idx}
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ duration: 0.3, delay: idx * 0.05 }}
                                                            className="bg-gray-100 p-4 rounded-md shadow-sm"
                                                        >
                                                            <h4 className="font-semibold text-gray-800 mb-2">{CATEGORIES_CONFIG[selectedCategory]?.fields.find(f => f.name === 'Event Name' || f.name === 'Course Name' || f.name === 'Sports Name' || f.name === 'Name of the Membership Body' || f.name === 'Type of Scholarship / Freeship (Merit/Defense)' || f.name === 'Internship Company/University Name' || f.name === 'Paper/Patent Title' || f.name === 'Outreach Title')?.name || 'Achievement'}</h4>
                                                            {CATEGORIES_CONFIG[selectedCategory]?.fields.filter(f => !['Reg Number', 'Student Name', 'Section', 'id'].includes(f.name)).map(field => {
  const value = achievement[field.name];
  return (
    <p key={field.name} className="text-sm text-gray-600">
      <span className="font-medium">{field.name}:</span>{' '}
      {field.type === 'url' && value
        ? (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline break-all"
            >
              {value}
            </a>
          )
        : field.type === 'date'
          ? formatDateToDDMMYYYY(value)
          : value}
    </p>
  );
})}

                                                        </motion.div>
                                                    ))
                                                ) : (
                                                    <p className="col-span-full text-gray-500 italic">No approved {selectedCategory} found for this student.</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* PENDING ACHIEVEMENTS LIST VIEW */}
                    {!loading && !error && displayMode === 'pending' && (
                        <motion.div
                            key="pending-list-view"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Students with Pending Achievements</h2>
                            {searchResults.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {searchResults.map((student) => (
                                        <motion.div
                                            key={student.regNo}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.3 }}
                                            className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-200"
                                            onClick={() => handleStudentCardClick(student)}
                                        >
                                            <div className="flex items-center mb-2">
                                                <Clock className="h-5 w-5 text-orange-500 mr-2" />
                                                <h3 className="text-xl font-semibold text-gray-800">{student.name}</h3>
                                            </div>
                                            <p className="text-gray-600 mb-1">Reg No: {student.regNo}</p>
                                            <p className="text-gray-600">Section: {student.section}</p>
                                            <p className="mt-3 text-sm text-orange-700 font-medium">
    {(student.pendingItems?.length || 0)} Pending Update(s)
    </p>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">No students with pending achievements found for this search criteria.</p>
                            )}
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
                        >
                            <button
                                onClick={handleBackToPendingList}
                                className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
                            >
                                <ArrowLeft className="h-5 w-5 mr-2" /> Back to Pending List
                            </button>

                            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                                Pending Achievements for {selectedStudentForPendingView.name} ({selectedStudentForPendingView.regNo})
                            </h2>

                            {selectedStudentForPendingView.pendingItems && Array.isArray(selectedStudentForPendingView.pendingItems) && selectedStudentForPendingView.pendingItems.length > 0 ? (
                                <>
                                    <div className="space-y-6">
                                        {selectedStudentForPendingView.pendingItems.map((item, index) => (
                                            <motion.div
                                                key={item.id || index}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                                className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500"
                                            >
                                                <p className="text-lg font-semibold mb-2">Category: {item.category}</p>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                                    {Object.entries(item.data).map(([key, value]) => {
      const fieldConfig = CATEGORIES_CONFIG[item.category]?.fields.find(f => f.name === key);
      return (
        <p key={key} className="text-gray-700">
          <span className="font-medium">{key}:</span>{' '}
          {fieldConfig?.type === 'url' && value
            ? (
                <a
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline break-all"
                >
                  {value}
                </a>
              )
            : fieldConfig?.type === 'date'
              ? formatDateToDDMMYYYY(value)
              : value}
        </p>
      );
    })}

                                                </div>
                                                
                                                {/* Individual Achievement Remarks and Action Buttons */}
                                                <div className="mt-4 pt-4 border-t border-gray-200">
                                                    <label htmlFor={`remark-${item.id}`} className="block text-gray-700 text-sm font-semibold mb-2">
                                                        Remarks for this achievement (Optional)
                                                    </label>
                                                    <textarea
                                                        id={`remark-${item.id}`}
                                                        value={individualRemarks[item.id] || ''}
                                                        onChange={(e) => handleIndividualRemarkChange(item.id, e.target.value)}
                                                        placeholder="Enter remarks for this achievement (optional)..."
                                                        rows={2}
                                                        className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm text-gray-800 mb-3"
                                                    />
                                                    
                                                    {/* Individual Approve/Reject Buttons */}
                                                    <div className="flex justify-end gap-3">
                                                        <motion.button
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => handleIndividualApproveReject(item.id, 'approve')}
                                                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-300 flex items-center gap-2 text-sm font-semibold"
                                                            disabled={loading}
                                                        >
                                                            <Check className="h-4 w-4" /> Approve
                                                        </motion.button>
                                                        <motion.button
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => handleIndividualApproveReject(item.id, 'reject')}
                                                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-300 flex items-center gap-2 text-sm font-semibold"
                                                            disabled={loading}
                                                        >
                                                            <X className="h-4 w-4" /> Reject
                                                        </motion.button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                    
                                    {/* Global Approve All / Reject All Section (for convenience) */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: selectedStudentForPendingView.pendingItems.length * 0.05 + 0.1 }}
                                        className="bg-gray-50 p-6 rounded-lg shadow-md mt-6 border-2 border-dashed border-gray-300"
                                    >
                                        <label htmlFor="adminRemarks" className="block text-gray-700 text-lg font-semibold mb-2">
                                            Approve/Reject All Achievements (Optional Remarks)
                                        </label>
                                        <textarea
                                            id="adminRemarks"
                                            value={remarkInput}
                                            onChange={(e) => setRemarkInput(e.target.value)}
                                            placeholder="Enter remarks for all achievements (optional)..."
                                            rows={3}
                                            className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-800"
                                        />
                                        <p className="text-sm text-gray-500 mt-1">These remarks will apply to all remaining achievements when using Approve All or Reject All.</p>

                                        {/* Approve All/Reject All Buttons */}
                                        <div className="flex justify-end gap-4 mt-4">
                                            <motion.button
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleApproveReject('approve')}
                                                className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-300 flex items-center gap-2 text-lg font-semibold"
                                                disabled={loading}
                                            >
                                                <Check className="h-6 w-6" /> Approve All
                                            </motion.button>
                                            <motion.button
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleApproveReject('reject')}
                                                className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-300 flex items-center gap-2 text-lg font-semibold"
                                                disabled={loading}
                                            >
                                                <X className="h-6 w-6" /> Reject All
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                </>
                            ) : (
                                <p className="text-gray-500 italic">No pending achievements for this student.</p>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }