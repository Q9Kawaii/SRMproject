"use client";
import React, { useEffect, useRef, useState } from "react";

export default function CursorBlob() {
  const blobRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const blob = blobRef.current;

    if (!blob) return;

    if (!isMobile) {
      const moveBlob = (e) => {
        blob.animate(
          {
            left: `${e.clientX - 75}px`,
            top: `${e.clientY - 75}px`,
          },
          { duration: 300, fill: "forwards" }
        );
      };
      window.addEventListener("pointermove", moveBlob);
      return () => window.removeEventListener("pointermove", moveBlob);
    } else {
      const animateMobile = () => {
        const x = Math.random() * (window.innerWidth - 150);
        const y = Math.random() * (window.innerHeight - 150);
        blob.animate(
          {
            left: `${x}px`,
            top: `${y}px`,
          },
          { duration: 3000, fill: "forwards", easing: "ease-in-out" }
        );
      };
      const interval = setInterval(animateMobile, 3000);
      animateMobile();
      return () => clearInterval(interval);
    }
  }, [isMobile]);

  return (
    <div
      ref={blobRef}
      className="fixed top-0 left-0 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-blue-400  to-indigo-600 opacity-10 blur-3xl z-0 pointer-events-none transition-transform"
    ></div>
  );
}
