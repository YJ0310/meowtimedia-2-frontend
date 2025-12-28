"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from "react";
import { useAuth } from "./auth-context";

const API_URL = "https://api.meowtimap.smoltako.space";

// Available reaction emojis
export const REACTION_EMOJIS = ["😍", "😮", "🤯", "😂", "❤️"] as const;
export type ReactionType = (typeof REACTION_EMOJIS)[number];

export interface ReactionUser {
  id: string;
  displayName: string;
  avatar: string;
  reactedAt: string;
}

export interface ReactionData {
  count: number;
  users: ReactionUser[];
}

export interface ReactionsState {
  [emoji: string]: ReactionData;
}

export interface AllReactionsState {
  [funfactId: string]: ReactionsState;
}

export interface UserReactionsState {
  [funfactId: string]: ReactionType;
}

interface ReactionsContextType {
  reactions: AllReactionsState;
  userReactions: UserReactionsState;
  isLoading: boolean;
  lastUpdate: string | null;
  hasLoadedOnce: boolean;
  getReactionsForFunfact: (funfactId: string) => ReactionsState;
  getUserReactionForFunfact: (funfactId: string) => ReactionType | null;
  addReaction: (funfactId: string, countrySlug: string, reactionType: ReactionType) => Promise<void>;
  refreshReactions: () => Promise<void>;
}

const ReactionsContext = createContext<ReactionsContextType | undefined>(undefined);

// Polling interval for real-time updates (10 seconds)
const POLL_INTERVAL = 10000;

export function ReactionsProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [reactions, setReactions] = useState<AllReactionsState>({});
  const [userReactions, setUserReactions] = useState<UserReactionsState>({});
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingRef = useRef(false);

  // Fetch all reactions from the server
  const fetchAllReactions = useCallback(async (silent = false) => {
    if (isPollingRef.current) return; // Prevent concurrent fetches
    isPollingRef.current = true;
    
    if (!silent) setIsLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/reactions/all`, {
        credentials: "include",
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setReactions(data.reactions || {});
          setUserReactions(data.userReactions || {});
          setLastUpdate(data.lastUpdate || null);
          setHasLoadedOnce(true);
        }
      }
    } catch (error) {
      console.error("Error fetching reactions:", error);
    } finally {
      setIsLoading(false);
      isPollingRef.current = false;
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetchAllReactions();
  }, [fetchAllReactions]);

  // Start polling for real-time updates
  useEffect(() => {
    // Start polling
    pollIntervalRef.current = setInterval(() => {
      fetchAllReactions(true); // Silent refresh
    }, POLL_INTERVAL);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [fetchAllReactions]);

  // Get reactions for a specific funfact
  const getReactionsForFunfact = useCallback((funfactId: string): ReactionsState => {
    return reactions[funfactId] || {};
  }, [reactions]);

  // Get user's reaction for a specific funfact
  const getUserReactionForFunfact = useCallback((funfactId: string): ReactionType | null => {
    return userReactions[funfactId] || null;
  }, [userReactions]);

  // Add or toggle a reaction with optimistic updates
  const addReaction = useCallback(async (
    funfactId: string,
    countrySlug: string,
    reactionType: ReactionType
  ) => {
    if (!isAuthenticated || !user) return;

    const previousReactions = { ...reactions };
    const previousUserReactions = { ...userReactions };
    const currentUserReaction = userReactions[funfactId];

    // Optimistic update
    const updatedReactions = { ...reactions };
    const updatedUserReactions = { ...userReactions };

    if (!updatedReactions[funfactId]) {
      updatedReactions[funfactId] = {};
    }

    if (currentUserReaction === reactionType) {
      // Toggle off - remove reaction
      delete updatedUserReactions[funfactId];
      
      if (updatedReactions[funfactId][reactionType]) {
        updatedReactions[funfactId][reactionType] = {
          count: updatedReactions[funfactId][reactionType].count - 1,
          users: updatedReactions[funfactId][reactionType].users.filter(
            (u) => u.id !== user.id
          ),
        };
        if (updatedReactions[funfactId][reactionType].count <= 0) {
          delete updatedReactions[funfactId][reactionType];
        }
      }
    } else {
      // Add or change reaction
      // Remove from previous reaction if exists
      if (currentUserReaction && updatedReactions[funfactId][currentUserReaction]) {
        updatedReactions[funfactId][currentUserReaction] = {
          count: updatedReactions[funfactId][currentUserReaction].count - 1,
          users: updatedReactions[funfactId][currentUserReaction].users.filter(
            (u) => u.id !== user.id
          ),
        };
        if (updatedReactions[funfactId][currentUserReaction].count <= 0) {
          delete updatedReactions[funfactId][currentUserReaction];
        }
      }

      // Add to new reaction
      if (!updatedReactions[funfactId][reactionType]) {
        updatedReactions[funfactId][reactionType] = { count: 0, users: [] };
      }
      updatedReactions[funfactId][reactionType] = {
        count: updatedReactions[funfactId][reactionType].count + 1,
        users: [
          {
            id: user.id,
            displayName: user.displayName,
            avatar: user.avatar,
            reactedAt: new Date().toISOString(),
          },
          ...updatedReactions[funfactId][reactionType].users,
        ],
      };

      updatedUserReactions[funfactId] = reactionType;
    }

    setReactions(updatedReactions);
    setUserReactions(updatedUserReactions);

    try {
      const response = await fetch(`${API_URL}/reactions/${funfactId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          reactionType,
          countrySlug,
        }),
      });

      if (!response.ok) {
        // Revert on failure
        setReactions(previousReactions);
        setUserReactions(previousUserReactions);
      }
    } catch {
      // Revert on error
      setReactions(previousReactions);
      setUserReactions(previousUserReactions);
    }
  }, [reactions, userReactions, user, isAuthenticated]);

  // Manual refresh
  const refreshReactions = useCallback(async () => {
    await fetchAllReactions();
  }, [fetchAllReactions]);

  return (
    <ReactionsContext.Provider
      value={{
        reactions,
        userReactions,
        isLoading,
        lastUpdate,
        hasLoadedOnce,
        getReactionsForFunfact,
        getUserReactionForFunfact,
        addReaction,
        refreshReactions,
      }}
    >
      {children}
    </ReactionsContext.Provider>
  );
}

export function useReactions() {
  const context = useContext(ReactionsContext);
  if (context === undefined) {
    throw new Error("useReactions must be used within a ReactionsProvider");
  }
  return context;
}
