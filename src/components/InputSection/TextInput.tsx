import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../locales/translations';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function TextInput({ value, onChange }: Props) {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <textarea
        rows={6}
        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm 
                   focus:border-blue-500 focus:ring-blue-500 
                   transition-all duration-300
                   hover:border-blue-400
                   dark:bg-gray-800 dark:border-gray-600 
                   dark:text-white dark:placeholder-gray-400
                   focus:scale-[1.01]"
        placeholder={t.placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        dir="auto"
      />
      <motion.div
        initial={false}
        animate={{
          scale: value.length > 0 ? 1 : 0,
          opacity: value.length > 0 ? 1 : 0
        }}
        className="absolute bottom-2 right-2 text-sm text-gray-500"
      >
        {value.length} characters
      </motion.div>
    </motion.div>
  );
}
