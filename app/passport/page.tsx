'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { mockUser, stamps, countries } from '@/lib/mock-data';

export default function PassportPage() {
  const [currentPage, setCurrentPage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'left' | 'right'>('right');
  const totalPages = Math.ceil((stamps.length + 4) / 4); // 4 stamps per page spread
  const dragX = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const nextPage = () => {
    if (currentPage < totalPages - 1 && !isFlipping) {
      setFlipDirection('right');
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage(currentPage + 1);
        setIsFlipping(false);
      }, 400);
    }
  };

  const prevPage = () => {
    if (currentPage > 0 && !isFlipping) {
      setFlipDirection('left');
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage(currentPage - 1);
        setIsFlipping(false);
      }, 400);
    }
  };

  // Handle drag for mobile flip
  const handleDragEnd = (e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x < -threshold && currentPage < totalPages - 1) {
      nextPage();
    } else if (info.offset.x > threshold && currentPage > 0) {
      prevPage();
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

  // Mobile single page view with flip effect
  const renderMobilePage = () => {
    const allPages = [
      { type: 'cover' as const },
      ...stamps.map((stamp, i) => ({ type: 'stamp' as const, stamp, index: i })),
      ...Array(48 - stamps.length).fill(null).map((_, i) => ({ type: 'empty' as const, index: i }))
    ];

    const currentContent = allPages[currentPage];

    return (
      <motion.div
        ref={containerRef}
        className="relative w-full max-w-sm mx-auto"
        style={{ perspective: '1500px' }}
      >
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
          style={{ x: dragX }}
          className="touch-pan-y"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ 
                rotateY: flipDirection === 'right' ? -90 : 90,
                opacity: 0,
                scale: 0.9
              }}
              animate={{ 
                rotateY: 0,
                opacity: 1,
                scale: 1
              }}
              exit={{ 
                rotateY: flipDirection === 'right' ? 90 : -90,
                opacity: 0,
                scale: 0.9
              }}
              transition={{ 
                duration: 0.4, 
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
              className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
              style={{ 
                transformStyle: 'preserve-3d',
                minHeight: '500px'
              }}
            >
              {/* Page Edge Effect */}
              <div className="absolute left-0 top-0 bottom-0 w-3 bg-linear-to-r from-gray-300/50 to-transparent dark:from-gray-700/50" />
              
              {/* Page Content */}
              <div className="p-6">
                {currentContent.type === 'cover' && (
                  <div className="text-center space-y-6 py-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", duration: 0.8 }}
                    >
                      <div className="text-7xl mb-4 animate-float">🐾</div>
                      <div className="text-xs uppercase tracking-[0.2em] text-neutral-dark font-semibold">
                        Meowtimap Passport
                      </div>
                      <div className="h-px w-20 bg-neutral-dark mx-auto my-3" />
                      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                        {mockUser.name}
                      </h1>
                      <p className="text-neutral-dark dark:text-gray-400">Cultural Explorer</p>
                    </motion.div>
                    <div className="glass p-4 rounded-xl inline-block">
                      <div className="text-3xl font-bold text-gradient">{stamps.length}/48</div>
                      <div className="text-xs text-neutral-dark">Stamps Collected</div>
                    </div>
                    <img
                      src={mockUser.image}
                      alt={mockUser.name}
                      className="w-24 h-24 rounded-full mx-auto border-4 border-primary shadow-xl"
                    />
                  </div>
                )}
                
                {currentContent.type === 'stamp' && currentContent.stamp && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    <div className="glass-strong p-6 rounded-xl border-4 border-dashed border-primary/30 relative overflow-hidden">
                      {/* Watermark */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-5">
                        <span className="text-9xl">{currentContent.stamp.icon}</span>
                      </div>
                      
                      <div className="relative z-10 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-5xl">{currentContent.stamp.icon}</span>
                          <span className="text-4xl opacity-30">
                            {countries.find(c => c.slug === currentContent.stamp!.countrySlug)?.flag}
                          </span>
                        </div>
                        
                        <div>
                          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                            Cultural Achievement
                          </div>
                          <h3 className="font-bold text-2xl leading-tight">{currentContent.stamp.topicName}</h3>
                          <p className="text-muted-foreground">{currentContent.stamp.countryName}</p>
                        </div>

                        <div className="pt-4 border-t border-dashed border-primary/20">
                          <div className="text-xs text-muted-foreground">Earned on</div>
                          <div className="font-mono text-lg font-semibold">
                            {new Date(currentContent.stamp.date).toLocaleDateString('en-US', {
                              month: 'long',
                              day: '2-digit',
                              year: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Stamp Seal */}
                      <div className="absolute top-4 right-4">
                        <svg width="50" height="50" viewBox="0 0 40 40">
                          <circle 
                            cx="20" cy="20" r="18" 
                            fill="none" stroke="currentColor"
                            strokeWidth="2" strokeDasharray="3 2"
                            className="text-primary/40"
                          />
                          <text x="20" y="25" textAnchor="middle" className="text-sm font-bold fill-primary/60">
                            ✓
                          </text>
                        </svg>
                      </div>
                    </div>
                    
                    {/* Page number */}
                    <div className="text-center text-muted-foreground text-sm">
                      Stamp {currentContent.index + 1} of {stamps.length}
                    </div>
                  </motion.div>
                )}
                
                {currentContent.type === 'empty' && (
                  <div className="glass p-8 rounded-xl border-4 border-dashed border-gray-300 dark:border-gray-700 opacity-50 min-h-[350px] flex flex-col items-center justify-center">
                    <div className="text-6xl opacity-50 mb-4">🔒</div>
                    <p className="text-muted-foreground text-center">
                      Empty Slot<br/>
                      <span className="text-xs">Complete lessons to earn stamps!</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Page Corner Fold Effect */}
              <div 
                className="absolute bottom-0 right-0 w-12 h-12"
                style={{
                  background: 'linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.1) 50%)'
                }}
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Swipe Hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="text-center text-muted-foreground text-xs mt-4"
        >
          ← Swipe to flip pages →
        </motion.div>
      </motion.div>
    );
  };

  // Calculate total mobile pages (cover + stamps + empty slots)
  const totalMobilePages = 1 + stamps.length + (48 - stamps.length);

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
            {isMobile ? `Page ${currentPage + 1} of ${totalMobilePages}` : `Page ${currentPage + 1} of ${totalPages}`}
          </p>
        </motion.div>

        {/* Mobile View - Single Page Flip */}
        {isMobile && renderMobilePage()}

        {/* Desktop View - Book Spread */}
        {!isMobile && (
          <>
            {/* Passport Book */}
            <div className="relative" style={{ perspective: '2000px' }}>
              <div className="relative w-full" style={{ paddingBottom: '70%' }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentPage}
                    initial={{ rotateY: flipDirection === 'right' ? -90 : 90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: flipDirection === 'right' ? 90 : -90, opacity: 0 }}
                    transition={{ duration: 0.6, type: "spring" }}
                    className="absolute inset-0"
                  >
                    <div className="grid grid-cols-2 gap-0 h-full">
                      {/* Left Page */}
                      <div className="relative bg-white dark:bg-gray-900 rounded-l-3xl shadow-2xl">
                        {pageContent.left}
                        {/* Page binding effect */}
                        <div className="absolute right-0 top-0 bottom-0 w-8 bg-linear-to-r from-transparent to-gray-900/10" />
                      </div>

                      {/* Right Page */}
                      <div className="relative bg-white dark:bg-gray-900 rounded-r-3xl shadow-2xl">
                        {pageContent.right}
                        {/* Page binding effect */}
                        <div className="absolute left-0 top-0 bottom-0 w-8 bg-linear-to-l from-transparent to-gray-900/10" />
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 max-w-md mx-auto px-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={prevPage}
            disabled={currentPage === 0 || isFlipping}
            className="glass p-3 md:p-4 rounded-full disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </motion.button>

          {/* Page Indicators */}
          <div className="flex gap-1 md:gap-2 flex-wrap justify-center max-w-[200px]">
            {[...Array(isMobile ? Math.min(totalMobilePages, 10) : totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => !isFlipping && setCurrentPage(index)}
                className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all ${
                  index === currentPage
                    ? 'bg-primary w-4 md:w-6'
                    : 'bg-gray-300 dark:bg-gray-700'
                }`}
              />
            ))}
            {isMobile && totalMobilePages > 10 && (
              <span className="text-xs text-muted-foreground">...</span>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={nextPage}
            disabled={(isMobile ? currentPage >= totalMobilePages - 1 : currentPage >= totalPages - 1) || isFlipping}
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
