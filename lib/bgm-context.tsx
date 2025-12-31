'use client';

import { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from 'react';

type MusicType = 'theme' | 'quiz' | 'quiz_result' | 'none';

interface BGMContextType {
  // Sound settings
  isSoundEnabled: boolean;
  toggleSound: () => void;
  
  // Music control
  currentMusic: MusicType;
  playThemeMusic: () => void;
  playQuizMusic: () => void;
  playQuizResultMusic: () => void;
  stopMusic: () => void;
  
  // Sound effects (play over background music)
  playCorrectSound: () => void;
  playWrongSound: () => void;
  
  // Audio loading state
  isAudioReady: boolean;
}

const BGMContext = createContext<BGMContextType | undefined>(undefined);

export function BGMProvider({ children }: { children: ReactNode }) {
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [currentMusic, setCurrentMusic] = useState<MusicType>('none');
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAudioReady, setIsAudioReady] = useState(false);
  
  // Audio refs - using refs to persist across renders
  const themeAudioRef = useRef<HTMLAudioElement | null>(null);
  const quizAudioRef = useRef<HTMLAudioElement | null>(null);
  const quizResultAudioRef = useRef<HTMLAudioElement | null>(null);
  const correctSoundRef = useRef<HTMLAudioElement | null>(null);
  const wrongSoundRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio elements on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Create audio elements
      themeAudioRef.current = new Audio('/bgm/theme_music.mp3');
      themeAudioRef.current.loop = true;
      themeAudioRef.current.volume = 0.3;

      quizAudioRef.current = new Audio('/bgm/quiz.mp3');
      quizAudioRef.current.loop = true;
      quizAudioRef.current.volume = 0.3;

      quizResultAudioRef.current = new Audio('/bgm/quiz_result.mp3');
      quizResultAudioRef.current.loop = true;
      quizResultAudioRef.current.volume = 0.3;

      correctSoundRef.current = new Audio('/bgm/quiz_correct.mp3');
      correctSoundRef.current.volume = 0.5;

      wrongSoundRef.current = new Audio('/bgm/quiz_wrong.mp3');
      wrongSoundRef.current.volume = 0.5;

      // Load sound preference from localStorage
      const savedSoundPref = localStorage.getItem('soundEnabled');
      const soundEnabled = savedSoundPref !== null ? savedSoundPref === 'true' : true;
      setIsSoundEnabled(soundEnabled);
      
      // If sound is disabled, mark as ready immediately
      if (!soundEnabled) {
        setIsAudioReady(true);
        setIsInitialized(true);
        return;
      }

      // Sound is enabled - try to autoplay immediately
      // Wait for audio to be ready to play
      themeAudioRef.current.addEventListener('canplaythrough', () => {
        if (themeAudioRef.current) {
          themeAudioRef.current.play()
            .then(() => {
              setCurrentMusic('theme');
              setIsAudioReady(true);
            })
            .catch(() => {
              // Autoplay blocked by browser - set up interaction listeners as fallback
              const handleFirstInteraction = () => {
                if (themeAudioRef.current && soundEnabled) {
                  themeAudioRef.current.play()
                    .then(() => {
                      setCurrentMusic('theme');
                      setIsAudioReady(true);
                    })
                    .catch(() => {
                      setIsAudioReady(true);
                    });
                }
                document.removeEventListener('click', handleFirstInteraction);
                document.removeEventListener('keydown', handleFirstInteraction);
                document.removeEventListener('touchstart', handleFirstInteraction);
              };

              document.addEventListener('click', handleFirstInteraction);
              document.addEventListener('keydown', handleFirstInteraction);
              document.addEventListener('touchstart', handleFirstInteraction);
            });
        }
      }, { once: true });

      // Fallback: set audio ready after 3 seconds if not loaded/played
      const fallbackTimer = setTimeout(() => {
        setIsAudioReady(true);
      }, 3000);

      setIsInitialized(true);

      // Cleanup on unmount
      return () => {
        clearTimeout(fallbackTimer);
        themeAudioRef.current?.pause();
        quizAudioRef.current?.pause();
        quizResultAudioRef.current?.pause();
      };
    }
  }, []);

  // Handle sound toggle
  useEffect(() => {
    if (!isInitialized) return;

    if (!isSoundEnabled) {
      // Pause all music when sound is disabled
      themeAudioRef.current?.pause();
      quizAudioRef.current?.pause();
      quizResultAudioRef.current?.pause();
    } else {
      // Resume current music when sound is enabled
      if (currentMusic === 'theme') {
        themeAudioRef.current?.play().catch(() => {});
      } else if (currentMusic === 'quiz') {
        quizAudioRef.current?.play().catch(() => {});
      } else if (currentMusic === 'quiz_result') {
        quizResultAudioRef.current?.play().catch(() => {});
      }
    }
  }, [isSoundEnabled, isInitialized, currentMusic]);

  const toggleSound = useCallback(() => {
    const newValue = !isSoundEnabled;
    setIsSoundEnabled(newValue);
    localStorage.setItem('soundEnabled', String(newValue));
  }, [isSoundEnabled]);

  const stopAllMusic = useCallback(() => {
    themeAudioRef.current?.pause();
    quizAudioRef.current?.pause();
    quizResultAudioRef.current?.pause();
    
    // Reset to beginning
    if (themeAudioRef.current) themeAudioRef.current.currentTime = 0;
    if (quizAudioRef.current) quizAudioRef.current.currentTime = 0;
    if (quizResultAudioRef.current) quizResultAudioRef.current.currentTime = 0;
  }, []);

  const playThemeMusic = useCallback(() => {
    if (!isInitialized) return;
    
    stopAllMusic();
    setCurrentMusic('theme');
    
    if (isSoundEnabled && themeAudioRef.current) {
      themeAudioRef.current.play().catch(() => {});
    }
  }, [isInitialized, isSoundEnabled, stopAllMusic]);

  const playQuizMusic = useCallback(() => {
    if (!isInitialized) return;
    
    stopAllMusic();
    setCurrentMusic('quiz');
    
    if (isSoundEnabled && quizAudioRef.current) {
      quizAudioRef.current.play().catch(() => {});
    }
  }, [isInitialized, isSoundEnabled, stopAllMusic]);

  const playQuizResultMusic = useCallback(() => {
    if (!isInitialized) return;
    
    stopAllMusic();
    setCurrentMusic('quiz_result');
    
    if (isSoundEnabled && quizResultAudioRef.current) {
      quizResultAudioRef.current.play().catch(() => {});
    }
  }, [isInitialized, isSoundEnabled, stopAllMusic]);

  const stopMusic = useCallback(() => {
    stopAllMusic();
    setCurrentMusic('none');
  }, [stopAllMusic]);

  const playCorrectSound = useCallback(() => {
    if (!isInitialized || !isSoundEnabled) return;
    
    if (correctSoundRef.current) {
      correctSoundRef.current.currentTime = 0;
      correctSoundRef.current.play().catch(() => {});
    }
  }, [isInitialized, isSoundEnabled]);

  const playWrongSound = useCallback(() => {
    if (!isInitialized || !isSoundEnabled) return;
    
    if (wrongSoundRef.current) {
      wrongSoundRef.current.currentTime = 0;
      wrongSoundRef.current.play().catch(() => {});
    }
  }, [isInitialized, isSoundEnabled]);

  return (
    <BGMContext.Provider
      value={{
        isSoundEnabled,
        toggleSound,
        currentMusic,
        playThemeMusic,
        playQuizMusic,
        playQuizResultMusic,
        stopMusic,
        playCorrectSound,
        playWrongSound,
        isAudioReady,
      }}
    >
      {children}
    </BGMContext.Provider>
  );
}

export function useBGM() {
  const context = useContext(BGMContext);
  if (context === undefined) {
    throw new Error('useBGM must be used within a BGMProvider');
  }
  return context;
}
