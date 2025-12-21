'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { stamps } from '@/lib/mock-data';
import { useAuth } from '@/lib/auth-context';
import { ToastContainer, useToast } from '@/components/toast';

export default function PassportPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'left' | 'right'>('right');
  const { toasts, removeToast, info } = useToast();
  // Filter visible stamps only
  const visibleStamps = stamps.filter(s => s.isVisible);
  const totalPages = Math.ceil((visibleStamps.length + 4) / 4); // 4 stamps per page spread
  const dragX = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const totalMobilePages = 1 + visibleStamps.length + (48 - visibleStamps.length);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Show toast on initial load
  useEffect(() => {
    info('My Passport', `Page 1 of ${isMobile ? totalMobilePages : totalPages}`, '🐾');
  }, []);

  // Show toast when page changes
  useEffect(() => {
    if (currentPage > 0) {
      info('My Passport', `Page ${currentPage + 1} of ${isMobile ? totalMobilePages : totalPages}`, '🐾');
    }
  }, [currentPage]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-soft dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-black dark:text-white">Loading passport...</p>
        </motion.div>
      </div>
    );
  }

  // If no user, show nothing (auth context will redirect)
  if (!user) {
    return null;
  }

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
            {user.displayName}
          </h1>
          <p className="text-sm md:text-base text-neutral-dark">Cultural Explorer</p>
        </div>
        <div className="mt-4 md:mt-8 glass p-3 md:p-4 rounded-xl">
          <div className="text-2xl md:text-3xl font-bold text-gradient">{visibleStamps.length}/48</div>
          <div className="text-xs text-neutral-dark">Stamps Collected</div>
        </div>
        <div className="text-4xl md:text-6xl opacity-20 absolute bottom-4 md:bottom-8 right-4 md:right-8">🐾</div>
      </motion.div>
    </div>
  );

  const renderStampPage = (pageStamps: typeof stamps) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 p-3 md:p-4 h-full">
      {pageStamps.map((stamp, index) => (
        <motion.div
          key={stamp.id}
          initial={{ opacity: 0, rotate: -5, scale: 0.8 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className="relative"
        >
          {/* Stamp Card */}
          <div className="glass-strong p-2 md:p-3 rounded-xl border-2 md:border-3 border-dashed border-primary/30 relative overflow-hidden min-h-[120px] md:min-h-[140px]">
            {/* Stamp Image */}
            {stamp.stampImage ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.img 
                  src={stamp.stampImage}
                  alt={`${stamp.countryName} stamp`}
                  className="w-full h-full object-contain p-2 opacity-90"
                  initial={{ rotate: -10, scale: 0 }}
                  animate={{ rotate: Math.random() * 10 - 5, scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.2, type: "spring", stiffness: 200 }}
                  style={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))' }}
                />
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center opacity-20">
                <span className="text-4xl md:text-6xl">{stamp.icon}</span>
              </div>
            )}
            
            {/* Content overlay at bottom */}
            <div className="relative z-10 flex flex-col justify-end h-full min-h-[100px] md:min-h-[120px]">
              <div className="bg-white/80 dark:bg-black/60 backdrop-blur-sm rounded-lg p-1.5 md:p-2">
                <h3 className="font-bold text-[10px] md:text-xs leading-tight line-clamp-1">{stamp.topicName}</h3>
                <p className="text-[8px] md:text-[9px] text-muted-foreground">{stamp.countryName}</p>
                <div className="font-mono text-[7px] md:text-[8px] text-muted-foreground mt-0.5">
                  {new Date(stamp.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: '2-digit',
                    year: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
      
      {/* Empty Slots */}
      {[...Array(Math.max(0, 4 - pageStamps.length))].map((_, index) => (
        <div
          key={`empty-${index}`}
          className="glass p-2 md:p-3 rounded-xl border-2 md:border-3 border-dashed border-gray-300 dark:border-gray-700 opacity-30 min-h-[120px] md:min-h-[140px]"
        >
          <div className="h-full flex flex-col items-center justify-center text-center space-y-1">
            <div className="text-xl md:text-2xl opacity-50">🔒</div>
            <p className="text-[9px] md:text-[10px] text-muted-foreground">Awaiting Adventure</p>
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
        right: renderStampPage(visibleStamps.slice(0, 4))
      };
    }
    
    const startIndex = (pageNum - 1) * 8 + 4;
    const leftStamps = visibleStamps.slice(startIndex, startIndex + 4);
    const rightStamps = visibleStamps.slice(startIndex + 4, startIndex + 8);
    
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
      ...visibleStamps.map((stamp, i) => ({ type: 'stamp' as const, stamp, index: i })),
      ...Array(48 - visibleStamps.length).fill(null).map((_, i) => ({ type: 'empty' as const, index: i }))
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
              <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-gray-300/50 to-transparent dark:from-gray-700/50" />
              
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
                        {user.displayName}
                      </h1>
                      <p className="text-neutral-dark dark:text-gray-400">Cultural Explorer</p>
                    </motion.div>
                    <div className="glass p-4 rounded-xl inline-block">
                      <div className="text-3xl font-bold text-gradient">{stamps.length}/48</div>
                      <div className="text-xs text-neutral-dark">Stamps Collected</div>
                    </div>
                    <img
                      src={user.avatar}
                      alt={user.displayName}
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
                    <div className="glass-strong p-6 rounded-xl border-4 border-dashed border-primary/30 relative overflow-hidden min-h-[300px]">
                      {/* Stamp Image */}
                      {currentContent.stamp.stampImage ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <motion.img 
                            src={currentContent.stamp.stampImage}
                            alt={`${currentContent.stamp.countryName} stamp`}
                            className="w-full h-full object-contain p-4"
                            initial={{ rotate: -10, scale: 0 }}
                            animate={{ rotate: Math.random() * 10 - 5, scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            style={{ filter: 'drop-shadow(3px 3px 6px rgba(0,0,0,0.4))' }}
                          />
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center opacity-20">
                          <span className="text-9xl">{currentContent.stamp.icon}</span>
                        </div>
                      )}
                      
                      {/* Content overlay at bottom */}
                      <div className="relative z-10 flex flex-col justify-end h-full min-h-[280px]">
                        <div className="bg-white/90 dark:bg-black/70 backdrop-blur-sm rounded-lg p-3">
                          <h3 className="font-bold text-xl leading-tight">{currentContent.stamp.topicName}</h3>
                          <p className="text-muted-foreground">{currentContent.stamp.countryName}</p>
                          <div className="font-mono text-sm text-muted-foreground mt-1">
                            {new Date(currentContent.stamp.date).toLocaleDateString('en-US', {
                              month: 'long',
                              day: '2-digit',
                              year: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Page number */}
                    <div className="text-center text-muted-foreground text-sm">
                      Stamp {currentContent.index + 1} of {visibleStamps.length}
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

  return (
    <div className="h-screen bg-gradient-soft flex flex-col overflow-hidden">
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="flex-1 flex flex-col items-center justify-center p-2 md:p-4 max-w-7xl mx-auto w-full">

        {/* Mobile View - Single Page Flip */}
        {isMobile && (
          <div className="flex-1 flex items-center justify-center w-full overflow-hidden">
            {renderMobilePage()}
          </div>
        )}

        {/* Desktop View - Book Spread */}
        {!isMobile && (
          <div className="flex-1 flex items-center justify-center w-full overflow-hidden">
            {/* Passport Book */}
            <div className="relative w-full h-full flex items-center justify-center" style={{ perspective: '2000px' }}>
              <div className="relative w-full max-w-5xl" style={{ height: 'calc(100vh - 180px)', maxHeight: '600px' }}>
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
                      <div className="relative bg-white dark:bg-gray-900 rounded-l-3xl shadow-2xl overflow-hidden">
                        {pageContent.left}
                        {/* Page binding effect */}
                        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-gray-900/10" />
                      </div>

                      {/* Right Page */}
                      <div className="relative bg-white dark:bg-gray-900 rounded-r-3xl shadow-2xl overflow-hidden">
                        {pageContent.right}
                        {/* Page binding effect */}
                        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-l from-transparent to-gray-900/10" />
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}

        {/* Navigation - Compact */}
        <div className="flex items-center justify-between mt-2 md:mt-4 max-w-md mx-auto px-4 w-full shrink-0">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={prevPage}
            disabled={currentPage === 0 || isFlipping}
            className="glass p-2 md:p-3 rounded-full disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
          </motion.button>

          {/* Page Indicators */}
          <div className="flex gap-1 flex-wrap justify-center max-w-[180px]">
            {[...Array(isMobile ? Math.min(totalMobilePages, 10) : totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => !isFlipping && setCurrentPage(index)}
                className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all ${
                  index === currentPage
                    ? 'bg-primary w-3 md:w-4'
                    : 'bg-gray-300 dark:bg-gray-700'
                }`}
              />
            ))}
            {isMobile && totalMobilePages > 10 && (
              <span className="text-[10px] text-muted-foreground">...</span>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={nextPage}
            disabled={(isMobile ? currentPage >= totalMobilePages - 1 : currentPage >= totalPages - 1) || isFlipping}
            className="glass p-2 md:p-3 rounded-full disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
          >
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
