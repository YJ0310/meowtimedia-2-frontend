'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
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
                <motion.span 
                  className="text-4xl md:text-7xl"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  🐾
                </motion.span>
                <h1 className="text-5xl md:text-9xl font-bold text-gradient">
                  Meowtimap
                </h1>
                <motion.span 
                  className="text-4xl md:text-7xl"
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, delay: 0.3 }}
                >
                  🐾
                </motion.span>
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
              Explore 10 fascinating Asian countries, unlock cultural knowledge, 
              and build your digital passport one stamp at a time.
            </p>
            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="gradient-primary text-white px-8 py-4 rounded-xl text-lg font-semibold flex items-center gap-3 mx-auto shadow-xl hover:shadow-2xl transition-shadow"
              >
                Begin Your Journey
                <ArrowRight className="w-6 h-6" />
              </motion.button>
            </Link>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/20">
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
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

