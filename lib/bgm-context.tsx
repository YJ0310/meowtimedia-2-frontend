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
  isAudioLoaded: boolean;
  startExperience: () => void;
}

const BGMContext = createContext<BGMContextType | undefined>(undefined);

export function BGMProvider({ children }: { children: ReactNode }) {
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [currentMusic, setCurrentMusic] = useState<MusicType>('none');
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);
  
  // Audio refs - using refs to persist across renders
  const themeAudioRef = useRef<HTMLAudioElement | null>(null);
  const quizAudioRef = useRef<HTMLAudioElement | null>(null);
  const quizResultAudioRef = useRef<HTMLAudioElement | null>(null);
  const correctSoundRef = useRef<HTMLAudioElement | null>(null);
  const wrongSoundRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio elements on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Helper to create audio with iOS-friendly settings
      const createAudio = (src: string, loop: boolean, volume: number) => {
        const audio = new Audio(src);
        audio.loop = loop;
        audio.volume = volume;
        audio.preload = 'auto';
        // iOS Safari requires these attributes
        audio.setAttribute('playsinline', 'true');
        audio.setAttribute('webkit-playsinline', 'true');
        return audio;
      };

      // Create audio elements with iOS-friendly settings
      themeAudioRef.current = createAudio('/bgm/theme_music.mp3', true, 0.3);
      quizAudioRef.current = createAudio('/bgm/quiz.mp3', true, 0.3);
      quizResultAudioRef.current = createAudio('/bgm/quiz_result.mp3', true, 0.3);
      correctSoundRef.current = createAudio('/bgm/quiz_correct.mp3', false, 0.5);
      wrongSoundRef.current = createAudio('/bgm/quiz_wrong.mp3', false, 0.5);

      // Load all audio files
      themeAudioRef.current.load();
      quizAudioRef.current.load();
      quizResultAudioRef.current.load();
      correctSoundRef.current.load();
      wrongSoundRef.current.load();

      // Load sound preference from localStorage
      const savedSoundPref = localStorage.getItem('soundEnabled');
      const soundEnabled = savedSoundPref !== null ? savedSoundPref === 'true' : true;
      setIsSoundEnabled(soundEnabled);
      
      // If sound is disabled, mark as ready immediately (no need to wait for audio)
      if (!soundEnabled) {
        setIsAudioLoaded(true);
        setIsAudioReady(true);
        setIsInitialized(true);
        return;
      }

      // Sound is enabled - wait for theme audio to be loaded
      themeAudioRef.current.addEventListener('canplaythrough', () => {
        setIsAudioLoaded(true);
      }, { once: true });

      // Fallback: mark as loaded after 3 seconds
      const fallbackTimer = setTimeout(() => {
        setIsAudioLoaded(true);
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

  // Start experience - called when user clicks "Start" button
  // iOS Safari requires audio to be played during a user interaction to unlock it
  const startExperience = useCallback(() => {
    if (isSoundEnabled && themeAudioRef.current) {
      // Play theme music directly - this user interaction unlocks audio on iOS
      themeAudioRef.current.play()
        .then(() => {
          setCurrentMusic('theme');
          setIsAudioReady(true);
        })
        .catch((err) => {
          console.warn('Audio play failed:', err);
          // If play fails, still mark as ready
          setIsAudioReady(true);
        });
    } else {
      setIsAudioReady(true);
    }
  }, [isSoundEnabled]);

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
        isAudioLoaded,
        startExperience,
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
