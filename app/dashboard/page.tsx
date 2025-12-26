"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { X, ArrowRight, Clock, MapPin } from "lucide-react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import { countries } from "@/lib/mock-data";
import { useAuth, CountryProgress } from "@/lib/auth-context";
import { ToastContainer, useToast } from "@/components/toast";
import GlobalLoading from "@/components/global-loading";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json";

// Fun comments for countries
const countryComments = {
  japan: [
    "Sushi capital! 🍣",
    "Cherry blossoms season!",
    "Tech paradise",
    "Anime wonderland",
  ],
  "south-korea": [
    "K-Pop fever! 🎤",
    "Kimchi heaven",
    "Seoul lights",
    "Drama vibes",
  ],
  china: [
    "Great Wall awaits",
    "Tea traditions 🍵",
    "Ancient wisdom",
    "5000 years rich",
  ],
  thailand: [
    "Beach paradise 🏖️",
    "Street food heaven",
    "Smile capital",
    "Temple treasures",
  ],
  vietnam: ["Pho-nomenal! 🍜", "Coffee culture", "Boat rides", "Lantern magic"],
  indonesia: [
    "Island hopping! 🏝️",
    "Bali bliss",
    "Diverse cultures",
    "Volcano views",
  ],
  malaysia: [
    "Food fusion 🍛",
    "Twin towers",
    "Rainforest life",
    "Multicultural hub",
  ],
  philippines: [
    "Beach dreams 🌴",
    "7,000+ islands",
    "Warm hearts",
    "Island adventures",
  ],
  singapore: [
    "Food paradise! 🍜",
    "Garden city",
    "Modern marvel",
    "Hawker culture",
  ],
  india: [
    "Spice heaven 🌶️",
    "Taj Mahal beauty",
    "Yoga origins",
    "Colorful festivals",
  ],
  taiwan: [
    "Bubble tea! 🧋",
    "Night markets",
    "Mountain beauty",
    "Tech innovation",
  ],
  brunei: [
    "Golden mosque ✨",
    "Royal splendor",
    "Rainforest gems",
    "Oil rich nation",
  ],
};

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([100, 25]);
  const [floatingComments, setFloatingComments] = useState<
    Array<{
      id: number;
      country: string;
      text: string;
      coordinates: [number, number];
    }>
  >([]);
  const [selectedCountryComments, setSelectedCountryComments] = useState<
    Array<{ id: number; text: string; offset: [number, number] }>
  >([]);
  const { toasts, removeToast, info } = useToast();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState("");
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  const country = selectedCountry
    ? countries.find((c) => c.slug === selectedCountry)
    : null;

  // Calculate country progress from user data
  const getCountryProgress = useCallback((countrySlug: string): CountryProgress | undefined => {
    return user?.countriesProgress?.find(cp => cp.countrySlug === countrySlug);
  }, [user]);

  // Calculate total stamps collected
  const totalStampsCollected = useMemo(() => {
    return user?.countriesProgress?.filter(cp => cp.hasStamp).length || 0;
  }, [user]);

  // Get stamps for selected country
  const selectedCountryHasStamp = useMemo(() => {
    if (!selectedCountry) return false;
    const progress = getCountryProgress(selectedCountry);
    return progress?.hasStamp || false;
  }, [selectedCountry, getCountryProgress]);

  // Calculate progress percentage for a country (based on highest quiz score)
  const calculateProgress = useCallback((countrySlug: string): number => {
    const progress = getCountryProgress(countrySlug);
    if (!progress) return 0;
    // Progress is based on highest score percentage (10 questions = 100%)
    return Math.round((progress.highestScore / 10) * 100);
  }, [getCountryProgress]);

  // Get sorted unlocked countries: progress DESC, last quiz time DESC, name ASC
  const sortedCountries = useMemo(() => {
    return countries
      .filter((c) => c.isUnlocked)
      .map((c) => ({
        ...c,
        progress: calculateProgress(c.slug),
        lastQuizTime: getCountryProgress(c.slug)?.lastQuizTime,
      }))
      .sort((a, b) => {
        // First: sort by progress descending
        if (b.progress !== a.progress) {
          return b.progress - a.progress;
        }
        // Second: sort by last quiz time descending (most recent first)
        const aTime = a.lastQuizTime ? new Date(a.lastQuizTime).getTime() : 0;
        const bTime = b.lastQuizTime ? new Date(b.lastQuizTime).getTime() : 0;
        if (bTime !== aTime) {
          return bTime - aTime;
        }
        // Third: sort by name ascending
        return a.name.localeCompare(b.name);
      });
  }, [calculateProgress, getCountryProgress]);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Set greeting based on time
  useEffect(() => {
    const hour = currentTime.getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, [currentTime]);

  // Calculate spread positions for comments around a country
  const getSpreadOffsets = useCallback((count: number): [number, number][] => {
    // Fixed positions spread around the pin - spread wider to prevent overlap
    const positions: [number, number][] = [
      [-18, -12], // top-left (wider spread)
      [14, -14], // top-right
      [-20, 4], // middle-left
      [16, 3], // middle-right
      [-14, 14], // bottom-left
      [12, 16], // bottom-right
    ];
    return positions.slice(0, count);
  }, []);

  // Random floating comments - only for selectable (unlocked) countries
  useEffect(() => {
    if (!selectedCountry) {
      const addComment = () => {
        // Only show comments for unlocked/selectable countries
        const selectableCountries = countries.filter((c) => c.isUnlocked);
        const shuffled = [...selectableCountries].sort(
          () => 0.5 - Math.random()
        );
        const randomCountries = shuffled.slice(0, 2);
        const newComments = randomCountries.map((c, i) => {
          const comments = countryComments[
            c.slug as keyof typeof countryComments
          ] || ["Explore me!"];
          const randomComment =
            comments[Math.floor(Math.random() * comments.length)];
          return {
            id: Date.now() + i,
            country: c.slug,
            text: randomComment,
            coordinates: c.coordinates,
          };
        });
        setFloatingComments(newComments as any);
      };

      addComment();
      const interval = setInterval(addComment, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedCountry]);

  // Selected country comments with spread offsets
  useEffect(() => {
    if (selectedCountry) {
      const updateComments = () => {
        const comments =
          countryComments[selectedCountry as keyof typeof countryComments] ||
          [];
        const shuffled = comments.sort(() => 0.5 - Math.random()).slice(0, 4);
        const offsets = getSpreadOffsets(shuffled.length);
        const randomComments = shuffled.map((text, i) => ({
          id: Date.now() + i,
          text,
          offset: offsets[i] || [0, 0],
        }));
        setSelectedCountryComments(randomComments);
      };

      updateComments();
      const interval = setInterval(updateComments, 8000);
      return () => clearInterval(interval);
    } else {
      setSelectedCountryComments([]);
    }
  }, [selectedCountry, getSpreadOffsets]);

  // Show welcome toast on load
  useEffect(() => {
    info('Explore Asia', 'Click on any country pin to begin your cultural journey', '🗺️');
  }, []);

  // Check if new user and show tutorial
  useEffect(() => {
    if (user && !authLoading) {
      const hasProgress = user.countriesProgress && user.countriesProgress.length > 0;
      const tutorialSeen = localStorage.getItem(`tutorial_seen_${user.id}`);
      if (!hasProgress && !tutorialSeen) {
        setShowTutorial(true);
      }
    }
  }, [user, authLoading]);

  const handleTutorialNext = () => {
    if (tutorialStep < 3) {
      setTutorialStep(tutorialStep + 1);
    } else {
      setShowTutorial(false);
      if (user) {
        localStorage.setItem(`tutorial_seen_${user.id}`, 'true');
      }
    }
  };

  const handleSkipTutorial = () => {
    setShowTutorial(false);
    if (user) {
      localStorage.setItem(`tutorial_seen_${user.id}`, 'true');
    }
  };

  // Toggle body class to hide mobile dock when country card is shown
  useEffect(() => {
    if (selectedCountry) {
      document.body.classList.add("country-card-open");
    } else {
      document.body.classList.remove("country-card-open");
    }
    return () => {
      document.body.classList.remove("country-card-open");
    };
  }, [selectedCountry]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <GlobalLoading 
        isLoading={true} 
        title="Loading Dashboard" 
        subtitle="Preparing your adventure..." 
      />
    );
  }

  // If no user, show nothing (auth context will redirect)
  if (!user) {
    return null;
  }

  // Handle country selection with zoom
  const handleCountryClick = (countrySlug: string) => {
    const country = countries.find((c) => c.slug === countrySlug);
    if (country && country.isUnlocked) {
      setSelectedCountry(countrySlug);
      setSidebarExpanded(false);
      setMobileMenuOpen(false);
      setZoom(2.5);
      setCenter([country.coordinates[0], country.coordinates[1]]);
    }
  };

  // Reset zoom
  const handleBackToMap = () => {
    setSelectedCountry(null);
    setSidebarExpanded(true);
    setMobileMenuOpen(false);
    setZoom(1);
    setCenter([100, 25]);
  };

  return (
    <div className="h-screen w-screen fixed inset-0 overflow-hidden bg-gradient-soft dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Dock-style Sidebar */}
      <AnimatePresence>
        {sidebarExpanded && (
          <motion.aside
            initial={{ x: -350, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -350, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="hidden md:block fixed left-6 top-24 bottom-6 w-80 bg-white/10 dark:bg-black/30 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl z-40 rounded-3xl overflow-hidden"
          >
            <div className="p-5 h-full flex flex-col">
              {/* Close button */}
              <div className="flex justify-end -mt-2 -mr-2 shrink-0">
                <button
                  onClick={() => setSidebarExpanded(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {/* Time & Greeting */}
              <div className="text-center space-y-2 shrink-0">
                <div className="flex items-center justify-center gap-2 text-primary">
                  <Clock className="w-4 h-4" />
                  <div className="text-sm font-mono">
                    {currentTime.toLocaleTimeString()}
                  </div>
                </div>
                <h2 className="text-xl font-semibold">
                  {greeting}, {user.displayName?.split(' ')[0] || 'Explorer'}!
                </h2>
              </div>

              {/* User Profile */}
              <div className="text-center space-y-2 shrink-0 py-4">
                <Link href="/profile">
                  <motion.img
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    src={user.avatar}
                    alt={user.displayName}
                    className="w-20 h-20 rounded-full mx-auto border-4 border-primary shadow-xl cursor-pointer"
                  />
                </Link>
                <div className="glass p-2 rounded-lg text-black dark:text-white">
                  <div className="text-2xl font-bold text-gradient">
                    {totalStampsCollected}/{countries.filter(c => c.isUnlocked).length}
                  </div>
                  <div className="text-xs text-black dark:text-white">
                    Stamps Collected
                  </div>
                </div>
              </div>

              {/* Countries Progress - Scrollable */}
              <div className="flex-1 min-h-0 flex flex-col">
                <h3 className="font-semibold text-xs text-black dark:text-white uppercase tracking-wide flex items-center gap-2 shrink-0 mb-2">
                  <MapPin className="w-3 h-3" />
                  Your Progress
                </h3>
                <div className="flex-1 overflow-y-auto scrollbar-hide space-y-1.5 pr-1">
                  {sortedCountries.map((c) => {
                      const progress = c.progress;
                      const countryProgressData = getCountryProgress(c.slug);
                      const hasStamp = countryProgressData?.hasStamp || false;
                      const countryData = countries.find(country => country.slug === c.slug);
                      return (
                        <motion.button
                          key={c.id}
                          onClick={() => handleCountryClick(c.slug)}
                          whileHover={{ scale: 1.01, x: 2 }}
                          whileTap={{ scale: 0.99 }}
                          className={`w-full p-2 rounded-lg text-left transition-all backdrop-blur-md border text-black dark:text-white ${
                            hasStamp 
                              ? "bg-gradient-to-r from-amber-400/20 to-yellow-500/20 border-amber-400/40 dark:from-amber-400/15 dark:to-yellow-500/15"
                              : "bg-white/10 dark:bg-black/20 border-white/20 dark:border-white/10"
                          } ${
                            selectedCountry === c.slug
                              ? "ring-2 ring-primary shadow-lg"
                              : ""
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                              {countryData?.flag?.startsWith('/') ? (
                                <img 
                                  src={countryData.flag} 
                                  alt={c.name} 
                                  className="w-full h-full object-cover rounded-md"
                                />
                              ) : (
                                <span className="text-lg">{countryData?.flag || c.slug.substring(0, 2).toUpperCase()}</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-xs truncate text-black dark:text-white">
                                {c.name}
                              </div>
                              <div className="flex items-center gap-1 mt-0.5">
                                <div className="flex-1 h-1 bg-white/20 dark:bg-white/10 rounded-full overflow-hidden">
                                  <motion.div
                                    className="h-full bg-linear-to-r from-primary to-secondary"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 1, delay: 0.1 }}
                                  />
                                </div>
                                <span className="text-[10px] text-black dark:text-white w-6 text-right shrink-0">
                                  {progress}%
                                </span>
                              </div>
                            </div>
                            {hasStamp && (
                              <div className="w-6 h-6 shrink-0">
                                <img 
                                  src={`/stamp/${c.slug}.png`} 
                                  alt={`${c.name} stamp`}
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement!.innerHTML = '🐾';
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Sidebar Toggle Button - Desktop */}
      {!sidebarExpanded && (
        <button
          onClick={() => setSidebarExpanded(true)}
          className="hidden md:flex fixed left-6 top-24 z-40 bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg p-3 rounded-xl hover:bg-white/20 transition-colors items-center gap-2"
        >
          <MapPin className="w-5 h-5" />
          <span className="text-sm font-medium">Menu</span>
        </button>
      )}

      {/* Mobile Bottom Menu Sheet */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-lg border-t border-white/20 shadow-lg rounded-t-3xl max-h-[70vh] overflow-y-auto"
          >
            <div className="p-6 space-y-6">
              {/* Close Handle */}
              <div className="flex justify-center">
                <div className="w-12 h-1.5 bg-white/30 rounded-full"></div>
              </div>

              {/* Time & Greeting */}
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-primary">
                  <Clock className="w-4 h-4" />
                  <div className="text-sm font-mono">
                    {currentTime.toLocaleTimeString()}
                  </div>
                </div>
                <h2 className="text-xl font-semibold">
                  {greeting}, {user.displayName?.split(' ')[0] || 'Explorer'}!
                </h2>
              </div>

              {/* User Profile */}
              <div className="text-center space-y-3">
                <motion.img
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  src={user.avatar}
                  alt={user.displayName}
                  className="w-24 h-24 rounded-full mx-auto border-4 border-primary shadow-xl"
                />
                <div className="glass p-3 rounded-lg text-black dark:text-white">
                  <div className="text-3xl font-bold text-gradient">
                    {totalStampsCollected}/{countries.filter(c => c.isUnlocked).length}
                  </div>
                  <div className="text-xs text-black dark:text-white">
                    Stamps Collected
                  </div>
                </div>
              </div>

              {/* Countries Progress */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-black dark:text-white uppercase tracking-wide flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Your Progress
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {sortedCountries.map((c) => {
                      const progress = c.progress;
                      const countryProgressData = getCountryProgress(c.slug);
                      const hasStamp = countryProgressData?.hasStamp || false;
                      const countryData = countries.find(country => country.slug === c.slug);
                      return (
                        <motion.button
                          key={c.id}
                          onClick={() => handleCountryClick(c.slug)}
                          whileHover={{ scale: 1.02, x: 4 }}
                          whileTap={{ scale: 0.98 }}
                          className={`w-full p-3 rounded-lg text-left transition-all backdrop-blur-md border text-black dark:text-white ${
                            hasStamp 
                              ? "bg-gradient-to-r from-amber-400/20 to-yellow-500/20 border-amber-400/40 dark:from-amber-400/15 dark:to-yellow-500/15"
                              : "bg-white/10 dark:bg-black/20 border-white/20 dark:border-white/10"
                          } ${
                            selectedCountry === c.slug
                              ? "ring-2 ring-primary shadow-lg"
                              : ""
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 flex items-center justify-center rounded-lg shrink-0 overflow-hidden">
                              {countryData?.flag?.startsWith('/') ? (
                                <img 
                                  src={countryData.flag} 
                                  alt={c.name} 
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <span className="text-xl">{countryData?.flag || c.slug.substring(0, 2).toUpperCase()}</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-sm truncate text-black dark:text-white">
                                {c.name}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="w-32 h-1.5 bg-white/20 dark:bg-white/10 rounded-full overflow-hidden shrink-0">
                                  <motion.div
                                    className="h-full bg-linear-to-r from-primary to-secondary"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 1, delay: 0.1 }}
                                  />
                                </div>
                                <span className="text-xs text-black dark:text-white w-8 text-right shrink-0">
                                  {progress}%
                                </span>
                              </div>
                            </div>
                            {hasStamp && (
                              <div className="w-7 h-7 shrink-0">
                                <img 
                                  src={`/stamp/${c.slug}.png`} 
                                  alt={`${c.name} stamp`}
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement!.innerHTML = '🐾';
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Toggle - Bottom Dock Style */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg p-4 rounded-full active:scale-95 transition-transform"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Full-screen Map Area */}
      <div className="absolute inset-0">
        {/* Map Container - Full Screen */}
        <div className="w-full h-full">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 400,
              center: [105, 20],
            }}
            width={800}
            height={500}
            className="w-full h-full"
            style={{ transition: "all 0.3s ease-out" }}
          >
            <ZoomableGroup
              zoom={zoom}
              center={center}
              minZoom={0.8}
              maxZoom={8}
              translateExtent={[
                [-100, -50],
                [900, 550],
              ]}
              onMoveEnd={(position) => {
                setCenter(position.coordinates);
                setZoom(position.zoom);
              }}
            >
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const countryName = geo.properties.name;
                    // Map geography names to our country slugs (Selectable countries)
                    const selectableCountries: Record<string, string> = {
                      Japan: "japan",
                      "South Korea": "south-korea",
                      Thailand: "thailand",
                      Indonesia: "indonesia",
                      Malaysia: "malaysia",
                    };

                    // Two types: Selectable (unlocked) or Unselectable (everything else)
                    const isSelectable = countryName in selectableCountries;

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onClick={() => {
                          if (isSelectable) {
                            handleCountryClick(
                              selectableCountries[countryName]
                            );
                          }
                        }}
                        fill={isSelectable ? "#A8BEDF" : "#4B5563"}
                        stroke={isSelectable ? "#FFFFFF" : "#374151"}
                        strokeWidth={isSelectable ? 0.8 : 0.3}
                        style={{
                          default: {
                            outline: "none",
                            cursor: isSelectable ? "pointer" : "default",
                          },
                          hover: {
                            fill: isSelectable ? "#EFE4D4" : "#4B5563",
                            outline: "none",
                            cursor: isSelectable ? "pointer" : "default",
                          },
                          pressed: { outline: "none" },
                        }}
                      />
                    );
                  })
                }
              </Geographies>

              {/* Country Markers - Only for Selectable countries */}
              {countries
                .filter((c) => c.isUnlocked)
                .map((c) => (
                  <Marker key={c.id} coordinates={c.coordinates}>
                    <g
                      onClick={() => handleCountryClick(c.slug)}
                      style={{ cursor: "pointer" }}
                    >
                      <circle
                        r={selectedCountry === c.slug ? 8 / zoom : 6 / zoom}
                        fill={
                          selectedCountry === c.slug ? "#EFE4D4" : "#A8BEDF"
                        }
                        stroke="#fff"
                        strokeWidth={2 / zoom}
                      />
                      <circle r={12 / zoom} fill="#A8BEDF" opacity={0.3} />
                    </g>
                  </Marker>
                ))}

              {/* Floating Comments as Markers - anchored to pins */}
              {!selectedCountry &&
                floatingComments.map((comment) => (
                  <Marker key={comment.id} coordinates={comment.coordinates}>
                    <g transform={`scale(${1 / zoom})`}>
                      {/* Connector line from pin to comment */}
                      <line
                        x1="0"
                        y1="0"
                        x2="15"
                        y2="-15"
                        stroke="#A8BEDF"
                        strokeWidth="1.5"
                        strokeDasharray="3,2"
                        opacity="0.6"
                      />
                      <foreignObject x="15" y="-40" width="140" height="40">
                        <div className="bg-white/20 dark:bg-black/30 backdrop-blur-2xl px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap shadow-2xl border border-white/30 dark:border-white/10">
                          {comment.text}
                        </div>
                      </foreignObject>
                    </g>
                  </Marker>
                ))}

              {/* Selected Country Comments - spread around the country area with fixed geo positions */}
              {selectedCountry &&
                country &&
                selectedCountryComments.map((comment) => {
                  // Use fixed geo coordinate offsets so comments stay in place during zoom
                  const commentCoords: [number, number] = [
                    country.coordinates[0] + comment.offset[0],
                    country.coordinates[1] + comment.offset[1],
                  ];
                  return (
                    <Marker key={comment.id} coordinates={commentCoords}>
                      <g transform={`scale(${1 / zoom})`}>
                        {/* Connector line from comment to country pin */}
                        <line
                          x1="0"
                          y1="0"
                          x2={
                            (country.coordinates[0] - commentCoords[0]) *
                            zoom *
                            2
                          }
                          y2={
                            (country.coordinates[1] - commentCoords[1]) *
                            zoom *
                            2
                          }
                          stroke="#EFE4D4"
                          strokeWidth="1.5"
                          strokeDasharray="4,3"
                          opacity="0.6"
                        />
                        <motion.g
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{
                            type: "spring",
                            delay: Math.random() * 0.3,
                          }}
                        >
                          <foreignObject
                            x="-75"
                            y="-20"
                            width="150"
                            height="40"
                          >
                            <div className="bg-white/20 dark:bg-black/30 backdrop-blur-2xl px-3 py-2 rounded-full text-xs md:text-sm font-medium shadow-2xl whitespace-nowrap text-center border border-white/30 dark:border-white/10">
                              {comment.text}
                            </div>
                          </foreignObject>
                        </motion.g>
                      </g>
                    </Marker>
                  );
                })}
            </ZoomableGroup>
          </ComposableMap>
        </div>

        {/* Zoom Controls - Hidden on mobile */}
        <div className="hidden md:flex absolute bottom-6 right-6 flex-col gap-2 z-20">
          <button
            onClick={() => setZoom(Math.min(zoom * 1.5, 8))}
            className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg p-3 rounded-xl hover:bg-white/20 transition-colors active:scale-95"
          >
            <span className="text-xl">+</span>
          </button>
          <button
            onClick={() => setZoom(Math.max(zoom / 1.5, 0.8))}
            className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg p-3 rounded-xl hover:bg-white/20 transition-colors active:scale-95"
          >
            <span className="text-xl">−</span>
          </button>
          {selectedCountry && (
            <button
              onClick={handleBackToMap}
              className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg p-3 rounded-xl hover:bg-white/20 transition-colors active:scale-95"
            >
              <span className="text-sm">⟲</span>
            </button>
          )}
        </div>
      </div>

      {/* Country Detail Panel */}
      <AnimatePresence>
        {country && (
          <>
            {/* Desktop/Tablet - dock style from right */}
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 250 }}
              className="hidden md:block fixed right-6 top-24 bottom-6 w-[420px] bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 shadow-2xl z-50 rounded-3xl overflow-hidden"
            >
              <div className="p-6 space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      {country.flag.startsWith("/") ? (
                        <img
                          src={country.flag}
                          alt={country.name}
                          className="w-12 h-12 object-contain"
                        />
                      ) : (
                        <span className="text-5xl">{country.flag}</span>
                      )}
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-black dark:text-white">{country.name}</h2>
                    </div>
                  </div>
                  <button
                    onClick={handleBackToMap}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </motion.div>

                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between text-sm text-black dark:text-white">
                    <span>Progress</span>
                    <span className="font-bold">{calculateProgress(country.slug)}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-linear-to-r from-primary to-secondary"
                      initial={{ width: 0 }}
                      animate={{ width: `${calculateProgress(country.slug)}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="glass p-4 rounded-lg text-black dark:text-white"
                >
                  <div className="text-sm font-semibold text-primary mb-1">
                    💡 Fun Fact
                  </div>
                  <p className="text-sm text-black dark:text-white">{country.funFact}</p>
                </motion.div>

                {selectedCountryHasStamp && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-3"
                  >
                    <h3 className="font-semibold flex items-center gap-2">
                      <span>Your Stamp</span>
                      <span className="text-2xl">🐾</span>
                    </h3>
                    <div className="glass p-3 rounded-lg flex items-center justify-center hover:shadow-lg transition-shadow">
                      <img 
                        src={`/stamp/${country.slug}.png`} 
                        alt={`${country.name} stamp`}
                        className="w-20 h-20 object-contain"
                        onError={(e) => {
                          e.currentTarget.src = '';
                          e.currentTarget.alt = '🐾';
                        }}
                      />
                    </div>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <Link href={`/country/${country.slug}`}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-linear-to-r from-primary to-secondary text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transition-shadow"
                    >
                      Explore {country.name}
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  </Link>
                </motion.div>
              </div>
            </motion.div>

            {/* Mobile - slides up from bottom - No backdrop, card only */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="md:hidden fixed inset-x-0 bottom-0 max-h-[85vh] bg-white dark:bg-gray-900 shadow-[0_-10px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)] rounded-t-3xl z-60 safe-area-inset-bottom"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag handle - tap to close */}
              <button
                onClick={handleBackToMap}
                className="w-full flex justify-center py-3 cursor-pointer"
              >
                <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
              </button>

              <div className="px-4 pb-8 space-y-4 overflow-y-auto max-h-[calc(85vh-48px)]">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      {country.flag.startsWith("/") ? (
                        <img
                          src={country.flag}
                          alt={country.name}
                          className="w-10 h-10 object-contain"
                        />
                      ) : (
                        <span className="text-4xl">{country.flag}</span>
                      )}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-black dark:text-white">
                        {country.name}
                      </h2>
                    </div>
                  </div>
                  <button
                    onClick={handleBackToMap}
                    className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-black dark:text-white" />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-black dark:text-white">
                    <span>Progress</span>
                    <span className="font-bold">{calculateProgress(country.slug)}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-linear-to-r from-primary to-secondary"
                      initial={{ width: 0 }}
                      animate={{ width: `${calculateProgress(country.slug)}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                    />
                  </div>
                </div>

                <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-lg border border-primary/20">
                  <div className="text-sm font-semibold text-primary mb-1">
                    💡 Fun Fact
                  </div>
                  <p className="text-xs text-black dark:text-white">
                    {country.funFact}
                  </p>
                </div>

                {selectedCountryHasStamp && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm flex items-center gap-2 text-black dark:text-white">
                      <span>Your Stamp</span>
                      <span className="text-xl">🐾</span>
                    </h3>
                    <div className="flex justify-center pb-2">
                      <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md p-3 rounded-lg border border-white/20 dark:border-white/10">
                        <img 
                          src={`/stamp/${country.slug}.png`} 
                          alt={`${country.name} stamp`}
                          className="w-16 h-16 object-contain"
                          onError={(e) => {
                            e.currentTarget.src = '';
                            e.currentTarget.alt = '🐾';
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <Link href={`/country/${country.slug}`}>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-linear-to-r from-primary to-secondary text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-xl"
                  >
                    Explore {country.name}
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Tutorial Overlay for New Users */}
      <AnimatePresence>
        {showTutorial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/20 dark:bg-black/40 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl"
            >
              {/* Tutorial Steps */}
              {tutorialStep === 0 && (
                <div className="text-center space-y-4">
                  <div className="text-6xl">🎉</div>
                  <h2 className="text-2xl font-bold text-black dark:text-white">Welcome to Meowtimedia!</h2>
                  <p className="text-black/80 dark:text-white/80">
                    Let&apos;s take a quick tour to help you get started on your Asian cultural adventure!
                  </p>
                </div>
              )}
              {tutorialStep === 1 && (
                <div className="text-center space-y-4">
                  <div className="text-6xl">🗺️</div>
                  <h2 className="text-2xl font-bold text-black dark:text-white">Explore the Map</h2>
                  <p className="text-black/80 dark:text-white/80">
                    Click on any <span className="text-primary font-semibold">country pin</span> on the map to learn about its culture, food, and traditions!
                  </p>
                </div>
              )}
              {tutorialStep === 2 && (
                <div className="text-center space-y-4">
                  <div className="text-6xl">📚</div>
                  <h2 className="text-2xl font-bold text-black dark:text-white">Learn & Quiz</h2>
                  <p className="text-black/80 dark:text-white/80">
                    Each country has fun facts and topics to explore. Take the <span className="text-primary font-semibold">quiz</span> to test your knowledge!
                  </p>
                </div>
              )}
              {tutorialStep === 3 && (
                <div className="text-center space-y-4">
                  <div className="text-6xl">🐾</div>
                  <h2 className="text-2xl font-bold text-black dark:text-white">Collect Stamps!</h2>
                  <p className="text-black/80 dark:text-white/80">
                    Score <span className="text-amber-500 font-semibold">80% or higher</span> on a quiz to earn that country&apos;s stamp! Fill your passport with stamps!
                  </p>
                </div>
              )}

              {/* Progress Dots */}
              <div className="flex justify-center gap-2 mt-6">
                {[0, 1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`w-2 h-2 rounded-full transition-all ${
                      step === tutorialStep
                        ? 'bg-primary w-6'
                        : step < tutorialStep
                        ? 'bg-primary/50'
                        : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSkipTutorial}
                  className="flex-1 py-3 rounded-xl border border-white/30 dark:border-white/10 text-black dark:text-white font-medium hover:bg-white/10 transition-colors"
                >
                  Skip
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleTutorialNext}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold shadow-lg"
                >
                  {tutorialStep === 3 ? "Let's Go!" : 'Next'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
