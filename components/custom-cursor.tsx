"use client";

import { useEffect, useState, useRef } from "react";

export default function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const positionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Check for touch device on mount
    if ("ontouchstart" in window) {
      setIsTouchDevice(true);
      return;
    }

    const updateCursorPosition = () => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${positionRef.current.x - 8}px, ${positionRef.current.y - 8}px)`;
      }
      rafRef.current = null;
    };

    const handlePointerMove = (e: PointerEvent | MouseEvent) => {
      // Store position immediately
      positionRef.current = { x: e.clientX, y: e.clientY };
      
      // Use requestAnimationFrame for smooth updates
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(updateCursorPosition);
      }
      
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    // Use pointermove for better compatibility with drag operations
    window.addEventListener("pointermove", handlePointerMove, { passive: true, capture: true });
    window.addEventListener("mousemove", handlePointerMove, { passive: true, capture: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove, { capture: true });
      window.removeEventListener("mousemove", handlePointerMove, { capture: true });
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
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
