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
      {/* Desktop Navbar */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 glass-strong border-b backdrop-blur-xl">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-3xl animate-paw">🐾</span>
            <h1 className="text-2xl font-bold logo-text text-gradient">Meowtimap</h1>
          </Link>

          <div className="flex items-center gap-6">
            <Link 
              href="/dashboard" 
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-primary/20 transition-colors"
            >
              <span>Explore</span>
            </Link>

            <Link 
              href="/passport" 
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-primary/20 transition-colors"
            >
              <Book size={20} />
              <span>Passport</span>
            </Link>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-primary/20 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            <Link href="/dashboard" className="flex items-center gap-2">
              <img 
                src={mockUser.image} 
                alt={mockUser.name}
                className="w-10 h-10 rounded-full border-2 border-primary"
              />
              <div className="hidden lg:block text-sm">
                <p className="font-semibold">{mockUser.name}</p>
                <p className="text-xs text-muted-foreground">{mockUser.totalStamps} stamps</p>
              </div>
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Dock */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg rounded-full px-6 py-3">
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
            href="/dashboard" 
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
