import { FC, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, FileText, AlertTriangle, TrendingUp } from 'lucide-react';
import { AnalysisResult, WritingStyleResult } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../locales/translations';
import { GlassCard } from './common/GlassCard';
import { analyzeService } from '../services/analyzeService';
import { AnalysisIndicator } from './AnalysisIndicator';
import clsx from 'clsx';

interface ResultCardProps {
  result: AnalysisResult;
  content?: string;
}

export const ResultCard: FC<ResultCardProps> = ({ result, content }) => {
  const { language } = useLanguage();
  const t = translations[language];
  const [writingStyle, setWritingStyle] = useState<WritingStyleResult | null>(null);
  const isMalayalam = language === 'ml';

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

  const styleIndicators = writingStyle ? [
    {
      id: 'sensationalism',
      score: Math.round(writingStyle.sensationalism),
      title: t.sensationalismScore
    },
    {
      id: 'writingStyle',
      score: Math.round(writingStyle.writingStyle),
      title: t.writingStyleScore
    },
    {
      id: 'clickbait',
      score: Math.round(writingStyle.clickbait),
      title: t.clickbaitScore
    }
  ] : [];

  const confidencePercentage = Math.round(result.CONFIDENCE * 100);
  const explanation = language === 'ml' ? result.EXPLANATION_ML : result.EXPLANATION_EN;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-2xl mx-auto space-y-4"
    >
      <GlassCard className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-white/30 dark:from-gray-800/50 dark:to-gray-800/30" />
        <div className={clsx(
          "relative p-6 space-y-6",
          isMalayalam && "malayalam-text"
        )}>
          {/* Main Analysis Result */}
          <div className="flex items-center justify-center mb-6">
            {result.ISFAKE === 0 ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center text-green-500 dark:text-green-400"
              >
                <ShieldCheck className="w-8 h-8 mr-2" />
                <span className={clsx(
                  "text-xl font-semibold",
                  isMalayalam && "text-2xl leading-relaxed"
                )}>{t.reliable}</span>
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center text-amber-500 dark:text-amber-400"
              >
                <ShieldAlert className="w-8 h-8 mr-2" />
                <span className={clsx(
                  "text-xl font-semibold",
                  isMalayalam && "text-2xl leading-relaxed"
                )}>{t.suspicious}</span>
              </motion.div>
            )}
          </div>

          {/* Explanation */}
          <div className="mb-6">
            <h3 className={clsx(
              "text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100 flex items-center",
              isMalayalam && "text-xl leading-relaxed"
            )}>
              <FileText className="w-5 h-5 mr-2" />
              {t.analysisTitle}
            </h3>
            <p className={clsx(
              "text-gray-600 dark:text-gray-300",
              isMalayalam && "text-lg leading-loose"
            )}>
              {explanation}
            </p>
          </div>

          {/* Writing Style Analysis */}
          {writingStyle && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className={clsx(
                "text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center",
                isMalayalam && "text-xl leading-relaxed"
              )}>
                <TrendingUp className="w-5 h-5 mr-2" />
                {t.writingStyleAnalysis}
              </h3>
              <div className="space-y-4">
                {styleIndicators.map((indicator) => (
                  <AnalysisIndicator key={indicator.id} indicator={indicator} />
                ))}
              </div>
              {writingStyle.sensationalism > 70 && (
                <div className={clsx(
                  "mt-4 flex items-center text-amber-500",
                  isMalayalam && "text-lg"
                )}>
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  <span>{t.highSensationalism}</span>
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
              className={clsx(
                "inline-block px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-full",
                isMalayalam && "text-base"
              )}>
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
