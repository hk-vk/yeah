import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronUp } from 'lucide-react';
import clsx from 'clsx';

interface ExpandButtonProps {
  onClick?: () => void;
  expanded?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ExpandButton: React.FC<ExpandButtonProps> = ({
  onClick,
  expanded = false,
  className = '',
  size = 'md',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };
  
  return (
    <motion.button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={{ 
        rotate: expanded ? 180 : 0,
        backgroundColor: isHovered 
          ? 'var(--hover-bg, rgba(59, 130, 246, 0.2))' 
          : 'var(--bg, rgba(59, 130, 246, 0.1))'
      }}
      className={clsx(
        sizeClasses[size],
        'rounded-full flex items-center justify-center',
        'transition-shadow duration-200',
        'border border-blue-200 dark:border-blue-800',
        'shadow-sm hover:shadow',
        className
      )}
      style={{
        '--bg': 'rgba(59, 130, 246, 0.1)',
        '--hover-bg': 'rgba(59, 130, 246, 0.2)',
        '--dark-bg': 'rgba(30, 64, 175, 0.2)',
        '--dark-hover-bg': 'rgba(30, 64, 175, 0.3)',
      } as React.CSSProperties}
    >
      <ChevronUp 
        className={clsx(
          iconSizes[size],
          'text-blue-600 dark:text-blue-400'
        )}
      />
    </motion.button>
  );
};