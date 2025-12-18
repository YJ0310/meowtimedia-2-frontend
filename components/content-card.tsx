"use client";

import { motion } from "framer-motion";

interface ContentCardProps {
  title: string;
  content: string;
  image: string;
  imagePosition?: "left" | "right";
  index?: number;
}

export default function ContentCard({
  title,
  content,
  image,
  imagePosition = "left",
  index = 0,
}: ContentCardProps) {
  const isImageLeft = imagePosition === "left";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="glass-strong rounded-2xl overflow-hidden hover:shadow-xl transition-shadow"
    >
      <div className={`flex ${isImageLeft ? "flex-row" : "flex-row-reverse"}`}>
        {/* Image Section - 1/4 */}
        <div className="w-1/4 min-h-[120px] relative">
          <img
            src={image}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        {/* Content Section - 3/4 */}
        <div className="w-3/4 p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-bold text-black dark:text-white mb-2">
            {title}
          </h3>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            {content}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
