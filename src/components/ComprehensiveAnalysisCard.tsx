import { FC } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, AlertCircle, CheckCircle, BarChart2 } from 'lucide-react';
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

  // Calculate weighted result (text: 40%, image: 30%, url: 30%)
  const calculateOverallResult = () => {
    let totalWeight = 0;
    let weightedSum = 0;

    if (textAnalysis) {
      weightedSum += (textAnalysis.ISFAKE === 1 ? 1 : 0) * 0.4;
      totalWeight += 0.4;
    }
    if (imageAnalysis) {
      // For image analysis, consider verdict and score
      const isImageFake = imageAnalysis.verdict.toLowerCase().includes('fake') || 
                         imageAnalysis.score < 0.5 ||
                         imageAnalysis.details.ai_generated ||
                         imageAnalysis.details.deepfake;
      weightedSum += (isImageFake ? 1 : 0) * 0.3;
      totalWeight += 0.3;
    }
    if (urlAnalysis) {
      // For URL analysis, consider trust_score and is_trustworthy
      const isUrlFake = !urlAnalysis.is_trustworthy || urlAnalysis.trust_score < 0.5;
      weightedSum += (isUrlFake ? 1 : 0) * 0.3;
      totalWeight += 0.3;
    }

    // If no analysis available, return null
    if (totalWeight === 0) return null;

    // Normalize the result
    const normalizedResult = weightedSum / totalWeight;
    return normalizedResult >= 0.5 ? 1 : 0;
  };

  const overallResult = calculateOverallResult();

  // Generate comprehensive explanation
  const generateExplanation = (isML: boolean) => {
    if (overallResult === null) {
      return isML 
        ? 'വിശകലന ഫലങ്ങൾ ലഭ്യമല്ല'
        : 'No analysis results available';
    }

    const explanations = [];
    if (textAnalysis) {
      explanations.push(isML ? textAnalysis.EXPLANATION_ML : textAnalysis.EXPLANATION_EN);
    }
    if (imageAnalysis) {
      // For image analysis, create explanation from verdict and details
      const imageExplanation = isML
        ? `ചിത്രം ${imageAnalysis.verdict.toLowerCase().includes('fake') ? 'വ്യാജമാണ്' : 'യഥാർത്ഥമാണ്'}. ${
            imageAnalysis.details.ai_generated ? 'AI ഉപയോഗിച്ച് നിർമ്മിച്ചതാണ്. ' : ''
          }${imageAnalysis.details.deepfake ? 'ഡീപ്ഫേക്ക് സാങ്കേതികവിദ്യ ഉപയോഗിച്ചിട്ടുണ്ട്. ' : ''}`
        : `The image appears to be ${imageAnalysis.verdict}. ${
            imageAnalysis.details.ai_generated ? 'It was generated using AI. ' : ''
          }${imageAnalysis.details.deepfake ? 'Deepfake technology was detected. ' : ''}`;
      explanations.push(imageExplanation);
    }
    if (urlAnalysis) {
      // For URL analysis, create explanation from trust reasons and final decision
      const urlExplanation = isML
        ? `URL ${urlAnalysis.is_trustworthy ? 'വിശ്വസനീയമാണ്' : 'വിശ്വസനീയമല്ല'}. ${
            urlAnalysis.trust_reasons.join('. ')
          }`
        : `The URL is ${urlAnalysis.is_trustworthy ? 'trustworthy' : 'not trustworthy'}. ${
            urlAnalysis.trust_reasons.join('. ')
          }`;
      explanations.push(urlExplanation);
    }

    return explanations.join(' ');
  };

  if (overallResult === null) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-2xl mx-auto relative space-y-4"
    >
      <div className="absolute top-4 right-4 z-10">
        <span className={clsx(
          "px-3 py-1 rounded-full text-sm font-medium",
          "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200",
          "border border-purple-200 dark:border-purple-800/30"
        )}>
          {language === 'ml' ? 'സമഗ്ര വിശകലനം' : 'Comprehensive Analysis'}
        </span>
      </div>

      <GlassCard className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-white/30 dark:from-gray-800/50 dark:to-gray-800/30" />
        <div className={clsx(
          "relative p-6 space-y-6",
          isMalayalam && "malayalam-text"
        )}>
          {/* Main Analysis Result */}
          <div className="flex items-center justify-center mb-6">
            {overallResult === 0 ? (
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

          {/* Explanation */}
          <div className="mb-6">
            <h3 className={clsx(
              "text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100 flex items-center",
              isMalayalam && "text-xl leading-relaxed"
            )}>
              {overallResult === 0 ? (
                <CheckCircle className="w-5 h-5 mr-2 text-green-500 dark:text-green-400" />
              ) : (
                <AlertCircle className="w-5 h-5 mr-2 text-red-500 dark:text-red-400" />
              )}
              {language === 'ml' ? 'സമഗ്ര വിശകലന സംഗ്രഹം' : 'Comprehensive Analysis Summary'}
            </h3>
            <p className={clsx(
              "text-gray-600 dark:text-gray-300 mb-3",
              isMalayalam && "text-lg leading-loose"
            )}>
              {generateExplanation(isMalayalam)}
            </p>
          </div>

          {/* Analysis Breakdown */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className={clsx(
              "text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center",
              isMalayalam && "text-xl leading-relaxed"
            )}>
              <BarChart2 className="w-5 h-5 mr-2" />
              {language === 'ml' ? 'വിശകലന വിശദാംശങ്ങൾ' : 'Analysis Breakdown'}
            </h3>
            <div className="space-y-3">
              {textAnalysis && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-300">
                    {language === 'ml' ? 'വാചക വിശകലനം' : 'Text Analysis'}
                  </span>
                  <span className={clsx(
                    "font-medium",
                    textAnalysis.ISFAKE === 0 ? "text-green-500" : "text-red-500"
                  )}>
                    {textAnalysis.ISFAKE === 0 ? t.reliable : t.suspicious} (40%)
                  </span>
                </div>
              )}
              {imageAnalysis && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-300">
                    {language === 'ml' ? 'ചിത്ര വിശകലനം' : 'Image Analysis'}
                  </span>
                  <span className={clsx(
                    "font-medium",
                    !imageAnalysis.verdict.toLowerCase().includes('fake') ? "text-green-500" : "text-red-500"
                  )}>
                    {!imageAnalysis.verdict.toLowerCase().includes('fake') ? t.reliable : t.suspicious} (30%)
                  </span>
                </div>
              )}
              {urlAnalysis && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-300">
                    {language === 'ml' ? 'URL വിശകലനം' : 'URL Analysis'}
                  </span>
                  <span className={clsx(
                    "font-medium",
                    urlAnalysis.is_trustworthy ? "text-green-500" : "text-red-500"
                  )}>
                    {urlAnalysis.is_trustworthy ? t.reliable : t.suspicious} (30%)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}; 