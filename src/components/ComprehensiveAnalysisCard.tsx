import { FC } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, FileText, Image as ImageIcon, Globe, Search } from 'lucide-react';
import { TextAnalysisResult, ImageAnalysisResult } from '../types/analysis';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../locales/translations';
import { GlassCard } from './common/GlassCard';
import clsx from 'clsx';

interface ComprehensiveAnalysisCardProps {
  textAnalysis?: TextAnalysisResult | null;
  imageAnalysis?: ImageAnalysisResult | null;
  urlAnalysis?: TextAnalysisResult['urlAnalysis'];
}

export const ComprehensiveAnalysisCard: FC<ComprehensiveAnalysisCardProps> = ({
  textAnalysis,
  imageAnalysis,
  urlAnalysis
}) => {
  const { language } = useLanguage();
  const t = translations[language];
  const isMalayalam = language === 'ml';

  // Calculate weighted result
  const calculateOverallResult = () => {
    let totalWeight = 0;
    let weightedScore = 0;

    // Text Analysis (45%)
    if (textAnalysis) {
      totalWeight += 45;
      weightedScore += (textAnalysis.ISFAKE === 0 ? 100 : 0) * 0.45;
    }

    // Image Analysis (25%)
    if (imageAnalysis) {
      totalWeight += 25;
      weightedScore += (!imageAnalysis.verdict.toLowerCase().includes('fake') ? 100 : 0) * 0.25;
    }

    // URL Analysis (10%)
    if (urlAnalysis) {
      totalWeight += 10;
      weightedScore += (urlAnalysis.is_trustworthy ? 100 : 0) * 0.10;
    }

    // Image Text Analysis (20%)
    if (imageAnalysis?.details?.text_analysis) {
      totalWeight += 20;
      const textTrustworthy = imageAnalysis.details.text_analysis.reverse_search?.reliability_score || 0;
      weightedScore += (textTrustworthy >= 50 ? 100 : 0) * 0.20;
    }

    // Return final result
    return totalWeight > 0 ? weightedScore / (totalWeight / 100) : 0;
  };

  const overallScore = calculateOverallResult();
  const isReliable = overallScore >= 50;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-2xl mx-auto"
    >
      <GlassCard className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-white/30 dark:from-gray-800/50 dark:to-gray-800/30" />
        <div className={clsx(
          "relative p-6 space-y-6",
          isMalayalam && "malayalam-text"
        )}>
          {/* Main Analysis Result */}
          <div className="flex items-center justify-center mb-6">
            {isReliable ? (
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
                className="flex items-center text-red-500 dark:text-red-400"
              >
                <ShieldAlert className="w-8 h-8 mr-2" />
                <span className={clsx(
                  "text-xl font-semibold",
                  isMalayalam && "text-2xl leading-relaxed"
                )}>{t.suspicious}</span>
              </motion.div>
            )}
          </div>

          {/* Analysis Breakdown */}
          <div className="space-y-4">
            {/* Text Analysis */}
            {textAnalysis && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Search className="w-5 h-5 mr-2" />
                  <span>{t.textAnalysisWeight}</span>
                </div>
                <span className={clsx(
                  "font-medium",
                  textAnalysis.ISFAKE === 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                )}>
                  {textAnalysis.ISFAKE === 0 ? t.reliable : t.suspicious} (45%)
                </span>
              </div>
            )}

            {/* Image Analysis */}
            {imageAnalysis && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ImageIcon className="w-5 h-5 mr-2" />
                  <span>{t.imageAnalysisWeight}</span>
                </div>
                <span className={clsx(
                  "font-medium",
                  !imageAnalysis.verdict.toLowerCase().includes('fake') ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                )}>
                  {!imageAnalysis.verdict.toLowerCase().includes('fake') ? t.reliable : t.suspicious} (25%)
                </span>
              </div>
            )}

            {/* URL Analysis */}
            {urlAnalysis && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  <span>{t.urlAnalysisWeight}</span>
                </div>
                <span className={clsx(
                  "font-medium",
                  urlAnalysis.is_trustworthy ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                )}>
                  {urlAnalysis.is_trustworthy ? t.reliable : t.suspicious} (10%)
                </span>
              </div>
            )}

            {/* Image Text Analysis */}
            {imageAnalysis?.details?.text_analysis && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  <span>{t.imageTextAnalysisWeight}</span>
                </div>
                <span className={clsx(
                  "font-medium",
                  (imageAnalysis.details.text_analysis.reverse_search?.reliability_score || 0) >= 50 
                    ? "text-green-600 dark:text-green-400" 
                    : "text-red-600 dark:text-red-400"
                )}>
                  {(imageAnalysis.details.text_analysis.reverse_search?.reliability_score || 0) >= 50 
                    ? t.reliable 
                    : t.suspicious} (20%)
                </span>
              </div>
            )}
          </div>

          {/* Overall Score */}
          <div className="mt-6">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">
                {t.confidenceScore}
              </span>
              <span className={clsx(
                "text-sm font-medium",
                isReliable ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              )}>
                {Math.round(overallScore)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className={clsx(
                  "h-2.5 rounded-full transition-all duration-500",
                  isReliable ? "bg-green-500" : "bg-red-500"
                )}
                style={{ width: `${overallScore}%` }}
              />
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}; 