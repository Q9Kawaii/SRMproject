"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Award, Plus, ChevronDown, ChevronUp, Calendar, MapPin, Building, ExternalLink, Upload, Check, X, BookOpen, Trophy, Users, Briefcase, Star, Shield, DollarSign, FileText, Heart, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';



//Global Date Conversion Functions : 
const convertToInputDate = (dateString) => {
    if (!dateString) return '';
    const parts = dateString.split('/');
    if (parts.length === 3) {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    return dateString;
};



const convertToBackendDate = (dateString) => {
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length === 3) {
        return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
    }
    return dateString;
};

// Configuration for each achievement category, precisely matching Excel column headers
const CATEGORIES_CONFIG = {
  'Participations': {
    icon: BookOpen,
    color: 'bg-gradient-to-r from-blue-500 to-blue-600',
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
    color: 'bg-gradient-to-r from-purple-500 to-purple-600',
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
    color: 'bg-gradient-to-r from-pink-500 to-pink-600',
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
    color: 'bg-gradient-to-r from-green-500 to-green-600',
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
    color: 'bg-gradient-to-r from-orange-500 to-orange-600',
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
    color: 'bg-gradient-to-r from-indigo-500 to-indigo-600',
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
    color: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
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
    color: 'bg-gradient-to-r from-teal-500 to-teal-600',
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
    color: 'bg-gradient-to-r from-red-500 to-red-600',
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
    color: 'bg-gradient-to-r from-rose-500 to-rose-600',
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

// Individual Input Field Component - Optimized for focus issue
const InputField = ({ fieldConfig, value, onChange, studentInfo }) => {
  const { name, type, required, hint, disabled } = fieldConfig;
  
  const isTextArea = name.toLowerCase().includes('description') || (name.length > 30 && type === 'text');
  
  // Memoize finalValue to prevent unnecessary re-calculation
  const finalValue = useMemo(() => {
    if (name === 'Reg Number') return studentInfo?.regNo || '';
    if (name === 'Student Name') return studentInfo?.name || '';
    if (name === 'Section') return studentInfo?.section || '';
    return value || '';
  }, [name, value, studentInfo]); // Dependencies ensure it updates only when needed
  
  // Memoize isDisabled to prevent unnecessary re-calculation
  const isDisabled = useMemo(() => {
    return disabled || ['Reg Number', 'Student Name', 'Section'].includes(name);
  }, [disabled, name]);
  
  // Memoize handleInputChange to prevent unnecessary re-creation on parent re-renders
  const handleInputChange = useCallback((e) => {
    onChange(name, e.target.value);
  }, [name, onChange]); // Dependencies ensure it recreates only if name or onChange changes

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {name}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {isTextArea ? (
        <textarea
          value={finalValue}
          onChange={handleInputChange}
          className={`w-full px-4 py-3 border-0 bg-white/70 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white/90 transition-all duration-300 shadow-lg placeholder-gray-400 ${isDisabled ? 'bg-gray-100/70 cursor-not-allowed' : 'hover:bg-white/80'}`}
          rows="3"
          placeholder={`Enter ${name.toLowerCase()}`}
          disabled={isDisabled}
        />
      ) : (
        <input
          type={type}
          value={finalValue}
          onChange={handleInputChange}
          className={`w-full px-4 py-3 border-0 bg-white/70 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white/90 transition-all duration-300 shadow-lg placeholder-gray-400 ${isDisabled ? 'bg-gray-100/70 cursor-not-allowed' : 'hover:bg-white/80'}`}
          placeholder={`Enter ${name.toLowerCase()}`}
          disabled={isDisabled}
        />
      )}
      
      {hint && (
        <p className="text-xs text-gray-500">
          {hint}
        </p>
      )}
    </div>
  );
};



// Form Card Component - Optimized with useCallback for internal handlers
const FormCard = ({ category, config, isOpen, onToggle, formData, onInputChange, onSubmit, onCancel, loading, studentInfo }) => {
  const IconComponent = config.icon;
  
  // Memoize handleToggle
  const handleToggle = useCallback(() => {
    onToggle(category);
  }, [category, onToggle]);
  
  // Memoize handleSubmit
  const handleSubmit = useCallback(() => {
    onSubmit(category);
  }, [category, onSubmit]);

  const router = useRouter();
  

  
  return (
    <div className="bg-white/60 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 overflow-hidden hover:shadow-2xl hover:bg-white/70 transition-all duration-500">
      <button
        onClick={handleToggle}
        className="w-full p-6 flex items-center justify-between hover:bg-white/20 transition-all duration-300"
      >
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-2xl ${config.color} shadow-lg`}>
            <IconComponent className="h-6 w-6 text-white" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-gray-900">{category}</h3>
          </div>
        </div>
        <div className="flex items-center">
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-gray-600 transition-transform duration-300 transform rotate-180" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-600 transition-transform duration-300" />
          )}
        </div>
      </button>

      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
        isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="p-6 pt-0 border-t border-white/30 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <div className="grid gap-6">
            {config.fields.map((fieldConfig) => (
              <InputField
                key={fieldConfig.name}
                fieldConfig={fieldConfig}
                value={formData[fieldConfig.name]}
                onChange={onInputChange}
                studentInfo={studentInfo}
              />
            ))}
          </div>
        </div>
        
        <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-white/30 p-6">
          <button
            onClick={onCancel}
            className="px-6 py-3 bg-white/60 backdrop-blur-sm border border-white/30 text-gray-700 rounded-xl hover:bg-white/80 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
          >
            {loading ? 'Submitting...' : 'Save Achievement'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
const StudentAchievementsPortal = ({ studentRegNo }) => {
  //... useState declarations ...
  const [studentInfo, setStudentInfo] = useState(null);
  const [achievements, setAchievements] = useState({});
  const [pendingAchievements, setPendingAchievements] = useState({ pendingItems: [], remarks: [] });
  const [activeCategory, setActiveCategory] = useState(null);
  const [editingAchievementId, setEditingAchievementId] = useState(null);  // NEW STATE: To store the ID of the achievement being edited (null for new submission)
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);


  //* 1. Utility functions / simple callbacks :

  // Show Toast Message
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const onInputChange = useCallback((fieldName, value) => {
      setFormData(prev => ({
          ...prev,
          [fieldName]: value
      }));
  }, []);

  // Scrolls to the forms section
  const scrollToForms = useCallback(() => {
    document.getElementById('forms-section')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const onCancel = useCallback(() => {
      setActiveCategory(null);
      setFormData({});
      setEditingAchievementId(null);
      setToast(null); // Clear any toasts
  }, []);

   //* 2. Data fetching functions
  
    // Fetch Student Basic Info
  const fetchStudentInfo = useCallback(async () => {
    if (!studentRegNo) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/get-basic-student-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regNo: studentRegNo })
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setStudentInfo(result.data);
      } else {
        console.error('Error fetching student info:', result.message);
        showToast(`Failed to load student info: ${result.message}`, 'error');
        // Fallback for UI if API fails
        setStudentInfo({ name: "Student Name (N/A)", regNo: studentRegNo, section: "N/A" });
      }
    } catch (error) {
      console.error('Network error fetching student info:', error);
      showToast('Network error fetching student info. Please check your connection.', 'error');
      // Fallback for UI if network fails
      setStudentInfo({ name: "Student Name (N/A)", regNo: studentRegNo, section: "N/A" });
    } finally {
      setLoading(false);
    }
  }, [studentRegNo, showToast]);

  
  // Fetch All Approved Achievements
  const fetchAchievements = useCallback(async () => {
    if (!studentRegNo) return;

    try {
        setLoading(true);
        const response = await fetch('/api/get-user-or-section-achievements', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                identifier: studentRegNo,
                type: 'regNo'
            })
        });
        const result = await response.json();

        if (response.ok && result.success) {
            const rawAchievements = result.data.achievements || {};
            const transformedAchievements = {};

            // Iterate over each category (e.g., "Online Courses", "Participations")
            for (const categoryName in rawAchievements) {
                if (Object.hasOwnProperty.call(rawAchievements, categoryName)) {
                    const categoryData = rawAchievements[categoryName];

                    // Check if categoryData is already an array (e.g., if backend sends it that way for some categories)
                    // If it's an object of objects (like Firestore sub-collections), convert it to an array of values.
                    if (typeof categoryData === 'object' && categoryData !== null && !Array.isArray(categoryData)) {
                        transformedAchievements[categoryName] = Object.values(categoryData);
                    } else if (Array.isArray(categoryData)) {
                        // If it's already an array, use it directly
                        transformedAchievements[categoryName] = categoryData;
                    } else {
                        // Handle unexpected formats, e.g., if it's null or a primitive
                        transformedAchievements[categoryName] = [];
                        console.warn(`Unexpected data format for category "${categoryName}":`, categoryData);
                    }
                }
            }

            setAchievements(transformedAchievements);

        } else {
            console.error('Error fetching achievements:', result.message);
            showToast(`Failed to load achievements: ${result.message}`, 'error');
            setAchievements({});
        }
    } catch (error) {
        console.error('Network error fetching achievements:', error);
        showToast('Network error fetching achievements. Please check your connection.', 'error');
        setAchievements({});
    } finally {
        setLoading(false);
    }
}, [studentRegNo, showToast]); // Removed studentInfo from dependencies

  // Fetch Pending Achievements
  const fetchStudentPendingAchievements = useCallback(async () => {
    if (!studentRegNo) return;
    
    try {
      const response = await fetch('/api/get-pending-updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
        identifier: studentRegNo, // Send studentRegNo as identifier
        type: 'regNo'             // Specify the type as 'regNo'
      })
    });
      const result = await response.json();
      if (response.ok && result.success) {
      // Correctly capture both pendingItems and remarks from the backend response
      setPendingAchievements({
        pendingItems: result.data.pendingItems || [],
        remarks: result.data.remarks || []
      });
    } else {
      if (result.message !== "No pending update found") {
        console.error('Error fetching pending achievements:', result.message);
        showToast(`Failed to load pending achievements: ${result.message}`, 'error');
      } else {
        console.log('No pending achievements found for student (expected).');
      }
      setPendingAchievements({ pendingItems: [], remarks: [] }); // Ensure default empty object on error or no data
    }
  } catch (error) {
    console.error('Network error fetching pending achievements:', error);
    showToast('Network error fetching pending achievements. Please check your connection.', 'error');
    setPendingAchievements({ pendingItems: [], remarks: [] }); // Ensure default empty object on network error
  }
}, [studentRegNo, showToast]);

// And ensure your useEffect calls them distinctly:
useEffect(() => {
    if (typeof studentRegNo === 'string' && studentRegNo.trim() !== '') {
        fetchStudentInfo(); // Handles studentInfo state
        fetchAchievements(); // Handles achievements state
        fetchStudentPendingAchievements(); // Handles pendingAchievements state
    } else {
        setStudentInfo(null);
        setAchievements({});
        setPendingAchievements(null);
    }
}, [studentRegNo, fetchStudentInfo, fetchAchievements, fetchStudentPendingAchievements]);

//* 3. Form toggle/edit logic (requires studentInfo, CATEGORIES_CONFIG)

    // Function to handle opening a specific form for adding a new achievement
  // or editing an existing one
const handleToggleForm = useCallback((category, achievementToEdit = null) => {
    if (activeCategory === category && !achievementToEdit) { // If clicking same category to close, and not editing
        setActiveCategory(null);
        setFormData({});
        setEditingAchievementId(null);
    } else {
        setActiveCategory(category);
        if (achievementToEdit) {
            // Editing an existing achievement: Load its data and ID
            const newFormData = { ...achievementToEdit };

            // **START DATE CONVERSION LOGIC (DD/MM/YYYY to YYYY-MM-DD for input)**
            const configFields = CATEGORIES_CONFIG[category]?.fields || [];
            configFields.forEach(field => {
                if (field.type === 'date' && newFormData[field.name]) {
                    newFormData[field.name] = convertToInputDate(newFormData[field.name]);
                }
            });
            // **END DATE CONVERSION LOGIC**

            setFormData(newFormData);
            setEditingAchievementId(achievementToEdit.id);
            showToast("Now editing your achievement. Submit to save changes for approval.", "info");
        } else {
            // Adding a new achievement: Initialize with student info and generate a new ID
            setFormData({
                'Reg Number': studentInfo?.regNo || studentRegNo,
                'Student Name': studentInfo?.name || '',
                'Section': studentInfo?.section || '',
                id: uuidv4() // Generate unique ID for NEW submissions
            });
            setEditingAchievementId(null); // Ensure editing ID is null for new
        }
    }
}, [activeCategory, studentInfo, studentRegNo, showToast]); // Dependencies for useCallback
  //* 4. Action handlers (that depend on the above)

  // Function to handle editing an approved achievement
const handleEditApprovedAchievement = useCallback((category, achievementData) => {
    // Use the handleToggleForm to open the form pre-filled with existing data
    handleToggleForm(category, achievementData);
    scrollToForms(); // Scroll to the form section
    // Removed toast here as it's now inside handleToggleForm to prevent double toast
}, [handleToggleForm, scrollToForms]);

// Function to handle deleting an approved achievement
const handleDeleteApprovedAchievement = useCallback(async (category, achievementId) => {
    if (!confirm("Are you sure you want to permanently delete this achievement? This action cannot be undone.")) {
        return;
    }

    setLoading(true);
    setToast(null);

    try {
        const response = await fetch('/api/delete-approved-achievement', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                regNo: studentRegNo,
                category: category,
                achievementId: achievementId,
            }),
        });

        const result = await response.json();

        if (response.ok && result.success) {
            showToast("Achievement deleted successfully!", "success");
            fetchAchievements(); // Refresh approved achievements
            fetchStudentPendingAchievements(); // Refresh pending to ensure consistency
        } else {
            showToast(`Deletion failed: ${result.message}`, "error");
        }
    } catch (error) {
        console.error("Deletion error:", error);
        showToast("Network error during deletion. Please try again.", "error");
    } finally {
        setLoading(false);
    }
}, [studentRegNo, showToast, fetchAchievements, fetchStudentPendingAchievements]);

const handleSubmit = useCallback(async (category) => {
    setLoading(true);
    setToast(null);

    const config = CATEGORIES_CONFIG[category];
    const requiredFieldsFilled = config.fields.every(field => {
        if (field.required && !field.disabled) {
            // Special handling for date fields: ensure they are not empty string
            if (field.type === 'date') {
                return formData[field.name] && formData[field.name].trim() !== '';
            }
            return formData[field.name] && String(formData[field.name]).trim() !== '';
        }
        return true;
    });

    // Also ensure the ID is present
    if (!formData.id) {
        showToast("Achievement ID is missing. Please try again.", "error");
        setLoading(false);
        return;
    }

    if (!requiredFieldsFilled) {
        showToast("Please fill in all required fields.", "error");
        setLoading(false);
        return;
    }

    try {
        const achievementDataToSend = { ...formData }; // Clone formData

        // **START DATE CONVERSION LOGIC (YYYY-MM-DD to DD/MM/YYYY for backend)**
        config.fields.forEach(field => {
            if (field.type === 'date' && achievementDataToSend[field.name]) {
                achievementDataToSend[field.name] = convertToBackendDate(achievementDataToSend[field.name]);
            }
        });
        // **END DATE CONVERSION LOGIC**

        // Ensure `id` is explicitly passed as part of achievementData
        achievementDataToSend.id = formData.id; 

        const response = await fetch('/api/submit-pending-achievement', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                regNo: studentRegNo,
                category: category,
                achievementData: achievementDataToSend // Send the converted data
            }),
        });

        const result = await response.json();

        if (response.ok && result.success) {
            showToast("Achievement submitted for approval!", "success");
            setActiveCategory(null); // Close the form
            setFormData({}); // Clear form data
            setEditingAchievementId(null); // Reset editing state
            fetchStudentPendingAchievements(); // Refresh pending list after submission
        } else {
            showToast(`Submission failed: ${result.message}`, "error");
        }
    } catch (error) {
        console.error("Submission error:", error);
        showToast("Network error during submission. Please try again.", "error");
    } finally {
        setLoading(false);
    }
}, [formData, studentRegNo, showToast, CATEGORIES_CONFIG, fetchStudentPendingAchievements]); // Removed activeCategory from dependencies, as it's not directly used in the effect body


const router = useRouter();

// Simple "Go Back" button (no save):
const handleGoBack = useCallback(() => {
  router.back();
}, [router]);

// OR — if you want it to save active form first:
const handleSaveAndGoBack = useCallback(async () => {
  if (!activeCategory) {
    router.back();
    return;
  }
  await handleSubmit(activeCategory);
  setTimeout(() => {
    router.back();
  }, 500);
}, [activeCategory, handleSubmit, router]);

// Function to handle dismissing all remarks
const handleDismissRemarks = useCallback(async () => {
    if (!studentRegNo) return; // Ensure we have a student ID

    setLoading(true); // Show loading state
    setToast(null);    // Clear any existing toast

    try {
        const response = await fetch('/api/dismiss-remark', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ regNo: studentRegNo }), // Send the student's registration number
        });

        const result = await response.json();

        if (response.ok && result.success) {
            showToast("All remarks dismissed!", "success"); // Success message
            fetchStudentPendingAchievements(); // Refresh data to show remarks are gone
        } else {
            showToast(`Failed to dismiss remarks: ${result.message}`, "error"); // Error message
        }
    } catch (error) {
        console.error("Dismiss remarks error:", error);
        showToast("Network error dismissing remarks. Please try again.", "error"); // Network error
    } finally {
        setLoading(false); // End loading state
    }
}, [studentRegNo, showToast, fetchStudentPendingAchievements]); // Dependencies for useCallback

//* 5. useEffect (depends on fetch functions)

  // Load data on mount
  useEffect(() => {
    // Only proceed if studentRegNo is a non-empty string
    if (typeof studentRegNo === 'string' && studentRegNo.trim() !== '') {
      // console.log("useEffect triggered with valid studentRegNo:", studentRegNo); // For debugging
      fetchStudentInfo();
      fetchAchievements();
      fetchStudentPendingAchievements();
    } else {
      // console.log("useEffect skipped: studentRegNo is invalid or not yet available.", studentRegNo); // For debugging
      // You might want to clear states or show a message if regNo becomes invalid
      setStudentInfo(null);
      setAchievements({});
      setPendingAchievements({ pendingItems: [], remarks: [] });
    }
  }, [studentRegNo, fetchStudentInfo, fetchAchievements, fetchStudentPendingAchievements]);

//* 6. Memoized components (use useMemo *after* all data/functions they rely on are defined)

// Sub-component: Basic Info Header (memoized)
  const BasicInfoHeader = useMemo(() => (
    <div className="bg-white/60 backdrop-blur-md rounded-3xl shadow-2xl p-8 mb-8 border border-white/30 animate-fade-in-down">
      <div className="flex items-center space-x-6">
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-2xl shadow-lg">
          <User className="h-8 w-8 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {studentInfo?.name || 'Loading...'}
          </h1>
          <div className="flex items-center space-x-4 text-gray-600">
            <span className="flex items-center">
              <span className="font-semibold">Reg No:</span>
              <span className="ml-2 bg-white/70 backdrop-blur-sm px-3 py-1 rounded-full text-sm shadow-md">{studentInfo?.regNo || 'N/A'}</span>
            </span>
            <span className="flex items-center">
              <span className="font-semibold">Section:</span>
              <span className="ml-2 bg-blue-100/70 backdrop-blur-sm text-blue-800 px-3 py-1 rounded-full text-sm shadow-md">{studentInfo?.section || 'N/A'}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  ), [studentInfo]);


// Sub-component: Remarks Display Card (NEW COMPONENT)
const RemarksCard = ({ remarks, onDismissRemarks, isLoading }) => {
    const [isRemarksExpanded, setIsRemarksExpanded] = useState(true); // Start expanded by default for visibility

    // Only render the card if there are actual remarks to show
    if (!remarks || remarks.length === 0) {
        return null; // Don't render if no remarks
    }

    return (
        <div className="bg-white/60 backdrop-blur-md rounded-3xl shadow-2xl p-8 mb-8 border border-white/30 animate-fade-in">
            <button
                onClick={() => setIsRemarksExpanded(!isRemarksExpanded)}
                className="w-full flex items-center justify-between text-left text-2xl font-bold text-gray-900 mb-4 focus:outline-none hover:bg-white/20 p-4 rounded-2xl transition-all duration-300"
            >
                <div className="flex items-center">
                    {/* Using FileText icon for remarks, you can change it if you prefer MessageSquare or other */}
                    <FileText className="h-7 w-7 text-red-500 mr-3" />
                    Faculty Remarks
                    <span className="ml-3 bg-red-100/70 backdrop-blur-sm text-red-800 px-3 py-1 rounded-full text-base font-semibold shadow-md">
                        {remarks.length} {remarks.length === 1 ? 'remark' : 'remarks'}
                    </span>
                </div>
                {isRemarksExpanded ? (
                    <ChevronUp className="h-6 w-6 text-gray-600 transition-transform duration-300 transform rotate-180" />
                ) : (
                    <ChevronDown className="h-6 w-6 text-gray-600 transition-transform duration-300" />
                )}
            </button>

            {/* Content area that expands/collapses */}
            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
                isRemarksExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
            }`}>
                <p className="text-gray-600 mb-6">
                    Here are the remarks from the faculty regarding your pending achievements.
                </p>
                <div className="space-y-4 max-h-[40vh] overflow-y-auto custom-scrollbar">
                    {remarks.map((remark, index) => (
                        <div key={index} className="bg-red-50/70 backdrop-blur-sm border border-red-200/50 rounded-2xl p-4 shadow-lg flex items-start">
                            {/* Star icon for individual remarks */}
                            <Star className="h-5 w-5 text-red-600 flex-shrink-0 mr-3 mt-1" />
                            <p className="text-gray-800 flex-grow">{remark}</p>
                        </div>
                    ))}
                </div>
                <div className="mt-6 text-right">
                    <button
                        onClick={onDismissRemarks}
                        disabled={isLoading} // Disable button while dismissing
                        className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:from-red-600 hover:to-rose-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
                    >
                        {isLoading ? 'Dismissing...' : 'Dismiss All Remarks'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Sub-component: Pending Achievements Card
const PendingAchievementsCard = ({ pendingAchievements }) => {
  const [isPendingExpanded, setIsPendingExpanded] = useState(false);

  if (!pendingAchievements || pendingAchievements.length === 0) { // Check length for array
    return null;
  }

  return (
    <div className="bg-white/60 backdrop-blur-md rounded-3xl shadow-2xl p-8 mb-8 border border-white/30 animate-fade-in">
      <button
        onClick={() => setIsPendingExpanded(!isPendingExpanded)}
        className="w-full flex items-center justify-between text-left text-2xl font-bold text-gray-900 mb-4 focus:outline-none hover:bg-white/20 p-4 rounded-2xl transition-all duration-300"
      >
        <div className="flex items-center">
          <Clock className="h-7 w-7 text-orange-500 mr-3" />
          Pending Submissions
          <span className="ml-3 bg-orange-100/70 backdrop-blur-sm text-orange-800 px-3 py-1 rounded-full text-base font-semibold shadow-md">
            {pendingAchievements.length} {/* Count array length */}
          </span>
        </div>
        {isPendingExpanded ? (
          <ChevronUp className="h-6 w-6 text-gray-600 transition-transform duration-300 transform rotate-180" />
        ) : (
          <ChevronDown className="h-6 w-6 text-gray-600 transition-transform duration-300" />
        )}
      </button>

      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
        isPendingExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <p className="text-gray-600 mb-6">
          These are your achievements awaiting faculty approval.
        </p>
        <div className="space-y-4 max-h-[40vh] overflow-y-auto custom-scrollbar">
          {pendingAchievements.map((pendingItem) => { // Iterate directly over the array
            const category = pendingItem.category;
            const itemData = pendingItem.data; // The actual achievement data is under 'data'
            const categoryConfig = CATEGORIES_CONFIG[category];
            const IconComponent = categoryConfig?.icon || Award;

            return (
              <div key={itemData.id} className="bg-orange-50/70 backdrop-blur-sm border border-orange-200/50 rounded-2xl p-4 shadow-lg"> {/* Use itemData.id as key */}
                <h4 className="text-lg font-semibold text-orange-800 mb-2 flex items-center">
                  <div className={`p-1 rounded-lg ${categoryConfig?.color || 'bg-gray-500'} mr-2 shadow-md`}>
                    <IconComponent className="h-4 w-4 text-white" />
                  </div>
                  {category}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
                  {Object.entries(itemData).filter(([key]) => // Iterate over itemData, not pendingItem
                    !['Reg Number', 'Student Name', 'Section', 'id', 'submissionDate'].includes(key) // Filter out internal fields
                  ).map(([key, value]) => (
                    <div key={key}>
                      <span className="font-medium">{key}:</span> {value}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Submitted on: {new Date(pendingItem.submissionDate).toLocaleDateString()} {/* Display submissionDate */}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Sub-component: Achievements Display Section
const AchievementsDisplaySection = ({ onEdit, onDelete }) => { // Accept new props
  const hasAchievements = Object.keys(achievements).length > 0;

  if (!hasAchievements) {
    return (
      <div className="bg-white/60 backdrop-blur-md rounded-3xl shadow-2xl p-12 mb-8 text-center border border-white/30 animate-fade-in">
        <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No achievements added yet!</h3>
        <p className="text-gray-600 mb-6">Start showcasing your accomplishments by adding your first achievement.</p>
        <button
          onClick={scrollToForms}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-2xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm"
        >
          <Plus className="h-5 w-5 inline-block mr-2" />
          Add Achievement
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/60 backdrop-blur-md rounded-3xl shadow-2xl p-8 mb-8 border border-white/30 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        <Award className="h-7 w-7 text-blue-500 mr-3" />
        Your Approved Achievements
      </h2>
      <div className="space-y-6">
        {Object.entries(achievements)
          .filter(([_, categoryData]) => Array.isArray(categoryData) && categoryData?.length > 0)
          .map(([category, categoryData]) => {
            const categoryConfig = CATEGORIES_CONFIG[category];
            const IconComponent = categoryConfig?.icon || Award;
            // Ensure categoryData is always treated as an array of items for consistent rendering
            const itemsToDisplay = Array.isArray(categoryData) ? categoryData : [categoryData];

            return (
              <div key={category} className="bg-white/50 backdrop-blur-sm border border-white/30 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:bg-white/60">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <div className={`p-2 rounded-xl ${categoryConfig?.color || 'bg-gray-500'} mr-3 shadow-md`}>
                    <IconComponent className="h-5 w-5 text-white" />
                  </div>
                  {category}
                  <span className="ml-auto bg-white/70 backdrop-blur-sm text-gray-600 px-2 py-1 rounded-full text-sm shadow-md">
                    {itemsToDisplay.length} {itemsToDisplay.length === 1 ? 'item' : 'items'}
                  </span>
                </h3>
                <div className="grid gap-4">
                  {itemsToDisplay.map((achievement, index) => (
                    <div key={achievement.id} className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border-l-4 border-blue-500 animate-fade-in-up relative group shadow-lg"> {/* Added group for hover effect */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {Object.entries(achievement).filter(([key]) =>
                          !['Reg Number', 'Student Name', 'Section', 'id', 'submissionDate'].includes(key) // Filter out internal fields
                        ).map(([key, value]) => (
                          <div key={key} className="text-sm">
                            <span className="font-medium text-gray-700">{key}:</span>
                            <span className="ml-1 text-gray-600">{value}</span>
                          </div>
                        ))}
                      </div>
                      {/* Edit and Delete Buttons */}
                      <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          onClick={() => onEdit(category, achievement)}
                          className="p-1.5 rounded-full bg-blue-100/70 backdrop-blur-sm text-blue-700 hover:bg-blue-200/80 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
                          title="Edit Achievement"
                        >
                          <FileText className="h-4 w-4" /> {/* Or Pencil/Edit icon if you prefer */}
                        </button>
                        <button
                          onClick={() => onDelete(category, achievement.id)}
                          className="p-1.5 rounded-full bg-red-100/70 backdrop-blur-sm text-red-700 hover:bg-red-200/80 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-md"
                          title="Delete Achievement"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
      </div>

    </div>
  );
};

  // Sub-component: Toast Notification
  const Toast = () => {
    if (!toast) return null;

    return (
      <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-full duration-300 ease-out">
        <div className={`flex items-center p-4 rounded-2xl shadow-2xl backdrop-blur-md border border-white/30 ${
          toast.type === 'success'
            ? 'bg-green-500/90 text-white'
            : toast.type === 'info'
            ? 'bg-blue-500/90 text-white'
            : 'bg-red-500/90 text-white'
        }`}>
          {toast.type === 'success' ? (
            <Check className="h-5 w-5 mr-3" />
          ) : (
            <X className="h-5 w-5 mr-3" />
          )}
          <span className="font-medium">{toast.message}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 font-sans">
      <style>
        {`
        /* Custom scrollbar for better aesthetics */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(241, 241, 241, 0.5);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(136, 136, 136, 0.7);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(85, 85, 85, 0.8);
        }

        /* Custom animations */
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-in-down {
          animation: fadeInDown 0.6s ease-out forwards;
        }

        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
        }

        /* Glassmorphism backdrop */
        .glass-bg {
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.18);
        }
        `}
      </style>
      <div className="container mx-auto px-4 py-8 max-w-6xl">

       

        
        {BasicInfoHeader}

        {/* NEW: Remarks Card - Rendered above Pending Submissions */}
      <RemarksCard
        remarks={pendingAchievements?.remarks} // Pass the remarks array from the state
        onDismissRemarks={handleDismissRemarks} // Pass the dismiss function
        isLoading={loading} // Pass loading state to disable the dismiss button
      />

      {/* Existing: Pending Achievements Card - Now accepts a prop */}
      <PendingAchievementsCard
        pendingAchievements={pendingAchievements?.pendingItems} // Pass only the pendingItems array
      />

      <AchievementsDisplaySection
        onEdit={handleEditApprovedAchievement}
        onDelete={handleDeleteApprovedAchievement}
      />

        <div id="forms-section" className="scroll-mt-8">
          <div className="bg-white/60 backdrop-blur-md rounded-3xl shadow-2xl p-8 mb-8 border border-white/30 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Plus className="h-7 w-7 text-green-500 mr-3" />
              Add New Achievement
            </h2>
            <p className="text-gray-600 mb-8">
              Select a category below to add or update your achievement. Only one form can be open at a time.
            </p>

            <div className="space-y-4">
              {Object.entries(CATEGORIES_CONFIG).map(([category, config]) => (
                <FormCard
                  key={category}
                  category={category}
                  config={config}
                  isOpen={activeCategory === category}
                  onToggle={handleToggleForm}
                  formData={formData}
                  onInputChange={onInputChange}
                  onSubmit={handleSubmit}
                  onCancel={onCancel}
                  loading={loading}
                  studentInfo={studentInfo}
                />
              ))}
            </div>
          </div>
        </div>
         {/* Go Back Button (outside everything) */}
      <div className="mb-6">
        <button
          onClick={handleGoBack} // or handleSaveAndGoBack
          className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-700 text-white rounded-xl hover:from-gray-600 hover:to-gray-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
        >
          ← Save and Go Back
        </button>
      </div>
      </div>

      <Toast />
      
    </div>
  );
};

export default StudentAchievementsPortal;

