'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { X, ArrowRight, Clock, MapPin } from 'lucide-react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { countries, mockUser, stamps } from '@/lib/mock-data';
import ProgressCircle from '@/components/progress-circle';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json";

// Fun comments for countries
const countryComments = {
  japan: ['Sushi capital! 🍣', 'Cherry blossoms season!', 'Tech paradise', 'Anime wonderland'],
  'south-korea': ['K-Pop fever! 🎤', 'Kimchi heaven', 'Seoul lights', 'Drama vibes'],
  china: ['Great Wall awaits', 'Tea traditions 🍵', 'Ancient wisdom', '5000 years rich'],
  thailand: ['Beach paradise 🏖️', 'Street food heaven', 'Smile capital', 'Temple treasures'],
  vietnam: ['Pho-nomenal! 🍜', 'Coffee culture', 'Boat rides', 'Lantern magic'],
  indonesia: ['Island hopping! 🏝️', 'Bali bliss', 'Diverse cultures', 'Volcano views'],
  malaysia: ['Food fusion 🍛', 'Twin towers', 'Rainforest life', 'Multicultural hub'],
  philippines: ['Beach dreams 🌴', '7,000+ islands', 'Warm hearts', 'Island adventures'],
  singapore: ['Food paradise! 🍜', 'Garden city', 'Modern marvel', 'Hawker culture'],
  india: ['Spice heaven 🌶️', 'Taj Mahal beauty', 'Yoga origins', 'Colorful festivals']
};

export default function DashboardPage() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([100, 25]);
  const [floatingComments, setFloatingComments] = useState<Array<{id: number, country: string, text: string, coordinates: [number, number]}>>([]);
  const [selectedCountryComments, setSelectedCountryComments] = useState<Array<{id: number, text: string}>>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState('');

  const country = selectedCountry ? countries.find(c => c.slug === selectedCountry) : null;
  const userStamps = stamps.filter(s => s.countrySlug === selectedCountry);

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
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, [currentTime]);

  // Random floating comments - now using country coordinates
  useEffect(() => {
    if (!selectedCountry) {
      const addComment = () => {
        const shuffled = [...countries].sort(() => 0.5 - Math.random());
        const randomCountries = shuffled.slice(0, 2);
        const newComments = randomCountries.map((c, i) => {
          const comments = countryComments[c.slug as keyof typeof countryComments] || ['Explore me!'];
          const randomComment = comments[Math.floor(Math.random() * comments.length)];
          return {
            id: Date.now() + i,
            country: c.slug,
            text: randomComment,
            coordinates: c.coordinates
          };
        });
        setFloatingComments(newComments as any);
      };

      addComment();
      const interval = setInterval(addComment, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedCountry]);

  // Selected country comments
  useEffect(() => {
    if (selectedCountry) {
      const updateComments = () => {
        const comments = countryComments[selectedCountry as keyof typeof countryComments] || [];
        const randomComments = comments
          .sort(() => 0.5 - Math.random())
          .slice(0, 3)
          .map((text, i) => ({ id: Date.now() + i, text }));
        setSelectedCountryComments(randomComments);
      };

      updateComments();
      const interval = setInterval(updateComments, 6000);
      return () => clearInterval(interval);
    } else {
      setSelectedCountryComments([]);
    }
  }, [selectedCountry]);

  // Handle country selection with zoom
  const handleCountryClick = (countrySlug: string) => {
    const country = countries.find(c => c.slug === countrySlug);
    if (country) {
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
    setZoom(1);
    setCenter([100, 25]);
  };

  return (
    <div className="min-h-screen relative bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          x: (sidebarExpanded || mobileMenuOpen) ? 0 : -320,
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed left-0 top-16 bottom-0 w-80 glass-strong border-r backdrop-blur-xl z-40 overflow-hidden"
      >
        <div className="p-6 space-y-6 w-80">
          {/* Time & Greeting */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-primary">
              <Clock className="w-4 h-4" />
              <div className="text-sm font-mono">
                {currentTime.toLocaleTimeString()}
              </div>
            </div>
            <h2 className="text-xl font-semibold">{greeting}, {mockUser.name}!</h2>
          </div>

          {/* User Profile */}
          <div className="text-center space-y-3">
            <motion.img 
              whileHover={{ scale: 1.05, rotate: 5 }}
              src={mockUser.image} 
              alt={mockUser.name}
              className="w-24 h-24 rounded-full mx-auto border-4 border-primary shadow-xl"
            />
            <div className="glass p-3 rounded-lg">
              <div className="text-3xl font-bold text-gradient">{mockUser.totalStamps}/48</div>
              <div className="text-xs text-muted-foreground">Stamps Collected</div>
            </div>
          </div>

          {/* Countries Progress */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Your Progress
            </h3>
            <div className="space-y-2 max-h-[calc(100vh-450px)] overflow-y-auto pr-2">
              {countries.map((c) => {
                const countryStamps = stamps.filter(s => s.countrySlug === c.slug).length;
                return (
                  <motion.button
                    key={c.id}
                    onClick={() => handleCountryClick(c.slug)}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full glass p-3 rounded-lg text-left transition-all ${
                      selectedCountry === c.slug ? 'ring-2 ring-primary shadow-lg' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl shrink-0">{c.flag}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">{c.name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-32 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shrink-0">
                            <motion.div 
                              className="h-full bg-linear-to-r from-primary to-secondary"
                              initial={{ width: 0 }}
                              animate={{ width: `${c.progress}%` }}
                              transition={{ duration: 1, delay: 0.1 }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground w-8 text-right shrink-0">{c.progress}%</span>
                        </div>
                      </div>
                      {countryStamps > 0 && (
                        <div className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full font-semibold shrink-0">
                          {countryStamps} 🐾
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

      {/* Main Map Area */}
      <div className="transition-all duration-300 md:ml-0">
        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden fixed top-20 left-4 z-50 glass-strong p-3 rounded-lg shadow-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="relative min-h-screen p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-4 md:mb-6 space-y-2"
            >
              <h1 className="text-3xl md:text-5xl font-bold logo-text text-gradient">Explore Asia</h1>
              <p className="text-muted-foreground text-sm md:text-lg px-4">
                Click on any country pin to begin your cultural journey
              </p>
            </motion.div>

            {/* Map Container */}
            <div className="relative w-full aspect-video md:aspect-16/10 glass-strong rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl mt-16 md:mt-0">
              <ComposableMap
                projection="geoMercator"
                projectionConfig={{
                  scale: 400
                }}
                width={800}
                height={500}
                className="w-full h-full"
              >
                <ZoomableGroup zoom={zoom} center={center}>
                  <Geographies geography={geoUrl}>
                    {({ geographies }) =>
                      geographies.map((geo) => {
                        const isAsian = ['Japan', 'South Korea', 'China', 'Thailand', 'Vietnam', 
                          'Indonesia', 'Malaysia', 'Philippines', 'Singapore', 'India', 'Myanmar',
                          'Cambodia', 'Laos', 'Nepal', 'Bangladesh', 'Sri Lanka'].includes(geo.properties.name);
                        
                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            fill={isAsian ? "#C7D5E8" : "#E5E7EB"}
                            stroke="#FFFFFF"
                            strokeWidth={0.5}
                            style={{
                              default: { outline: 'none' },
                              hover: { fill: isAsian ? "#A8BEDF" : "#E5E7EB", outline: 'none' },
                              pressed: { outline: 'none' }
                            }}
                          />
                        );
                      })
                    }
                  </Geographies>

                  {/* Country Markers */}
                  {countries.map((c, i) => (
                    <Marker key={c.id} coordinates={c.coordinates}>
                      <g onClick={() => handleCountryClick(c.slug)} style={{ cursor: 'pointer' }}>
                        <circle
                          r={selectedCountry === c.slug ? 8 / zoom : 6 / zoom}
                          fill={selectedCountry === c.slug ? "#EFE4D4" : "#A8BEDF"}
                          stroke="#fff"
                          strokeWidth={2 / zoom}
                        />
                        <circle
                          r={12 / zoom}
                          fill="#A8BEDF"
                          opacity={0.3}
                        />
                      </g>
                    </Marker>
                  ))}

                  {/* Floating Comments as Markers */}
                  {!selectedCountry && floatingComments.map((comment) => (
                    <Marker key={comment.id} coordinates={comment.coordinates}>
                      <g transform={`scale(${1 / zoom})`}>
                        <foreignObject x="10" y="-10" width="120" height="30">
                          <div className="glass-strong backdrop-blur-xl px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shadow-lg">
                            {comment.text}
                          </div>
                        </foreignObject>
                      </g>
                    </Marker>
                  ))}

                  {/* Selected Country Comments */}
                  {selectedCountry && country && selectedCountryComments.map((comment, index) => {
                    const offsetX = [15, -15, 25][index] || 15;
                    const offsetY = [-15, -25, -10][index] || -15;
                    return (
                      <Marker 
                        key={comment.id} 
                        coordinates={[
                          country.coordinates[0] + offsetX * 0.3,
                          country.coordinates[1] + offsetY * 0.3
                        ]}
                      >
                        <g transform={`scale(${1 / zoom})`}>
                          <foreignObject x="0" y="0" width="140" height="40">
                            <div className="glass-strong backdrop-blur-xl px-4 py-2 rounded-lg text-sm font-medium shadow-lg whitespace-nowrap">
                              {comment.text}
                            </div>
                          </foreignObject>
                        </g>
                      </Marker>
                    );
                  })}
                </ZoomableGroup>
              </ComposableMap>

              {/* Zoom Controls */}
              <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                <button
                  onClick={() => setZoom(Math.min(zoom * 1.5, 4))}
                  className="glass-strong p-3 md:p-2 rounded-lg hover:bg-primary/20 transition-colors active:scale-95"
                >
                  <span className="text-2xl md:text-xl">+</span>
                </button>
                <button
                  onClick={() => setZoom(Math.max(zoom / 1.5, 1))}
                  className="glass-strong p-3 md:p-2 rounded-lg hover:bg-primary/20 transition-colors active:scale-95"
                >
                  <span className="text-2xl md:text-xl">−</span>
                </button>
                {selectedCountry && (
                  <button
                    onClick={handleBackToMap}
                    className="glass-strong p-3 md:p-2 rounded-lg hover:bg-primary/20 transition-colors active:scale-95"
                  >
                    <span className="text-lg md:text-sm">⟲</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Country Detail Panel */}
      <AnimatePresence>
        {country && (
          <motion.div
            initial={{ x: '100%', scale: 0.9 }}
            animate={{ x: 0, scale: 1 }}
            exit={{ x: '100%', scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-16 bottom-0 w-full md:w-[480px] glass-strong border-l overflow-y-auto z-50 shadow-2xl"
          >
            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start justify-between"
              >
                <div className="flex items-center gap-2 md:gap-3">
                  <motion.span 
                    className="text-3xl md:text-5xl"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {country.flag}
                  </motion.span>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold">{country.name}</h2>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      {country.unlockedTopics}/{country.totalTopics} topics unlocked
                    </p>
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
                className="flex justify-center"
              >
                <ProgressCircle progress={country.progress} />
              </motion.div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="space-y-3"
              >
                <p className="text-muted-foreground leading-relaxed">{country.description}</p>
                <div className="glass p-4 rounded-lg">
                  <div className="text-sm font-semibold text-primary mb-1">💡 Fun Fact</div>
                  <p className="text-sm">{country.funFact}</p>
                </div>
              </motion.div>

              {userStamps.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-3"
                >
                  <h3 className="font-semibold flex items-center gap-2">
                    <span>Your Stamps</span>
                    <span className="text-2xl">🐾</span>
                  </h3>
                  <div className="space-y-2">
                    {userStamps.map((stamp, index) => (
                      <motion.div
                        key={stamp.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="glass p-3 rounded-lg flex items-center gap-3 hover:shadow-lg transition-shadow"
                      >
                        <span className="text-2xl">{stamp.icon}</span>
                        <div className="flex-1">
                          <div className="font-semibold text-sm">{stamp.topicName}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(stamp.date).toLocaleDateString()}
                          </div>
                        </div>
                      </motion.div>
                    ))}
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
        )}
      </AnimatePresence>
    </div>
  );
}
