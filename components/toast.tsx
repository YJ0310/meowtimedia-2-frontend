'use client';

import { useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  icon?: string; // emoji icon
  duration?: number; // ms, 0 for persistent
}

interface ToastContainerProps {
  toasts: ToastProps[];
  onRemove: (id: string) => void;
  hasNavbar?: boolean;
}

// Type-based border colors (subtle accent)
const typeBorderColors: Record<ToastType, string> = {
  success: 'border-green-500/30',
  error: 'border-red-500/30',
  warning: 'border-amber-500/30',
  info: 'border-blue-500/30',
};

// Default icons per type
const defaultIcons: Record<ToastType, string> = {
  success: '✓',
  error: '✗',
  warning: '⚠',
  info: 'ℹ',
};

function Toast({ toast, onRemove }: { toast: ToastProps; onRemove: (id: string) => void }) {
  useEffect(() => {
    if (toast.duration !== 0) {
      const timer = setTimeout(() => onRemove(toast.id), toast.duration || 5000);
      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, onRemove]);

  const borderColor = typeBorderColors[toast.type];
  const icon = toast.icon || defaultIcons[toast.type];

  return (
    <motion.div
      layout
      layoutId={toast.id}
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
      transition={{ 
        type: 'spring', 
        damping: 25, 
        stiffness: 350,
        layout: {
          type: 'spring',
          damping: 30,
          stiffness: 400
        }
      }}
      className={`
        bg-white/20 dark:bg-black/30 
        backdrop-blur-2xl backdrop-saturate-150
        px-4 md:px-6 py-3 md:py-4 
        rounded-2xl shadow-2xl flex items-center gap-3 md:gap-4 
        border border-white/30 dark:border-white/10 
        max-w-[90vw] md:max-w-md
        ${borderColor}
      `}
    >
      <div className="min-w-0 flex-1">
        <h3 className="font-bold text-base md:text-lg truncate text-black dark:text-white">
          {icon && <span className="mr-2">{icon}</span>}
          {toast.title}
        </h3>
        {toast.message && (
          <p className="text-xs md:text-sm text-black dark:text-white">
            {toast.message}
          </p>
        )}
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

export function ToastContainer({ toasts, onRemove, hasNavbar = false }: ToastContainerProps) {
  // Position below navbar if present (top-20 = 80px), otherwise at top (top-4)
  // On mobile, navbar is at bottom so always use top-4
  return (
    <div className={`fixed left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 ${hasNavbar ? 'top-4 md:top-20' : 'top-4'}`}>
      <LayoutGroup>
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} onRemove={onRemove} />
          ))}
        </AnimatePresence>
      </LayoutGroup>
    </div>
  );
}

// Hook for easy toast management
export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = useCallback((toast: Omit<ToastProps, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    // Convenience methods
    success: useCallback((title: string, message?: string, icon?: string) =>
      addToast({ type: 'success', title, message, icon }), [addToast]),
    error: useCallback((title: string, message?: string, icon?: string) =>
      addToast({ type: 'error', title, message, icon }), [addToast]),
    warning: useCallback((title: string, message?: string, icon?: string) =>
      addToast({ type: 'warning', title, message, icon }), [addToast]),
    info: useCallback((title: string, message?: string, icon?: string) =>
      addToast({ type: 'info', title, message, icon }), [addToast]),
  };
}
