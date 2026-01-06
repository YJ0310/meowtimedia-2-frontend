'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Moon, Sun, Book } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function Navbar() {
  const { user, isAuthenticated, login } = useAuth();
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
              <img src="/logo.png" alt="Paw" className="w-8 h-8 object-contain animate-paw" />
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

              {isAuthenticated && user ? (
                <Link href="/profile" className="flex items-center gap-2 group">
                  <img 
                    src={user.avatar} 
                    alt={user.displayName}
                    className="w-9 h-9 rounded-full border-2 border-primary/50 group-hover:border-primary transition-colors"
                  />
                </Link>
              ) : (
                <button 
                  onClick={login}
                  className="px-4 py-2 rounded-full bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Dock - Full width with fixed aspect ratio */}
      <nav className="mobile-dock md:hidden fixed bottom-4 left-2 right-2 z-50 bg-white/20 dark:bg-black/30 backdrop-blur-2xl backdrop-saturate-150 border border-white/30 dark:border-white/10 shadow-xl shadow-black/10 rounded-full transition-all duration-300" style={{ height: 'clamp(48px, 12vw, 64px)' }}>
        <div className="flex items-center justify-around h-full w-full px-2">
          <Link 
            href="/" 
            className="rounded-full hover:bg-primary/20 transition-colors active:scale-95 flex items-center justify-center" style={{ width: 'clamp(32px, 8vw, 40px)', height: 'clamp(32px, 8vw, 40px)' }}
          >
            <img src="/logo.png" alt="Paw" className="w-full h-full object-contain" style={{ maxWidth: 'clamp(20px, 5vw, 28px)', maxHeight: 'clamp(20px, 5vw, 28px)' }} />
          </Link>

          <Link 
            href="/dashboard" 
            className="rounded-full hover:bg-primary/20 transition-colors active:scale-95 flex items-center justify-center" style={{ width: 'clamp(32px, 8vw, 40px)', height: 'clamp(32px, 8vw, 40px)' }}
          >
            <svg style={{ width: 'clamp(18px, 4.5vw, 24px)', height: 'clamp(18px, 4.5vw, 24px)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </Link>

          <Link 
            href="/passport" 
            className="rounded-full hover:bg-primary/20 transition-colors active:scale-95 flex items-center justify-center" style={{ width: 'clamp(32px, 8vw, 40px)', height: 'clamp(32px, 8vw, 40px)' }}
          >
            <Book style={{ width: 'clamp(18px, 4.5vw, 24px)', height: 'clamp(18px, 4.5vw, 24px)' }} />
          </Link>

          <button
            onClick={toggleTheme}
            className="rounded-full hover:bg-primary/20 transition-colors active:scale-95 flex items-center justify-center"
            style={{ width: 'clamp(32px, 8vw, 40px)', height: 'clamp(32px, 8vw, 40px)' }}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon style={{ width: 'clamp(18px, 4.5vw, 24px)', height: 'clamp(18px, 4.5vw, 24px)' }} /> : <Sun style={{ width: 'clamp(18px, 4.5vw, 24px)', height: 'clamp(18px, 4.5vw, 24px)' }} />}
          </button>

          <Link 
            href="/profile" 
            className="rounded-full border-2 border-primary active:scale-95 transition-transform flex items-center justify-center overflow-hidden"
            style={{ width: 'clamp(32px, 8vw, 40px)', height: 'clamp(32px, 8vw, 40px)' }}
          >
            {isAuthenticated && user ? (
              <img 
                src={user.avatar} 
                alt={user.displayName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary text-xs font-bold">?</span>
              </div>
            )}
          </Link>
        </div>
      </nav>
    </>
  );
}
