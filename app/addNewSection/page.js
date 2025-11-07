"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { db } from '../../lib/firebase.js'; // Using your existing Firebase setup
import { doc, setDoc } from 'firebase/firestore';
import { UploadCloud, FileText, XCircle, CheckCircle } from 'lucide-react';

// The main component for adding a new section's data
export default function AddNewSection() {
    // --- STATE MANAGEMENT ---
    const [section, setSection] = useState('');
    const [file, setFile] = useState(null);
    const [logs, setLogs] = useState([]);
    const [status, setStatus] = useState('Waiting for a file...');
    const [isProcessing, setIsProcessing] = useState(false);
    const logContainerRef = useRef(null);

    // --- SCRIPT & LOGGING UTILITIES ---
    // Load parsing libraries from a CDN dynamically to bypass build issues.
    useEffect(() => {
        const scripts = [
            { id: 'papaparse-script', src: 'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js' },
            { id: 'xlsx-script', src: 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js' }
        ];

        scripts.forEach(scriptInfo => {
            if (!document.getElementById(scriptInfo.id)) {
                const script = document.createElement('script');
                script.id = scriptInfo.id;
                script.src = scriptInfo.src;
                script.async = true;
                document.body.appendChild(script);
            }
        });

        return () => {
            // Clean up the scripts when the component unmounts
            scripts.forEach(scriptInfo => {
                const scriptElement = document.getElementById(scriptInfo.id);
                if (scriptElement) {
                    document.body.removeChild(scriptElement);
                }
            });
        };
    }, []);

    // A helper function to add new entries to the log display
    const addLog = (message, type = 'info') => {
        setLogs(prevLogs => [...prevLogs, { message, type, timestamp: new Date().toLocaleTimeString() }]);
    };

    // Auto-scroll the log container to the bottom when new logs are added
    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs]);

    // --- FILE HANDLING (with react-dropzone) ---
    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            const selectedFile = acceptedFiles[0];
            setFile(selectedFile);
            addLog(`File selected: ${selectedFile.name}`, 'info');
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false
        // The 'accept' property has been removed to allow any file type.
    });
    
    // --- FILE PARSING LOGIC ---
    // This function now handles both CSV and Excel files.
    const parseSpreadsheet = (fileToParse) => {
        return new Promise((resolve, reject) => {
            const fileExtension = fileToParse.name.split('.').pop().toLowerCase();

            if (fileExtension === 'csv') {
                if (typeof window.Papa === 'undefined') return reject(new Error('CSV parser not loaded.'));
                window.Papa.parse(fileToParse, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => resolve(results.data),
                    error: (err) => reject(new Error(`CSV Parsing Error: ${err.message}`))
                });
            } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
                if (typeof window.XLSX === 'undefined') return reject(new Error('Excel parser not loaded.'));
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = e.target.result;
                        const workbook = window.XLSX.read(data, { type: 'array' });
                        const sheetName = workbook.SheetNames[0];
                        const worksheet = workbook.Sheets[sheetName];
                        const json = window.XLSX.utils.sheet_to_json(worksheet);
                        resolve(json);
                    } catch (err) {
                        reject(new Error(`Excel Parsing Error: ${err.message}`));
                    }
                };
                reader.onerror = () => reject(new Error('Error reading the file.'));
                reader.readAsArrayBuffer(fileToParse);
            } else {
                reject(new Error(`Unsupported file type: .${fileExtension}. Please upload a CSV or Excel file.`));
            }
        });
    };

    // --- MAIN PROCESSING LOGIC ---
    const handleProcessFile = async () => {
        if (!file) { addLog('Error: No file selected.', 'error'); return; }
        if (!section.trim()) { addLog('Error: Section name is required.', 'error'); return; }

        setIsProcessing(true);
        setStatus('Processing... Please wait.');
        setLogs([]);
        addLog(`Starting file processing for section: ${section.toUpperCase()}`, 'info');

        try {
            const data = await parseSpreadsheet(file);
            const totalRows = data.length;
            addLog(`Found ${totalRows} student records in the file.`, 'info');

            const processedFAs = new Set();

            for (let i = 0; i < totalRows; i++) {
                const row = data[i];
                setStatus(`Processing student ${i + 1} of ${totalRows}...`);

                const regNo = row['Reg. No']?.toString().trim();
                if (!regNo) {
                    addLog(`Skipping row ${i + 2}: 'Reg. No' is missing.`, 'warn');
                    continue;
                }

                const studentData = {
    name: row['Name']?.trim() || '',
    regNo: regNo,
    email: row['Stu.Email']?.trim() || '',
    section: section.toUpperCase(),
    phoneNumber: row['Stu.Mobile']?.toString().trim() || '',
    parentEmail: row['Parent Email']?.trim() || '',
    fatherMobile: row['Parent Mobile']?.toString().trim() || '',
    'FA name': row['FA Name']?.trim() || '',
    faEmail: row['FA Email id']?.trim() || '',
    'AA name': row['AA Name']?.trim() || '',
    aaEmail: row['AA Email id']?.trim() || '',
};


                try {
                    await setDoc(doc(db, "User", regNo), studentData, { merge: true });
                    addLog(`[User] Upserted: ${regNo} - ${studentData.name}`, 'success');
                } catch (error) {
                    addLog(`[User] FAILED to upsert ${regNo}: ${error.message}`, 'error');
                }

                // === Handle FA entry in UsersLogin ===
const faEmail = row['FA Email id']?.trim();
const faName = row['FA Name']?.trim();
if (faEmail && !processedFAs.has(faEmail)) {
    const faData = {
        SecRole: "FA",
        name: faName || faEmail.split('@')[0],
        role: "teacher",
        section: section.toUpperCase(),
    };
    try {
        await setDoc(doc(db, "UsersLogin", faEmail), faData, { merge: true });
        addLog(`[UsersLogin] Upserted FA: ${faEmail}`, 'success');
        processedFAs.add(faEmail);
    } catch (error) {
        addLog(`[UsersLogin] FAILED to upsert FA ${faEmail}: ${error.message}`, 'error');
    }
}

// === Handle AA entry in UsersLogin ===
const aaEmail = row['AA Email id']?.trim();
const aaName = row['AA Name']?.trim();
if (aaEmail && !processedFAs.has(aaEmail)) {
    const aaData = {
        SecRole: "AA",
        name: aaName || aaEmail.split('@')[0],
        role: "teacher",
        email: aaEmail,
    };
    try {
        await setDoc(doc(db, "UsersLogin", aaEmail), aaData, { merge: true });
        addLog(`[UsersLogin] Upserted AA: ${aaEmail}`, 'success');
        processedFAs.add(aaEmail);
    } catch (error) {
        addLog(`[UsersLogin] FAILED to upsert AA ${aaEmail}: ${error.message}`, 'error');
    }
}

                await new Promise(res => setTimeout(res, 20));
            }
            
            setStatus(`Processing complete! ${totalRows} records processed.`);
            addLog('All operations finished.', 'info');
        } catch (err) {
            addLog(`Fatal Error: ${err.message}`, 'error');
            setStatus('Error processing file.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="bg-slate-50 p-6 sm:p-8 rounded-2xl shadow-md border border-slate-200 w-full max-w-5xl mx-auto">
            <div className="mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Add New Section Data</h2>
                <p className="mt-2 text-sm text-gray-600">Upload a CSV or Excel file to populate student and faculty advisor data in Firestore.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div>
                        <label htmlFor="section-input" className="block text-sm font-semibold text-gray-700 mb-1">Section Name</label>
                        <input
                            type="text"
                            id="section-input"
                            value={section}
                            onChange={(e) => setSection(e.target.value.toUpperCase())}
                            placeholder="e.g., N2"
                            className="block w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            disabled={isProcessing}
                        />
                    </div>

                    <div {...getRootProps()} className={`relative flex flex-col items-center justify-center w-full p-8 text-center border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300 ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white hover:bg-gray-50'}`}>
                        <input {...getInputProps()} />
                        <UploadCloud className="w-12 h-12 text-gray-400 mb-3" />
                        <p className="text-gray-600">{isDragActive ? "Drop the file here!" : "Drag & drop a file here, or click to select"}</p>
                    </div>

                    {file && (
                        <div className="flex items-center justify-between p-3 bg-gray-100 border border-gray-200 rounded-md">
                            <div className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-gray-500" />
                                <span className="text-sm font-medium text-gray-800">{file.name}</span>
                            </div>
                            <button onClick={() => setFile(null)} disabled={isProcessing}>
                                <XCircle className="w-5 h-5 text-gray-400 hover:text-red-500" />
                            </button>
                        </div>
                    )}

                    <button
                        onClick={handleProcessFile}
                        disabled={!file || !section || isProcessing}
                        className="w-full py-3 px-4 font-semibold text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? 'Processing...' : 'Process File'}
                    </button>
                </div>

                <div className="flex flex-col">
                     <h3 className="text-lg font-semibold text-gray-900">Processing Log</h3>
                     <p id="status" className="mt-1 text-sm text-gray-600 font-medium">{status}</p>
                    <div ref={logContainerRef} className="mt-4 flex-grow p-4 text-sm bg-gray-800 text-gray-300 rounded-md shadow-inner overflow-y-auto h-64 lg:h-auto">
                        {logs.length === 0 && <span className="text-gray-500">Log entries will appear here...</span>}
                        {logs.map((log, index) => (
                            <div key={index} className="flex items-start gap-2 mb-1 font-mono">
                                {log.type === 'success' && <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />}
                                {log.type === 'error' && <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />}
                                <span className={`flex-grow ${
                                    log.type === 'success' ? 'text-green-300' :
                                    log.type === 'error' ? 'text-red-300' :
                                    log.type === 'warn' ? 'text-yellow-300' : 'text-gray-300'
                                }`}>
                                    <span className="text-gray-500 mr-2">{log.timestamp}</span>
                                    {log.message}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

