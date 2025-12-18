"use client";

import { motion } from "framer-motion";
import { Play, Trophy } from "lucide-react";
import Link from "next/link";

interface QuizCardProps {
  countrySlug: string;
  countryName: string;
  highestScore?: number;
  totalQuestions?: number;
}

export default function QuizCard({
  countrySlug,
  countryName,
  highestScore = 0,
  totalQuestions = 10,
}: QuizCardProps) {
  const hasAttempted = highestScore > 0;
  const percentage = Math.round((highestScore / totalQuestions) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong rounded-2xl p-6 md:p-8 text-center space-y-6"
    >
      {/* Trophy Icon */}
      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        className="inline-block"
      >
        <div className="w-20 h-20 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
          <Trophy className="w-10 h-10 text-primary" />
        </div>
      </motion.div>

      {/* Title */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-black dark:text-white">
          {countryName} Quiz
        </h2>
        <p className="text-muted-foreground mt-2">
          Test your knowledge about {countryName}
        </p>
      </div>

      {/* Highest Score */}
      <div className="glass rounded-xl p-4">
        <div className="text-sm text-muted-foreground mb-1">Highest Score</div>
        {hasAttempted ? (
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl font-bold text-gradient">
              {highestScore}/{totalQuestions}
            </span>
            <span className="text-lg text-muted-foreground">({percentage}%)</span>
          </div>
        ) : (
          <div className="text-xl text-muted-foreground">Not attempted yet</div>
        )}
      </div>

      {/* Start Button */}
      <Link href={`/learn/${countrySlug}/quiz`}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-linear-to-r from-primary to-secondary text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transition-shadow"
        >
          <Play className="w-5 h-5" />
          {hasAttempted ? "Try Again" : "Start Quiz"}
        </motion.button>
      </Link>

      {/* Info */}
      <p className="text-xs text-muted-foreground">
        {totalQuestions} questions • Multiple choice
      </p>
    </motion.div>
  );
}
