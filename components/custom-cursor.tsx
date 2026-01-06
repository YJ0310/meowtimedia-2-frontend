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

    const handlePointerMove = (e: PointerEvent) => {
      updateCursor(e.clientX, e.clientY);
      if (!isInViewport) setIsInViewport(true);
    };

    const handleMouseMove = (e: MouseEvent) => {
      updateCursor(e.clientX, e.clientY);
      if (!isInViewport) setIsInViewport(true);
    };

    const handleDrag = (e: DragEvent) => {
      if (e.clientX !== 0 && e.clientY !== 0) {
        updateCursor(e.clientX, e.clientY);
      }
    };

    const handleMouseLeave = (e: MouseEvent) => {
      // Only hide if actually leaving the document
      if (e.relatedTarget === null || 
          (e.clientY <= 0 || e.clientX <= 0 || 
           e.clientX >= window.innerWidth || e.clientY >= window.innerHeight)) {
        setIsInViewport(false);
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

    // Add all event listeners - use pointer events for drag support
    document.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("drag", handleDrag, { passive: true });
    document.addEventListener("dragover", handleDrag, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("drag", handleDrag);
      document.removeEventListener("dragover", handleDrag);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
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
