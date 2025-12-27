"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import { useAuth } from "@/lib/auth-context";

const API_URL = "https://api.meowtimap.smoltako.space";

// Available reaction emojis - limited suitable set
const REACTION_EMOJIS = ["😍", "😮", "🤯", "😂", "❤️"] as const;
type ReactionType = (typeof REACTION_EMOJIS)[number];

interface ReactionUser {
  id: string;
  displayName: string;
  avatar: string;
  reactedAt: string;
}

interface ReactionData {
  count: number;
  users: ReactionUser[];
}

interface ReactionsState {
  [emoji: string]: ReactionData;
}

interface FunFactReactionsProps {
  funfactId: string;
  countrySlug: string;
  compact?: boolean;
}

export default function FunFactReactions({
  funfactId,
  countrySlug,
  compact = false,
}: FunFactReactionsProps) {
  const { user, isAuthenticated } = useAuth();
  const [reactions, setReactions] = useState<ReactionsState>({});
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const [hoveredEmoji, setHoveredEmoji] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // iOS 26 liquid spring animations
  const springConfig = { stiffness: 400, damping: 30, mass: 0.8 } as const;

  // Fetch reactions
  const fetchReactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/reactions/${funfactId}`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setReactions(data.reactions || {});
          setUserReaction(data.userReaction || null);
        }
      }
    } catch (error) {
      console.error("Error fetching reactions:", error);
    } finally {
      setIsLoading(false);
    }
  }, [funfactId]);

  // Reset and refetch when funfactId changes (country switch)
  useEffect(() => {
    setReactions({});
    setUserReaction(null);
    setShowPicker(false);
    fetchReactions();
  }, [fetchReactions]);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setShowPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle reaction with optimistic updates
  const handleReaction = async (emoji: ReactionType) => {
    if (!isAuthenticated || !user) {
      // Optionally show login prompt
      return;
    }

    if (isAnimating) return;
    setIsAnimating(true);

    const previousReactions = { ...reactions };
    const previousUserReaction = userReaction;

    // Optimistic update
    if (userReaction === emoji) {
      // Toggle off - remove reaction
      setUserReaction(null);
      const updatedReactions = { ...reactions };
      if (updatedReactions[emoji]) {
        updatedReactions[emoji] = {
          count: updatedReactions[emoji].count - 1,
          users: updatedReactions[emoji].users.filter(
            (u) => u.id !== user.id
          ),
        };
        if (updatedReactions[emoji].count <= 0) {
          delete updatedReactions[emoji];
        }
      }
      setReactions(updatedReactions);
    } else {
      // Add or change reaction
      const updatedReactions = { ...reactions };

      // Remove from previous reaction if exists
      if (previousUserReaction && updatedReactions[previousUserReaction]) {
        updatedReactions[previousUserReaction] = {
          count: updatedReactions[previousUserReaction].count - 1,
          users: updatedReactions[previousUserReaction].users.filter(
            (u) => u.id !== user.id
          ),
        };
        if (updatedReactions[previousUserReaction].count <= 0) {
          delete updatedReactions[previousUserReaction];
        }
      }

      // Add to new reaction
      if (!updatedReactions[emoji]) {
        updatedReactions[emoji] = { count: 0, users: [] };
      }
      updatedReactions[emoji] = {
        count: updatedReactions[emoji].count + 1,
        users: [
          {
            id: user.id,
            displayName: user.displayName,
            avatar: user.avatar,
            reactedAt: new Date().toISOString(),
          },
          ...updatedReactions[emoji].users,
        ],
      };

      setUserReaction(emoji);
      setReactions(updatedReactions);
    }

    setShowPicker(false);

    try {
      const response = await fetch(`${API_URL}/reactions/${funfactId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          reactionType: emoji,
          countrySlug,
        }),
      });

      if (!response.ok) {
        // Revert on failure
        setReactions(previousReactions);
        setUserReaction(previousUserReaction);
      }
    } catch {
      // Revert on error
      setReactions(previousReactions);
      setUserReaction(previousUserReaction);
    } finally {
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  // Get total reaction count
  const totalReactions = Object.values(reactions).reduce(
    (sum, r) => sum + r.count,
    0
  );

  // iOS 26 style pill button animation
  const pillVariants = {
    idle: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.92 },
  };

  // Emoji picker variants - iOS style spring
  const pickerVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 10,
      filter: "blur(8px)",
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring" as const,
        ...springConfig,
        staggerChildren: 0.03,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      y: 5,
      filter: "blur(4px)",
      transition: { duration: 0.15 },
    },
  };

  // Individual emoji button variants
  const emojiVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.5 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring" as const, ...springConfig },
    },
  };

  // Floating reaction badge animation
  const badgeVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: { type: "spring" as const, ...springConfig },
    },
    exit: { scale: 0, opacity: 0 },
    hover: { scale: 1.15, y: -2 },
    tap: { scale: 0.9 },
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        {/* Skeleton reaction pills */}
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/10 dark:bg-black/20 border border-white/10 dark:border-white/5"
          >
            <div 
              className="w-4 h-4 rounded-full bg-white/20 dark:bg-white/10 animate-pulse"
              style={{ animationDelay: `${i * 100}ms` }}
            />
            <div 
              className="w-3 h-3 rounded bg-white/15 dark:bg-white/8 animate-pulse"
              style={{ animationDelay: `${i * 100 + 50}ms` }}
            />
          </div>
        ))}
        {/* Skeleton add button */}
        <div className="w-7 h-7 rounded-full bg-white/10 dark:bg-black/20 border border-white/10 dark:border-white/5 animate-pulse" 
          style={{ animationDelay: '350ms' }}
        />
      </div>
    );
  }

  return (
    <div className="relative" ref={pickerRef}>
      {/* Reactions display */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Existing reactions */}
        <AnimatePresence mode="popLayout">
          {Object.entries(reactions).map(([emoji, data]) => (
            <motion.button
              key={emoji}
              variants={badgeVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              whileHover="hover"
              whileTap="tap"
              onClick={() => handleReaction(emoji as ReactionType)}
              className={`group relative flex items-center gap-1 px-2 py-1 rounded-full transition-all duration-200 ${
                userReaction === emoji
                  ? "bg-primary/20 border-2 border-primary/40 shadow-lg shadow-primary/20"
                  : "bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-black/30"
              }`}
            >
              <motion.span
                className="text-sm"
                animate={userReaction === emoji ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {emoji}
              </motion.span>
              <span
                className={`text-xs font-medium ${
                  userReaction === emoji
                    ? "text-primary"
                    : "text-black/70 dark:text-white/70"
                }`}
              >
                {data.count}
              </span>

              {/* Hover preview - who reacted */}
              {!compact && data.users.length > 0 && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50">
                  <motion.div
                    initial={{ y: 5, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-black/90 dark:bg-white/90 backdrop-blur-xl px-3 py-2 rounded-xl shadow-xl min-w-max"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      {data.users.slice(0, 3).map((u) => (
                        <img
                          key={u.id}
                          src={u.avatar}
                          alt={u.displayName}
                          className="w-5 h-5 rounded-full border border-white/20"
                        />
                      ))}
                      {data.users.length > 3 && (
                        <span className="text-xs text-white/70 dark:text-black/70">
                          +{data.users.length - 3}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white dark:text-black max-w-[150px] truncate">
                      {data.users
                        .slice(0, 2)
                        .map((u) => u.displayName.split(" ")[0])
                        .join(", ")}
                      {data.users.length > 2
                        ? ` and ${data.users.length - 2} more`
                        : ""}
                    </p>
                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-black/90 dark:border-t-white/90" />
                  </motion.div>
                </div>
              )}
            </motion.button>
          ))}
        </AnimatePresence>

        {/* Add reaction button */}
        {isAuthenticated && (
          <motion.button
            variants={pillVariants}
            initial="idle"
            whileHover="hover"
            whileTap="tap"
            onClick={() => setShowPicker(!showPicker)}
            className={`flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200 ${
              showPicker
                ? "bg-primary/30 border-2 border-primary/50"
                : "bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-black/30"
            }`}
          >
            <motion.span
              className="text-sm"
              animate={{ rotate: showPicker ? 45 : 0 }}
              transition={{ type: "spring", ...springConfig }}
            >
              {showPicker ? "×" : "+"}
            </motion.span>
          </motion.button>
        )}

        {/* Total count indicator (when no reactions yet) */}
        {totalReactions === 0 && !showPicker && (
          <span className="text-xs text-black/50 dark:text-white/50 ml-1">
            Be the first to react!
          </span>
        )}
      </div>

      {/* Emoji picker - iOS 26 style floating panel */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            variants={pickerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute bottom-full left-0 mb-2 z-50"
          >
            <div className="bg-white/80 dark:bg-black/80 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/30 dark:border-white/10 p-2 overflow-hidden">
              {/* iOS-style liquid glass effect */}
              <div className="absolute inset-0 bg-linear-to-br from-white/20 to-transparent dark:from-white/5 rounded-2xl pointer-events-none" />

              <div className="flex items-center gap-1 relative">
                {REACTION_EMOJIS.map((emoji, index) => (
                  <motion.button
                    key={emoji}
                    variants={emojiVariants}
                    whileHover={{
                      scale: 1.4,
                      y: -8,
                      transition: { type: "spring", stiffness: 500, damping: 20 },
                    }}
                    whileTap={{ scale: 0.85 }}
                    onHoverStart={() => setHoveredEmoji(emoji)}
                    onHoverEnd={() => setHoveredEmoji(null)}
                    onClick={() => handleReaction(emoji)}
                    className={`relative w-10 h-10 flex items-center justify-center rounded-xl transition-colors duration-150 ${
                      userReaction === emoji
                        ? "bg-primary/20"
                        : hoveredEmoji === emoji
                        ? "bg-white/30 dark:bg-white/10"
                        : ""
                    }`}
                  >
                    <span className="text-2xl">{emoji}</span>

                    {/* Selection indicator */}
                    {userReaction === emoji && (
                      <motion.div
                        layoutId="selectedIndicator"
                        className="absolute inset-0 border-2 border-primary rounded-xl"
                        transition={{ type: "spring" as const, ...springConfig }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
