import React from 'react';
import { motion } from 'framer-motion';
import { Newspaper, Globe, Radio, Tv, Rss, FileText, MessageCircle, Mail, Share2, Bookmark } from 'lucide-react';

interface FloatingLetterProps {
  letter: string;
  index: number;
  className?: string;
}

// Array of news-related icons with their colors
const newsIcons = [
  { icon: Newspaper, color: '#4B9CD3' },
  { icon: Globe, color: '#34D399' },
  { icon: Radio, color: '#F87171' },
  { icon: Tv, color: '#60A5FA' },
  { icon: Rss, color: '#FBBF24' },
  { icon: FileText, color: '#A78BFA' },
  { icon: MessageCircle, color: '#EC4899' },
  { icon: Mail, color: '#6EE7B7' },
  { icon: Share2, color: '#9333EA' },
  { icon: Bookmark, color: '#F59E0B' }
];

export function FloatingLetter({ letter, index, className }: FloatingLetterProps) {
  const randomRotation = Math.random() * 360;
  const randomDuration = 15 + Math.random() * 20;
  const randomDelay = Math.random() * -20;
  const randomX = Math.random() * 100 - 50;
  const randomHue = Math.random() * 360;
  const randomDepth = Math.random() * 500 - 250;
  
  // Select random icon
  const randomIcon = newsIcons[Math.floor(Math.random() * newsIcons.length)];

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -100,
        x: randomX,
        z: randomDepth,
        rotateX: randomRotation,
        rotateY: randomRotation,
        rotateZ: randomRotation,
        scale: 0.8,
      }}
      animate={{
        opacity: [0, 0.6, 0],
        y: ['0vh', '100vh'],
        z: [randomDepth, -randomDepth],
        rotateX: [0, 360],
        rotateY: [0, 360],
        rotateZ: [0, 360],
        scale: [0.8, 1.2, 0.8],
      }}
      transition={{
        duration: randomDuration,
        repeat: Infinity,
        delay: randomDelay,
        ease: 'linear',
      }}
      className={`${className} absolute`}
      style={{
        left: `${(index * 10) % 100}%`,
        perspective: '1000px',
        transformStyle: 'preserve-3d',
      }}
    >
      <motion.div 
        className="relative"
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Letter */}
        <motion.div 
          className="relative text-3xl font-bold"
          style={{
            color: `hsla(${randomHue}, 70%, 50%, 0.4)`,
            textShadow: `
              0 0 20px hsla(${randomHue}, 70%, 50%, 0.4),
              0 0 40px hsla(${randomHue}, 70%, 50%, 0.3)
            `,
            transform: 'translateZ(10px)',
          }}
        >
          <span lang="ml">{letter}</span>
        </motion.div>

        {/* Icon */}
        <motion.div
          className="absolute -top-6 -right-6"
          animate={{
            rotate: [0, 360],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            transform: 'translateZ(15px)',
          }}
        >
          <randomIcon.icon 
            size={16} 
            style={{ 
              color: randomIcon.color,
              filter: `drop-shadow(0 0 8px ${randomIcon.color})`
            }}
          />
        </motion.div>

        {/* 3D Glow effect */}
        <motion.div
          animate={{
            opacity: [0.3, 0.7, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 rounded-full blur-xl"
          style={{
            background: `radial-gradient(circle, 
              hsla(${randomHue}, 70%, 50%, 0.2) 0%,
              transparent 70%
            )`,
            transform: 'translateZ(-15px)',
          }}
        />

        {/* Connection lines between letter and icon */}
        <motion.div
          className="absolute top-0 right-0 w-4 h-4"
          style={{
            background: `linear-gradient(135deg, 
              transparent 0%,
              ${randomIcon.color}40 100%
            )`,
            transform: 'translateZ(5px)',
          }}
        />

        {/* Particle effects */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            animate={{
              opacity: [0, 0.5, 0],
              scale: [0, 1, 0],
              x: [0, (i - 1) * 10],
              y: [0, (i - 1) * 10],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeOut",
            }}
            style={{
              background: randomIcon.color,
              boxShadow: `0 0 5px ${randomIcon.color}`,
              transform: 'translateZ(12px)',
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}