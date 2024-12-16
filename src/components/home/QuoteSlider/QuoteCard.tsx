import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

interface QuoteCardProps {
  text: string;
  author: string;
  index: number;
}

export function QuoteCard({ text, author, index }: QuoteCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.1 }}
      className="relative p-6 bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-xl backdrop-blur-lg"
    >
      <div className="absolute -top-4 -left-4">
        <div className="p-3 bg-blue-600 rounded-lg shadow-lg">
          <Quote className="h-6 w-6 text-white" />
        </div>
      </div>
      
      <div className="mt-4">
        <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed">
          {text}
        </p>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 font-medium">
          — {author}
        </p>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-b-xl" />
    </motion.div>
  );
}
