import Image from 'next/image';
import { LogOut, ArrowLeft } from 'lucide-react';

export default function NavBar({ onHamClick, onLogout }) {
  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="w-full relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-20 w-32 h-32 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-0 left-20 w-24 h-24 bg-[#3a5b72] rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-pulse delay-500"></div>
      </div>

      {/* Floating Geometric Shapes */}
      <div className="absolute top-8 left-10 w-2 h-2 bg-white transform rotate-45 animate-bounce delay-300 opacity-60"></div>
      <div className="absolute top-12 right-32 w-3 h-3 bg-white rounded-full animate-bounce delay-700 opacity-40"></div>

      {/* Top Banner */}
      <div className="relative z-10 flex justify-center items-center text-white h-8 bg-gradient-to-r from-[#0c4da2] via-[#3a5b72] to-[#0c4da2] text-xs text-center font-medium shadow-lg">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span>SAMADHAN – SRM Institute of Science and Technology, Chennai</span>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="relative z-10 bg-white/90 backdrop-blur-sm shadow-xl border-b border-blue-100">
        <div className="flex sm:flex-row justify-between items-center px-6 py-4 gap-4">
          
          {/* Logo Section */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72] rounded-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
              <div className="relative h-12 w-28 overflow-hidden flex justify-center items-center p-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100 group-hover:shadow-xl transition-all duration-300">
                <Image 
                  src="/SRMlogo.png" 
                  width={100} 
                  height={36} 
                  className="h-9 w-auto" 
                  alt="SRM Logo" 
                />
              </div>
            </div>
            
            {/* Brand Text */}
            <div className="hidden md:block">
              <h1 className="text-lg font-bold text-[#0c4da2]">Shine</h1>
              <p className="text-xs text-gray-600">Student Management Portal</p>
            </div>
          </div>
          
          {/* Right side with back button, logout button and hamburger menu */}
          <div className="flex items-center gap-3">
            
            {/* Back Button */}
            <button
              onClick={handleGoBack}
              className="group flex items-center gap-2 px-4 py-3 bg-white/80 backdrop-blur-sm text-[#0c4da2] hover:bg-gradient-to-r hover:from-[#0c4da2] hover:to-[#3a5b72] hover:text-white rounded-xl transition-all duration-300 font-medium text-sm shadow-lg border border-blue-100 hover:shadow-xl transform hover:-translate-y-0.5"
              title="Go Back"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="hidden sm:inline">Back</span>
            </button>
            
            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="group flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm text-[#0c4da2] hover:bg-gradient-to-r hover:from-[#0c4da2] hover:to-[#3a5b72] hover:text-white rounded-xl transition-all duration-300 font-medium text-sm shadow-lg border border-blue-100 hover:shadow-xl transform hover:-translate-y-0.5"
              title="Logout"
            >
              <LogOut size={18} className="group-hover:rotate-12 transition-transform duration-300" />
              <span className="hidden sm:inline">Logout</span>
            </button>
            
            {/* Hamburger Menu */}
            <button
              onClick={onHamClick}
              className="group relative w-12 h-12 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72] rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center"
              title="Menu"
            >
              <div className="flex flex-col gap-1.5">
                <div className="w-6 h-0.5 bg-white rounded-full group-hover:rotate-45 group-hover:translate-y-2 transition-all duration-300"></div>
                <div className="w-6 h-0.5 bg-white rounded-full group-hover:opacity-0 transition-all duration-300"></div>
                <div className="w-6 h-0.5 bg-white rounded-full group-hover:-rotate-45 group-hover:-translate-y-2 transition-all duration-300"></div>
              </div>
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </div>

        {/* Bottom gradient accent */}
        <div className="w-full h-1 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72]"></div>
      </div>
    </div>
  );
}
