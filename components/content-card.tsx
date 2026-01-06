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
      className="glass-strong rounded-2xl overflow-hidden hover:shadow-xl transition-shadow w-full"
    >
      {/* Mobile: Stacked (picture top, text bottom) */}
      <div className="flex flex-col md:hidden">
        {/* Image Section - Full width on mobile */}
        <div className="w-full aspect-video relative">
          <img
            src={image}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        {/* Content Section - Full width on mobile */}
        <div className="w-full p-4">
          <h3 className="text-lg font-bold text-black dark:text-white mb-2">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {content}
          </p>
        </div>
      </div>

      {/* Desktop: 1/3 picture, 2/3 text */}
      <div className={`hidden md:flex ${isImageLeft ? "flex-row" : "flex-row-reverse"}`}>
        {/* Image Section - 1/3 */}
        <div className="w-1/3 min-h-[150px] relative">
          <img
            src={image}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        {/* Content Section - 2/3 */}
        <div className="w-2/3 p-6">
          <h3 className="text-xl font-bold text-black dark:text-white mb-2">
            {title}
          </h3>
          <p className="text-base text-muted-foreground leading-relaxed">
            {content}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
