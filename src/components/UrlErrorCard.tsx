import { FC } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Globe, RefreshCcw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { GlassCard } from './common/GlassCard';
import clsx from 'clsx';

interface UrlErrorCardProps {
  errorMessage: string;
  url: string;
  onRetry?: () => void;
}

export const UrlErrorCard: FC<UrlErrorCardProps> = ({ 
  errorMessage, 
  url,
  onRetry
}) => {
  const { language } = useLanguage();
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-full mx-auto relative"
    >
      <GlassCard className="relative overflow-hidden backdrop-blur-sm border-2 border-red-300 dark:border-red-900/50">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Globe className="w-6 h-6 mr-2 text-red-600 dark:text-red-400" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                {language === 'ml' ? 'URL പിശക്' : 'URL Error'}
              </h2>
            </div>
            <div className="flex items-center">
              <span className={clsx(
                "px-3 py-1 rounded-full text-sm font-medium",
                "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300"
              )}>
                {language === 'ml' ? 'അസാധുവായ URL' : 'Invalid URL'}
              </span>
            </div>
          </div>

          {/* Error Message */}
          <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800/30">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 mr-3 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                  {language === 'ml' ? 'URL വിശകലനം പരാജയപ്പെട്ടു' : 'URL Analysis Failed'}
                </h3>
                <p className="text-red-700 dark:text-red-300 text-sm">
                  {errorMessage}
                </p>
              </div>
            </div>
          </div>

          {/* URL Display */}
          <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-800/30">
            <div className="flex items-start">
              <Globe className="w-5 h-5 mr-3 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="overflow-hidden">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                  {language === 'ml' ? 'അസാധുവായ URL' : 'Problem URL'}
                </h3>
                <p className="text-amber-700 dark:text-amber-300 text-sm break-all">
                  {url}
                </p>
              </div>
            </div>
          </div>

          {/* Suggestions */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800/30">
            <div className="flex items-start">
              <div className="w-full">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                  {language === 'ml' ? 'നിർദ്ദേശങ്ങൾ' : 'Suggestions'}
                </h3>
                <ul className="text-blue-700 dark:text-blue-300 text-sm space-y-2">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>
                      {language === 'ml' 
                        ? 'URL-ൽ "https://" എന്നത് ഉൾപ്പെടുത്തിയിട്ടുണ്ടെന്ന് ഉറപ്പാക്കുക'
                        : 'Make sure the URL includes "https://"'}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>
                      {language === 'ml'
                        ? 'ടൈപ്പിംഗ് പിശകുകൾ പരിശോധിക്കുക'
                        : 'Check for any typing errors'}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>
                      {language === 'ml'
                        ? 'വെബ്സൈറ്റ് ലഭ്യമാണെന്ന് ഉറപ്പാക്കുക'
                        : 'Ensure the website is accessible'}
                    </span>
                  </li>
                </ul>
                
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="mt-4 flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                  >
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    {language === 'ml' ? 'വീണ്ടും ശ്രമിക്കുക' : 'Try Again'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}; 