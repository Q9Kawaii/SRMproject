"use client";
import React, { useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";

export default function ZoomImageModal({ imageSrc, onClose, alt }) {
  const [dragging, setDragging] = useState(false);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [lastTouchDistance, setLastTouchDistance] = useState(null);

  // ESC key to close
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Calculate distance between two touches
  const getTouchDistance = (touches) => {
    const [touch1, touch2] = touches;
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      setDragging(true);
      setOrigin({
        x: e.touches[0].clientX - translate.x,
        y: e.touches[0].clientY - translate.y,
      });
      setLastTouchDistance(null);
    } else if (e.touches.length === 2) {
      const distance = getTouchDistance(e.touches);
      setLastTouchDistance(distance);
      setDragging(false);
    }
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    if (e.touches.length === 1 && dragging) {
      setTranslate({
        x: e.touches[0].clientX - origin.x,
        y: e.touches[0].clientY - origin.y,
      });
    } else if (e.touches.length === 2) {
      const distance = getTouchDistance(e.touches);
      if (lastTouchDistance) {
        const scaleChange = distance / lastTouchDistance;
        setScale((prev) => {
          let newScale = prev * scaleChange;
          return Math.max(1, Math.min(newScale, 4));
        });
      }
      setLastTouchDistance(distance);
    }
  };

  const handleTouchEnd = () => {
    setDragging(false);
    setLastTouchDistance(null);
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    setDragging(true);
    setOrigin({ x: e.clientX - translate.x, y: e.clientY - translate.y });
  };

  const handleMouseMove = useCallback((e) => {
    if (!dragging) return;
    setTranslate({ x: e.clientX - origin.x, y: e.clientY - origin.y });
  }, [dragging, origin]);

  const handleMouseUp = useCallback(() => {
    setDragging(false);
  }, []);

  useEffect(() => {
    if (dragging) {
      document.body.style.cursor = "grabbing";
    } else {
      document.body.style.cursor = "";
    }
    return () => {
      document.body.style.cursor = "";
    };
  }, [dragging]);

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 4));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 1));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative max-w-5xl w-full h-[90vh] flex items-center justify-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-3xl font-bold z-10 hover:text-blue-300 bg-indigo-700 rounded-full h-[40px] w-[40px] flex justify-center items-center text-center pb-1"
          aria-label="Close"
        >
          &times;
        </button>

        {/* Zoom Controls */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex gap-3">
          <button
            onClick={zoomOut}
            className="bg-white/90 hover:bg-white text-black font-bold py-2 px-4 rounded shadow"
            disabled={scale <= 1}
          >
            −
          </button>
          <span className="bg-white/90 text-black font-bold py-2 px-4 rounded shadow">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={zoomIn}
            className="bg-white/90 hover:bg-white text-black font-bold py-2 px-4 rounded shadow"
            disabled={scale >= 4}
          >
            +
          </button>
        </div>

        {/* Image Container */}
        <div className="w-full h-full overflow-hidden flex items-center justify-center bg-transparent">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt={alt || "Zoomed Screenshot"}
            className="object-contain shadow-2xl rounded-xl cursor-grab active:cursor-grabbing"
            style={{
              width: "min(1200px, 90vw)",
              maxWidth: "2000px",
              minWidth: "300px",
              minHeight: "300px",
              maxHeight: "80vh",
              transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
              transition: dragging ? "none" : "transform 0.2s ease-out",
              userSelect: "none",
              touchAction: "none",
            }}
            draggable={false}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          />
        </div>
      </div>
    </div>
  );
}

// PropTypes for type checking
ZoomImageModal.propTypes = {
  imageSrc: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  alt: PropTypes.string,
};

// Default props
ZoomImageModal.defaultProps = {
  alt: "Zoomed Screenshot",
};
