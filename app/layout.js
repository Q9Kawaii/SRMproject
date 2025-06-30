"use client"
import Footer from "./components/Footer";
import NavBar from "./components/NavBar";
import test from "./components/test";
import "./globals.css";
import AuthReset from './components/AuthReset';
import React, { useState } from "react";
import Link from "next/link";
import CursorBlob from "./components/DashboardComponents/CursorBlob";

export default function RootLayout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <html lang="en">
      <body className="antialiased flex flex-col min-h-screen">
        <AuthReset />
        <CursorBlob/>
        <main className="flex-1">
          <NavBar onHamClick={() => setMenuOpen(prev => !prev)} />
            <div
  className={`rounded-l-2xl opacity-89 fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 z-50 ${
    menuOpen ? "translate-x-0" : "translate-x-full"
  }`}
>
  <div className="p-4 flex flex-col justify-between h-[100%]">
    <div>
      <h2 className="text-lg font-bold mb-4">Menu</h2>
        <ul className="space-y-2 flex-col flex">
          <Link href="#">Contact Us</Link>
          <Link href="/AboutUs">About US</Link>
        </ul>
    </div>
    <div>
      <img src="SAMADHAN transparent english.png" className="h-20" />
    </div>
  </div>
</div>
{menuOpen && (
  <div
    className="fixed inset-0 bg-black opacity-40 z-40"
    onClick={() => setMenuOpen(false)}
  />
)}

        {children}
        </main>
        <Footer/>
        <test/>
      </body>
    </html>
  );
}
