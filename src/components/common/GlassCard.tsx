import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function GlassCard({ children, className, delay = 0 }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6,
        delay,
        type: "spring",
        stiffness: 100 
      }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className={cn(
        'relative overflow-hidden',
        'bg-white/80 dark:bg-gray-800/80',
        'backdrop-blur-lg backdrop-filter',
        'border border-white/20 dark:border-gray-700/20',
        'shadow-xl shadow-blue-500/5',
        'rounded-xl',
        'transition-all duration-300',
        'hover:shadow-2xl hover:shadow-blue-500/10',
        'before:absolute before:inset-0',
        'before:bg-gradient-to-r before:from-blue-500/10 before:to-purple-500/10',
        'before:opacity-0 hover:before:opacity-100',
        'before:transition-opacity before:duration-300',
        className
      )}
    >
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}
