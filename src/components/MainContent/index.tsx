import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InputSection } from '../InputSection';
import { ResultCard } from '../ResultCard';
import { FeedbackSection } from '../FeedbackSection';
import { LoadingSpinner } from './LoadingSpinner';
import type { AnalysisResult } from '../../types';
import { analyzeService } from '../../services/analyzeService';
import toast from 'react-hot-toast';

export function MainContent() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentContent, setCurrentContent] = useState<string>('');

  const handleAnalyze = async ({ content }: { type: string; content: string }) => {
    setIsAnalyzing(true);
    setResult(null);
    setCurrentContent(content);
    
    try {
      const analysisResult = await analyzeService.analyzeContent(content);
      setResult(analysisResult);
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="relative space-y-8 max-w-4xl mx-auto">
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-indigo-500/5 rounded-3xl blur-3xl -z-10"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 2, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      />
      <InputSection onAnalyze={handleAnalyze} />
      <AnimatePresence mode="wait">
        {isAnalyzing ? (
          <LoadingSpinner />
        ) : result ? (
          <>
            <ResultCard result={result} content={currentContent} />
            <FeedbackSection />
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
