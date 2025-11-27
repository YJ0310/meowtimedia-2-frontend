'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { mockUser, stamps, countries } from '@/lib/mock-data';

export default function PassportPage() {
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = Math.ceil((stamps.length + 4) / 4); // 4 stamps per page spread

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const renderCover = () => (
    <div className="absolute inset-0 gradient-warm rounded-r-3xl shadow-2xl flex flex-col items-center justify-center p-4 md:p-8 border-r-4 md:border-r-8 border-accent-dark">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 1 }}
        className="text-center space-y-3 md:space-y-6"
      >
        <div className="text-5xl md:text-8xl mb-2 md:mb-4 animate-float">🐾</div>
        <div className="space-y-2">
          <div className="text-xs md:text-sm uppercase tracking-[0.2em] md:tracking-[0.3em] text-neutral-dark font-semibold">
            Meowtimap Passport
          </div>
          <div className="h-px w-20 md:w-32 bg-neutral-dark mx-auto" />
          <h1 className="text-2xl md:text-4xl font-bold text-gray-800">
            {mockUser.name}
          </h1>
          <p className="text-sm md:text-base text-neutral-dark">Cultural Explorer</p>
        </div>
        <div className="mt-4 md:mt-8 glass p-3 md:p-4 rounded-xl">
          <div className="text-2xl md:text-3xl font-bold text-gradient">{stamps.length}/48</div>
          <div className="text-xs text-neutral-dark">Stamps Collected</div>
        </div>
        <div className="text-4xl md:text-6xl opacity-20 absolute bottom-4 md:bottom-8 right-4 md:right-8">🐾</div>
      </motion.div>
    </div>
  );

  const renderStampPage = (pageStamps: typeof stamps) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 p-4 md:p-8">
      {pageStamps.map((stamp, index) => (
        <motion.div
          key={stamp.id}
          initial={{ opacity: 0, rotate: -5, scale: 0.8 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className="relative"
        >
          {/* Visa Stamp */}
          <div className="glass-strong p-3 md:p-6 rounded-xl border-2 md:border-4 border-dashed border-primary/30 relative overflow-hidden">
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5">
              <span className="text-6xl md:text-9xl">{stamp.icon}</span>
            </div>
            
            {/* Content */}
            <div className="relative z-10 space-y-2 md:space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl md:text-4xl">{stamp.icon}</span>
                <span className="text-xl md:text-3xl opacity-30">
                  {countries.find(c => c.slug === stamp.countrySlug)?.flag}
                </span>
              </div>
              
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                  Cultural Achievement
                </div>
                <h3 className="font-bold text-sm md:text-lg leading-tight">{stamp.topicName}</h3>
                <p className="text-xs md:text-sm text-muted-foreground">{stamp.countryName}</p>
              </div>

              <div className="pt-2 md:pt-3 border-t border-dashed border-primary/20">
                <div className="text-xs text-muted-foreground">Earned on</div>
                <div className="font-mono text-xs md:text-sm font-semibold">
                  {new Date(stamp.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: '2-digit',
                    year: 'numeric'
                  })}
                </div>
              </div>

              {/* Stamp Effect */}
              <div className="absolute top-1 right-1 md:top-2 md:right-2">
                <svg width="30" height="30" viewBox="0 0 40 40" className="md:w-10 md:h-10">
                  <circle 
                    cx="20" 
                    cy="20" 
                    r="18" 
                    fill="none" 
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray="3 2"
                    className="text-primary/40"
                  />
                  <text 
                    x="20" 
                    y="25" 
                    textAnchor="middle" 
                    className="text-xs font-bold fill-primary/60"
                  >
                    ✓
                  </text>
                </svg>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
      
      {/* Empty Slots */}
      {[...Array(4 - pageStamps.length)].map((_, index) => (
        <div
          key={`empty-${index}`}
          className="glass p-3 md:p-6 rounded-xl border-2 md:border-4 border-dashed border-gray-300 dark:border-gray-700 opacity-30"
        >
          <div className="h-full flex flex-col items-center justify-center text-center space-y-2">
            <div className="text-2xl md:text-4xl opacity-50">🔒</div>
            <p className="text-xs text-muted-foreground">Awaiting Adventure</p>
          </div>
        </div>
      ))}
    </div>
  );

  const getPageContent = (pageNum: number) => {
    if (pageNum === 0) {
      // First page spread: cover + first stamps
      return {
        left: renderCover(),
        right: renderStampPage(stamps.slice(0, 4))
      };
    }
    
    const startIndex = (pageNum - 1) * 8 + 4;
    const leftStamps = stamps.slice(startIndex, startIndex + 4);
    const rightStamps = stamps.slice(startIndex + 4, startIndex + 8);
    
    return {
      left: renderStampPage(leftStamps),
      right: renderStampPage(rightStamps)
    };
  };

  const pageContent = getPageContent(currentPage);

  return (
    <div className="min-h-screen bg-gradient-soft flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-7xl">
        {/* Page Counter */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-2">
            My Passport
          </h1>
          <p className="text-muted-foreground">
            Page {currentPage + 1} of {totalPages}
          </p>
        </motion.div>

        {/* Passport Book */}
        <div className="relative" style={{ perspective: '2000px' }}>
          <div className="relative w-full" style={{ paddingBottom: '70%' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ rotateY: currentPage > 0 ? -90 : 0, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: 90, opacity: 0 }}
                transition={{ duration: 0.6, type: "spring" }}
                className="absolute inset-0"
              >
                <div className="grid grid-cols-2 gap-0 h-full">
                  {/* Left Page */}
                  <div className="relative bg-white dark:bg-gray-900 rounded-l-3xl shadow-2xl">
                    {pageContent.left}
                    {/* Page binding effect */}
                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-gray-900/10" />
                  </div>

                  {/* Right Page */}
                  <div className="relative bg-white dark:bg-gray-900 rounded-r-3xl shadow-2xl">
                    {pageContent.right}
                    {/* Page binding effect */}
                    <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-l from-transparent to-gray-900/10" />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 max-w-md mx-auto px-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={prevPage}
            disabled={currentPage === 0}
            className="glass p-3 md:p-4 rounded-full disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </motion.button>

          {/* Page Indicators */}
          <div className="flex gap-2">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index)}
                className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all ${
                  index === currentPage
                    ? 'bg-primary w-6 md:w-8'
                    : 'bg-gray-300 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={nextPage}
            disabled={currentPage === totalPages - 1}
            className="glass p-3 md:p-4 rounded-full disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </motion.button>
        </div>

        {/* Helper Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-muted-foreground mt-8 text-sm"
        >
          🐾 Collect more stamps by completing lessons across Asia! 🐾
        </motion.p>
      </div>
    </div>
  );
}
