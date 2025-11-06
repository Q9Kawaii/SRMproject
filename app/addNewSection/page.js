"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { db } from '../../lib/firebase.js';
import { doc, setDoc } from 'firebase/firestore';
import { UploadCloud, FileText, XCircle, CheckCircle } from 'lucide-react';

export default function AddNewSection() {
const [section, setSection] = useState('');
const [file, setFile] = useState('');
const [logs, setLogs] = useState([]);
const [status, setStatus] = useState('Waiting for a file...');
const [isProcessing, setIsProcessing] = useState(false);
const logContainerRef = useRef(null);

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
scripts.forEach(scriptInfo => {
const scriptElement = document.getElementById(scriptInfo.id);
if (scriptElement) {
document.body.removeChild(scriptElement);
}
});
};
}, []);

const addLog = (message, type = 'info') => {
setLogs(prevLogs => [...prevLogs, { message, type, timestamp: new Date().toLocaleTimeString() }]);
};

useEffect(() => {
if (logContainerRef.current) {
logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
}
}, [logs]);

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
});

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
<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
<div className="bg-white/80 backdrop-blur-xl p-6 sm:p-10 rounded-3xl shadow-2xl border border-white/20 w-full max-w-6xl mx-auto transition-all duration-300 hover:shadow-blue-200/50">
<div className="mb-8">
<h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
Add New Section Data
</h2>
<p className="mt-3 text-base text-gray-600 leading-relaxed">
Upload a CSV or Excel file to populate student and faculty advisor data in Firestore.
</p>
</div>

<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
<div className="space-y-6">
<div className="group">
<label htmlFor="section-input" className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-blue-600">
Section Name
</label>
<input
type="text"
id="section-input"
value={section}
onChange={(e) => setSection(e.target.value.toUpperCase())}
placeholder="e.g., N2"
className="block w-full px-5 py-3 text-gray-900 bg-white/90 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300"
disabled={isProcessing}
/>
</div>

<div 
{...getRootProps()} 
className={`relative flex flex-col items-center justify-center w-full p-10 text-center border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${
isDragActive 
? 'border-blue-500 bg-blue-50/80 scale-105 shadow-lg' 
: 'border-gray-300 bg-gradient-to-br from-gray-50 to-white hover:border-blue-400 hover:bg-blue-50/30 hover:scale-[1.02] shadow-md'
}`}
>
<input {...getInputProps()} />
<div className={`transition-transform duration-300 ${isDragActive ? 'scale-110' : ''}`}>
<UploadCloud className={`w-14 h-14 mx-auto mb-4 transition-colors ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
</div>
<p className="text-gray-700 font-medium">
{isDragActive ? "Drop the file here!" : "Drag & drop a file here"}
</p>
<p className="text-sm text-gray-500 mt-2">or click to browse files</p>
</div>

{file && (
<div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl shadow-sm animate-in slide-in-from-top duration-300">
<div className="flex items-center gap-3">
<div className="p-2 bg-blue-100 rounded-lg">
<FileText className="w-5 h-5 text-blue-600" />
</div>
<span className="text-sm font-semibold text-gray-800">{file.name}</span>
</div>
<button 
onClick={() => setFile(null)} 
disabled={isProcessing}
className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
>
<XCircle className="w-5 h-5 text-gray-500 hover:text-red-500 transition-colors" />
</button>
</div>
)}

<button
onClick={handleProcessFile}
disabled={!file || !section || isProcessing}
className="w-full py-4 px-6 font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed disabled:shadow-none transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
>
{isProcessing ? (
<span className="flex items-center justify-center gap-2">
<svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
</svg>
Processing...
</span>
) : 'Process File'}
</button>
</div>

<div className="flex flex-col bg-gradient-to-br from-gray-50 to-slate-100 rounded-2xl p-6 shadow-inner border border-gray-200">
<h3 className="text-xl font-bold text-gray-900 mb-2">Processing Log</h3>
<div className="flex items-center gap-2 mb-4">
<div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
<p id="status" className="text-sm text-gray-700 font-medium">{status}</p>
</div>
<div 
ref={logContainerRef} 
className="flex-grow p-5 text-sm bg-gradient-to-br from-gray-900 to-slate-800 text-gray-300 rounded-xl shadow-lg overflow-y-auto h-80 lg:h-96 border border-gray-700"
>
{logs.length === 0 && (
<div className="flex flex-col items-center justify-center h-full text-gray-500">
<FileText className="w-12 h-12 mb-3 opacity-50" />
<span>Log entries will appear here...</span>
</div>
)}
{logs.map((log, index) => (
<div 
key={index} 
className="flex items-start gap-3 mb-2 font-mono text-xs leading-relaxed p-2 rounded-lg hover:bg-gray-800/50 transition-colors animate-in fade-in slide-in-from-left duration-200"
>
{log.type === 'success' && <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />}
{log.type === 'error' && <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />}
{log.type === 'warn' && <span className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5 font-bold">⚠</span>}
{log.type === 'info' && <span className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5 font-bold">ℹ</span>}
<span className={`flex-grow ${
log.type === 'success' ? 'text-green-300' :
log.type === 'error' ? 'text-red-300' :
log.type === 'warn' ? 'text-yellow-300' : 'text-gray-300'
}`}>
<span className="text-gray-500 mr-3 font-semibold">[{log.timestamp}]</span>
{log.message}
</span>
</div>
))}
</div>
</div>
</div>
</div>
</div>
);
}
