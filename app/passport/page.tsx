'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useAuth, CountryProgress } from '@/lib/auth-context';
import { ToastContainer, useToast } from '@/components/toast';

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.meowtimap.smoltako.space';

// Country configuration with stamp images and display names
const COUNTRY_CONFIG: Record<string, { name: string; stampImage: string; icon: string }> = {
  'japan': { name: 'Japan', stampImage: '/stamp/japan.png', icon: '🇯🇵' },
  'south-korea': { name: 'South Korea', stampImage: '/stamp/south-korea.png', icon: '🇰🇷' },
  'thailand': { name: 'Thailand', stampImage: '/stamp/thailand.png', icon: '🇹🇭' },
  'malaysia': { name: 'Malaysia', stampImage: '/stamp/malaysia.png', icon: '🇲🇾' },
  'indonesia': { name: 'Indonesia', stampImage: '/stamp/indonesia.png', icon: '🇮🇩' },
  'china': { name: 'China', stampImage: '', icon: '🇨🇳' },
  'vietnam': { name: 'Vietnam', stampImage: '', icon: '🇻🇳' },
  'singapore': { name: 'Singapore', stampImage: '', icon: '🇸🇬' },
  'india': { name: 'India', stampImage: '', icon: '🇮🇳' },
  'philippines': { name: 'Philippines', stampImage: '', icon: '🇵🇭' },
};

// Stamp interface for passport display
interface PassportStamp {
  id: string;
  countrySlug: string;
  countryName: string;
  stampImage: string;
  icon: string;
  collectedAt: string;
}

export default function PassportPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'left' | 'right'>('right');
  const [totalCountries, setTotalCountries] = useState(Object.keys(COUNTRY_CONFIG).length); // Default to config length
  const { toasts, removeToast, info } = useToast();

  // Fetch total countries from backend
  useEffect(() => {
    const fetchCountryCount = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/country/count`);
        const data = await response.json();
        if (data.success && data.count) {
          setTotalCountries(data.count);
        }
      } catch (error) {
        console.error('Failed to fetch country count:', error);
        // Keep default value on error
      }
    };
    fetchCountryCount();
  }, []);
  
  // Generate stamps from user's countriesProgress
  const collectedStamps = useMemo(() => {
    if (!user?.countriesProgress) return [];
    
    return user.countriesProgress
      .filter((cp: CountryProgress) => cp.stampCollectedAt)
      .map((cp: CountryProgress, index: number): PassportStamp => {
        const config = COUNTRY_CONFIG[cp.countrySlug] || {
          name: cp.countrySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          stampImage: '',
          icon: '🌍'
        };
        return {
          id: `stamp-${cp.countrySlug}-${index}`,
          countrySlug: cp.countrySlug,
          countryName: config.name,
          stampImage: config.stampImage,
          icon: config.icon,
          collectedAt: cp.stampCollectedAt!,
        };
      })
      .sort((a, b) => new Date(a.collectedAt).getTime() - new Date(b.collectedAt).getTime());
  }, [user?.countriesProgress]);

  const totalStampsCollected = collectedStamps.length;
  const totalPages = Math.ceil((totalStampsCollected + 4) / 4); // 4 stamps per page spread
  const dragX = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const totalMobilePages = 1 + totalStampsCollected; // Cover + one page per stamp

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Show toast on initial load
  useEffect(() => {
    if (!authLoading && user) {
      info('My Passport', `Page 1 of ${isMobile ? totalMobilePages : totalPages}`, '🐾');
    }
  }, [authLoading]);

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

  // Get max pages based on device type
  const maxPages = isMobile ? totalMobilePages : totalPages;

  const nextPage = () => {
    if (currentPage < maxPages - 1 && !isFlipping) {
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
    if (info.offset.x < -threshold && currentPage < maxPages - 1) {
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
          <div className="text-2xl md:text-3xl font-bold text-gradient">{totalStampsCollected}/{totalCountries}</div>
          <div className="text-xs text-neutral-dark">Stamps Collected</div>
        </div>
        <div className="text-4xl md:text-6xl opacity-20 absolute bottom-4 md:bottom-8 right-4 md:right-8">🐾</div>
      </motion.div>
    </div>
  );

  const renderStampPage = (pageStamps: PassportStamp[], isRightPage: boolean = false) => (
    <div className="relative w-full h-full p-4 md:p-6">
      {/* Passport page background texture */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(0,0,0,0.03) 20px, rgba(0,0,0,0.03) 21px)',
        }} />
      </div>
      
      {/* Stamps scattered on the page */}
      {pageStamps.map((stamp, index) => {
        // Random positioning and rotation for realistic stamp look
        const positions = [
          { top: '5%', left: '5%', rotate: -8 },
          { top: '8%', left: '50%', rotate: 12 },
          { top: '45%', left: '10%', rotate: -5 },
          { top: '48%', left: '55%', rotate: 8 },
        ];
        const pos = positions[index % 4];
        
        return (
          <motion.div
            key={stamp.id}
            initial={{ opacity: 0, scale: 0, rotate: pos.rotate - 20 }}
            animate={{ opacity: 1, scale: 1, rotate: pos.rotate }}
            transition={{ 
              delay: index * 0.15, 
              type: "spring", 
              stiffness: 200,
              damping: 15
            }}
            className="absolute w-[42%] md:w-[40%] aspect-square"
            style={{ 
              top: pos.top, 
              left: pos.left,
              filter: 'drop-shadow(2px 3px 4px rgba(0,0,0,0.25))'
            }}
          >
            {stamp.stampImage ? (
              <img 
                src={stamp.stampImage}
                alt={`${stamp.countryName} stamp`}
                className="w-full h-full object-contain"
                style={{ 
                  opacity: 0.92,
                }}
              />
            ) : (
              /* Fallback stamp design */
              <div className="w-full h-full flex items-center justify-center">
                <div 
                  className="w-[90%] h-[90%] rounded-full border-4 border-red-600/70 flex items-center justify-center"
                  style={{ 
                    background: 'radial-gradient(circle, rgba(220,38,38,0.1) 0%, transparent 70%)'
                  }}
                >
                  <span className="text-4xl md:text-5xl">{stamp.icon}</span>
                </div>
              </div>
            )}
          </motion.div>
        );
      })}
      
      {/* Page number */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 font-mono">
        {isRightPage ? currentPage * 2 + 2 : currentPage * 2 + 1}
      </div>
    </div>
  );

  const getPageContent = (pageNum: number) => {
    if (pageNum === 0) {
      // First page spread: cover + first stamps
      return {
        left: renderCover(),
        right: renderStampPage(collectedStamps.slice(0, 4), true)
      };
    }
    
    const startIndex = (pageNum - 1) * 8 + 4;
    const leftStamps = collectedStamps.slice(startIndex, startIndex + 4);
    const rightStamps = collectedStamps.slice(startIndex + 4, startIndex + 8);
    
    return {
      left: renderStampPage(leftStamps, false),
      right: renderStampPage(rightStamps, true)
    };
  };

  const pageContent = getPageContent(currentPage);

  // Mobile single page view with flip effect
  const renderMobilePage = () => {
    const allPages: ({ type: 'cover' } | { type: 'stamp'; stamp: PassportStamp; index: number } | { type: 'empty'; index: number })[] = [
      { type: 'cover' as const },
      ...collectedStamps.map((stamp, i) => ({ type: 'stamp' as const, stamp, index: i })),
    ];

    const currentContent = allPages[currentPage] || { type: 'empty', index: 0 };

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
              className="relative rounded-2xl shadow-2xl overflow-hidden"
              style={{ 
                transformStyle: 'preserve-3d',
                minHeight: '500px',
                backgroundColor: '#f5f0e8'
              }}
            >
              {/* Page Edge Effect */}
              <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-gray-400/30 to-transparent" />
              
              {/* Passport paper texture */}
              <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
                backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")'
              }} />
              
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
                      <div className="text-3xl font-bold text-gradient">{totalStampsCollected}/{totalCountries}</div>
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
                    initial={{ opacity: 0, scale: 0, rotate: -15 }}
                    animate={{ opacity: 1, scale: 1, rotate: Math.random() * 16 - 8 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="flex items-center justify-center min-h-[400px]"
                  >
                    {/* Stamp only - no frame */}
                    {currentContent.stamp.stampImage ? (
                      <img 
                        src={currentContent.stamp.stampImage}
                        alt={`${currentContent.stamp.countryName} stamp`}
                        className="w-[80%] max-w-[280px] aspect-square object-contain"
                        style={{ 
                          filter: 'drop-shadow(3px 4px 6px rgba(0,0,0,0.35))',
                          opacity: 0.92
                        }}
                      />
                    ) : (
                      <div 
                        className="w-[70%] max-w-[240px] aspect-square rounded-full border-4 border-red-600/70 flex items-center justify-center"
                        style={{ 
                          background: 'radial-gradient(circle, rgba(220,38,38,0.15) 0%, transparent 70%)',
                          filter: 'drop-shadow(2px 3px 5px rgba(0,0,0,0.3))'
                        }}
                      >
                        <span className="text-7xl">{currentContent.stamp.icon}</span>
                      </div>
                    )}
                  </motion.div>
                )}
                
                {currentContent.type === 'empty' && (
                  <div className="min-h-[400px] flex flex-col items-center justify-center opacity-30">
                    <div className="text-6xl opacity-50 mb-4">🔒</div>
                    <p className="text-muted-foreground text-center text-sm">
                      Empty Page
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
                      <div className="relative rounded-l-3xl shadow-2xl overflow-hidden" style={{ backgroundColor: '#f5f0e8' }}>
                        {/* Passport paper texture */}
                        <div className="absolute inset-0 opacity-30" style={{
                          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")'
                        }} />
                        {pageContent.left}
                        {/* Page binding effect */}
                        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-gray-900/15" />
                      </div>

                      {/* Right Page */}
                      <div className="relative rounded-r-3xl shadow-2xl overflow-hidden" style={{ backgroundColor: '#f5f0e8' }}>
                        {/* Passport paper texture */}
                        <div className="absolute inset-0 opacity-30" style={{
                          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")'
                        }} />
                        {pageContent.right}
                        {/* Page binding effect */}
                        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-l from-transparent to-gray-900/15" />
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
