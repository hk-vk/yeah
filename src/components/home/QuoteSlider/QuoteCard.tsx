import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

interface QuoteCardProps {
  text: string;
  author: string;
  index: number;
}

export const QuoteCard = memo(function QuoteCard({ text, author, index }: QuoteCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ 
        duration: 0.4,
        ease: "easeOut"
      }}
      className="relative p-6 pt-14 bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-xl backdrop-blur-lg will-change-transform"
    >
      <div 
        className="absolute top-6 left-6 transform-gpu"
        style={{ willChange: 'transform' }}
      >
        <div className="p-2 sm:p-3 bg-blue-600 rounded-lg shadow-lg">
          <Quote className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
        </div>
      </div>
      
      <div className="pl-16">
        <p className="text-base sm:text-lg text-gray-800 dark:text-gray-200 leading-relaxed line-clamp-4 sm:line-clamp-none">
          {text}
        </p>
        <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
          — {author}
        </p>
      </div>
      
      <div 
        className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-b-xl"
        style={{ willChange: 'opacity' }}
      />
    </motion.div>
  );
});
