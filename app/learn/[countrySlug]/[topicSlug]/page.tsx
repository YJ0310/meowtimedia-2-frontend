'use client';

import { use, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, X, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { countries, topics, lessons } from '@/lib/mock-data';
import { useAuth } from '@/lib/auth-context';
import { useBGM } from '@/lib/bgm-context';

export default function LessonPage({ 
  params 
}: { 
  params: Promise<{ countrySlug: string; topicSlug: string }> 
}) {
  const { user, isLoading: authLoading } = useAuth();
  const { startExperience, isAudioReady } = useBGM();
  const router = useRouter();
  const resolvedParams = use(params);
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);

  // Start music on any click if not already started
  const handlePageClick = () => {
    if (!isAudioReady) {
      startExperience();
    }
  };

  const lessonKey = `${resolvedParams.countrySlug}-${resolvedParams.topicSlug}`;
  const lesson = lessons[lessonKey];
  const country = countries.find(c => c.slug === resolvedParams.countrySlug);
  const topic = topics.find(t => t.countrySlug === resolvedParams.countrySlug && t.slug === resolvedParams.topicSlug);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-black dark:text-white">Loading lesson...</p>
        </motion.div>
      </div>
    );
  }

  // If no user, show nothing (auth context will redirect)
  if (!user) {
    return null;
  }

  if (!lesson || !country || !topic) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Lesson Not Found</h1>
          <Link href="/dashboard" className="text-primary hover:underline">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    
    const isCorrect = selectedAnswer === lesson.quiz[currentQuestion].correctAnswer;
    if (isCorrect) {
      setScore(score + 1);
    }
    setShowResult(true);

    setTimeout(() => {
      if (currentQuestion < lesson.quiz.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        setQuizComplete(true);
      }
    }, 2000);
  };

  const handleClaimStamp = () => {
    // Trigger confetti
    const duration = 3000;
    const end = Date.now() + duration;

    const colors = ['#A8BEDF', '#C7D5E8', '#EFE4D4', '#D8C9BA'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();

    setTimeout(() => {
      router.push(`/country/${resolvedParams.countrySlug}`);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-soft" onClick={handlePageClick}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link 
            href={`/country/${resolvedParams.countrySlug}`}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {country.name}
          </Link>
          
          <div className="glass-strong rounded-2xl p-6">
            <div className="flex items-center gap-4">
              {country.flag.startsWith('/') ? (
                <img src={country.flag} alt={country.name} className="w-14 h-14 object-contain" />
              ) : (
                <span className="text-5xl">{country.flag}</span>
              )}
              <div className="flex-1">
                <div className="text-sm text-primary font-semibold">{country.name}</div>
                <h1 className="text-3xl font-bold">{lesson.title}</h1>
              </div>
              <span className="text-5xl animate-float">{topic.icon}</span>
            </div>
          </div>
        </motion.div>

        {!quizStarted ? (
          /* Lesson Content */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {lesson.sections.map((section, index) => (
              <motion.article
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="glass-strong rounded-2xl p-8 space-y-4"
              >
                <h2 className="text-2xl font-bold text-gradient">{section.title}</h2>
                {section.image && (
                  <div className="relative w-full h-64 rounded-xl overflow-hidden">
                    <img 
                      src={section.image} 
                      alt={section.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {section.content}
                </p>
              </motion.article>
            ))}

            {/* Start Quiz Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-strong rounded-2xl p-8 text-center space-y-4"
            >
              <h3 className="text-2xl font-bold">Ready to Test Your Knowledge?</h3>
              <p className="text-muted-foreground">
                Complete the quiz to earn your stamp!
              </p>
              <button
                onClick={() => setQuizStarted(true)}
                className="gradient-primary text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow"
              >
                Start Quiz
              </button>
            </motion.div>
          </motion.div>
        ) : !quizComplete ? (
          /* Quiz */
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-strong rounded-2xl p-8 space-y-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-muted-foreground">
                Question {currentQuestion + 1} of {lesson.quiz.length}
              </div>
              <div className="text-sm font-semibold">
                Score: {score}/{lesson.quiz.length}
              </div>
            </div>

            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full gradient-primary"
                initial={{ width: 0 }}
                animate={{ width: `${((currentQuestion + 1) / lesson.quiz.length) * 100}%` }}
              />
            </div>

            <h3 className="text-2xl font-bold">
              {lesson.quiz[currentQuestion].question}
            </h3>

            <div className="space-y-3">
              {lesson.quiz[currentQuestion].options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === lesson.quiz[currentQuestion].correctAnswer;
                const showCorrect = showResult && isCorrect;
                const showIncorrect = showResult && isSelected && !isCorrect;

                return (
                  <motion.button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showResult}
                    whileHover={!showResult ? { scale: 1.02 } : {}}
                    whileTap={!showResult ? { scale: 0.98 } : {}}
                    className={`w-full p-4 rounded-xl text-left transition-all ${
                      showCorrect
                        ? 'bg-green-500 text-white'
                        : showIncorrect
                        ? 'bg-red-500 text-white'
                        : isSelected
                        ? 'ring-2 ring-primary bg-primary/10'
                        : 'glass hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        showCorrect || showIncorrect ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'
                      }`}>
                        {showCorrect && <Check className="w-5 h-5" />}
                        {showIncorrect && <X className="w-5 h-5" />}
                        {!showResult && <span className="text-sm font-semibold">
                          {String.fromCharCode(65 + index)}
                        </span>}
                      </div>
                      <span className="flex-1">{option}</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {!showResult && (
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null}
                className="w-full gradient-primary text-white py-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Answer
              </button>
            )}
          </motion.div>
        ) : (
          /* Quiz Complete */
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-strong rounded-2xl p-12 text-center space-y-6"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1 }}
              className="text-8xl mx-auto"
            >
              {topic.icon}
            </motion.div>
            
            <h2 className="text-4xl font-bold">Congratulations!</h2>
            
            <div className="text-6xl font-bold text-gradient">
              {score}/{lesson.quiz.length}
            </div>
            
            <p className="text-xl text-muted-foreground">
              You scored {Math.round((score / lesson.quiz.length) * 100)}%
            </p>

            {score >= lesson.quiz.length * 0.7 ? (
              <>
                <p className="text-lg">
                  You've mastered this topic! Time to claim your stamp!
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClaimStamp}
                  className="gradient-primary text-white px-12 py-6 rounded-xl text-xl font-bold shadow-xl"
                >
                  🐾 Claim Your Stamp! 🐾
                </motion.button>
              </>
            ) : (
              <>
                <p className="text-lg">
                  Keep learning! Try the quiz again to improve your score.
                </p>
                <button
                  onClick={() => {
                    setQuizStarted(false);
                    setCurrentQuestion(0);
                    setScore(0);
                    setQuizComplete(false);
                  }}
                  className="gradient-primary text-white px-8 py-4 rounded-xl font-semibold"
                >
                  Try Again
                </button>
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
