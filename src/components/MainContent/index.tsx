import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InputSection } from '../InputSection';
import { ResultCard } from '../ResultCard';
import { FeedbackSection } from '../FeedbackSection';
import { LoadingSpinner } from './LoadingSpinner';
import type { AnalysisResult, InputType } from '../../types';
import { analyzeFakeNews } from '../../utils/mockAnalysis';

export function MainContent() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async ({ type, content }: { type: InputType; content: string }) => {
    setIsAnalyzing(true);
    setResult(null);
    
    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const analysis = analyzeFakeNews(content);
    setResult(analysis);
    setIsAnalyzing(false);
  };

  return (
    <div className="relative space-y-8 max-w-4xl mx-auto">
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-indigo-500/5 rounded-3xl blur-3xl -z-10"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
          background: [
            'linear-gradient(to right bottom, rgba(59, 130, 246, 0.05), rgba(147, 51, 234, 0.05), rgba(99, 102, 241, 0.05))',
            'linear-gradient(to right bottom, rgba(147, 51, 234, 0.05), rgba(99, 102, 241, 0.05), rgba(59, 130, 246, 0.05))',
            'linear-gradient(to right bottom, rgba(99, 102, 241, 0.05), rgba(59, 130, 246, 0.05), rgba(147, 51, 234, 0.05))',
          ]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "linear"
        }}
      />
      
      <InputSection onAnalyze={handleAnalyze} />
      
      <AnimatePresence mode="wait">
        {isAnalyzing && <LoadingSpinner />}
        
        {result && !isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 15
            }}
            className="flex flex-col items-center space-y-8"
          >
            <ResultCard result={result} />
            <FeedbackSection />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
