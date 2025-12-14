"use client";

import { useEffect, useState, useRef } from "react";

export default function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check for touch device on mount
    if ("ontouchstart" in window) {
      setIsTouchDevice(true);
      return;
    }

    const updateMousePosition = (e: MouseEvent) => {
      if (cursorRef.current) {
        // Use transform for real-time positioning without React re-renders
        cursorRef.current.style.transform = `translate(${e.clientX - 8}px, ${e.clientY - 8}px)`;
      }
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    // Use passive listeners for better performance
    window.addEventListener("mousemove", updateMousePosition, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [isVisible]);

  // Hide on touch devices
  if (isTouchDevice) {
    return null;
  }

  return (
    <div
      ref={cursorRef}
      className="pointer-events-none fixed top-0 left-0 z-[9999] will-change-transform"
      style={{
        opacity: isVisible ? 1 : 0,
        transition: "opacity 0.15s ease",
      }}
    >
      <img
        src="/cursor2.png"
        alt=""
        className="w-6 h-6"
        style={{
          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.25)) drop-shadow(0 1px 2px rgba(0,0,0,0.15))",
        }}
        draggable={false}
      />
    </div>
  );
}
