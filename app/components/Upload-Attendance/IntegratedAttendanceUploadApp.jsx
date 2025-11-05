"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Upload, CheckCircle, FileText, AlertCircle, ArrowLeft, Home, Sparkles, Zap, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AttendanceUploadApp() {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [isDragOver, setIsDragOver] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusHistory, setStatusHistory] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleFileSelect = (selectedFile) => {
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setUploadStatus('idle');
      setUploadProgress(0);
    } else {
      alert('Please select a valid PDF file.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFileSelect(droppedFile);
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragOver(false); };
  const handleFileInputChange = (e) => handleFileSelect(e.target.files[0]);

  const simulateUploadProgress = () => new Promise((resolve) => {
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) { clearInterval(interval); resolve(); return 100; }
        return prev + Math.random() * 12;
      });
    }, 150);
  });

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setUploadStatus('uploading');
    setUploadProgress(0);
    setStatusMessage('Starting upload...');
    setStatusHistory([]);
    
    let statusPollInterval = null;
    
    try {
      const formData = new FormData();
      formData.append('pdf', file);
      
      // Start progress simulation
      const progressPromise = simulateUploadProgress();
      
      // Create a job ID for status tracking
      const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      formData.append('jobId', jobId);
      
      // Start polling for status
      statusPollInterval = setInterval(async () => {
        try {
          const statusResponse = await fetch(`/api/upload-attendance-status?jobId=${jobId}`);
          if (statusResponse.ok) {
            const statusData = await statusResponse.json();
            if (statusData.status) {
              setStatusMessage(statusData.status);
              if (statusData.history) {
                setStatusHistory(statusData.history);
              }
            }
          }
        } catch (err) {
          // Ignore polling errors
        }
      }, 500); // Poll every 500ms
      
      const response = await fetch('/api/upload-attendance', { method: 'POST', body: formData });
      
      if (statusPollInterval) {
        clearInterval(statusPollInterval);
        statusPollInterval = null;
      }
      
      await progressPromise;
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }
      
      const result = await response.json();
      setStatusMessage('Upload completed successfully!');
      setUploadStatus('success');
      setUploadProgress(100);
    } catch (err) {
      console.error('Upload error:', err);
      setStatusMessage(`Error: ${err.message}`);
      setUploadStatus('error');
    } finally {
      if (statusPollInterval) {
        clearInterval(statusPollInterval);
      }
      setIsUploading(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setUploadProgress(0);
    setUploadStatus('idle');
    setIsUploading(false);
    setStatusMessage('');
    setStatusHistory([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-96 h-96 bg-gradient-to-r from-blue-100/30 to-purple-100/30 rounded-full blur-3xl"
          style={{ transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`, transition: 'transform 0.6s ease-out' }}
        />
        <div 
          className="absolute top-1/3 right-0 w-80 h-80 bg-gradient-to-l from-indigo-100/40 to-cyan-100/40 rounded-full blur-3xl"
          style={{ transform: `translate(${mousePosition.x * -0.015}px, ${mousePosition.y * -0.015}px)`, transition: 'transform 0.8s ease-out' }}
        />
      </div>

      <nav className="relative z-50 bg-white/70 backdrop-blur-xl border-b border-white/40 sticky top-0">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button 
              className="flex items-center space-x-3 group transition-all duration-500 hover:scale-105 active:scale-95"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              onClick={() => router.push('/')}
            >
              <div className="relative">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2.5 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:rotate-3">
                  <ArrowLeft className="h-5 w-5 text-white group-hover:-translate-x-0.5 transition-transform duration-300" />
                </div>
                {isHovering && (
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl blur opacity-30 animate-pulse" />
                )}
              </div>
              <div className="group-hover:translate-x-1 transition-transform duration-300">
                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">University Portal</span>
                <p className="text-xs text-slate-500 -mt-1 group-hover:text-blue-500 transition-colors duration-300">Back to Dashboard</p>
              </div>
            </button>
            <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-slate-100/80 to-white/60 rounded-full border border-white/40 backdrop-blur-sm">
              <Home className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-slate-600 font-medium">Attendance Module</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8 py-16">
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full border border-blue-100/60 mb-6">
            <Sparkles className="h-4 w-4 text-blue-500 animate-pulse" />
            <span className="text-sm font-medium text-blue-700">Smart PDF Processing</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-800 leading-tight">Upload <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-pulse"> Attendance</span></h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">Seamlessly process your PDF attendance records with our intelligent system</p>
        </div>

        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-300 via-purple-300 to-indigo-300 rounded-3xl blur opacity-20 group-hover:opacity-40 transition-all duration-500" />
          <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-200/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <div className="relative p-8 md:p-12">
              <div
                className={`relative border-2 border-dashed rounded-2xl p-12 md:p-16 text-center transition-all duration-500 cursor-pointer group/upload ${
                  isDragOver ? 'border-blue-400 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 scale-[1.02] shadow-lg' :
                  file ? 'border-emerald-300 bg-gradient-to-br from-emerald-50/60 to-green-50/60' :
                  'border-slate-300 hover:border-blue-300 hover:bg-gradient-to-br hover:from-slate-50/60 hover:to-blue-50/40 hover:scale-[1.01]'
                } ${isUploading ? 'animate-pulse' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileInputChange} className="hidden" />
                <div className="space-y-8">
                  {!file ? (
                    <>
                      <div className={`mx-auto w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover/upload:scale-110 ${isDragOver ? 'bg-gradient-to-br from-blue-400 to-indigo-500 shadow-lg animate-bounce' : 'bg-gradient-to-br from-slate-100 to-slate-200 group-hover/upload:from-blue-100 group-hover/upload:to-indigo-100'}`}>
                        <Upload className={`h-10 w-10 transition-all duration-500 ${isDragOver ? 'text-white rotate-12' : 'text-slate-500 group-hover/upload:text-blue-600'}`} />
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-2xl md:text-3xl font-bold text-slate-800 group-hover/upload:text-blue-700 transition-colors duration-300">
                          {isDragOver ? "Drop it like it's hot! 🔥" : 'Drop your magic PDF here'}
                        </h3>
                        <p className="text-slate-500 text-lg group-hover/upload:text-slate-600 transition-colors duration-300">or click anywhere to browse your files</p>
                        <div className="flex flex-wrap justify-center gap-2 mt-6">
                          <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium animate-pulse">PDF Only</div>
                          <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">Instant Processing</div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center justify-center space-x-4 animate-fadeIn">
                        <div className="bg-gradient-to-br from-emerald-400 to-green-500 p-4 rounded-2xl shadow-lg animate-bounce">
                          <FileText className="h-8 w-8 text-white" />
                        </div>
                        <div className="text-left space-y-1">
                          <p className="font-bold text-xl text-slate-800">{file.name}</p>
                          <p className="text-emerald-600 font-medium">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready to process</p>
                        </div>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); resetUpload(); }} className="text-slate-500 hover:text-red-500 transition-all duration-300 hover:scale-105 active:scale-95 font-medium">✨ Choose different file</button>
                    </div>
                  )}
                </div>
                {isDragOver && (
                  <div className="absolute inset-0 pointer-events-none">
                    <Star className="absolute top-4 left-4 h-4 w-4 text-blue-400 animate-ping" />
                    <Star className="absolute top-8 right-8 h-3 w-3 text-purple-400 animate-ping" style={{animationDelay: '0.5s'}} />
                    <Star className="absolute bottom-6 left-12 h-5 w-5 text-indigo-400 animate-ping" style={{animationDelay: '1s'}} />
                  </div>
                )}
              </div>

              {isUploading && (
                <div className="mt-10 space-y-6 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                      <span className="text-lg font-semibold text-slate-700">Processing your PDF...</span>
                    </div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{Math.round(uploadProgress)}%</span>
                  </div>
                  <div className="relative w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-full transition-all duration-300 ease-out relative" style={{ width: `${uploadProgress}%` }}>
                      <div className="absolute inset-0 bg-white/30 animate-pulse" />
                    </div>
                  </div>
                  
                  {/* Status Message Display */}
                  {statusMessage && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                      <div className="flex items-start space-x-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent mt-0.5"></div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-blue-900">{statusMessage}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Status History */}
                  {statusHistory.length > 0 && (
                    <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Progress Log:</p>
                      <div className="space-y-1">
                        {statusHistory.slice(-5).map((entry, idx) => (
                          <div key={idx} className={`text-xs p-2 rounded-lg ${
                            entry.type === 'success' ? 'bg-emerald-50 text-emerald-700' :
                            entry.type === 'error' ? 'bg-red-50 text-red-700' :
                            entry.type === 'warning' ? 'bg-amber-50 text-amber-700' :
                            'bg-slate-50 text-slate-600'
                          }`}>
                            {entry.message}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {uploadStatus === 'success' && (
                <div className="mt-10 p-8 bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-3xl animate-fadeIn">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <CheckCircle className="h-16 w-16 text-emerald-500 animate-bounce" />
                      <div className="absolute -inset-2 bg-emerald-400/20 rounded-full animate-ping" />
                    </div>
                    <div className="text-center space-y-2">
                      <h4 className="text-2xl font-bold text-emerald-800">🎉 Upload Successful!</h4>
                      <p className="text-emerald-600 text-lg">Your attendance data is being processed</p>
                    </div>
                  </div>
                </div>
              )}

              {uploadStatus === 'error' && (
                <div className="mt-10 p-8 bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 rounded-3xl animate-fadeIn">
                  <div className="flex items-center justify-center space-x-4">
                    <AlertCircle className="h-12 w-12 text-red-500 animate-pulse" />
                    <div className="text-center">
                      <h4 className="text-xl font-bold text-red-800">Oops! Something went wrong</h4>
                      <p className="text-red-600">Please try again in a moment</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleUpload}
                  disabled={!file || isUploading || uploadStatus === 'success'}
                  className={`group relative px-10 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform ${
                    !file || isUploading || uploadStatus === 'success'
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 hover:scale-105 hover:shadow-2xl active:scale-95'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-3">
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        <span>Processing Magic...</span>
                      </>
                    ) : uploadStatus === 'success' ? (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        <span>Complete!</span>
                      </>
                    ) : (
                      <>
                        <Zap className="h-5 w-5 group-hover:animate-pulse" />
                        <span>Process Attendance</span>
                      </>
                    )}
                  </div>
                  {!(!file || isUploading || uploadStatus === 'success') && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
                  )}
                </button>

                {uploadStatus === 'success' && (
                  <button onClick={resetUpload} className="px-8 py-4 bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 rounded-2xl font-semibold hover:from-slate-200 hover:to-slate-300 transition-all duration-300 hover:scale-105 active:scale-95">✨ Upload Another</button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 text-center space-y-8">
          <div className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-50/80 to-purple-50/80 rounded-full border border-blue-100/60 backdrop-blur-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
            <span className="text-slate-600 font-medium ml-2">Powered by AI</span>
          </div>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">Experience the future of attendance management with intelligent processing and beautiful design</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.6s ease-out forwards; }
      `}</style>
    </div>
  );
}


