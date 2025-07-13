"use client";

import Link from "next/link";
import { useState } from "react";
import { 
  Github, 
  ExternalLink, 
  Users, 
  BookOpen, 
  TrendingUp, 
  Mail, 
  CheckCircle, 
  ArrowRight,
  Code,
  Database,
  Shield,
  Zap,
  Clock,
  FileText
} from 'lucide-react';
import ZoomImageModal from "./ZoomImageModal";

export default function ProjectShowcase() {
  const [activeTab, setActiveTab] = useState('overview');
  const [zoomedImage, setZoomedImage] = useState(null);
  const [zoomedAlt, setZoomedAlt] = useState("");


  const features = [
  {
    id: 'attendance',
    title: 'Automated Attendance Warning & Approval',
    description: 'Students receive online alerts for low attendance, submit absence reasons digitally, and get approvals from Faculty Advisor (FA) and Academic Advisor (AA) - all within the portal.',
    beforeAfter: {
      before: 'Paper forms, manual approvals, time-consuming process',
      after: 'Online alerts, digital approvals, instant notifications'
    },
    thumbnail: '/screenshots/attendance-thumb.png',
    flowchart: '/screenshots/attendance-flow.png',
    impact: 'Reduced processing time by 80%'
  },
  {
    id: 'communication',
    title: 'Automated Parent Communication',
    description: 'Faculty can upload a PDF of marks and with one click, send emails to parents of students with low attendance or poor performance.',
    beforeAfter: {
      before: 'Individual emails, manual effort, prone to errors',
      after: 'One-click PDF upload, bulk email automation'
    },
    thumbnail: '/screenshots/parent-comm-thumb.png',
    flowchart: '/screenshots/parent-communication.png',
    impact: 'Saves 5+ hours per month'
  },
  {
    id: 'placement',
    title: 'Placement Matrix Automation',
    description: 'Students fill placement data directly in the portal, and faculty can download the entire batch matrix with a single click.',
    beforeAfter: {
      before: 'Excel sheets, manual data collection, version conflicts',
      after: 'Portal-based forms, instant batch downloads'
    },
    thumbnail: '/screenshots/placement-thumb.png',
    flowchart: '/screenshots/placement-matrix.png',
    impact: 'Eliminated manual data entry errors'
  }
];


  const techStack = [
    { name: 'Next.js', icon: '⚛️', description: 'React framework for production' },
    { name: 'Firebase', icon: '🔥', description: 'Authentication & Database' },
    { name: 'Tailwind CSS', icon: '🎨', description: 'Utility-first CSS framework' },
    { name: 'JavaScript', icon: '💛', description: 'Core programming language' },
    { name: 'Firestore', icon: '🗄️', description: 'NoSQL cloud database' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0c4da2] to-[#3a5b72] text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-20">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">College Automation Project</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              SRM <span className="text-blue-200">Samadhan</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Revolutionizing college administration through digital automation - 
              transforming attendance tracking, parent communication, and placement management
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="#features" 
                className="inline-flex items-center gap-2 bg-white text-[#0c4da2] px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <BookOpen className="w-5 h-5" />
                Explore Features
              </a>
              <Link
              href="/"
              className="inline-flex items-center gap-2 bg-[#0c4da2] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#3a5b72] transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Github className="w-5 h-5" />
              Visit the Page
            </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Project Overview */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Project Overview</h2>
            <p className="text-lg text-gray-600 mb-6">
              As a student at SRM Institute, We identified critical inefficiencies in our college&apos;s administrative processes. 
              Traditional paper-based systems for attendance warnings, parent communications, and placement data collection 
              were time-consuming and error-prone.
            </p>
            <p className="text-lg text-gray-600 mb-8">
              We developed <strong>SRM Samadhan</strong> - a comprehensive digital solution that automates these processes, 
              reducing manual work by 80% and eliminating human errors.
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <div className="text-2xl font-bold text-[#0c4da2]">3</div>
                <div className="text-sm text-gray-600">Core Features</div>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <div className="text-2xl font-bold text-[#0c4da2]">80%</div>
                <div className="text-sm text-gray-600">Time Saved</div>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <div className="text-2xl font-bold text-[#0c4da2]">100%</div>
                <div className="text-sm text-gray-600">Digital</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Tech Stack</h3>
            <div className="grid grid-cols-2 gap-4">
              {techStack.map((tech, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-2xl">{tech.icon}</span>
                  <div>
                    <div className="font-medium text-gray-900">{tech.name}</div>
                    <div className="text-xs text-gray-500">{tech.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div id="features" className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Key Features</h2>
            <p className="text-xl text-gray-600">
              Three major automation solutions that transformed our college processes
            </p>
          </div>

          <div className="space-y-16">
            {features.map((feature, index) => (
              <div
                key={feature.id}
                className={`flex flex-col ${index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"} gap-8 items-center`}
              >
                <div className="flex-1">
                  <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#0c4da2] to-[#3a5b72] rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">{index + 1}</span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">{feature.title}</h3>
                    </div>
                    <p className="text-gray-600 mb-6 text-lg">{feature.description}</p>

                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <h4 className="font-semibold text-red-800 mb-2">Before (Manual)</h4>
                        <p className="text-red-700 text-sm">{feature.beforeAfter.before}</p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <h4 className="font-semibold text-green-800 mb-2">After (Automated)</h4>
                        <p className="text-green-700 text-sm">{feature.beforeAfter.after}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[#0c4da2] font-semibold">
                      <CheckCircle className="w-5 h-5" />
                      <span>{feature.impact}</span>
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-8 shadow-xl">
                    <div className="bg-white rounded-lg p-4 mb-4 flex flex-col items-center">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                      <img
                        src={feature.thumbnail}
                        alt={feature.title}
                        className="cursor-zoom-in rounded shadow max-w-xs transition-transform hover:scale-105"
                        onClick={() => {
                          setZoomedImage(feature.flowchart);
                          setZoomedAlt(feature.title);
                        }}
                      />
                      <p className="mt-4 text-gray-500 text-sm">Click to expand flowchart</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {zoomedImage && (
          <ZoomImageModal
            imageSrc={zoomedImage}
            alt={zoomedAlt}
            onClose={() => setZoomedImage(null)}
          />
        )}

        <div className="bg-gradient-to-r from-[#0c4da2] to-[#3a5b72] rounded-3xl p-8 md:p-12 text-white mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Project Impact</h2>
            <p className="text-xl text-blue-100">Measurable improvements in college administration efficiency</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8" />
              </div>
              <div className="text-3xl font-bold mb-2">80%</div>
              <div className="text-blue-100">Time Reduction</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8" />
              </div>
              <div className="text-3xl font-bold mb-2">500+</div>
              <div className="text-blue-100">Students Benefited</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <div className="text-3xl font-bold mb-2">0</div>
              <div className="text-blue-100">Paper Forms</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8" />
              </div>
              <div className="text-3xl font-bold mb-2">100%</div>
              <div className="text-blue-100">Automation</div>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Technical Implementation</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-[#0c4da2]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Authentication</h3>
              <p className="text-gray-600">Firebase Authentication with Google OAuth, role-based access control for students and faculty</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Database className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Database</h3>
              <p className="text-gray-600">Firestore for real-time data synchronization, scalable document-based storage</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Code className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Frontend</h3>
              <p className="text-gray-600">Next.js with Tailwind CSS for responsive, modern UI with server-side rendering</p>
            </div>
          </div>
        </div>

        <div className="text-center bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Interested in Learning More?</h2>
          <p className="text-xl text-gray-600 mb-8">
            This project showcases my ability to identify real-world problems and create scalable digital solutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-[#0c4da2] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#3a5b72] transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Github className="w-5 h-5" />
              Visit the Page
            </Link>
            <a
              href="https://github.com/Q9Kawaii"
              className="inline-flex items-center gap-2 bg-transparent border-2 border-[#0c4da2] text-[#0c4da2] px-8 py-4 rounded-xl font-semibold hover:bg-[#0c4da2] hover:text-white transition-all duration-300"
            >
              <Mail className="w-5 h-5" />
              Contact Me
            </a>
          </div>
        </div>
      </div>

      {zoomedImage && (
        <ZoomImageModal
          imageSrc={zoomedImage}
          alt={zoomedAlt}
          onClose={() => setZoomedImage(null)}
        />
      )}
    </div>
  );
}
