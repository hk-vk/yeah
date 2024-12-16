import React from 'react';
import { motion } from 'framer-motion';
import { Newspaper, FileText, File, PenTool } from 'lucide-react';
import { ANIMATION_CONFIG } from './constants';

interface NewsItemProps {
  index: number;
}

const icons = [Newspaper, FileText, File, PenTool];

export function NewsItem({ index }: NewsItemProps) {
  // Enhanced random values for more varied animations
  const randomRotation = Math.random() * 720 - 360; // Wider rotation range
  const randomDuration = ANIMATION_CONFIG.minDuration + Math.random() * (ANIMATION_CONFIG.maxDuration - ANIMATION_CONFIG.minDuration);
  const randomDelay = Math.random() * ANIMATION_CONFIG.baseDelay;
  const randomX = Math.random() * 200 - 100; // Wider horizontal movement
  const randomScale = 0.6 + Math.random() * 0.8; // More varied scaling
  const randomIcon = icons[Math.floor(Math.random() * icons.length)];
  const Icon = randomIcon;

  // Random path for more interesting movement
  const path = {
    start: { x: randomX, y: -100, opacity: 0 },
    middle1: { x: randomX * -0.5, y: '25vh', opacity: 0.7 },
    middle2: { x: randomX * 0.5, y: '50vh', opacity: 0.5 },
    end: { x: randomX * -0.3, y: '120vh', opacity: 0 }
  };

  return (
    <motion.div
      initial={path.start}
      animate={[
        path.middle1,
        path.middle2,
        path.end
      ]}
      transition={{
        duration: randomDuration,
        repeat: Infinity,
        delay: randomDelay,
        times: [0, 0.4, 0.7, 1],
        ease: "easeInOut"
      }}
      className="absolute"
      style={{
        left: `${(index * 15) % 100}%`,
        filter: 'blur(0.5px)',
      }}
    >
      <motion.div
        animate={{
          rotate: [randomRotation, randomRotation + 360],
          scale: [randomScale, randomScale * 1.2, randomScale],
        }}
        transition={{
          duration: randomDuration * 0.8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative"
      >
        {/* Main icon */}
        <motion.div
          className="text-blue-500/20 dark:text-blue-400/20"
          whileHover={{ scale: 1.2 }}
        >
          <Icon className="w-12 h-12" />
        </motion.div>

        {/* Glow effect */}
        <motion.div
          animate={{
            opacity: [0.4, 0.8, 0.4],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 bg-blue-500/10 dark:bg-blue-400/10 rounded-full blur-xl"
        />

        {/* Trail effect */}
        <motion.div
          animate={{
            opacity: [0.1, 0.3, 0.1],
            scale: [0.8, 1.1, 0.8],
            y: [0, 10, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 bg-blue-400/5 dark:bg-blue-300/5 rounded-full blur-lg -z-10"
          style={{
            transform: 'translateY(5px)',
          }}
        />
      </motion.div>
    </motion.div>
  );
}

// Add these types to your constants.ts file if not already present
/*
export const ANIMATION_CONFIG = {
  minDuration: 15,
  maxDuration: 25,
  baseDelay: 5,
} as const;
*/