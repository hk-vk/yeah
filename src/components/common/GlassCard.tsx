import React from 'react';
import { cn } from '../../utils/cn';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '' }) => {
  return (
    <div 
      className={`
        relative rounded-xl 
        bg-white/90 dark:bg-gray-800/80 
        backdrop-blur-lg shadow-lg 
        border border-gray-100 dark:border-gray-700/20
        text-gray-900 dark:text-white
        focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-50 
        motion-safe:transition-all duration-300
        ${className}
      `}
    >
      {children}
    </div>
  );
};
