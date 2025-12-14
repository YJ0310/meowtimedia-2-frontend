'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

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
}

const typeStyles: Record<ToastType, { border: string; bg: string; icon: React.ReactNode }> = {
  success: {
    border: 'border-green-500/30',
    bg: 'bg-green-500/20',
    icon: <CheckCircle className="w-5 h-5 text-green-500" />,
  },
  error: {
    border: 'border-red-500/30',
    bg: 'bg-red-500/20',
    icon: <AlertCircle className="w-5 h-5 text-red-500" />,
  },
  warning: {
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/20',
    icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
  },
  info: {
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/20',
    icon: <Info className="w-5 h-5 text-blue-500" />,
  },
};

function Toast({ toast, onRemove }: { toast: ToastProps; onRemove: (id: string) => void }) {
  const [isWindows, setIsWindows] = useState(false);

  useEffect(() => {
    setIsWindows(navigator.platform.toLowerCase().includes('win'));
  }, []);

  useEffect(() => {
    if (toast.duration !== 0) {
      const timer = setTimeout(() => onRemove(toast.id), toast.duration || 5000);
      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, onRemove]);

  const style = typeStyles[toast.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -30, scale: 0.9 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className={`
        bg-white/20 dark:bg-black/30 
        backdrop-blur-2xl backdrop-saturate-150
        px-4 md:px-6 py-3 md:py-4 
        rounded-2xl shadow-2xl flex items-center gap-3 md:gap-4 
        border border-white/30 dark:border-white/10 
        max-w-[90vw] md:max-w-md
        ${style.border}
      `}
    >
      <div className={`w-10 h-10 rounded-full ${style.bg} flex items-center justify-center shrink-0`}>
        {toast.icon ? <span className="text-xl">{toast.icon}</span> : style.icon}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-bold text-base md:text-lg truncate text-black dark:text-white">
          {toast.title}
        </h3>
        {toast.message && (
          <p className="text-xs md:text-sm text-black dark:text-white opacity-80">
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

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  const [isWindows, setIsWindows] = useState(false);

  useEffect(() => {
    setIsWindows(navigator.platform.toLowerCase().includes('win'));
  }, []);

  return (
    <div className={`fixed left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 ${isWindows ? 'top-4' : 'top-12'}`}>
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Hook for easy toast management
export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = (toast: Omit<ToastProps, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    return id;
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const clearToasts = () => {
    setToasts([]);
  };

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    // Convenience methods
    success: (title: string, message?: string, icon?: string) =>
      addToast({ type: 'success', title, message, icon }),
    error: (title: string, message?: string, icon?: string) =>
      addToast({ type: 'error', title, message, icon }),
    warning: (title: string, message?: string, icon?: string) =>
      addToast({ type: 'warning', title, message, icon }),
    info: (title: string, message?: string, icon?: string) =>
      addToast({ type: 'info', title, message, icon }),
  };
}
