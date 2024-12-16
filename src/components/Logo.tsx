import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

export function Logo() {
  const { language } = useLanguage();
  
  const letters = language === 'en' ? 'YEAH!' : 'യാ !';
  
  return (
    <motion.div
      className="relative group cursor-pointer"
      whileHover={{ scale: 1.05 }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <motion.div
        className="absolute -inset-2 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 rounded-lg blur-lg group-hover:blur-xl transition-all duration-300"
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      <motion.div
        className={`relative font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-blue-500 text-3xl ${
          language === 'ml' ? 'font-malayalam' : 'font-display'
        }`}
        whileHover={{ scale: 1.1 }}
      >
        {letters.split('').map((letter, index) => (
          <motion.span
            key={index}
            className="inline-block"
            initial={{ y: 0 }}
            whileHover={{
              y: -5,
              scale: 1.2,
              transition: { duration: 0.2 }
            }}
            style={{ display: 'inline-block' }}
          >
            {letter}
          </motion.span>
        ))}
      </motion.div>
    </motion.div>
  );
}
