"use client";

import { motion, AnimatePresence, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";

// ============================================
// DONUT CHART (Question 2) - Redesigned
// ============================================

interface ChartData {
  label: string;
  count: number;
  color: string;
}

interface DonutChartProps {
  data: ChartData[];
  total: number;
}

export const DonutChart = ({ data, total }: DonutChartProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isAnimated, setIsAnimated] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => setIsAnimated(true), 100);
      return () => clearTimeout(timer);
    }
  }, [isInView]);

  if (total === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-muted-foreground text-center py-16 font-medium"
      >
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted/30 flex items-center justify-center">
          <svg className="w-10 h-10 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
        </div>
        <p className="text-sm">No data available</p>
      </motion.div>
    );
  }

  // Calculate stroke-dasharray segments
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  
  let accumulatedOffset = 0;
  const segments = data.map((item, index) => {
    const percentage = item.count / total;
    const segmentLength = percentage * circumference;
    const offset = accumulatedOffset;
    accumulatedOffset += segmentLength;
    
    return {
      ...item,
      percentage: percentage * 100,
      segmentLength,
      offset,
      index,
    };
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col lg:flex-row items-center gap-10 justify-center py-4"
    >
      {/* Chart Container */}
      <div className="relative">
        {/* Ambient glow */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 0.5, scale: 1 } : {}}
          transition={{ duration: 1, delay: 0.2 }}
          className="absolute -inset-8 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 rounded-full blur-3xl"
        />
        
        {/* SVG Chart */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 1 } : {}}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="relative w-52 h-52 lg:w-60 lg:h-60"
        >
          <svg 
            viewBox="0 0 200 200" 
            className="w-full h-full -rotate-90 drop-shadow-xl"
          >
            {/* Background circle */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="24"
              className="text-muted/20"
            />
            
            {/* Data segments */}
            {segments.map((segment, idx) => {
              const isHovered = hoveredIndex === idx;
              
              return (
                <motion.circle
                  key={idx}
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth={isHovered ? 28 : 24}
                  strokeLinecap="round"
                  initial={{ 
                    strokeDasharray: `0 ${circumference}`,
                    strokeDashoffset: -segment.offset,
                  }}
                  animate={isAnimated ? { 
                    strokeDasharray: `${segment.segmentLength - 4} ${circumference}`,
                    strokeDashoffset: -segment.offset,
                    strokeWidth: isHovered ? 28 : 24,
                  } : {}}
                  transition={{ 
                    strokeDasharray: {
                      duration: 1.2,
                      delay: 0.1 + idx * 0.15,
                      ease: [0.34, 1.56, 0.64, 1],
                    },
                    strokeWidth: { duration: 0.2 }
                  }}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="cursor-pointer transition-all duration-200"
                  style={{
                    filter: isHovered 
                      ? `drop-shadow(0 0 12px ${segment.color})` 
                      : `drop-shadow(0 2px 4px ${segment.color}40)`,
                  }}
                />
              );
            })}
          </svg>
          
          {/* Center content */}
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.4 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-28 h-28 lg:w-32 lg:h-32 rounded-full glass-strong flex items-center justify-center">
              <div className="text-center">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.6 }}
                >
                  <span className="text-3xl lg:text-4xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                    {total}
                  </span>
                </motion.div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : {}}
                  transition={{ delay: 0.7 }}
                  className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em] mt-1"
                >
                  Responses
                </motion.p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Legend */}
      <div className="w-full max-w-xs space-y-2">
        {segments.map((item, idx) => {
          const isHovered = hoveredIndex === idx;
          
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.3 + idx * 0.1, duration: 0.4 }}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`
                flex items-center justify-between p-3 rounded-2xl transition-all duration-300 cursor-pointer
                ${isHovered ? 'bg-muted/70 shadow-lg scale-[1.02]' : 'hover:bg-muted/40'}
              `}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ 
                    scale: isHovered ? 1.3 : 1,
                    boxShadow: isHovered ? `0 0 16px ${item.color}` : 'none'
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="w-3 h-3 rounded-full ring-2 ring-white/50 dark:ring-black/50"
                  style={{ backgroundColor: item.color }}
                />
                <span className={`text-sm font-medium transition-colors duration-200 ${isHovered ? 'text-foreground' : 'text-foreground/80'}`}>
                  {item.label}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <motion.span 
                  animate={{ scale: isHovered ? 1.1 : 1 }}
                  className="text-sm font-bold tabular-nums"
                >
                  {item.count}
                </motion.span>
                <span className={`
                  text-xs font-semibold tabular-nums px-2 py-0.5 rounded-full transition-all duration-200
                  ${isHovered 
                    ? 'bg-foreground text-background' 
                    : 'bg-muted text-muted-foreground'
                  }
                `}>
                  {item.percentage.toFixed(0)}%
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};


// ============================================
// HORIZONTAL BAR CHART (Question 4) - Redesigned
// ============================================

interface BarData {
  label: string;
  count: number;
  value: string;
}

interface HorizontalBarChartProps {
  data: BarData[];
  total: number;
  maxVal: number;
  colorMap?: { value: string; color: string }[];
}

export const HorizontalBarChart = ({ data, total, maxVal, colorMap }: HorizontalBarChartProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });

  // Default gradient colors (Apple-inspired)
  const defaultColors = [
    { bg: "from-blue-400 to-blue-600", color: "#3b82f6" },
    { bg: "from-purple-400 to-purple-600", color: "#a855f7" },
    { bg: "from-pink-400 to-pink-600", color: "#ec4899" },
    { bg: "from-orange-400 to-orange-600", color: "#f97316" },
    { bg: "from-teal-400 to-teal-600", color: "#14b8a6" },
    { bg: "from-indigo-400 to-indigo-600", color: "#6366f1" },
    { bg: "from-rose-400 to-rose-600", color: "#f43f5e" },
    { bg: "from-emerald-400 to-emerald-600", color: "#10b981" },
  ];

  const safeMaxVal = maxVal > 0 ? maxVal : 1;

  if (!data || data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-muted-foreground text-center py-16 font-medium"
      >
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted/30 flex items-center justify-center">
          <svg className="w-10 h-10 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p className="text-sm">No data available</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      {data.map((item, idx) => {
        const percentage = total > 0 ? (item.count / total) * 100 : 0;
        const widthPercentage = Math.min((item.count / safeMaxVal) * 100, 100);
        const isHovered = hoveredIndex === idx;
        
        // Get color from colorMap or use default
        const mappedColor = colorMap?.find((c) => c.value === item.value)?.color;
        const colorStyle = defaultColors[idx % defaultColors.length];
        const barColor = mappedColor || colorStyle.color;

        return (
          <motion.div
            key={`${item.value}-${idx}`}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ 
              delay: 0.05 * idx, 
              duration: 0.4,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
            className={`
              relative p-4 rounded-2xl transition-all duration-300 cursor-pointer
              ${isHovered 
                ? 'bg-muted/60 shadow-lg shadow-black/5 dark:shadow-white/5 scale-[1.01]' 
                : 'hover:bg-muted/30'
              }
            `}
          >
            {/* Label Row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ 
                    scale: isHovered ? 1.4 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ 
                    backgroundColor: barColor,
                    boxShadow: isHovered ? `0 0 12px ${barColor}` : 'none'
                  }}
                />
                <span className={`
                  text-sm font-semibold transition-colors duration-200
                  ${isHovered ? 'text-foreground' : 'text-foreground/80'}
                `}>
                  {item.label}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <motion.span
                  animate={{ scale: isHovered ? 1.1 : 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="text-base font-bold tabular-nums"
                >
                  {item.count}
                </motion.span>
                <motion.span 
                  animate={{ 
                    backgroundColor: isHovered ? barColor : 'transparent',
                    color: isHovered ? '#ffffff' : undefined,
                  }}
                  className={`
                    text-xs font-semibold tabular-nums px-2.5 py-1 rounded-full transition-all duration-300
                    ${isHovered 
                      ? '' 
                      : 'bg-muted text-muted-foreground'
                    }
                  `}
                >
                  {percentage.toFixed(1)}%
                </motion.span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="relative h-3 w-full bg-muted/50 rounded-full overflow-hidden">
              {/* Background shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
              
              {/* Animated Bar */}
              <motion.div
                initial={{ width: 0 }}
                animate={isInView ? { width: `${widthPercentage}%` } : { width: 0 }}
                transition={{ 
                  duration: 0.8, 
                  delay: 0.2 + idx * 0.08,
                  ease: [0.34, 1.56, 0.64, 1]
                }}
                className="h-full rounded-full relative overflow-hidden"
                style={{ 
                  backgroundColor: barColor,
                  boxShadow: isHovered 
                    ? `0 0 20px ${barColor}60, inset 0 1px 0 rgba(255,255,255,0.3)` 
                    : `inset 0 1px 0 rgba(255,255,255,0.2)`,
                }}
              >
                {/* Inner highlight */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/25 to-transparent" />
                
                {/* Shine animation on hover */}
                <motion.div
                  initial={{ x: "-100%", opacity: 0 }}
                  animate={isHovered ? { x: "200%", opacity: 1 } : { x: "-100%", opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
                />
              </motion.div>
            </div>

            {/* Hover indicator line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: isHovered ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full origin-left"
              style={{ backgroundColor: barColor }}
            />
          </motion.div>
        );
      })}
    </motion.div>
  );
};


// ============================================
// RATING HISTOGRAM - Enhanced Version
// ============================================

interface RatingData {
  _id: number;
  count: number;
}

interface EmojiMap {
  value: number;
  emoji: string;
  label: string;
}

interface RatingHistogramProps {
  data: RatingData[];
  total: number;
  emojiMap: EmojiMap[];
}

export const RatingHistogram = ({ data, total, emojiMap }: RatingHistogramProps) => {
  const ratings = [1, 2, 3, 4, 5];
  const maxCount = Math.max(...data.map(d => d.count), 1);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });

  const getRatingStyle = (rating: number) => {
    if (rating >= 4) return { 
      gradient: "from-emerald-400 via-emerald-500 to-teal-600", 
      shadow: "rgba(16, 185, 129, 0.4)",
      bg: "bg-emerald-500"
    };
    if (rating === 3) return { 
      gradient: "from-amber-400 via-amber-500 to-orange-500", 
      shadow: "rgba(245, 158, 11, 0.4)",
      bg: "bg-amber-500"
    };
    return { 
      gradient: "from-rose-400 via-rose-500 to-red-500", 
      shadow: "rgba(244, 63, 94, 0.4)",
      bg: "bg-rose-500"
    };
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.4 }}
      className="relative px-2"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-muted/30 to-transparent rounded-3xl -z-10" />
      
      <div className="flex items-end justify-between h-56 gap-3 lg:gap-5 pt-10 pb-2">
        {ratings.map((rating, idx) => {
          const item = data.find(d => d._id === rating);
          const count = item?.count || 0;
          const percentage = total > 0 ? (count / total) * 100 : 0;
          const heightPercentage = (count / maxCount) * 100;
          const emojiItem = emojiMap.find(e => e.value === rating);
          const isHovered = hoveredRating === rating;
          const style = getRatingStyle(rating);

          return (
            <motion.div
              key={rating}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 + idx * 0.08, duration: 0.5 }}
              className="flex-1 flex flex-col items-center relative"
              onMouseEnter={() => setHoveredRating(rating)}
              onMouseLeave={() => setHoveredRating(null)}
            >
              {/* Tooltip */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="absolute -top-16 z-20 glass-strong px-4 py-2.5 rounded-2xl shadow-2xl"
                  >
                    <div className="text-center whitespace-nowrap">
                      <span className="text-lg font-bold">{count}</span>
                      <span className="text-xs text-muted-foreground ml-1.5">votes</span>
                    </div>
                    <div className="text-xs text-muted-foreground text-center mt-0.5">
                      {percentage.toFixed(1)}%
                    </div>
                    {/* Arrow */}
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 glass-strong" />
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Bar Container */}
              <div className="w-full flex-1 flex items-end relative">
                {/* Track */}
                <div className="absolute inset-0 bg-muted/30 rounded-2xl" />
                
                {/* Bar */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={isInView ? { 
                    height: count > 0 ? `${Math.max(heightPercentage, 8)}%` : '0%',
                  } : {}}
                  transition={{ 
                    type: "spring",
                    stiffness: 60,
                    damping: 15,
                    delay: 0.3 + idx * 0.1
                  }}
                  className={`
                    w-full rounded-2xl relative overflow-hidden
                    bg-gradient-to-t ${style.gradient}
                    transition-all duration-300
                  `}
                  style={{
                    boxShadow: isHovered 
                      ? `0 8px 32px ${style.shadow}, 0 0 0 2px rgba(255,255,255,0.2)` 
                      : `0 4px 16px ${style.shadow}`,
                    transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                  }}
                >
                  {/* Top highlight */}
                  <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/30 to-transparent" />
                  
                  {/* Count label */}
                  {count > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={isInView ? { opacity: 1 } : {}}
                      transition={{ delay: 0.6 + idx * 0.1 }}
                      className="absolute top-2 left-0 right-0 text-center"
                    >
                      <span className="text-white text-xs font-bold drop-shadow-md">
                        {count}
                      </span>
                    </motion.div>
                  )}
                  
                  {/* Shine effect */}
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={isHovered ? { x: "200%" } : { x: "-100%" }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                  />
                </motion.div>
              </div>
              
              {/* Label */}
              <motion.div
                animate={{ 
                  scale: isHovered ? 1.15 : 1,
                  y: isHovered ? -4 : 0
                }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="text-center mt-4 space-y-1"
              >
                <motion.div
                  animate={{ 
                    scale: isHovered ? 1.2 : 1,
                    filter: isHovered ? 'grayscale(0) drop-shadow(0 4px 8px rgba(0,0,0,0.15))' : 'grayscale(0.3)'
                  }}
                  className="text-2xl lg:text-3xl transition-all duration-300"
                >
                  {emojiItem?.emoji}
                </motion.div>
                <div className={`text-sm font-bold transition-all duration-300 ${isHovered ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {rating}
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};