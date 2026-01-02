"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

const API_URL = "https://api.meowtimap.smoltako.space";

export interface CountryProgress {
  countrySlug: string;
  lastQuizTime?: string;
  lastQuizScore: number;
  highestScore: number;
  totalAttempts: number;
  stampCollectedAt?: string;
  hasStamp: boolean;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  avatar: string;
  totalStamps?: number;
  countriesProgress?: CountryProgress[];
  feedbackStampCollectedAt?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  showAuthToast: boolean;
  setShowAuthToast: (show: boolean) => void;
  login: () => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Only landing page is public, all others require auth
const PUBLIC_ROUTES = ["/"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthToast, setShowAuthToast] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/user`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = () => {
    // Redirect to backend Google OAuth
    window.location.href = `${API_URL}/auth/google`;
  };

  const logout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        credentials: "include",
      });
      setUser(null);
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Protect routes - redirect to landing with toast if not authenticated
  useEffect(() => {
    if (!isLoading) {
      const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
      
      if (!user && !isPublicRoute) {
        // Show toast and redirect to landing page
        setShowAuthToast(true);
        router.push("/");
      }
    }
  }, [user, isLoading, pathname, router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        showAuthToast,
        setShowAuthToast,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
