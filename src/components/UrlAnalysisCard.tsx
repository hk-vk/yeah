import { FC } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, Globe, ChevronLeft, ChevronRight, TrendingUp, Link, AlertTriangle, CheckCircle } from 'lucide-react';
import { TextAnalysisResult } from '../types/analysis';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../locales/translations';
import { GlassCard } from './common/GlassCard';
import clsx from 'clsx';

interface UrlAnalysisCardProps {
  urlAnalysis: {
    url: string;
    prediction: string;
    prediction_probabilities: number[];
    google_safe_browsing_flag: boolean;
    trusted: boolean;
    trust_score: number;
    is_trustworthy: boolean;
    trust_reasons: string[];
    final_decision: string;
  } | null;
  onNavigate?: (direction: 'next' | 'prev') => void;
  showNavigationHints?: boolean;
}

export const UrlAnalysisCard: FC<UrlAnalysisCardProps> = ({ 
  urlAnalysis, 
  onNavigate,
  showNavigationHints = true 
}) => {
  const { language } = useLanguage();
  const t = translations[language];
  
  // Handle swipe gestures
  const handleDragEnd = (e: any, { offset, velocity }: { offset: { x: number }; velocity: { x: number } }) => {
    const swipe = Math.abs(offset.x) * velocity.x;
    if (swipe < -100 && onNavigate) {
      onNavigate('next');
    } else if (swipe > 100 && onNavigate) {
      onNavigate('prev');
    }
  };
  
  // Handle case where URL analysis data isn't available
  if (!urlAnalysis) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        className="w-full max-w-full mx-auto relative"
      >
        <GlassCard className="relative overflow-hidden backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-white/30 dark:from-gray-800/50 dark:to-gray-800/30" />
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Globe className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  {language === 'ml' ? 'URL വിശകലനം' : 'URL Analysis'}
                </h2>
              </div>
              <span className={clsx(
                "px-3 py-1 rounded-full text-sm font-medium",
                "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200",
                "border border-blue-200 dark:border-blue-800/30"
              )}>
                {language === 'ml' ? 'URL വിശകലനം' : 'URL Analysis'}
              </span>
            </div>
            
            <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-800/30">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 mr-2 text-amber-600 dark:text-amber-400 mt-0.5" />
                <p className="text-amber-700 dark:text-amber-300">
                  {language === 'ml' 
                    ? 'URL വിശകലന വിവരങ്ങൾ ലഭ്യമല്ല' 
                    : 'URL analysis data is not available. Please try again.'}
                </p>
              </div>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                <Link className="w-4 h-4 mr-2" />
                <span className="break-all">{urlAnalysis?.url}</span>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    );
  }
  
  // Extract URL analysis data
  const isTrusted = urlAnalysis.trusted || urlAnalysis.is_trustworthy;
  const trustScore = urlAnalysis.trust_score || 0;
  const trustReasons = urlAnalysis.trust_reasons || [];
  const finalDecision = urlAnalysis.final_decision || '';
  const isSafe = !urlAnalysis.google_safe_browsing_flag;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-full mx-auto relative"
    >
      <GlassCard className="relative overflow-hidden backdrop-blur-sm">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Globe className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                {language === 'ml' ? 'URL പരിശോധന' : 'URL Analysis'}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {isTrusted ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-500" />
              )}
              <span className={clsx(
                "px-3 py-1 rounded-full text-sm font-medium",
                isTrusted 
                  ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                  : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300"
              )}>
                {isTrusted ? t.reliable : t.suspicious}
              </span>
            </div>
          </div>

          {/* Main Analysis Section */}
          <div className={clsx(
            "p-4 rounded-lg",
            isTrusted 
              ? "bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30" 
              : "bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30"
          )}>
            <div className="flex items-start">
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
          </div>

          {/* Trust Score */}
          <div>
            <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-gray-100 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              {language === 'ml' ? 'വിശ്വസനീയത സ്കോർ' : 'Trust Score'}
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={clsx(
                      "h-full rounded-full transition-all duration-500",
                      trustScore >= 80 ? "bg-green-500" : 
                      trustScore >= 50 ? "bg-yellow-500" : "bg-red-500"
                    )}
                    style={{ width: `${trustScore}%` }}
                  />
                </div>
                <span className="ml-3 font-semibold text-gray-700 dark:text-gray-300">
                  {trustScore}%
                </span>
              </div>
            </div>
          </div>

          {/* Trust Reasons */}
          {trustReasons.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-gray-100">
                {language === 'ml' ? 'വിശ്വസനീയതയുടെ കാരണങ്ങൾ' : 'Trust Reasons'}
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg space-y-2">
                {trustReasons.map((reason: string, index: number) => (
                  <div key={index} className="flex items-start">
                    <ShieldCheck className="w-4 h-4 mr-2 text-green-600 dark:text-green-400 mt-1" />
                    <span className="text-gray-700 dark:text-gray-300">{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Safe Browsing Status */}
          <div className={clsx(
            "p-4 rounded-lg",
            isSafe 
              ? "bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30" 
              : "bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30"
          )}>
            <h3 className="font-medium mb-2 flex items-center text-gray-900 dark:text-gray-100">
              <TrendingUp className="w-4 h-4 mr-2" />
              {language === 'ml' ? 'Google സുരക്ഷിത ബ്രൗസിംഗ്' : 'Google Safe Browsing'}
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

          {/* URL Display */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
              <Link className="w-4 h-4 mr-2" />
              <a 
                href={urlAnalysis.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline break-all"
              >
                {urlAnalysis.url}
              </a>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}; 