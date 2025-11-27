'use client';

import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import Link from 'next/link';
import { Topic } from '@/lib/types';

interface TopicCardProps {
  topic: Topic;
  index: number;
}

export default function TopicCard({ topic, index }: TopicCardProps) {
  const CardContent = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`glass p-6 rounded-xl transition-all duration-300 ${
        topic.isUnlocked 
          ? 'hover:scale-105 hover:shadow-xl cursor-pointer' 
          : 'opacity-50 grayscale'
      }`}
    >
      <div className="flex flex-col items-center text-center gap-3">
        {topic.isUnlocked ? (
          <span className="text-5xl animate-float">{topic.icon}</span>
        ) : (
          <div className="relative">
            <span className="text-5xl opacity-50">{topic.icon}</span>
            <Lock className="absolute top-0 right-0 w-6 h-6 text-gray-400" />
          </div>
        )}
        <h3 className="font-semibold text-lg">{topic.name}</h3>
        <p className="text-sm text-muted-foreground">{topic.description}</p>
        {topic.isUnlocked && (
          <div className="mt-2 px-4 py-2 gradient-primary text-white rounded-lg text-sm font-medium">
            Start Learning
          </div>
        )}
        {!topic.isUnlocked && (
          <div className="mt-2 px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg text-sm">
            Locked
          </div>
        )}
      </div>
    </motion.div>
  );

  if (topic.isUnlocked) {
    return (
      <Link href={`/learn/${topic.countrySlug}/${topic.slug}`}>
        {CardContent}
      </Link>
    );
  }

  return CardContent;
}
