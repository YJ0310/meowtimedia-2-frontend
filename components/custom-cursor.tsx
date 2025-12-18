"use client";

import { useEffect, useState, useRef, useCallback } from "react";

export default function CustomCursor() {
  const [isInViewport, setIsInViewport] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef({ x: -100, y: -100 });

  // Direct DOM manipulation for zero-lag cursor movement
  const updateCursor = useCallback((x: number, y: number) => {
    positionRef.current = { x, y };
    if (cursorRef.current) {
      cursorRef.current.style.transform = `translate(${x - 8}px, ${y - 8}px)`;
    }
  }, []);

  useEffect(() => {
    // Check for touch device on mount
    if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
      setIsTouchDevice(true);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      updateCursor(e.clientX, e.clientY);
      if (!isInViewport) setIsInViewport(true);
    };

    const handleMouseLeave = (e: MouseEvent) => {
      // Only hide if actually leaving the document
      if (e.relatedTarget === null || 
          (e.clientY <= 0 || e.clientX <= 0 || 
           e.clientX >= window.innerWidth || e.clientY >= window.innerHeight)) {
        setIsInViewport(false);
        // Move cursor off-screen
        updateCursor(-100, -100);
      }
    };

    const handleMouseEnter = () => {
      setIsInViewport(true);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsInViewport(false);
        updateCursor(-100, -100);
      }
    };

    const handleWindowBlur = () => {
      setIsInViewport(false);
      updateCursor(-100, -100);
    };

    const handleWindowFocus = () => {
      // Don't auto-show, wait for mouse move
    };

    // Add all event listeners
    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [isInViewport, updateCursor]);

  // Hide on touch devices
  if (isTouchDevice) {
    return null;
  }

  return (
    <div
      ref={cursorRef}
      className="pointer-events-none fixed top-0 left-0 z-[9999]"
      style={{
        opacity: isInViewport ? 1 : 0,
        transform: `translate(${positionRef.current.x - 8}px, ${positionRef.current.y - 8}px)`,
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
