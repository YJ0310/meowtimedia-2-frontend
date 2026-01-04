"use client";

import { motion, AnimatePresence, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";

// ============================================
// DONUT CHART - Apple Style with SVG Arcs
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

  if (total === 0 || !data || data.length === 0) {
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

  // Calculate segments with small gaps
  const gapAngle = 2;
  const totalGapAngle = gapAngle * data.length;
  const availableAngle = 360 - totalGapAngle;

  let currentAngle = 0;
  const segments = data.map((item, index) => {
    const percentage = (item.count / total) * availableAngle;
    const startAngle = currentAngle;
    const endAngle = currentAngle + percentage;
    currentAngle = endAngle + gapAngle;

    return {
      ...item,
      startAngle,
      endAngle,
      percentage: (item.count / total) * 100,
      index,
    };
  });

  // Create SVG arc path
  const createArc = (
    startAngle: number,
    endAngle: number,
    outerRadius: number,
    innerRadius: number
  ) => {
    // Ensure minimum arc length for visibility
    if (endAngle - startAngle < 0.5) return "";

    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;

    const x1 = 100 + outerRadius * Math.cos(startRad);
    const y1 = 100 + outerRadius * Math.sin(startRad);
    const x2 = 100 + outerRadius * Math.cos(endRad);
    const y2 = 100 + outerRadius * Math.sin(endRad);
    const x3 = 100 + innerRadius * Math.cos(endRad);
    const y3 = 100 + innerRadius * Math.sin(endRad);
    const x4 = 100 + innerRadius * Math.cos(startRad);
    const y4 = 100 + innerRadius * Math.sin(startRad);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 justify-center py-4"
    >
      {/* Chart Container */}
      <div className="relative">
        {/* Ambient glow effect */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 0.4, scale: 1 } : {}}
          transition={{ duration: 1, delay: 0.2 }}
          className="absolute -inset-8 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 rounded-full blur-3xl pointer-events-none"
        />

        {/* SVG Donut Chart */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 1 } : {}}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="relative w-48 h-48 sm:w-56 sm:h-56"
        >
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xl">
            {/* Background track */}
            <circle
              cx="100"
              cy="100"
              r="75"
              fill="none"
              stroke="currentColor"
              strokeWidth="28"
              className="text-muted/20"
            />

            {/* Animated segments */}
            {segments.map((segment, idx) => {
              const isHovered = hoveredIndex === idx;
              const outerRadius = isHovered ? 80 : 75;
              const innerRadius = isHovered ? 46 : 50;
              const path = createArc(segment.startAngle, segment.endAngle, outerRadius, innerRadius);

              if (!path) return null;

              return (
                <motion.path
                  key={idx}
                  d={path}
                  fill={segment.color}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={
                    isAnimated
                      ? {
                          opacity: 1,
                          scale: 1,
                        }
                      : {}
                  }
                  transition={{
                    type: "spring",
                    stiffness: 80,
                    damping: 20,
                    delay: 0.2 + idx * 0.1,
                  }}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="cursor-pointer transition-all duration-300 origin-center"
                  style={{
                    filter: isHovered
                      ? `drop-shadow(0 0 16px ${segment.color}) brightness(1.1)`
                      : `drop-shadow(0 2px 8px ${segment.color}50)`,
                  }}
                />
              );
            })}
          </svg>

          {/* Center glassmorphism circle */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            transition={{ type: "spring", stiffness: 150, damping: 20, delay: 0.4 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full glass-strong flex items-center justify-center">
              <div className="text-center">
                <motion.span
                  initial={{ opacity: 0, y: 8 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.6 }}
                  className="text-3xl sm:text-4xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent"
                >
                  {total}
                </motion.span>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : {}}
                  transition={{ delay: 0.7 }}
                  className="text-[9px] sm:text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em] mt-0.5"
                >
                  Responses
                </motion.p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="w-full max-w-xs space-y-2"
      >
        {segments.map((item, idx) => {
          const isHovered = hoveredIndex === idx;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: 20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.4 + idx * 0.06 }}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`
                flex items-center justify-between p-3 rounded-2xl transition-all duration-300 cursor-pointer
                ${isHovered ? "bg-muted/70 shadow-lg scale-[1.02]" : "hover:bg-muted/40"}
              `}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{
                    scale: isHovered ? 1.3 : 1,
                    boxShadow: isHovered ? `0 0 16px ${item.color}` : "none",
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="w-3 h-3 rounded-full ring-2 ring-white/30 dark:ring-black/30"
                  style={{ backgroundColor: item.color }}
                />
                <span
                  className={`text-sm font-medium transition-colors duration-200 ${
                    isHovered ? "text-foreground" : "text-foreground/80"
                  }`}
                >
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
                <span
                  className={`
                  text-xs font-semibold tabular-nums px-2 py-0.5 rounded-full transition-all duration-200
                  ${isHovered ? "bg-foreground text-background" : "bg-muted text-muted-foreground"}
                `}
                >
                  {item.percentage.toFixed(0)}%
                </span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
};

// ============================================
// RATING HISTOGRAM - Vertical Bar Chart
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
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });

  const getRatingStyle = (rating: number) => {
    if (rating >= 4)
      return {
        gradient: "from-emerald-400 via-emerald-500 to-teal-600",
        shadow: "rgba(16, 185, 129, 0.4)",
        color: "#10b981",
      };
    if (rating === 3)
      return {
        gradient: "from-amber-400 via-amber-500 to-orange-500",
        shadow: "rgba(245, 158, 11, 0.4)",
        color: "#f59e0b",
      };
    return {
      gradient: "from-rose-400 via-rose-500 to-red-500",
      shadow: "rgba(244, 63, 94, 0.4)",
      color: "#f43f5e",
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
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-t from-muted/20 to-transparent rounded-3xl -z-10" />

      <div className="flex items-end justify-between h-52 sm:h-60 gap-2 sm:gap-4 pt-12 pb-2">
        {ratings.map((rating, idx) => {
          const item = data.find((d) => d._id === rating);
          const count = item?.count || 0;
          const percentage = total > 0 ? (count / total) * 100 : 0;
          const heightPercentage = (count / maxCount) * 100;
          const emojiItem = emojiMap.find((e) => e.value === rating);
          const isHovered = hoveredRating === rating;
          const style = getRatingStyle(rating);

          return (
            <motion.div
              key={rating}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 + idx * 0.08, duration: 0.4 }}
              className="flex-1 flex flex-col items-center relative"
              onMouseEnter={() => setHoveredRating(rating)}
              onMouseLeave={() => setHoveredRating(null)}
            >
              {/* Tooltip */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="absolute -top-14 z-20 glass-strong px-3 py-2 rounded-xl shadow-2xl whitespace-nowrap"
                  >
                    <div className="text-center">
                      <span className="text-base font-bold">{count}</span>
                      <span className="text-xs text-muted-foreground ml-1">votes</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground text-center">
                      {percentage.toFixed(1)}%
                    </div>
                    {/* Arrow */}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 glass-strong" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bar Container */}
              <div className="w-full flex-1 flex items-end relative">
                {/* Track */}
                <div className="absolute inset-0 bg-muted/25 rounded-xl sm:rounded-2xl" />

                {/* Bar */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={
                    isInView
                      ? {
                          height: count > 0 ? `${Math.max(heightPercentage, 10)}%` : "0%",
                        }
                      : {}
                  }
                  transition={{
                    type: "spring",
                    stiffness: 60,
                    damping: 15,
                    delay: 0.3 + idx * 0.08,
                  }}
                  className={`
                    w-full rounded-xl sm:rounded-2xl relative overflow-hidden
                    bg-gradient-to-t ${style.gradient}
                    transition-transform duration-300
                  `}
                  style={{
                    boxShadow: isHovered
                      ? `0 8px 32px ${style.shadow}, 0 0 0 2px rgba(255,255,255,0.15)`
                      : `0 4px 16px ${style.shadow}`,
                    transform: isHovered ? "scaleX(1.08)" : "scaleX(1)",
                  }}
                >
                  {/* Highlight gradient */}
                  <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent" />

                  {/* Count label inside bar */}
                  {count > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={isInView ? { opacity: 1 } : {}}
                      transition={{ delay: 0.6 + idx * 0.08 }}
                      className="absolute top-2 left-0 right-0 text-center"
                    >
                      <span className="text-white text-xs sm:text-sm font-bold drop-shadow-md">
                        {count}
                      </span>
                    </motion.div>
                  )}

                  {/* Shine effect on hover */}
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={isHovered ? { x: "200%" } : { x: "-100%" }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                  />
                </motion.div>
              </div>

              {/* Emoji & Rating Label */}
              <motion.div
                animate={{
                  scale: isHovered ? 1.1 : 1,
                  y: isHovered ? -2 : 0,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="text-center mt-3 space-y-0.5"
              >
                <motion.div
                  animate={{
                    scale: isHovered ? 1.25 : 1,
                    filter: isHovered ? "grayscale(0)" : "grayscale(0.4)",
                  }}
                  className="text-xl sm:text-2xl transition-all duration-300"
                >
                  {emojiItem?.emoji}
                </motion.div>
                <div
                  className={`
                  text-xs sm:text-sm font-bold transition-colors duration-300
                  ${isHovered ? "text-foreground" : "text-muted-foreground"}
                `}
                >
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

// ============================================
// HORIZONTAL BAR CHART
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

  // Apple-inspired color palette
  const defaultColors = [
    "#a8bedf", // meow-primary
    "#c7d5e8", // meow-secondary
    "#efe4d4", // meow-accent
    "#d8c9ba", // meow-neutral
    "#93c5fd", // blue-300
    "#c4b5fd", // violet-300
    "#fda4af", // rose-300
    "#fdba74", // orange-300
    "#86efac", // green-300
    "#67e8f9", // cyan-300
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
          <svg
            className="w-10 h-10 text-muted-foreground/40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
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
      className="space-y-3"
    >
      {data.map((item, idx) => {
        const percentage = total > 0 ? (item.count / total) * 100 : 0;
        const widthPercentage = Math.min((item.count / safeMaxVal) * 100, 100);
        const isHovered = hoveredIndex === idx;

        // Get color from colorMap or default palette
        const mappedColor = colorMap?.find((c) => c.value === item.value)?.color;
        const barColor = mappedColor || defaultColors[idx % defaultColors.length];

        return (
          <motion.div
            key={`${item.value}-${idx}`}
            initial={{ opacity: 0, y: 15 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{
              delay: 0.05 * idx,
              duration: 0.4,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
            className={`
              relative p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all duration-300 cursor-pointer
              ${isHovered ? "bg-muted/60 shadow-lg shadow-black/5 dark:shadow-white/5 scale-[1.01]" : "hover:bg-muted/30"}
            `}
          >
            {/* Label Row */}
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2.5">
                <motion.div
                  animate={{ scale: isHovered ? 1.4 : 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: barColor,
                    boxShadow: isHovered ? `0 0 12px ${barColor}` : "none",
                  }}
                />
                <span
                  className={`
                  text-sm font-medium transition-colors duration-200 truncate
                  ${isHovered ? "text-foreground" : "text-foreground/80"}
                `}
                >
                  {item.label}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <motion.span
                  animate={{ scale: isHovered ? 1.1 : 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="text-sm font-bold tabular-nums"
                >
                  {item.count}
                </motion.span>
                <motion.span
                  animate={{
                    backgroundColor: isHovered ? barColor : "transparent",
                    color: isHovered ? "#ffffff" : undefined,
                  }}
                  className={`
                    text-xs font-semibold tabular-nums px-2 py-0.5 rounded-full transition-all duration-300
                    ${isHovered ? "" : "bg-muted text-muted-foreground"}
                  `}
                >
                  {percentage.toFixed(1)}%
                </motion.span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-2.5 sm:h-3 w-full bg-muted/40 rounded-full overflow-hidden">
              {/* Animated Bar */}
              <motion.div
                initial={{ width: 0 }}
                animate={isInView ? { width: `${widthPercentage}%` } : { width: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 50,
                  damping: 15,
                  delay: 0.2 + idx * 0.06,
                }}
                className="h-full rounded-full relative overflow-hidden"
                style={{
                  backgroundColor: barColor,
                  boxShadow: isHovered ? `0 0 20px ${barColor}60` : "none",
                }}
              >
                {/* Top highlight */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/25 to-transparent" />

                {/* Shine effect on hover */}
                <motion.div
                  initial={{ x: "-100%", opacity: 0 }}
                  animate={isHovered ? { x: "200%", opacity: 1 } : { x: "-100%", opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
                />
              </motion.div>
            </div>

            {/* Bottom accent line on hover */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: isHovered ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-0 left-3 right-3 sm:left-4 sm:right-4 h-0.5 rounded-full origin-left"
              style={{ backgroundColor: barColor }}
            />
          </motion.div>
        );
      })}
    </motion.div>
  );
};

// ============================================
// STAT CARD - Bonus Apple-style Component
// ============================================

interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
}

export const StatCard = ({ label, value, change, icon }: StatCardProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="glass-strong rounded-3xl p-6 relative overflow-hidden group"
    >
      {/* Background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {label}
          </span>
          {icon && (
            <motion.div
              whileHover={{ rotate: 10, scale: 1.1 }}
              className="w-10 h-10 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground"
            >
              {icon}
            </motion.div>
          )}
        </div>

        <div className="flex items-end gap-3">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
            className="text-4xl font-bold tracking-tight"
          >
            {value}
          </motion.span>

          {change !== undefined && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.4 }}
              className={`
                flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full mb-1
                ${
                  change >= 0
                    ? "text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30"
                    : "text-rose-600 bg-rose-100 dark:text-rose-400 dark:bg-rose-900/30"
                }
              `}
            >
              <svg
                className={`w-3 h-3 ${change < 0 ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
              {Math.abs(change)}%
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};