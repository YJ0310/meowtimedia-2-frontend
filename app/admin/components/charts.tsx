"use client";

import { motion, AnimatePresence, useInView } from "framer-motion";
import { useRef, useState } from "react";

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
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  if (total === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-muted-foreground text-center py-16 font-medium"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
          <svg className="w-8 h-8 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        No data available
      </motion.div>
    );
  }

  // Calculate segments with gaps
  const gapAngle = 1; // degrees
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

  // Create SVG arcs for better control
  const createArc = (startAngle: number, endAngle: number, radius: number, innerRadius: number) => {
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);
    
    const x1 = 100 + radius * Math.cos(startRad);
    const y1 = 100 + radius * Math.sin(startRad);
    const x2 = 100 + radius * Math.cos(endRad);
    const y2 = 100 + radius * Math.sin(endRad);
    
    const x3 = 100 + innerRadius * Math.cos(endRad);
    const y3 = 100 + innerRadius * Math.sin(endRad);
    const x4 = 100 + innerRadius * Math.cos(startRad);
    const y4 = 100 + innerRadius * Math.sin(startRad);
    
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col lg:flex-row items-center gap-10 justify-center"
    >
      {/* The Chart */}
      <div className="relative">
        {/* Outer glow */}
        <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20 rounded-full blur-2xl opacity-60" />
        
        {/* Main chart */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 1 } : {}}
          transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
          className="relative w-56 h-56"
        >
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
            {/* Background circle */}
            <circle
              cx="100"
              cy="100"
              r="85"
              fill="none"
              stroke="currentColor"
              strokeWidth="30"
              className="text-muted/30"
            />
            
            {/* Animated segments */}
            {segments.map((segment, idx) => {
              const isHovered = hoveredIndex === idx;
              const outerRadius = isHovered ? 90 : 85;
              const innerRadius = isHovered ? 52 : 55;
              
              return (
                <motion.path
                  key={idx}
                  d={createArc(segment.startAngle, segment.endAngle, outerRadius, innerRadius)}
                  fill={segment.color}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { 
                    opacity: 1, 
                    scale: 1,
                    filter: isHovered ? "brightness(1.1)" : "brightness(1)"
                  } : {}}
                  transition={{ 
                    type: "spring",
                    stiffness: 100,
                    damping: 20,
                    delay: 0.3 + idx * 0.1 
                  }}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="transition-all duration-300 cursor-pointer"
                  style={{
                    filter: `drop-shadow(0 4px 12px ${segment.color}40)`,
                  }}
                />
              );
            })}
          </svg>
          
          {/* Inner Circle - Glassmorphism */}
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            transition={{ type: "spring", stiffness: 150, damping: 20, delay: 0.5 }}
            className="absolute inset-[22%] rounded-full flex items-center justify-center glass-strong"
          >
            <div className="text-center">
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.7, duration: 0.4 }}
                className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70"
              >
                {total}
              </motion.span>
              <motion.p
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 0.8, duration: 0.4 }}
                className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mt-1"
              >
                Responses
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* The Legend */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="space-y-3 min-w-[220px]"
      >
        {data.map((item, idx) => {
          const isHovered = hoveredIndex === idx;
          const percentage = ((item.count / total) * 100).toFixed(1);
          
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: 20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.5 + idx * 0.08, duration: 0.4 }}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`
                flex items-center justify-between p-3 rounded-2xl transition-all duration-300 cursor-pointer
                ${isHovered ? 'bg-muted/80 scale-[1.02] shadow-lg' : 'hover:bg-muted/40'}
              `}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ scale: isHovered ? 1.2 : 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="w-3 h-3 rounded-full shadow-sm"
                  style={{ 
                    backgroundColor: item.color,
                    boxShadow: isHovered ? `0 0 12px ${item.color}80` : 'none'
                  }}
                />
                <span className="text-sm font-medium text-foreground/90">{item.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold tabular-nums">{item.count}</span>
                <span className={`
                  text-xs font-medium tabular-nums px-2 py-0.5 rounded-full transition-colors duration-300
                  ${isHovered ? 'bg-foreground/10 text-foreground' : 'text-muted-foreground'}
                `}>
                  {percentage}%
                </span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
};

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
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const getBarGradient = (rating: number) => {
    if (rating >= 4) return "from-emerald-400 via-emerald-500 to-teal-600";
    if (rating === 3) return "from-amber-400 via-amber-500 to-orange-500";
    return "from-rose-400 via-rose-500 to-red-600";
  };

  const getBarShadowColor = (rating: number) => {
    if (rating >= 4) return "rgba(16, 185, 129, 0.4)";
    if (rating === 3) return "rgba(245, 158, 11, 0.4)";
    return "rgba(244, 63, 94, 0.4)";
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      {/* Background gradient glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-muted/20 to-transparent rounded-3xl -z-10" />
      
      <div className="flex items-end justify-between h-64 gap-4 pt-8 px-4">
        {ratings.map((rating, idx) => {
          const item = data.find(d => d._id === rating);
          const count = item?.count || 0;
          const percentage = total > 0 ? (count / total) * 100 : 0;
          const heightPercentage = (count / maxCount) * 100;
          const emojiItem = emojiMap.find(e => e.value === rating);
          const isHovered = hoveredRating === rating;

          return (
            <motion.div
              key={rating}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 + idx * 0.08, duration: 0.5 }}
              className="flex-1 flex flex-col items-center"
              onMouseEnter={() => setHoveredRating(rating)}
              onMouseLeave={() => setHoveredRating(null)}
            >
              {/* Floating Tooltip */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="absolute -top-2 glass-strong px-4 py-2 rounded-2xl shadow-xl z-10"
                  >
                    <div className="text-center">
                      <span className="text-lg font-bold">{count}</span>
                      <span className="text-xs text-muted-foreground ml-1">votes</span>
                    </div>
                    <div className="text-xs text-muted-foreground text-center">
                      {percentage.toFixed(1)}% of total
                    </div>
                    {/* Tooltip arrow */}
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-white/95 dark:bg-black/85 border-r border-b border-white/30 dark:border-white/10" />
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Bar Container */}
              <div className="w-full flex-1 flex items-end relative group">
                {/* Background track */}
                <div className="absolute inset-0 bg-muted/30 rounded-2xl" />
                
                {/* Animated Bar */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={isInView ? { 
                    height: `${heightPercentage}%`,
                    scale: isHovered ? 1.05 : 1,
                  } : {}}
                  transition={{ 
                    height: { 
                      type: "spring", 
                      stiffness: 50, 
                      damping: 15, 
                      delay: 0.3 + idx * 0.1 
                    },
                    scale: { type: "spring", stiffness: 300, damping: 20 }
                  }}
                  className={`
                    w-full rounded-2xl relative overflow-hidden
                    bg-gradient-to-t ${getBarGradient(rating)}
                  `}
                  style={{
                    boxShadow: isHovered 
                      ? `0 8px 32px ${getBarShadowColor(rating)}, 0 0 0 2px rgba(255,255,255,0.1)` 
                      : `0 4px 16px ${getBarShadowColor(rating)}`,
                    minHeight: count > 0 ? '24px' : '0',
                  }}
                >
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  
                  {/* Count badge */}
                  <AnimatePresence>
                    {count > 0 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 + idx * 0.1, type: "spring", stiffness: 200 }}
                        className="absolute top-2 left-1/2 -translate-x-1/2"
                      >
                        <span className="text-white text-sm font-bold drop-shadow-lg">
                          {count}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
              
              {/* Label */}
              <motion.div
                animate={{ scale: isHovered ? 1.1 : 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="text-center mt-4 space-y-1"
              >
                <motion.div
                  animate={{ 
                    scale: isHovered ? 1.3 : 1,
                    filter: isHovered ? 'grayscale(0)' : 'grayscale(0.5)'
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="text-2xl transition-all duration-300"
                >
                  {emojiItem?.emoji}
                </motion.div>
                <div className={`
                  text-sm font-bold transition-colors duration-300
                  ${isHovered ? 'text-foreground' : 'text-muted-foreground'}
                `}>
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
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const defaultColors = [
    "#a8bedf", // meow-primary
    "#c7d5e8", // meow-secondary
    "#efe4d4", // meow-accent
    "#d8c9ba", // meow-neutral
    "#93c5fd", // blue-300
    "#c4b5fd", // violet-300
    "#fda4af", // rose-300
    "#fdba74", // orange-300
  ];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.5 }}
      className="space-y-5"
    >
      {data.map((item, idx) => {
        const percentage = total > 0 ? (item.count / total) * 100 : 0;
        const widthPercentage = (item.count / maxVal) * 100;
        const color = colorMap 
          ? (colorMap.find((c) => c.value === item.value)?.color || defaultColors[idx % defaultColors.length]) 
          : defaultColors[idx % defaultColors.length];
        const isHovered = hoveredIndex === idx;

        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.1 + idx * 0.08, duration: 0.4 }}
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
            className={`
              relative p-4 rounded-2xl transition-all duration-300 cursor-pointer
              ${isHovered ? 'bg-muted/60 scale-[1.01]' : 'hover:bg-muted/30'}
            `}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ scale: isHovered ? 1.2 : 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ 
                    backgroundColor: color,
                    boxShadow: isHovered ? `0 0 12px ${color}80` : 'none'
                  }}
                />
                <span className="font-semibold text-foreground/90">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <motion.span
                  animate={{ scale: isHovered ? 1.1 : 1 }}
                  className="text-sm font-bold tabular-nums"
                >
                  {item.count}
                </motion.span>
                <span className={`
                  text-xs font-medium tabular-nums px-2.5 py-1 rounded-full transition-all duration-300
                  ${isHovered ? 'bg-foreground/10 text-foreground' : 'bg-muted text-muted-foreground'}
                `}>
                  {percentage.toFixed(1)}%
                </span>
              </div>
            </div>
            
            {/* Bar Track */}
            <div className="h-3 w-full bg-muted/50 rounded-full overflow-hidden relative">
              {/* Animated Bar */}
              <motion.div
                initial={{ width: 0 }}
                animate={isInView ? { 
                  width: `${widthPercentage}%`,
                } : {}}
                transition={{ 
                  type: "spring", 
                  stiffness: 50, 
                  damping: 15, 
                  delay: 0.3 + idx * 0.1 
                }}
                className="h-full rounded-full relative overflow-hidden"
                style={{ 
                  backgroundColor: color,
                  boxShadow: isHovered ? `0 0 16px ${color}60` : 'none',
                }}
              >
                {/* Shine effect */}
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={isHovered ? { x: "200%" } : { x: "-100%" }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                />
                
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
              </motion.div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

// Bonus: Stat Card Component for Apple-style statistics display
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
      {/* Background gradient */}
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
                ${change >= 0 
                  ? 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30' 
                  : 'text-rose-600 bg-rose-100 dark:text-rose-400 dark:bg-rose-900/30'
                }
              `}
            >
              <svg 
                className={`w-3 h-3 ${change < 0 ? 'rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              {Math.abs(change)}%
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};