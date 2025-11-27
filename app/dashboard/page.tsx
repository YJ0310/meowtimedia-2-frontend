'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { X, ArrowRight, ChevronLeft } from 'lucide-react';
import { countries, mockUser, stamps } from '@/lib/mock-data';
import ProgressCircle from '@/components/progress-circle';

export default function DashboardPage() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const country = selectedCountry ? countries.find(c => c.slug === selectedCountry) : null;
  const userStamps = stamps.filter(s => s.countrySlug === selectedCountry);

  return (
    <div className="min-h-screen relative bg-gradient-soft">
      {/* Sidebar - My Passport */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        className="fixed left-0 top-16 bottom-0 w-80 glass-strong border-r border-white/20 z-40 overflow-y-auto"
      >
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-10 top-4 p-2 glass rounded-r-lg"
        >
          <ChevronLeft className={`w-5 h-5 transition-transform ${!sidebarOpen ? 'rotate-180' : ''}`} />
        </button>

        <div className="p-6 space-y-6">
          {/* User Profile */}
          <div className="text-center space-y-3">
            <img 
              src={mockUser.image} 
              alt={mockUser.name}
              className="w-24 h-24 rounded-full mx-auto border-4 border-primary shadow-lg"
            />
            <div>
              <h2 className="text-xl font-bold">{mockUser.name}</h2>
              <p className="text-sm text-muted-foreground">{mockUser.email}</p>
            </div>
            <div className="glass p-3 rounded-lg">
              <div className="text-3xl font-bold text-gradient">{mockUser.totalStamps}/48</div>
              <div className="text-xs text-muted-foreground">Stamps Collected</div>
            </div>
          </div>

          {/* Countries Progress */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Your Progress
            </h3>
            <div className="space-y-2">
              {countries.map((c) => {
                const countryStamps = stamps.filter(s => s.countrySlug === c.slug).length;
                return (
                  <motion.button
                    key={c.id}
                    onClick={() => setSelectedCountry(c.slug)}
                    whileHover={{ scale: 1.02 }}
                    className={`w-full glass p-3 rounded-lg text-left transition-all ${
                      selectedCountry === c.slug ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{c.flag}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">{c.name}</div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full gradient-primary"
                              initial={{ width: 0 }}
                              animate={{ width: `${c.progress}%` }}
                              transition={{ duration: 1 }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{c.progress}%</span>
                        </div>
                      </div>
                      {countryStamps > 0 && (
                        <div className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                          {countryStamps} 🐾
                        </div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Map Area */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-80' : 'ml-0'}`}>
        <div className="relative min-h-screen p-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8 space-y-2"
            >
              <h1 className="text-5xl font-bold text-gradient">Explore Asia</h1>
              <p className="text-muted-foreground text-lg">
                Click on any country to begin your cultural journey
              </p>
            </motion.div>

            {/* Interactive Map SVG */}
            <div className="relative w-full aspect-[16/10] glass-strong rounded-3xl p-8 overflow-hidden">
              <svg viewBox="0 0 1000 600" className="w-full h-full">
                {/* Map Background */}
                <motion.path
                  d="M 150,120 Q 300,80 450,100 T 700,140 Q 800,170 850,220 T 900,320 Q 880,440 750,500 T 500,530 Q 350,510 250,450 T 150,360 Q 130,240 150,120 Z"
                  fill="currentColor"
                  className="text-primary/10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 2 }}
                />

                {/* Country Pins */}
                {countries.map((c, i) => {
                  const positions: { [key: string]: { x: number; y: number } } = {
                    'japan': { x: 820, y: 180 },
                    'south-korea': { x: 780, y: 200 },
                    'china': { x: 600, y: 220 },
                    'thailand': { x: 520, y: 340 },
                    'vietnam': { x: 550, y: 310 },
                    'indonesia': { x: 580, y: 440 },
                    'malaysia': { x: 540, y: 380 },
                    'philippines': { x: 680, y: 360 },
                    'singapore': { x: 540, y: 400 },
                    'india': { x: 350, y: 280 },
                  };

                  const pos = positions[c.slug] || { x: 500, y: 300 };

                  return (
                    <motion.g
                      key={c.id}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.5 + i * 0.1, type: "spring" }}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedCountry(c.slug)}
                    >
                      <motion.circle
                        cx={pos.x}
                        cy={pos.y}
                        r="12"
                        className={`${selectedCountry === c.slug ? 'fill-accent' : 'fill-primary'} transition-colors`}
                        whileHover={{ scale: 1.3 }}
                      />
                      <motion.circle
                        cx={pos.x}
                        cy={pos.y}
                        r="20"
                        className="fill-primary/20"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
                      />
                      <text
                        x={pos.x}
                        y={pos.y - 30}
                        textAnchor="middle"
                        className="text-xs font-semibold fill-current"
                      >
                        {c.flag}
                      </text>
                    </motion.g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Country Detail Panel */}
      <AnimatePresence>
        {country && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed right-0 top-16 bottom-0 w-full md:w-[480px] glass-strong border-l border-white/20 overflow-y-auto z-50"
          >
            <div className="p-6 space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-5xl">{country.flag}</span>
                  <div>
                    <h2 className="text-3xl font-bold">{country.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {country.unlockedTopics}/{country.totalTopics} topics unlocked
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCountry(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex justify-center">
                <ProgressCircle progress={country.progress} />
              </div>

              <div className="space-y-3">
                <p className="text-muted-foreground">{country.description}</p>
                <div className="glass p-4 rounded-lg">
                  <div className="text-sm font-semibold text-primary mb-1">Fun Fact</div>
                  <p className="text-sm">{country.funFact}</p>
                </div>
              </div>

              {userStamps.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold">Your Stamps</h3>
                  <div className="space-y-2">
                    {userStamps.map((stamp) => (
                      <div key={stamp.id} className="glass p-3 rounded-lg flex items-center gap-3">
                        <span className="text-2xl">{stamp.icon}</span>
                        <div className="flex-1">
                          <div className="font-semibold text-sm">{stamp.topicName}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(stamp.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Link href={`/country/${country.slug}`}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full gradient-primary text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg"
                >
                  Explore {country.name}
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
