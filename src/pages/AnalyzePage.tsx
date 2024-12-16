import React from 'react';
import { motion } from 'framer-motion';
import { MainContent } from '../components/MainContent';

export default function AnalyzePage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <MainContent />
    </motion.div>
  );
}
