'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Moon, Sun, Book } from 'lucide-react';
import { mockUser } from '@/lib/mock-data';

export default function Navbar() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <>
      {/* Desktop Navbar - Frosted Glass Bar */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-white/20 dark:bg-black/30 backdrop-blur-2xl backdrop-saturate-150 border-b border-white/30 dark:border-white/10 shadow-lg shadow-black/5">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl animate-paw">🐾</span>
              <h1 className="text-xl font-bold logo-text text-gradient">Meowtimap</h1>
            </Link>

            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard" 
                className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/20 dark:hover:bg-white/10 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">Explore</span>
              </Link>

              <Link 
                href="/passport" 
                className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/20 dark:hover:bg-white/10 transition-colors"
              >
                <Book size={18} />
                <span className="text-sm font-medium">Passport</span>
              </Link>

              <div className="w-px h-6 bg-white/20" />

              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-white/20 dark:hover:bg-white/10 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </button>

              <Link href="/profile" className="flex items-center gap-2 group">
                <img 
                  src={mockUser.image} 
                  alt={mockUser.name}
                  className="w-9 h-9 rounded-full border-2 border-primary/50 group-hover:border-primary transition-colors"
                />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Dock */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white/20 dark:bg-black/30 backdrop-blur-2xl backdrop-saturate-150 border border-white/30 dark:border-white/10 shadow-xl shadow-black/10 rounded-full px-6 py-3">
        <div className="flex items-center gap-6">
          <Link 
            href="/" 
            className="p-2 rounded-full hover:bg-primary/20 transition-colors active:scale-95"
          >
            <span className="text-2xl">🐾</span>
          </Link>

          <Link 
            href="/dashboard" 
            className="p-2 rounded-full hover:bg-primary/20 transition-colors active:scale-95"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </Link>

          <Link 
            href="/passport" 
            className="p-2 rounded-full hover:bg-primary/20 transition-colors active:scale-95"
          >
            <Book size={24} />
          </Link>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-primary/20 transition-colors active:scale-95"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
          </button>

          <Link 
            href="/profile" 
            className="p-0 rounded-full border-2 border-primary active:scale-95 transition-transform"
          >
            <img 
              src={mockUser.image} 
              alt={mockUser.name}
              className="w-10 h-10 rounded-full"
            />
          </Link>
        </div>
      </nav>
    </>
  );
}
