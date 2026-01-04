"use client";

import { motion, AnimatePresence, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";

// ============================================
// THEME COLORS - Meowtimap Palette
// ============================================

const THEME_COLORS = {
  primary: "#a8bedf",
  secondary: "#c7d5e8",
  accent: "#efe4d4",
  neutral: "#d8c9ba",
  chart: [
    "#a8bedf", // primary blue
    "#c7d5e8", // secondary blue
    "#efe4d4", // cream
    "#d8c9ba", // tan
    "#b8d4e3", // sky blue
    "#e8d5c7", // warm beige
    "#c4d4b8", // sage
    "#dfc7d8", // dusty rose
    "#d4dfe8", // ice blue
    "#e3d4b8", // sand
  ],
};

// ============================================
// DONUT CHART - Soft Glassmorphism Style
// ============================================

interface ChartData {
  label: string;
  count: number;
  color?: string;
}

interface DonutChartProps {
  data: ChartData[];
  total: number;
  title?: string;
}

export const DonutChart = ({ data, total, title }: DonutChartProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isAnimated, setIsAnimated] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => setIsAnimated(true), 150);
      return () => clearTimeout(timer);
    }
  }, [isInView]);

  if (total === 0 || !data || data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-3xl p-8 text-center"
      >
        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-meow-primary/20 to-meow-accent/20 flex items-center justify-center">
          <svg className="w-12 h-12 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
          </svg>
        </div>
        <p className="text-muted-foreground font-medium">No data available</p>
      </motion.div>
    );
  }

  // Calculate segments
  const gapAngle = 3;
  const totalGapAngle = gapAngle * data.length;
  const availableAngle = 360 - totalGapAngle;

  let currentAngle = -90; // Start from top
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
      color: item.color || THEME_COLORS.chart[index % THEME_COLORS.chart.length],
    };
  });

  const createArc = (
    startAngle: number,
    endAngle: number,
    outerRadius: number,
    innerRadius: number
  ) => {
    if (endAngle - startAngle < 0.5) return "";

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

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
      transition={{ duration: 0.6 }}
      className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 justify-center"
    >
      {/* Chart */}
      <div className="relative">
        {/* Soft glow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 0.6, scale: 1 } : {}}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="absolute -inset-12 bg-gradient-to-br from-meow-primary/30 via-meow-secondary/20 to-meow-accent/30 rounded-full blur-3xl pointer-events-none"
        />

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 1 } : {}}
          transition={{ type: "spring", stiffness: 80, damping: 20 }}
          className="relative w-52 h-52 sm:w-64 sm:h-64"
        >
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {/* Track */}
            <circle
              cx="100"
              cy="100"
              r="72"
              fill="none"
              stroke="currentColor"
              strokeWidth="24"
              className="text-muted/15"
            />

            {/* Segments */}
            {segments.map((segment, idx) => {
              const isHovered = hoveredIndex === idx;
              const outerRadius = isHovered ? 77 : 72;
              const innerRadius = isHovered ? 46 : 50;
              const path = createArc(segment.startAngle, segment.endAngle, outerRadius, innerRadius);

              if (!path) return null;

              return (
                <motion.path
                  key={idx}
                  d={path}
                  fill={segment.color}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isAnimated ? { opacity: 1, scale: 1 } : {}}
                  transition={{
                    type: "spring",
                    stiffness: 60,
                    damping: 18,
                    delay: 0.15 + idx * 0.1,
                  }}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="cursor-pointer origin-center transition-all duration-300"
                  style={{
                    filter: isHovered
                      ? `drop-shadow(0 4px 20px ${segment.color}90) brightness(1.08)`
                      : `drop-shadow(0 2px 6px ${segment.color}40)`,
                    transformOrigin: "100px 100px",
                  }}
                />
              );
            })}
          </svg>

          {/* Center */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            transition={{ type: "spring", stiffness: 120, damping: 18, delay: 0.5 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full glass-strong flex items-center justify-center">
              <div className="text-center">
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.7 }}
                  className="text-3xl sm:text-4xl font-bold text-gradient"
                >
                  {total}
                </motion.span>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : {}}
                  transition={{ delay: 0.8 }}
                  className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mt-1"
                >
                  {title || "Total"}
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
        transition={{ delay: 0.4, duration: 0.5 }}
        className="w-full max-w-sm space-y-2"
      >
        {segments.map((item, idx) => {
          const isHovered = hoveredIndex === idx;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: 20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.5 + idx * 0.05 }}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`
                flex items-center justify-between p-3.5 rounded-2xl transition-all duration-300 cursor-pointer
                ${isHovered ? "glass-strong scale-[1.02]" : "hover:bg-muted/30"}
              `}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{
                    scale: isHovered ? 1.3 : 1,
                    boxShadow: isHovered ? `0 0 20px ${item.color}` : "none",
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="w-3.5 h-3.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className={`text-sm font-medium transition-colors ${isHovered ? "text-foreground" : "text-foreground/70"}`}>
                  {item.label}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <motion.span
                  animate={{ scale: isHovered ? 1.1 : 1 }}
                  className="text-sm font-bold tabular-nums"
                >
                  {item.count}
                </motion.span>
                <span
                  className="text-xs font-semibold tabular-nums px-2.5 py-1 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: isHovered ? item.color : "var(--muted)",
                    color: isHovered ? "#ffffff" : "var(--muted-foreground)",
                  }}
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
// RATING HISTOGRAM - Soft Vertical Bars
// ============================================

interface RatingData {
  _id: number;
  count: number;
}

interface EmojiConfig {
  value: number;
  emoji: string;
  label: string;
  color: string;
}

interface RatingHistogramProps {
  data: RatingData[];
  total: number;
  emojiConfig?: EmojiConfig[];
  title?: string;
}

const DEFAULT_EMOJI_CONFIG: EmojiConfig[] = [
  { value: 1, emoji: "😢", label: "Poor", color: "#e8b4b4" },
  { value: 2, emoji: "😕", label: "Fair", color: "#e8c9b4" },
  { value: 3, emoji: "😐", label: "Okay", color: "#efe4d4" },
  { value: 4, emoji: "😊", label: "Good", color: "#c7d5e8" },
  { value: 5, emoji: "😍", label: "Great", color: "#a8bedf" },
];

export const RatingHistogram = ({
  data,
  total,
  emojiConfig = DEFAULT_EMOJI_CONFIG,
  title,
}: RatingHistogramProps) => {
  const ratings = [1, 2, 3, 4, 5];
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });

  // Calculate average
  const average = total > 0
    ? data.reduce((sum, d) => sum + d._id * d.count, 0) / total
    : 0;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      {/* Average Badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.3 }}
        className="absolute -top-2 right-0 glass-strong px-4 py-2 rounded-2xl z-10"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Average</span>
          <span className="text-lg font-bold text-gradient">{average.toFixed(1)}</span>
          <span className="text-xl">{emojiConfig[Math.round(average) - 1]?.emoji || "⭐"}</span>
        </div>
      </motion.div>

      {/* Bars */}
      <div className="flex items-end justify-between h-56 sm:h-64 gap-3 sm:gap-5 pt-16 pb-4 px-2">
        {ratings.map((rating, idx) => {
          const item = data.find((d) => d._id === rating);
          const count = item?.count || 0;
          const percentage = total > 0 ? (count / total) * 100 : 0;
          const heightPercentage = (count / maxCount) * 100;
          const config = emojiConfig.find((e) => e.value === rating) || DEFAULT_EMOJI_CONFIG[idx];
          const isHovered = hoveredRating === rating;

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
                {isHovered && count > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="absolute -top-16 z-20 glass-strong px-4 py-2.5 rounded-2xl shadow-xl"
                  >
                    <div className="text-center">
                      <span className="text-lg font-bold">{count}</span>
                      <span className="text-xs text-muted-foreground ml-1">responses</span>
                    </div>
                    <div className="text-xs text-muted-foreground text-center mt-0.5">
                      {percentage.toFixed(1)}% of total
                    </div>
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 glass-strong" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bar Container */}
              <div className="w-full flex-1 flex items-end relative">
                {/* Track */}
                <div className="absolute inset-0 bg-muted/20 rounded-2xl" />

                {/* Bar */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={isInView ? { height: count > 0 ? `${Math.max(heightPercentage, 8)}%` : "0%" } : {}}
                  transition={{
                    type: "spring",
                    stiffness: 50,
                    damping: 14,
                    delay: 0.25 + idx * 0.08,
                  }}
                  className="w-full rounded-2xl relative overflow-hidden transition-all duration-300"
                  style={{
                    backgroundColor: config.color,
                    boxShadow: isHovered
                      ? `0 8px 30px ${config.color}80, inset 0 1px 0 rgba(255,255,255,0.3)`
                      : `0 4px 12px ${config.color}40`,
                    transform: isHovered ? "scaleX(1.06)" : "scaleX(1)",
                  }}
                >
                  {/* Highlight */}
                  <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/30 to-transparent rounded-t-2xl" />

                  {/* Count inside bar */}
                  {count > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={isInView ? { opacity: 1 } : {}}
                      transition={{ delay: 0.6 + idx * 0.08 }}
                      className="absolute top-3 left-0 right-0 text-center"
                    >
                      <span className="text-white text-sm font-bold drop-shadow-md">
                        {count}
                      </span>
                    </motion.div>
                  )}

                  {/* Shimmer on hover */}
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={isHovered ? { x: "200%" } : { x: "-100%" }}
                    transition={{ duration: 0.7, ease: "easeInOut" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
                  />
                </motion.div>
              </div>

              {/* Label */}
              <motion.div
                animate={{
                  scale: isHovered ? 1.08 : 1,
                  y: isHovered ? -4 : 0,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="text-center mt-4 space-y-1"
              >
                <motion.div
                  animate={{
                    scale: isHovered ? 1.3 : 1,
                    filter: isHovered ? "grayscale(0) saturate(1.2)" : "grayscale(0.3) saturate(0.8)",
                  }}
                  className="text-2xl sm:text-3xl transition-all duration-300"
                >
                  {config.emoji}
                </motion.div>
                <div
                  className={`text-xs font-semibold transition-colors duration-300 ${
                    isHovered ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {config.label}
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
// HORIZONTAL BAR CHART - Soft Progress Style
// ============================================

interface BarData {
  label: string;
  count: number;
  value: string;
  color?: string;
}

interface HorizontalBarChartProps {
  data: BarData[];
  total: number;
  title?: string;
}

export const HorizontalBarChart = ({ data, total, title }: HorizontalBarChartProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });

  const maxVal = Math.max(...data.map((d) => d.count), 1);

  if (!data || data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-3xl p-8 text-center"
      >
        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-meow-primary/20 to-meow-accent/20 flex items-center justify-center">
          <svg className="w-12 h-12 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p className="text-muted-foreground font-medium">No data available</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.5 }}
      className="space-y-3"
    >
      {data.map((item, idx) => {
        const percentage = total > 0 ? (item.count / total) * 100 : 0;
        const widthPercentage = Math.min((item.count / maxVal) * 100, 100);
        const isHovered = hoveredIndex === idx;
        const barColor = item.color || THEME_COLORS.chart[idx % THEME_COLORS.chart.length];

        return (
          <motion.div
            key={`${item.value}-${idx}`}
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{
              delay: 0.05 * idx,
              duration: 0.4,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
            className={`
              relative p-4 sm:p-5 rounded-2xl sm:rounded-3xl transition-all duration-300 cursor-pointer
              ${isHovered ? "glass-strong scale-[1.01]" : "hover:bg-muted/20"}
            `}
          >
            {/* Label Row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{
                    scale: isHovered ? 1.4 : 1,
                    boxShadow: isHovered ? `0 0 16px ${barColor}` : "none",
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: barColor }}
                />
                <span className={`text-sm font-medium transition-colors ${isHovered ? "text-foreground" : "text-foreground/70"}`}>
                  {item.label}
                </span>
              </div>

              <div className="flex items-center gap-2.5 flex-shrink-0">
                <motion.span
                  animate={{ scale: isHovered ? 1.1 : 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="text-sm font-bold tabular-nums"
                >
                  {item.count}
                </motion.span>
                <span
                  className="text-xs font-semibold tabular-nums px-2.5 py-1 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: isHovered ? barColor : "var(--muted)",
                    color: isHovered ? "#ffffff" : "var(--muted-foreground)",
                  }}
                >
                  {percentage.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Progress Track */}
            <div className="relative h-3 w-full bg-muted/30 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={isInView ? { width: `${widthPercentage}%` } : { width: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 45,
                  damping: 14,
                  delay: 0.15 + idx * 0.06,
                }}
                className="h-full rounded-full relative overflow-hidden"
                style={{
                  backgroundColor: barColor,
                  boxShadow: isHovered ? `0 0 24px ${barColor}60` : "none",
                }}
              >
                {/* Highlight */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />

                {/* Shimmer */}
                <motion.div
                  initial={{ x: "-100%", opacity: 0 }}
                  animate={isHovered ? { x: "200%", opacity: 1 } : { x: "-100%", opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12"
                />
              </motion.div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

// ============================================
// ISSUES BREAKDOWN - Multi-Select Display
// ============================================

interface IssueData {
  value: string;
  label: string;
  count: number;
  icon?: string;
}

interface IssuesBreakdownProps {
  data: IssueData[];
  total: number;
}

const ISSUE_ICONS: Record<string, string> = {
  none: "✨",
  loading: "⏳",
  button: "🔘",
  navigation: "🧭",
  display: "📱",
  other: "💭",
};

export const IssuesBreakdown = ({ data, total }: IssuesBreakdownProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });

  const sortedData = [...data].sort((a, b) => b.count - a.count);
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 sm:grid-cols-2 gap-3"
    >
      {sortedData.map((item, idx) => {
        const percentage = total > 0 ? (item.count / total) * 100 : 0;
        const isHovered = hoveredIndex === idx;
        const isNone = item.value === "none";
        const baseColor = isNone ? THEME_COLORS.primary : THEME_COLORS.accent;

        return (
          <motion.div
            key={item.value}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.08 * idx, duration: 0.4 }}
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
            className={`
              relative p-4 rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden
              ${isHovered ? "glass-strong scale-[1.02]" : "bg-muted/20 hover:bg-muted/30"}
            `}
          >
            {/* Background fill */}
            <motion.div
              initial={{ width: 0 }}
              animate={isInView ? { width: `${(item.count / maxCount) * 100}%` } : {}}
              transition={{ delay: 0.2 + idx * 0.06, duration: 0.6, ease: "easeOut" }}
              className="absolute inset-y-0 left-0 rounded-2xl opacity-20"
              style={{ backgroundColor: baseColor }}
            />

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.span
                  animate={{ scale: isHovered ? 1.2 : 1 }}
                  className="text-xl"
                >
                  {item.icon || ISSUE_ICONS[item.value] || "📋"}
                </motion.span>
                <span className={`text-sm font-medium ${isHovered ? "text-foreground" : "text-foreground/70"}`}>
                  {item.label}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tabular-nums">{item.count}</span>
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: isHovered ? baseColor : "var(--muted)",
                    color: isHovered ? "#ffffff" : "var(--muted-foreground)",
                  }}
                >
                  {percentage.toFixed(0)}%
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

// ============================================
// STAT CARD - Meowtimap Style
// ============================================

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: number;
  color?: string;
}

export const StatCard = ({ label, value, subtitle, icon, trend, color }: StatCardProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const cardColor = color || THEME_COLORS.primary;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ type: "spring", stiffness: 80, damping: 18 }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="glass-strong rounded-3xl p-6 relative overflow-hidden group"
    >
      {/* Gradient accent */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 0.1 } : {}}
        className="absolute inset-0 bg-gradient-to-br"
        style={{
          backgroundImage: `linear-gradient(135deg, ${cardColor}30 0%, transparent 60%)`,
        }}
      />

      {/* Hover glow */}
      <div
        className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 blur-xl"
        style={{ backgroundColor: cardColor }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            {label}
          </span>
          {icon && (
            <motion.div
              whileHover={{ rotate: 10, scale: 1.1 }}
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: `${cardColor}20` }}
            >
              {icon}
            </motion.div>
          )}
        </div>

        <div className="flex items-end gap-3">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2, type: "spring", stiffness: 80 }}
            className="text-4xl font-bold tracking-tight text-gradient"
          >
            {value}
          </motion.span>

          {trend !== undefined && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.4 }}
              className={`
                flex items-center gap-1 text-sm font-semibold px-2.5 py-1 rounded-full mb-1
                ${trend >= 0 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"}
              `}
            >
              <svg className={`w-3 h-3 ${trend < 0 ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              {Math.abs(trend)}%
            </motion.div>
          )}
        </div>

        {subtitle && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.5 }}
            className="text-sm text-muted-foreground mt-2"
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
};

// ============================================
// FEEDBACK TIMELINE - Recent Responses
// ============================================

interface FeedbackItem {
  _id: string;
  firstImpression: string;
  recommendation: number;
  additionalFeedback?: string;
  createdAt: string;
}

interface FeedbackTimelineProps {
  data: FeedbackItem[];
  maxItems?: number;
}

const IMPRESSION_LABELS: Record<string, { label: string; emoji: string }> = {
  learning: { label: "Learning", emoji: "📚" },
  games: { label: "Games", emoji: "🎮" },
  "not-sure": { label: "Exploring", emoji: "🔍" },
  other: { label: "Other", emoji: "💭" },
};

export const FeedbackTimeline = ({ data, maxItems = 5 }: FeedbackTimelineProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });

  const displayData = data.slice(0, maxItems);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.5 }}
      className="space-y-3"
    >
      {displayData.map((item, idx) => {
        const impression = IMPRESSION_LABELS[item.firstImpression] || IMPRESSION_LABELS.other;
        const date = new Date(item.createdAt);
        const timeAgo = getTimeAgo(date);

        return (
          <motion.div
            key={item._id}
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.1 * idx, duration: 0.4 }}
            className="glass p-4 rounded-2xl hover:glass-strong transition-all duration-300"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{impression.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{impression.label}</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-xs ${i < item.recommendation ? "text-amber-400" : "text-muted/40"}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  {item.additionalFeedback && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      "{item.additionalFeedback}"
                    </p>
                  )}
                </div>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{timeAgo}</span>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

// Helper function
function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  const intervals = [
    { label: "y", seconds: 31536000 },
    { label: "mo", seconds: 2592000 },
    { label: "d", seconds: 86400 },
    { label: "h", seconds: 3600 },
    { label: "m", seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) return `${count}${interval.label} ago`;
  }
  return "Just now";
}