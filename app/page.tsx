'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles, Globe, Stamp, Map } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

// Floating particles component
const FloatingParticles = () => {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-primary/30 dark:bg-primary/20"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.random() * 50 - 25, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

// Interactive cat paw cursor trail
const PawTrail = () => {
  const [paws, setPaws] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (Math.random() > 0.9) {
        const newPaw = { id: Date.now(), x: e.clientX, y: e.clientY };
        setPaws((prev) => [...prev.slice(-5), newPaw]);
        setTimeout(() => {
          setPaws((prev) => prev.filter((p) => p.id !== newPaw.id));
        }, 1000);
      }
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <>
      {paws.map((paw) => (
        <motion.div
          key={paw.id}
          className="fixed pointer-events-none z-50 text-2xl"
          style={{ left: paw.x - 12, top: paw.y - 12 }}
          initial={{ opacity: 1, scale: 0 }}
          animate={{ opacity: 0, scale: 1, rotate: Math.random() * 40 - 20 }}
          transition={{ duration: 1 }}
        >
          🐾
        </motion.div>
      ))}
    </>
  );
};

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  const countries = [
    { name: 'Japan', emoji: '🇯🇵', x: 75, y: 30 },
    { name: 'Korea', emoji: '🇰🇷', x: 70, y: 35 },
    { name: 'China', emoji: '🇨🇳', x: 60, y: 40 },
    { name: 'Thailand', emoji: '🇹🇭', x: 55, y: 55 },
    { name: 'Vietnam', emoji: '🇻🇳', x: 58, y: 50 },
    { name: 'Indonesia', emoji: '🇮🇩', x: 62, y: 70 },
    { name: 'Malaysia', emoji: '🇲🇾', x: 55, y: 62 },
    { name: 'Philippines', emoji: '🇵🇭', x: 68, y: 55 },
    { name: 'Singapore', emoji: '🇸🇬', x: 56, y: 65 },
    { name: 'India', emoji: '🇮🇳', x: 42, y: 45 },
  ];

  return (
    <div ref={containerRef} className="min-h-screen relative overflow-hidden">
      {/* Dynamic Gradient Background */}
      <motion.div 
        className="fixed inset-0"
        style={{
          background: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, 
            rgba(168, 190, 223, 0.3) 0%, 
            rgba(199, 213, 232, 0.2) 25%, 
            rgba(239, 228, 212, 0.15) 50%, 
            transparent 70%)`,
        }}
      />
      
      {/* Base gradient */}
      <div className="fixed inset-0 bg-linear-to-br from-white via-meow-secondary/20 to-meow-accent/30 dark:from-black dark:via-gray-900 dark:to-black" />
      
      {/* Animated mesh gradient */}
      <motion.div
        className="fixed inset-0 opacity-40 dark:opacity-20"
        style={{ y: backgroundY }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(168,190,223,0.5),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_80%_120%,rgba(239,228,212,0.5),transparent)]" />
      </motion.div>

      <FloatingParticles />
      <PawTrail />
      
      {/* Interactive Map Background */}
      <div className="fixed inset-0 flex items-center justify-center">
        {countries.map((country, i) => (
          <motion.div
            key={country.name}
            className="absolute cursor-pointer group"
            style={{ left: `${country.x}%`, top: `${country.y}%` }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 + i * 0.1, type: "spring" }}
            whileHover={{ scale: 1.5, zIndex: 10 }}
          >
            <motion.div
              className="relative"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2 + i * 0.3, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="text-3xl md:text-4xl filter drop-shadow-lg">{country.emoji}</span>
              <motion.div
                className="absolute -inset-4 rounded-full bg-primary/20"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
              />
              {/* Tooltip */}
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="frosted px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                  {country.name}
                </div>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Hero Section */}
        <div className="flex-1 flex items-center justify-center px-4 pt-20">
          <div className="text-center space-y-8 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="space-y-6"
            >
              {/* Animated Logo */}
              <motion.div 
                className="flex items-center justify-center gap-3 md:gap-6"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <motion.span 
                  className="text-5xl md:text-8xl"
                  animate={{ 
                    rotate: [0, 15, -15, 0],
                    y: [0, -10, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  🐾
                </motion.span>
                <h1 className="text-6xl md:text-[10rem] font-bold text-gradient leading-none tracking-tight">
                  Meowtimap
                </h1>
                <motion.span 
                  className="text-5xl md:text-8xl"
                  animate={{ 
                    rotate: [0, -15, 15, 0],
                    y: [0, -10, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                >
                  🐾
                </motion.span>
              </motion.div>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-xl md:text-3xl text-muted-foreground font-light max-w-2xl mx-auto"
              >
                Collect cultures. Earn stamps. Fall in love with Asia.
              </motion.p>
            </motion.div>

            {/* Animated Features */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-wrap items-center justify-center gap-4 md:gap-6"
            >
              {[
                { icon: Globe, text: '10 Countries', color: 'text-blue-500' },
                { icon: Map, text: '80+ Topics', color: 'text-green-500' },
                { icon: Stamp, text: '48 Stamps', color: 'text-amber-500' },
              ].map((feature, i) => (
                <motion.div
                  key={feature.text}
                  className="frosted px-5 py-3 rounded-2xl flex items-center gap-3"
                  whileHover={{ scale: 1.05, y: -5 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + i * 0.1 }}
                >
                  <feature.icon className={`w-5 h-5 ${feature.color}`} />
                  <span className="font-semibold">{feature.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="pb-12 px-4"
        >
          <div className="max-w-2xl mx-auto">
            <motion.div
              className="frosted rounded-3xl p-8 md:p-12 text-center space-y-6"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 5, repeat: Infinity }}
              >
                <Sparkles className="w-12 h-12 mx-auto text-primary mb-4" />
              </motion.div>
              
              <h2 className="text-2xl md:text-4xl font-bold">
                Your Journey Awaits
              </h2>
              <p className="text-muted-foreground text-lg max-w-md mx-auto">
                Explore fascinating Asian countries, unlock cultural knowledge, 
                and build your digital passport one stamp at a time.
              </p>
              
              <Link href="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(168, 190, 223, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  className="gradient-primary text-white dark:text-black px-10 py-5 rounded-2xl text-xl font-bold flex items-center gap-4 mx-auto shadow-xl transition-all"
                >
                  Begin Your Journey
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-6 h-6" />
                  </motion.div>
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

