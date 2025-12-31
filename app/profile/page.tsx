"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Check,
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Save,
  LogOut,
  Loader2,
  Volume2,
  VolumeX,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useBGM } from "@/lib/bgm-context";
import GlobalLoading from "@/components/global-loading";

export default function ProfilePage() {
  const { user, isLoading: authLoading, logout } = useAuth();
  const { isSoundEnabled, toggleSound, isAudioReady } = useBGM();
  const [image, setImage] = useState<string>("");
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropAreaRef = useRef<HTMLDivElement>(null);
  const [showToast, setShowToast] = useState(true);

  // Set image from user's Google avatar
  useEffect(() => {
    if (user?.avatar) {
      setImage(user.avatar);
    }
  }, [user]);

  // Auto-hide toast after 4 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setOriginalImage(result);
        setIsEditing(true);
        setZoom(1);
        setRotation(0);
        setPosition({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      setIsDragging(true);
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      setDragStart({ x: clientX - position.x, y: clientY - position.y });
    },
    [position]
  );

  const handleDragMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDragging) return;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      setPosition({
        x: clientX - dragStart.x,
        y: clientY - dragStart.y,
      });
    },
    [isDragging, dragStart]
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Show loading while checking auth or waiting for audio
  if (authLoading || !isAudioReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-soft dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <GlobalLoading
            isLoading={true}
            title={`Loading Profile`}
            subtitle="Loading your profile"
          />
        </motion.div>
      </div>
    );
  }

  // If no user, show nothing (auth context will redirect)
  if (!user) {
    return null;
  }

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const handleSave = async () => {
    if (!originalImage) return;

    setIsSaving(true);

    // Simulate saving to server
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // In a real app, you would:
    // 1. Create a canvas with the cropped/transformed image
    // 2. Convert to blob
    // 3. Upload to server
    // For now, we'll just use the transformed image
    setImage(originalImage);
    setIsEditing(false);
    setOriginalImage(null);
    setIsSaving(false);
    setShowSuccess(true);

    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setOriginalImage(null);
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div className="fixed inset-0 bg-gradient-soft dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
      <div className="py-10 max-w-2xl mx-auto">
        {/* Header */}
        {/* Profile Toast Notification */}
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.9 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className={`fixed left-1/2 -translate-x-1/2 z-50 
        bg-white/20 dark:bg-black/30 
        backdrop-blur-2xl backdrop-saturate-150
        px-4 md:px-6 py-3 md:py-4 
        rounded-2xl shadow-2xl flex items-center gap-3 md:gap-4 
        border border-white/30 dark:border-white/10 
        max-w-[90vw] md:max-w-md 
        top-20`}
            >
              <motion.img
                src={user.avatar}
                alt={user.displayName}
                className="w-12 h-12 md:w-14 md:h-14 rounded-full border-3 border-primary shadow-lg shrink-0"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <div className="min-w-0">
                <h3 className="font-bold text-base md:text-lg truncate text-black dark:text-white">
                  Profile Picture
                </h3>
                <p className="text-xs md:text-sm text-black dark:text-white">
                  Upload and customize your avatar
                </p>
              </div>
              <button
                onClick={() => setShowToast(false)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-strong rounded-3xl p-6 md:p-8 space-y-8"
        >
          {/* Current Profile Picture */}
          {!isEditing && (
            <div className="text-center space-y-6">
              <motion.div
                className="relative inline-block"
                whileHover={{ scale: 1.02 }}
              >
                <img
                  src={image}
                  alt="Profile"
                  className="w-24 h-24 md:w-40 md:h-40 rounded-full object-cover border-4 border-primary shadow-2xl mx-auto"
                />
              </motion.div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold">{user.displayName}</h2>
                <p className="text-black dark:text-white">{user.email}</p>
              </div>

              {/* Sound Toggle */}
              <div className="flex items-center justify-center gap-4 py-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleSound}
                  className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all ${
                    isSoundEnabled
                      ? "glass bg-primary/10 border border-primary/30"
                      : "glass border border-gray-300 dark:border-gray-600"
                  }`}
                >
                  {isSoundEnabled ? (
                    <>
                      <Volume2 className="w-5 h-5 text-primary" />
                      <span className="text-black dark:text-white">
                        Sound On
                      </span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-5 h-5 text-gray-500" />
                      <span className="text-gray-500">Sound Off</span>
                    </>
                  )}
                  <div
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${
                      isSoundEnabled
                        ? "bg-primary"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  >
                    <motion.div
                      className="w-4 h-4 rounded-full bg-white shadow-md"
                      animate={{ x: isSoundEnabled ? 24 : 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  </div>
                </motion.button>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={logout}
                  className="glass px-6 py-3 rounded-xl font-semibold text-red-500 flex items-center justify-center gap-2"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </motion.button>
              </div>

              <Link href="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="glass px-6 py-3 rounded-xl font-semibold text-black dark:text-white w-full"
                >
                  Back to Dashboard
                </motion.button>
              </Link>
            </div>
          )}

          {/* Image Editor */}
          <AnimatePresence>
            {isEditing && originalImage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Crop Area */}
                <div
                  ref={cropAreaRef}
                  className="relative w-full aspect-square max-w-md mx-auto rounded-3xl overflow-hidden bg-gray-900 cursor-move"
                  onMouseDown={handleDragStart}
                  onMouseMove={handleDragMove}
                  onMouseUp={handleDragEnd}
                  onMouseLeave={handleDragEnd}
                  onTouchStart={handleDragStart}
                  onTouchMove={handleDragMove}
                  onTouchEnd={handleDragEnd}
                >
                  {/* Overlay Grid */}
                  <div className="absolute inset-0 pointer-events-none z-10">
                    <div
                      className="w-full h-full border-2 border-white/30 rounded-full m-auto"
                      style={{
                        width: "80%",
                        height: "80%",
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                      }}
                    />
                  </div>

                  {/* Image */}
                  <img
                    src={originalImage}
                    alt="Edit preview"
                    className="absolute select-none"
                    style={{
                      transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                      transformOrigin: "center",
                      top: "50%",
                      left: "50%",
                      marginTop: "-50%",
                      marginLeft: "-50%",
                      minWidth: "100%",
                      minHeight: "100%",
                      objectFit: "cover",
                      transition: isDragging
                        ? "none"
                        : "transform 0.1s ease-out",
                    }}
                    draggable={false}
                  />

                  {/* Vignette Overlay */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(circle, transparent 35%, rgba(0,0,0,0.6) 70%)",
                    }}
                  />
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleZoomOut}
                    className="glass p-3 rounded-full"
                    disabled={zoom <= 0.5}
                  >
                    <ZoomOut className="w-5 h-5" />
                  </motion.button>

                  <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${((zoom - 0.5) / 2.5) * 100}%` }}
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleZoomIn}
                    className="glass p-3 rounded-full"
                    disabled={zoom >= 3}
                  >
                    <ZoomIn className="w-5 h-5" />
                  </motion.button>

                  <div className="w-px h-8 bg-gray-300 dark:bg-gray-600 mx-2" />

                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRotate}
                    className="glass p-3 rounded-full"
                  >
                    <RotateCw className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCancel}
                    className="glass px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-linear-to-r from-primary to-secondary text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-xl disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          <Save className="w-5 h-5" />
                        </motion.div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        Save Photo
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </motion.div>

        {/* Success Toast */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 glass-strong px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50"
            >
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold">
                Profile picture updated successfully!
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
