'use client';

import { use, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Lock } from 'lucide-react';
import { countries, topics, stamps } from '@/lib/mock-data';
import ProgressCircle from '@/components/progress-circle';
import TopicCard from '@/components/topic-card';
import StampBadge from '@/components/stamp-badge';

export default function CountryPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const [activeTab, setActiveTab] = useState<'learn' | 'progress'>('learn');
  
  const country = countries.find(c => c.slug === resolvedParams.slug);
  const countryTopics = topics.filter(t => t.countrySlug === resolvedParams.slug);
  const countryStamps = stamps.filter(s => s.countrySlug === resolvedParams.slug);

  if (!country) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Country Not Found</h1>
          <Link href="/dashboard" className="text-primary hover:underline">
                Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link 
            href="/dashboard"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Map
          </Link>
          
          <div className="glass-strong rounded-3xl p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Country Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center gap-4 justify-center md:justify-start mb-4">
                  {country.flag.startsWith('/') ? (
                    <img src={country.flag} alt={country.name} className="w-20 h-20 object-contain" />
                  ) : (
                    <span className="text-7xl">{country.flag}</span>
                  )}
                  <div>
                    <h1 className="text-5xl font-bold">{country.name}</h1>
                    <p className="text-muted-foreground mt-2">
                      {country.unlockedTopics} of {country.totalTopics} topics unlocked
                    </p>
                  </div>
                </div>
                <p className="text-lg text-muted-foreground mb-4">{country.description}</p>
                <div className="glass p-4 rounded-lg inline-block">
                  <div className="text-sm font-semibold text-primary mb-1">Fun Fact</div>
                  <p className="text-sm">{country.funFact}</p>
                </div>
              </div>

              {/* Progress Circle */}
              <div className="flex-shrink-0">
                <ProgressCircle progress={country.progress} size={160} strokeWidth={10} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="glass-strong rounded-2xl p-2 mb-8 inline-flex">
          <button
            onClick={() => setActiveTab('learn')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'learn'
                ? 'gradient-primary text-white shadow-lg'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            Learn
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'progress'
                ? 'gradient-primary text-white shadow-lg'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            My Progress
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'learn' && (
          <motion.div
            key="learn"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {countryTopics.map((topic, index) => (
              <TopicCard key={topic.id} topic={topic} index={index} />
            ))}
          </motion.div>
        )}

        {activeTab === 'progress' && (
          <motion.div
            key="progress"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-3xl"
          >
            {countryStamps.length > 0 ? (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold mb-6">
                  Your Collected Stamps ({countryStamps.length})
                </h2>
                {countryStamps.map((stamp, index) => (
                  <StampBadge key={stamp.id} stamp={stamp} delay={index * 0.1} />
                ))}
              </div>
            ) : (
              <div className="glass-strong rounded-2xl p-12 text-center">
                <div className="text-6xl mb-4">🐾</div>
                <h3 className="text-2xl font-bold mb-2">No Stamps Yet</h3>
                <p className="text-muted-foreground">
                  Complete lessons to earn your first stamp from {country.name}!
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
