import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, FileText, AlertTriangle, TrendingUp } from 'lucide-react';
import { AnalysisResult, WritingStyleResult } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../locales/translations';
import { GlassCard } from './common/GlassCard';
import { analyzeService } from '../services/analyzeService';
import { AnalysisIndicator } from './AnalysisIndicator';

interface Props {
  result: AnalysisResult;
  content?: string;
}

export function ResultCard({ result, content }: Props) {
  const { language } = useLanguage();
  const t = translations[language];
  const [writingStyle, setWritingStyle] = useState<WritingStyleResult | null>(null);

  useEffect(() => {
    const fetchWritingStyle = async () => {
      if (content) {
        try {
          const styleResult = await analyzeService.analyzeWritingStyle(content);
          setWritingStyle(styleResult);
        } catch (error) {
          console.error('Writing style analysis failed:', error);
        }
      }
    };
    fetchWritingStyle();
  }, [content]);

  // Convert writing style results to indicator format
  const styleIndicators = writingStyle ? [
    {
      id: 'sensationalism',
      score: Math.round(writingStyle.sensationalism),
    },
    {
      id: 'writingStyle',
      score: Math.round(writingStyle.writingStyle),
    },
    {
      id: 'clickbait',
      score: Math.round(writingStyle.clickbait),
    }
  ] : [];

  const confidencePercentage = Math.round(result.CONFIDENCE * 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-2xl mx-auto space-y-4"
    >
      <GlassCard className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-white/30 dark:from-gray-800/50 dark:to-gray-800/30" />
        <div className="relative p-6 space-y-6">
          {/* Main Analysis Result */}
          <div className="flex items-center justify-center mb-6">
            {result.ISFAKE === 0 ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center text-green-500 dark:text-green-400"
              >
                <ShieldCheck className="w-8 h-8 mr-2" />
                <span className="text-xl font-semibold">{t.reliable}</span>
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center text-amber-500 dark:text-amber-400"
              >
                <ShieldAlert className="w-8 h-8 mr-2" />
                <span className="text-xl font-semibold">{t.suspicious}</span>
              </motion.div>
            )}
          </div>

          {/* Explanation */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              {t.analysisTitle}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {result.EXPLANATION}
            </p>
          </div>

          {/* Writing Style Analysis */}
          {writingStyle && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Writing Style Analysis
              </h3>
              <div className="space-y-4">
                {styleIndicators.map((indicator) => (
                  <AnalysisIndicator key={indicator.id} indicator={indicator} />
                ))}
              </div>
              {writingStyle.sensationalism > 70 && (
                <div className="mt-4 flex items-center text-amber-500">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  <span className="text-sm">High sensationalism detected</span>
                </div>
              )}
            </div>
          )}

          {/* Confidence Score */}
          <div className="text-sm text-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="inline-block px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-full"
            >
              <span className="text-blue-700 dark:text-blue-300">
                {t.confidenceScore}: {confidencePercentage}%
              </span>
            </motion.div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
