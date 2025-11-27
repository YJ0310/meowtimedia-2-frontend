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
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-white/20">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-3xl animate-paw">🐾</span>
          <h1 className="text-2xl font-bold text-gradient">Meowtimap</h1>
        </Link>

        <div className="flex items-center gap-6">
          <Link 
            href="/dashboard" 
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-primary/20 transition-colors"
          >
            <span>Explore</span>
          </Link>

          <Link 
            href="/passport" 
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-primary/20 transition-colors"
          >
            <Book size={20} />
            <span className="hidden md:inline">Passport</span>
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
  );
}
