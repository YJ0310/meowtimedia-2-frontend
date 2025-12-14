'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Loader2, X } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function Home() {
  const router = useRouter();
  const { login, isAuthenticated, showAuthToast, setShowAuthToast } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isWindows, setIsWindows] = useState(false);

  // Detect OS for toast positioning
  useEffect(() => {
    setIsWindows(navigator.platform.toLowerCase().includes('win'));
  }, []);

  // Auto-hide auth toast after 5 seconds
  useEffect(() => {
    if (showAuthToast) {
      const timer = setTimeout(() => setShowAuthToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showAuthToast, setShowAuthToast]);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleBeginJourney = () => {
    setIsLoading(true);
    // Show loading animation briefly then redirect to Google OAuth
    setTimeout(() => {
      login();
    }, 800);
  };

  return (
    <>
      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center gap-6"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="w-12 h-12 text-primary" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <h2 className="text-2xl font-bold text-gradient">Preparing Your Journey</h2>
              <p className="text-muted-foreground mt-2">Loading your adventure...</p>
            </motion.div>
            <motion.div
              className="flex gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {['/japan.gif', '/south korea.gif', '/thailand.gif', '/malaysia.gif', '/indonesia.gif'].map((flag, i) => (
                <motion.img
                  key={i}
                  src={flag}
                  alt="Flag"
                  className="w-8 h-8 object-contain"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 0.5, delay: i * 0.1, repeat: Infinity, repeatDelay: 1 }}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Required Toast */}
      <AnimatePresence>
        {showAuthToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className={`fixed left-1/2 z-[200] ${isWindows ? 'top-4' : 'top-12'}`}
          >
            <div className="glass-strong rounded-xl px-6 py-4 shadow-2xl border border-amber-500/30 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                <span className="text-xl">🔐</span>
              </div>
              <div>
                <p className="font-semibold text-black dark:text-white">Login Required</p>
                <p className="text-sm text-muted-foreground">Please sign in to access this feature</p>
              </div>
              <button
                onClick={() => setShowAuthToast(false)}
                className="ml-2 p-1 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 gradient-soft opacity-40" />
      
      {/* Animated SVG Map */}
      <div className="fixed inset-0 flex items-center justify-center opacity-20">
        <svg width="100%" height="100%" viewBox="0 0 1000 600" className="max-w-7xl">
          {/* Simplified Asia Map SVG */}
          <motion.path
            d="M 200,150 Q 300,100 400,120 T 600,150 Q 700,180 750,220 T 800,300 Q 780,400 700,450 T 550,480 Q 400,460 300,420 T 200,350 Q 180,250 200,150 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-primary/40"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3, ease: "easeInOut" }}
          />
          
          {/* Animated Pins */}
          {[
            { x: 720, y: 200 }, // Japan
            { x: 680, y: 220 }, // Korea
            { x: 580, y: 250 }, // China
            { x: 520, y: 350 }, // Thailand
            { x: 500, y: 320 }, // Vietnam
            { x: 540, y: 420 }, // Indonesia
            { x: 520, y: 360 }, // Malaysia
            { x: 600, y: 380 }, // Philippines
            { x: 560, y: 380 }, // Singapore
            { x: 400, y: 280 }, // India
          ].map((pos, i) => (
            <motion.g
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1 + i * 0.2, duration: 0.6, type: "spring" }}
            >
              <motion.circle
                cx={pos.x}
                cy={pos.y}
                r="8"
                className="fill-primary animate-glow"
              />
              <motion.circle
                cx={pos.x}
                cy={pos.y}
                r="15"
                className="fill-primary/20"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
              />
            </motion.g>
          ))}
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top Section - Title */}
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-center gap-2 md:gap-4">
                <motion.img 
                  src="/logo.png"
                  alt="Paw"
                  className="w-12 h-12 md:w-24 md:h-24 object-contain"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                />
                <h1 className="text-5xl md:text-9xl font-bold text-gradient">
                  Meowtimap
                </h1>
                <motion.img 
                  src="/cat.png"
                  alt="Cat"
                  className="w-12 h-12 md:w-24 md:h-24 object-contain"
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, delay: 0.3 }}
                />
              </div>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-lg md:text-2xl lg:text-3xl text-muted-foreground font-light px-4"
              >
                Collect cultures. Earn stamps. Fall in love with Asia.
              </motion.p>
            </motion.div>
          </div>
        </div>

        {/* Bottom Section - Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="pb-12 px-4"
        >
          <div className="max-w-2xl mx-auto glass-strong rounded-3xl p-8 md:p-12 text-center space-y-6">
            <h2 className="text-2xl md:text-3xl font-semibold">
              Your Journey Awaits
            </h2>
            <p className="text-muted-foreground text-lg">
              Explore Asian countries, unlock cultural knowledge, 
              and build your digital passport one stamp at a time.
            </p>
            <motion.button
                onClick={handleBeginJourney}
                disabled={isLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="gradient-primary text-white px-8 py-4 rounded-xl text-lg font-semibold flex items-center gap-3 mx-auto shadow-xl hover:shadow-2xl transition-shadow disabled:opacity-50"
              >
                Begin Your Journey
                <ArrowRight className="w-6 h-6" />
              </motion.button>
            
            {/* Stats */}
            {/* <div className="grid grid-cols-3 gap-4 pt-8">
              <div>
                <div className="text-3xl font-bold text-primary">10</div>
                <div className="text-sm text-muted-foreground">Countries</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">80+</div>
                <div className="text-sm text-muted-foreground">Topics</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">48</div>
                <div className="text-sm text-muted-foreground">Stamps</div>
              </div>
            </div> */}
          </div>
        </motion.div>
      </div>
    </div>
    </>
  );
}
