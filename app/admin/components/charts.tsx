"use client";

import { motion } from "framer-motion";

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
  if (total === 0) return <div className="text-gray-500 text-center py-10">No data available</div>;

  let currentAngle = 0;
  const gradientParts = data.map(item => {
    const percentage = (item.count / total) * 100;
    const start = currentAngle;
    const end = currentAngle + percentage;
    currentAngle = end;
    return `${item.color} ${start}% ${end}%`;
  });

  const gradientString = `conic-gradient(${gradientParts.join(', ')})`;

  return (
    <div className="flex flex-col md:flex-row items-center gap-8 justify-center">
      {/* The Chart */}
      <div className="relative w-48 h-48 rounded-full shadow-xl" style={{ background: gradientString }}>
        {/* Inner Circle to make it a Donut */}
        <div className="absolute inset-4 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
          <div className="text-center">
            <span className="text-3xl font-bold">{total}</span>
            <p className="text-xs text-gray-500 uppercase">Responses</p>
          </div>
        </div>
      </div>

      {/* The Legend */}
      <div className="space-y-3 min-w-[200px]">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between group">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">{item.count}</span>
              <span className="text-xs text-gray-400 w-8 text-right">{((item.count / total) * 100).toFixed(0)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
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

  return (
    <div className="flex items-end justify-between h-48 gap-3 pt-6">
      {ratings.map(rating => {
        const item = data.find(d => d._id === rating);
        const count = item?.count || 0;
        const percentage = total > 0 ? (count / total) * 100 : 0;
        const heightPercentage = (count / maxCount) * 100;
        const emojiItem = emojiMap.find(e => e.value === rating);

        return (
          <div key={rating} className="flex-1 flex flex-col items-center group">
            {/* Tooltip */}
            <div className="mb-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-black text-white px-2 py-1 rounded">
              {count} votes ({percentage.toFixed(1)}%)
            </div>
            
            {/* Bar Container */}
            <div className="w-full bg-gray-100 dark:bg-gray-700/50 rounded-t-lg relative flex-1 flex items-end overflow-hidden">
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: `${heightPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`w-full rounded-t-lg flex items-start justify-center pt-2 ${
                  rating >= 4 ? 'bg-gradient-to-t from-green-500 to-green-400' :
                  rating === 3 ? 'bg-gradient-to-t from-yellow-500 to-yellow-400' :
                  'bg-gradient-to-t from-red-500 to-red-400'
                }`}
              >
                {count > 0 && <span className="text-white text-xs font-bold drop-shadow-md">{count}</span>}
              </motion.div>
            </div>
            
            {/* Label */}
            <div className="text-center mt-3">
              <div className="text-xl mb-1 filter grayscale group-hover:grayscale-0 transition-all">{emojiItem?.emoji}</div>
              <div className="text-xs font-bold text-gray-500">{rating}</div>
            </div>
          </div>
        );
      })}
    </div>
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
  return (
    <div className="space-y-4">
      {data.map((item, idx) => {
        const percentage = total > 0 ? (item.count / total) * 100 : 0;
        const widthPercentage = (item.count / maxVal) * 100;
        const color = colorMap ? (colorMap.find((c) => c.value === item.value)?.color || "#CBD5E1") : "#3B82F6";

        return (
          <div key={idx} className="relative">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">{item.label}</span>
              <span className="text-gray-500">{item.count} ({percentage.toFixed(0)}%)</span>
            </div>
            <div className="h-4 w-full bg-gray-100 dark:bg-gray-700/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${widthPercentage}%` }}
                transition={{ duration: 0.8, delay: idx * 0.1 }}
                className="h-full rounded-full"
                style={{ backgroundColor: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
