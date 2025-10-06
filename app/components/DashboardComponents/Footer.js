"use client"
import React from 'react';
// Imports for next/image and next/link are removed to resolve build errors.
import { PlusCircle } from 'lucide-react'; // Import an icon for the button

export default function Footer() {
  return (
    <footer className="relative overflow-hidden mt-12">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-32 h-32 bg-[#3a5b72] rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-pulse delay-500"></div>
      </div>

      {/* Floating Geometric Shapes */}
      <div className="absolute top-4 left-10 w-3 h-3 bg-[#0c4da2] transform rotate-45 animate-bounce delay-300"></div>
      <div className="absolute bottom-4 right-10 w-4 h-4 bg-[#3a5b72] rounded-full animate-bounce delay-700"></div>

      {/* Main Footer Content */}
      <div className="relative z-10 bg-white/80 backdrop-blur-sm border-t border-blue-100 shadow-2xl">
        {/* Top gradient accent */}
        <div className="w-full h-1 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72]"></div>
        
        <div className="p-6 md:px-20 lg:px-40 md:py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            
            {/* Logos Section */}
            <div className="flex items-center gap-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72] rounded-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
                <div className="relative p-3 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100 group-hover:shadow-xl transition-all duration-300">
                  {/* Replaced next/image with standard <img> tag */}
                  <img 
                    src="/SRMlogo.png" 
                    className="h-12 md:h-12 w-auto" 
                    alt="SRM Logo" 
                  />
                </div>
              </div>
              
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72] rounded-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
                <div className="relative p-3 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100 group-hover:shadow-xl transition-all duration-300">
                  {/* Replaced next/image with standard <img> tag */}
                  <img 
                    src="/SAMADHAN transparent english.png" 
                    className="h-12 md:h-16 w-auto" 
                    alt="Samadhan Logo" 
                  />
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              
              <div className="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300">
                <p className="text-[#0c4da2] font-medium text-sm md:text-base">
                  srmportal2025@gmail.com
                </p>
              </div>
            </div>

          </div>

          {/* Bottom Section */}
          <div className="mt-8 pt-6 border-t border-blue-100/50">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              
              {/* Copyright */}
              <div className="text-center md:text-left">
                <p className="text-sm text-gray-600">
                  © 2025 SRM Samadhan. All rights reserved.
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  SRM Institute of Science and Technology
                </p>
              </div>

              {/* Additional Links/Info */}
              <div className="flex items-center gap-6">

                

                <div className="text-center">
                  <p className="text-xs text-[#0c4da2] font-medium">
                    Student Management System
                  </p>
                  <p className="text-xs text-gray-500">
                    Empowering Education
                  </p>
                </div>
                
                <div className="w-8 h-8 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72] rounded-full flex items-center justify-center opacity-60">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

