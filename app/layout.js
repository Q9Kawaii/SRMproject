"use client"
import Footer from "./components/DashboardComponents/Footer";
import NavBar from "./components/DashboardComponents/NavBar";
import "./globals.css";
import AuthReset from './components/AuthReset';
import React, { useState } from "react";
import Link from "next/link";
import Image from 'next/image';
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function RootLayout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
  try {
    setMenuOpen(false); // close side menu instantly
    const auth = getAuth();
    await signOut(auth);
    router.replace('/'); // replace prevents back button returning
  } catch (error) {
    console.error('Error signing out:', error);
  }
};



  return (
    <html lang="en">
      <body className="antialiased flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <AuthReset />
        <main className="flex-1 relative">
          <NavBar 
            onHamClick={() => setMenuOpen(prev => !prev)} 
            onLogout={handleLogout}
          />
          
          {/* Optimized Side Menu - Removed conflicting animations */}
          <div
            className={`fixed top-0 right-0 h-full w-80 bg-white/95 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 border-l border-blue-100 ${
              menuOpen ? "translate-x-0" : "translate-x-full"
            }`}
            style={{
              willChange: 'transform',
              backfaceVisibility: 'hidden',
            }}
          >
            {/* Simplified background - removed animated elements during slide */}
            {menuOpen && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-10 w-32 h-32 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
                <div className="absolute bottom-40 left-10 w-24 h-24 bg-[#3a5b72] rounded-full mix-blend-multiply filter blur-xl opacity-15"></div>
              </div>
            )}

            {/* Menu gradient accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72]"></div>
            
            <div className="relative z-10 p-8 flex flex-col justify-between h-full">
              <div>
                {/* Menu Header */}
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72] rounded-full flex items-center justify-center shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-[#0c4da2] relative">
                    Menu
                    <div className="absolute -bottom-1 left-0 w-3/4 h-0.5 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72] rounded-full"></div>
                  </h2>
                </div>

                {/* Menu Items - Simplified hover effects */}
                <ul className="space-y-4">
                  
                  <li>
                    <Link 
                      href="/AboutUs"
                      className="group flex items-center gap-4 p-4 bg-white/80 rounded-xl shadow-md border border-blue-100 hover:shadow-lg hover:bg-[#0c4da2] hover:text-white transition-all duration-200"
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72] group-hover:bg-white/20 rounded-full flex items-center justify-center shadow-md transition-all duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <span className="font-semibold text-[#0c4da2] group-hover:text-white transition-colors duration-200">
                        About Us
                      </span>
                    </Link>
                    <Link 
                      href="/demo"
                      className="group flex items-center gap-4 p-4 bg-white/80 rounded-xl shadow-md border border-blue-100 hover:shadow-lg hover:bg-[#0c4da2] hover:text-white transition-all duration-200"
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72] group-hover:bg-white/20 rounded-full flex items-center justify-center shadow-md transition-all duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <span className="font-semibold text-[#0c4da2] group-hover:text-white transition-colors duration-200">
                        Insigsts
                      </span>
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Menu Footer */}
              <div className="space-y-4">
                {/* Logo Section */}
                <div className="bg-white/80 rounded-2xl p-6 border border-blue-100 shadow-md text-center">
                  <Image 
                    src="/SAMADHAN transparent english.png" 
                    width={120} 
                    height={80} 
                    className="h-16 w-auto mx-auto" 
                    alt="Samadhan Logo" 
                  />
                  <p className="text-xs text-gray-600 mt-3 font-medium">
                    Student Management System
                  </p>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-full p-3 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Close Menu
                </button>
              </div>
            </div>
          </div>

          {/* Simplified Overlay */}
          {menuOpen && (
            <div
              className="fixed inset-0 bg-black/40 z-40 transition-opacity duration-300"
              onClick={() => setMenuOpen(false)}
            />
          )}

          <div className="relative">
            {children}
          </div>
        </main>
        <Footer/>
      </body>
    </html>
  );
}
