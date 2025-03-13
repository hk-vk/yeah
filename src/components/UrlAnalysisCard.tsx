import { FC } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, Globe, ChevronLeft, TrendingUp, Link, AlertTriangle } from 'lucide-react';
import { TextAnalysisResult } from '../types/analysis';
import { useLanguage } from '../contexts/LanguageContext';
import { GlassCard } from './common/GlassCard';
import clsx from 'clsx';

interface UrlAnalysisCardProps {
  result: TextAnalysisResult;
  url: string;
}

export const UrlAnalysisCard: FC<UrlAnalysisCardProps> = ({ result, url }) => {
  const { language } = useLanguage();
  const isMalayalam = language === 'ml';
  
  // Handle case where URL analysis data isn't available
  if (!result.urlAnalysis) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl mx-auto relative"
      >
        <div className="absolute top-4 right-4 z-10">
          <span className={clsx(
            "px-3 py-1 rounded-full text-sm font-medium",
            "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200",
            "border border-blue-200 dark:border-blue-800/30"
          )}>
            {language === 'ml' ? 'URL വിശകലനം' : 'URL Analysis'}
          </span>
        </div>

        <GlassCard>
          <div className="p-6">
            <div className="flex items-center mb-4">
              <Globe className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                {language === 'ml' ? 'URL വിശകലനം' : 'URL Analysis'}
              </h2>
            </div>
            
            <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-800/30">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 mr-2 text-amber-600 dark:text-amber-400 mt-0.5" />
                <p className="text-amber-700 dark:text-amber-300">
                  {language === 'ml' 
                    ? 'URL വിശകലന വിവരങ്ങൾ ലഭ്യമല്ല' 
                    : 'URL analysis data is not available. Please try again.'}
                </p>
              </div>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <p className="text-gray-500 dark:text-gray-400 text-sm break-all">
                <span className="font-medium">{language === 'ml' ? 'URL: ' : 'URL: '}</span>
                {url}
              </p>
            </div>
          </div>
        </GlassCard>
        
        {/* Swipe Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute -left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-600 hidden md:flex items-center"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          <span className="text-sm">
            {language === 'ml' ? 'വാചക വിശകലനം' : 'Text Analysis'}
          </span>
        </motion.div>
      </motion.div>
    );
  }
  
  // Extract URL analysis data
  const urlAnalysis = result.urlAnalysis;
  const isTrusted = urlAnalysis.trusted || urlAnalysis.is_trustworthy;
  const trustScore = urlAnalysis.trust_score || 0;
  const trustReasons = urlAnalysis.trust_reasons || [];
  const finalDecision = urlAnalysis.final_decision || '';
  const prediction = urlAnalysis.prediction || '';
  const isSafe = !urlAnalysis.google_safe_browsing_flag;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-2xl mx-auto relative"
    >
      <div className="absolute top-4 right-4 z-10">
        <span className={clsx(
          "px-3 py-1 rounded-full text-sm font-medium",
          "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200",
          "border border-blue-200 dark:border-blue-800/30"
        )}>
          {language === 'ml' ? 'URL വിശകലനം' : 'URL Analysis'}
        </span>
      </div>

      <GlassCard>
        <div className="p-6">
          <div className="flex items-center mb-4">
            <Globe className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              {language === 'ml' ? 'URL വിശകലനം' : 'URL Analysis'}
            </h2>
          </div>
          
          {/* URL Trust Status */}
          <div className={clsx(
            "mb-6 p-4 rounded-lg flex items-start",
            isTrusted 
              ? "bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30" 
              : "bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30"
          )}>
            {isTrusted ? (
              <ShieldCheck className="w-5 h-5 mr-3 text-green-600 dark:text-green-400 mt-0.5" />
            ) : (
              <ShieldAlert className="w-5 h-5 mr-3 text-red-600 dark:text-red-400 mt-0.5" />
            )}
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">
                {isTrusted 
                  ? (language === 'ml' ? 'വിശ്വസനീയ URL' : 'Trusted URL') 
                  : (language === 'ml' ? 'അവിശ്വസനീയ URL' : 'Untrusted URL')}
              </h3>
              <p className={clsx(
                "text-sm mt-1",
                isTrusted ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"
              )}>
                {finalDecision}
              </p>
            </div>
          </div>
          
          {/* Trust Score */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-100">
              {language === 'ml' ? 'വിശ്വാസയോഗ്യത സ്കോർ' : 'Trust Score'}
            </h3>
            <div className="flex items-center">
              <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={clsx(
                    "h-full rounded-full",
                    trustScore >= 80 ? "bg-green-500" : 
                    trustScore >= 50 ? "bg-yellow-500" : "bg-red-500"
                  )}
                  style={{ width: `${trustScore}%` }}
                />
              </div>
              <span className="ml-3 font-semibold">
                {trustScore}%
              </span>
            </div>
          </div>
          
          {/* Trust Reasons */}
          {trustReasons.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-100">
                {language === 'ml' ? 'വിശ്വാസകാരണങ്ങൾ' : 'Trust Reasons'}
              </h3>
              <ul className="space-y-2">
                {trustReasons.map((reason: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <ShieldCheck className="w-4 h-4 mr-2 text-green-600 dark:text-green-400 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Safe Browsing */}
          <div className={clsx(
            "mb-6 p-4 rounded-lg",
            isSafe 
              ? "bg-green-50 dark:bg-green-900/10" 
              : "bg-red-50 dark:bg-red-900/10"
          )}>
            <h3 className="font-medium mb-2 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              {language === 'ml' ? 'Google Safe Browsing' : 'Google Safe Browsing'}
            </h3>
            <p className={clsx(
              "text-sm",
              isSafe ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"
            )}>
              {isSafe 
                ? (language === 'ml' ? 'ഈ URL ഉപയോഗിക്കാൻ സുരക്ഷിതമാണ്' : 'This URL is safe to use') 
                : (language === 'ml' ? 'ഈ URL-ൽ സുരക്ഷാ ഭീഷണികൾ കണ്ടെത്തി' : 'Security threats detected on this URL')}
            </p>
          </div>
          
          {/* URL */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
            <p className="text-gray-500 dark:text-gray-400 text-sm break-all">
              <span className="font-medium">{language === 'ml' ? 'URL: ' : 'URL: '}</span>
              <Link className="inline-block w-4 h-4 mr-1 align-text-bottom" />
              <a 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {url}
              </a>
            </p>
          </div>
        </div>
      </GlassCard>
      
      {/* Swipe Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute -left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-600 hidden md:flex items-center"
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        <span className="text-sm">
          {language === 'ml' ? 'വാചക വിശകലനം' : 'Text Analysis'}
        </span>
      </motion.div>
    </motion.div>
  );
}; 