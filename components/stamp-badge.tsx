'use client';

import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Stamp } from '@/lib/types';

interface StampBadgeProps {
  stamp: Stamp;
  delay?: number;
}

export default function StampBadge({ stamp, delay = 0 }: StampBadgeProps) {
  const handleHover = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 20,
      spread: 50,
      origin: { x, y },
      colors: ['#A8BEDF', '#C7D5E8', '#EFE4D4', '#D8C9BA'],
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, rotate: -180 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ 
        delay, 
        duration: 0.6, 
        type: "spring",
        stiffness: 200
      }}
      whileHover={{ scale: 1.05, rotate: 5 }}
      onMouseEnter={handleHover}
      className="glass p-4 rounded-xl cursor-pointer group"
    >
      <div className="flex items-center gap-4">
        <div className="text-4xl animate-float">{stamp.icon}</div>
        <div className="flex-1">
          <h4 className="font-semibold text-sm">{stamp.topicName}</h4>
          <p className="text-xs text-muted-foreground">{stamp.countryName}</p>
          <p className="text-xs text-primary mt-1">
            {new Date(stamp.date).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
