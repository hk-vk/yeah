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
        bg-white/80 dark:bg-gray-800/80 
        backdrop-blur-lg shadow-lg 
        border border-white/20 dark:border-gray-700/20
        focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-50 
        motion-safe:transition-all duration-300
        ${className}
      `}
    >
      {children}
    </div>
  );
};
