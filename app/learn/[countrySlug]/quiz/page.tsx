'use client';

import { use, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, X, Loader2, Trophy, RotateCcw, Home } from 'lucide-react';
import confetti from 'canvas-confetti';
import { countries } from '@/lib/mock-data';
import { useAuth } from '@/lib/auth-context';
import GlobalLoading from '@/components/global-loading';

const API_URL = "https://api.meowtimap.smoltako.space";
const PASS_THRESHOLD = 0.8; // 80% to pass

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

export default function QuizPage({ 
  params 
}: { 
  params: Promise<{ countrySlug: string }> 
}) {
  const { user, isLoading: authLoading, checkAuth } = useAuth();
  const router = useRouter();
  const resolvedParams = use(params);
  
  // Quiz state
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stampAwarded, setStampAwarded] = useState(false);
  const [resultsReady, setResultsReady] = useState(false); // New: track when results are ready to show

  const country = countries.find(c => c.slug === resolvedParams.countrySlug);
  const totalQuestions = questions.length;
  const isPassing = totalQuestions > 0 && (score / totalQuestions) >= PASS_THRESHOLD;

  // Fetch quiz questions from API
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`${API_URL}/country/${resolvedParams.countrySlug}/quiz`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to load quiz questions');
        }

        const data = await response.json();
        if (data.success && data.questions && data.questions.length > 0) {
          setQuestions(data.questions);
        } else {
          throw new Error('No quiz questions available for this country');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load quiz');
      } finally {
        setIsLoading(false);
      }
    };

    if (resolvedParams.countrySlug) {
      fetchQuiz();
    }
  }, [resolvedParams.countrySlug]);

  // Submit quiz results to backend
  const submitResults = useCallback(async (finalScore: number) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`${API_URL}/country/${resolvedParams.countrySlug}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          score: finalScore,
          totalQuestions: totalQuestions,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.stampAwarded) {
          setStampAwarded(true);
        }
        // Refresh user data to get updated progress
        await checkAuth();
      }
    } catch (err) {
      console.error('Failed to submit results:', err);
    } finally {
      setIsSubmitting(false);
      setResultsReady(true); // Mark results as ready to show
    }
  }, [resolvedParams.countrySlug, totalQuestions, checkAuth]);

  // Trigger confetti effect
  const triggerConfetti = useCallback(() => {
    const duration = 3000;
    const end = Date.now() + duration;
    const colors = ['#A8BEDF', '#C7D5E8', '#EFE4D4', '#D8C9BA', '#FFD700'];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  // Handle answer selection
  const handleAnswerSelect = (answerIndex: number) => {
    if (showFeedback) return;
    setSelectedAnswer(answerIndex);
  };

  // Handle answer submission
  const handleSubmitAnswer = async () => {
    if (selectedAnswer === null) return;
    
    const isCorrect = selectedAnswer === questions[currentQuestion].correctAnswer;
    const newScore = isCorrect ? score + 1 : score;
    
    if (isCorrect) {
      setScore(newScore);
    }
    setShowFeedback(true);

    // Wait for feedback display then move to next question or complete
    setTimeout(async () => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
      } else {
        // Quiz complete - submit results
        setQuizComplete(true);
        await submitResults(newScore);
        
        // Trigger confetti if passing
        if ((newScore / questions.length) >= PASS_THRESHOLD) {
          triggerConfetti();
        }
      }
    }, 1500);
  };

  // Reset quiz
  const handleRetry = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setScore(0);
    setQuizComplete(false);
    setStampAwarded(false);
    setResultsReady(false);
    // Re-fetch questions to get new random set
    setIsLoading(true);
    fetch(`${API_URL}/country/${resolvedParams.countrySlug}/quiz`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setQuestions(data.questions);
        }
      })
      .finally(() => setIsLoading(false));
  };

  // Loading state - use GlobalLoading with country-specific fun facts
  if (isLoading || authLoading) {
    return (
      <GlobalLoading 
        isLoading={true}
        title={country ? `${country.name} Quiz` : "Loading Quiz"}
        subtitle={country ? `Preparing your ${country.name} challenge...` : "Loading..."}
        countrySlug={resolvedParams.countrySlug}
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

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-soft">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-strong rounded-2xl p-8 text-center space-y-4 max-w-md"
        >
          <div className="text-6xl">😿</div>
          <h2 className="text-2xl font-bold text-black dark:text-white">Oops!</h2>
          <p className="text-muted-foreground">{error}</p>
          <Link href={`/country/${resolvedParams.countrySlug}`}>
            <button className="gradient-primary text-white px-6 py-3 rounded-xl font-semibold">
              Go Back
            </button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
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
                <h1 className="text-2xl md:text-3xl font-bold text-black dark:text-white">
                  Cultural Quiz
                </h1>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Score</div>
                <div className="text-2xl font-bold text-gradient">{score}/{totalQuestions}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {!quizComplete ? (
          /* Quiz Questions */
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-strong rounded-2xl p-6 md:p-8 space-y-6"
          >
            {/* Progress */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-muted-foreground">
                Question {currentQuestion + 1} of {totalQuestions}
              </div>
              <div className="text-sm font-semibold text-black dark:text-white">
                {Math.round(((currentQuestion + 1) / totalQuestions) * 100)}% complete
              </div>
            </div>

            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${currentQuestion === totalQuestions - 1 && showFeedback ? 'bg-gradient-to-r from-yellow-400 to-amber-500' : 'gradient-primary'}`}
                initial={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
                animate={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            {/* Question */}
            <h3 className="text-xl md:text-2xl font-bold text-black dark:text-white">
              {questions[currentQuestion].question}
            </h3>

            {/* Options */}
            <div className="space-y-3">
              {questions[currentQuestion].options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === questions[currentQuestion].correctAnswer;
                const showCorrect = showFeedback && isCorrect;
                const showIncorrect = showFeedback && isSelected && !isCorrect;

                return (
                  <motion.button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showFeedback}
                    whileHover={!showFeedback ? { scale: 1.02 } : {}}
                    whileTap={!showFeedback ? { scale: 0.98 } : {}}
                    className={`w-full p-4 rounded-xl text-left transition-all ${
                      showCorrect
                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                        : showIncorrect
                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                        : isSelected
                        ? 'ring-2 ring-primary bg-primary/10'
                        : 'glass hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        showCorrect 
                          ? 'bg-white/20' 
                          : showIncorrect
                          ? 'bg-white/20'
                          : isSelected
                          ? 'bg-primary text-white'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}>
                        {showCorrect && <Check className="w-6 h-6" />}
                        {showIncorrect && <X className="w-6 h-6" />}
                        {!showFeedback && <span>{String.fromCharCode(65 + index)}</span>}
                      </div>
                      <span className="flex-1 text-base">{option}</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Feedback Message */}
            <AnimatePresence>
              {showFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`p-4 rounded-xl text-center font-semibold ${
                    selectedAnswer === questions[currentQuestion].correctAnswer
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                  }`}
                >
                  {selectedAnswer === questions[currentQuestion].correctAnswer
                    ? '🎉 Correct! Great job!'
                    : `❌ Wrong! The correct answer was: ${questions[currentQuestion].options[questions[currentQuestion].correctAnswer]}`
                  }
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            {!showFeedback && (
              <motion.button
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null}
                whileHover={selectedAnswer !== null ? { scale: 1.02 } : {}}
                whileTap={selectedAnswer !== null ? { scale: 0.98 } : {}}
                className="w-full gradient-primary text-white py-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                Submit Answer
              </motion.button>
            )}
          </motion.div>
        ) : (
          /* Quiz Complete - Show loading until results are ready */
          !resultsReady ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-strong rounded-2xl p-8 md:p-12 text-center space-y-6"
            >
              <Loader2 className="w-16 h-16 animate-spin mx-auto text-primary" />
              <h2 className="text-2xl font-bold text-black dark:text-white">
                Calculating Results...
              </h2>
              <p className="text-muted-foreground">
                Saving your progress to the cloud
              </p>
            </motion.div>
          ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-strong rounded-2xl p-8 md:p-12 text-center space-y-6"
          >
            {/* Result Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-block"
            >
              <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${
                isPassing ? 'bg-green-100 dark:bg-green-900/30' : 'bg-orange-100 dark:bg-orange-900/30'
              }`}>
                {isPassing ? (
                  <Trophy className="w-12 h-12 text-yellow-500" />
                ) : (
                  <span className="text-5xl">📚</span>
                )}
              </div>
            </motion.div>
            
            {/* Title */}
            <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white">
              {isPassing ? 'Congratulations! 🎉' : 'Keep Learning!'}
            </h2>
            
            {/* Score */}
            <div className="space-y-2">
              <div className="text-6xl font-bold text-gradient">
                {score}/{totalQuestions}
              </div>
              <p className="text-xl text-muted-foreground">
                You scored {Math.round((score / totalQuestions) * 100)}%
              </p>
            </div>

            {/* Progress Bar */}
            <div className="max-w-xs mx-auto space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${isPassing ? 'bg-green-500' : 'bg-orange-500'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${(score / totalQuestions) * 100}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span className="text-primary font-semibold">80% to pass</span>
                <span>100%</span>
              </div>
            </div>

            {/* Result Message & Actions */}
            {isPassing ? (
              <>
                {stampAwarded ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-linear-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 p-6 rounded-2xl space-y-3"
                  >
                    <div className="text-5xl">🐾</div>
                    <h3 className="text-xl font-bold text-black dark:text-white">
                      New Stamp Earned!
                    </h3>
                    <p className="text-muted-foreground">
                      You've mastered {country.name} and earned a stamp for your passport!
                    </p>
                  </motion.div>
                ) : (
                  <p className="text-lg text-muted-foreground">
                    Great score! You already have the stamp for this country.
                  </p>
                )}
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Link href={`/country/${resolvedParams.countrySlug}`}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full sm:w-auto gradient-primary text-white px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-xl"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      Back to {country.name}
                    </motion.button>
                  </Link>
                  <Link href="/dashboard">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full sm:w-auto glass px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-2"
                    >
                      <Home className="w-5 h-5" />
                      Dashboard
                    </motion.button>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <p className="text-lg text-muted-foreground">
                  You need 80% ({Math.ceil(totalQuestions * 0.8)}/{totalQuestions}) to earn the stamp. 
                  Keep exploring the content and try again!
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <motion.button
                    onClick={handleRetry}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full sm:w-auto gradient-primary text-white px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-xl"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Try Again
                  </motion.button>
                  <Link href={`/country/${resolvedParams.countrySlug}`}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full sm:w-auto glass px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      Review Content
                    </motion.button>
                  </Link>
                  <Link href="/dashboard">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full sm:w-auto glass px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-2"
                    >
                      <Home className="w-5 h-5" />
                      Dashboard
                    </motion.button>
                  </Link>
                </div>
              </>
            )}

            {isSubmitting && (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving results...</span>
              </div>
            )}
          </motion.div>
          )
        )}
      </div>
    </div>
  );
}
