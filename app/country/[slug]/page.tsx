'use client';

import { use, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, PartyPopper, UtensilsCrossed, Lightbulb, HelpCircle } from 'lucide-react';
import { countries, countryContent, countryQuizzes } from '@/lib/mock-data';
import { useAuth } from '@/lib/auth-context';
import GlobalLoading from '@/components/global-loading';
import ContentCard from '@/components/content-card';
import QuizCard from '@/components/quiz-card';

type TabType = 'festival' | 'food' | 'funfact' | 'quiz';

const tabConfig = {
  festival: { icon: PartyPopper, label: 'Festivals', color: 'text-pink-500' },
  food: { icon: UtensilsCrossed, label: 'Food', color: 'text-orange-500' },
  funfact: { icon: Lightbulb, label: 'Fun Facts', color: 'text-yellow-500' },
  quiz: { icon: HelpCircle, label: 'Quiz', color: 'text-blue-500' },
};

export default function CountryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { user, isLoading: authLoading } = useAuth();
  const resolvedParams = use(params);
  const [activeTab, setActiveTab] = useState<TabType>('festival');
  
  const country = countries.find(c => c.slug === resolvedParams.slug);
  const content = countryContent.filter(c => c.countrySlug === resolvedParams.slug);
  const quizData = countryQuizzes.find(q => q.countrySlug === resolvedParams.slug);

  // Filter content by type
  const festivals = content.filter(c => c.type === 'festival');
  const foods = content.filter(c => c.type === 'food');
  const funfacts = content.filter(c => c.type === 'funfact');

  // Show loading while checking auth
  if (authLoading) {
    return (
      <GlobalLoading 
        isLoading={true} 
        title={`Loading ${country?.name || 'Country'}`}
        subtitle="Discovering cultural treasures..." 
      />
    );
  }

  // If no user, show nothing (auth context will redirect)
  if (!user) {
    return null;
  }

  if (!country) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-soft">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Country Not Found</h1>
          <Link href="/dashboard" className="text-primary hover:underline">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'festival':
        return (
          <div className="space-y-4">
            {festivals.length > 0 ? (
              festivals.map((item, index) => (
                <ContentCard
                  key={item.id}
                  title={item.title}
                  content={item.content}
                  image={item.image}
                  imagePosition={index % 2 === 0 ? 'left' : 'right'}
                  index={index}
                />
              ))
            ) : (
              <div className="glass-strong rounded-2xl p-12 text-center">
                <PartyPopper className="w-16 h-16 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">No Festivals Yet</h3>
                <p className="text-muted-foreground">Festival content coming soon!</p>
              </div>
            )}
          </div>
        );
      case 'food':
        return (
          <div className="space-y-4">
            {foods.length > 0 ? (
              foods.map((item, index) => (
                <ContentCard
                  key={item.id}
                  title={item.title}
                  content={item.content}
                  image={item.image}
                  imagePosition={index % 2 === 0 ? 'left' : 'right'}
                  index={index}
                />
              ))
            ) : (
              <div className="glass-strong rounded-2xl p-12 text-center">
                <UtensilsCrossed className="w-16 h-16 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">No Food Content Yet</h3>
                <p className="text-muted-foreground">Delicious recipes coming soon!</p>
              </div>
            )}
          </div>
        );
      case 'funfact':
        return (
          <div className="space-y-4">
            {funfacts.length > 0 ? (
              funfacts.map((item, index) => (
                <ContentCard
                  key={item.id}
                  title={item.title}
                  content={item.content}
                  image={item.image}
                  imagePosition={index % 2 === 0 ? 'left' : 'right'}
                  index={index}
                />
              ))
            ) : (
              <div className="glass-strong rounded-2xl p-12 text-center">
                <Lightbulb className="w-16 h-16 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">No Fun Facts Yet</h3>
                <p className="text-muted-foreground">Amazing facts coming soon!</p>
              </div>
            )}
          </div>
        );
      case 'quiz':
        return (
          <QuizCard
            countrySlug={country.slug}
            countryName={country.name}
            highestScore={quizData?.highestScore || 0}
            totalQuestions={quizData?.totalQuestions || 10}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Left Side Dock - Desktop */}
      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="hidden md:flex fixed left-6 top-1/2 -translate-y-1/2 z-50 flex-col gap-3"
      >
        <div className="bg-white/10 dark:bg-black/30 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-3 shadow-2xl">
          {(Object.keys(tabConfig) as TabType[]).map((tab) => {
            const { icon: Icon, label, color } = tabConfig[tab];
            const isActive = activeTab === tab;
            return (
              <motion.button
                key={tab}
                onClick={() => setActiveTab(tab)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`relative w-14 h-14 rounded-xl flex items-center justify-center transition-all mb-2 last:mb-0 group ${
                  isActive 
                    ? 'bg-primary/20 shadow-lg' 
                    : 'hover:bg-white/10'
                }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'text-primary' : color}`} />
                {/* Tooltip */}
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-black/80 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {label}
                </div>
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 border-2 border-primary rounded-xl"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.aside>

      {/* Mobile Bottom Dock */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
      >
        <div className="bg-white/10 dark:bg-black/30 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-2 shadow-2xl flex gap-2">
          {(Object.keys(tabConfig) as TabType[]).map((tab) => {
            const { icon: Icon, color } = tabConfig[tab];
            const isActive = activeTab === tab;
            return (
              <motion.button
                key={tab}
                onClick={() => setActiveTab(tab)}
                whileTap={{ scale: 0.95 }}
                className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                  isActive 
                    ? 'bg-primary/20' 
                    : 'hover:bg-white/10'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : color}`} />
                {isActive && (
                  <motion.div
                    layoutId="activeMobileTab"
                    className="absolute inset-0 border-2 border-primary rounded-xl"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="md:pl-28 container mx-auto px-4 py-8 pb-32 md:pb-8">
        {/* Back Button & Country Header */}
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
          
          {/* Country Header Card */}
          <div className="glass-strong rounded-3xl p-6 md:p-8">
            <div className="flex items-center gap-4 md:gap-6">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                {country.flag.startsWith('/') ? (
                  <img src={country.flag} alt={country.name} className="w-16 h-16 md:w-20 md:h-20 object-contain" />
                ) : (
                  <span className="text-5xl md:text-7xl">{country.flag}</span>
                )}
              </motion.div>
              <div>
                <h1 className="text-3xl md:text-5xl font-bold text-black dark:text-white">{country.name}</h1>
                <p className="text-muted-foreground mt-1 md:mt-2">{country.description}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Section Header */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-black dark:text-white flex items-center gap-3">
            {(() => {
              const { icon: Icon, label, color } = tabConfig[activeTab];
              return (
                <>
                  <Icon className={`w-8 h-8 ${color}`} />
                  {label}
                </>
              );
            })()}
          </h2>
        </motion.div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
