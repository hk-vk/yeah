import { FC, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, FileText, AlertTriangle, TrendingUp, ChevronLeft, Search, Globe, ChevronDown, ChevronUp } from 'lucide-react';
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
  extractedFromImage?: boolean;
}

export const ResultCard: FC<ResultCardProps> = ({ 
  result, 
  content,
  extractedFromImage = false
}) => {
  const { language } = useLanguage();
  const t = translations[language];
  const [writingStyle, setWritingStyle] = useState<WritingStyleResult | null>(null);
  const [reverseSearchResults, setReverseSearchResults] = useState<any[] | null>(null);
  const [expandedMatches, setExpandedMatches] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
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
    
    // If text was extracted from image, perform a reverse search
    const performReverseSearch = async () => {
      if (extractedFromImage && content && content.length > 10) {
        setIsSearching(true);
        try {
          const searchResponse = await analyzeService.searchReverseContent(content);
          if (searchResponse && searchResponse.matches) {
            setReverseSearchResults(searchResponse.matches);
          }
        } catch (error) {
          console.error('Reverse search failed:', error);
        } finally {
          setIsSearching(false);
        }
      }
    };
    performReverseSearch();
  }, [content, extractedFromImage]);

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

  const renderReverseSearchResults = () => {
    if (isSearching) {
      return (
        <p className="text-gray-600 dark:text-gray-300 text-sm italic">
          {language === 'ml' ? 'തിരയുന്നു...' : 'Searching...'}
        </p>
      );
    }

    if (!reverseSearchResults || reverseSearchResults.length === 0) {
      return (
        <p className="text-green-600 dark:text-green-400 text-sm">
          {language === 'ml' ? 'സമാന വാചകങ്ങൾ കണ്ടെത്തിയില്ല' : 'No similar content found'}
        </p>
      );
    }

    // Display a preview or the full list based on expansion state
    const displayedMatches = expandedMatches ? reverseSearchResults : reverseSearchResults.slice(0, 1);
    
    return (
      <div className="space-y-2">
        {displayedMatches.map((match, index) => (
          <div key={index} className={clsx("break-all", isMalayalam ? "text-base" : "text-sm")}>
            <a
              href={match.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline flex items-start"
            >
              <Globe className="w-3.5 h-3.5 mt-0.5 mr-1.5 flex-shrink-0" />
              <span>{match.title || match.url}</span>
            </a>
          </div>
        ))}
        
        {reverseSearchResults.length > 1 && (
          <button
            onClick={() => setExpandedMatches(!expandedMatches)}
            className={clsx(
              "flex items-center mt-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400",
              "dark:hover:text-blue-300 transition-colors duration-200 rounded px-2 py-0.5 hover:bg-blue-50 dark:hover:bg-blue-900/20",
              isMalayalam ? "text-base" : "text-sm"
            )}
          >
            {expandedMatches 
              ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5 mr-1" />
                  {language === 'ml' ? 'ചുരുക്കുക' : 'Show less'}
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5 mr-1" />
                  {language === 'ml' 
                    ? `${reverseSearchResults.length - 1} കൂടുതൽ` 
                    : `Show ${reverseSearchResults.length - 1} more`}
                </>
              )
            }
          </button>
        )}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-2xl mx-auto relative space-y-4"
    >
      {/* Swipe Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute -left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-600 hidden md:flex items-center"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="text-sm ml-2">
          {language === 'ml' ? 'ചിത്ര വിശകലനം' : 'Image Analysis'}
        </span>
      </motion.div>

      <div className="absolute top-4 right-4 z-10">
        <span className={clsx(
          "px-3 py-1 rounded-full text-sm font-medium",
          "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200",
          "border border-blue-200 dark:border-blue-800/30"
        )}>
          {language === 'ml' ? 'വാചക വിശകലനം' : 'Text Analysis'}
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

          {/* Text Source Indicator */}
          {extractedFromImage && (
            <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
              <p className={clsx(
                "text-blue-700 dark:text-blue-300 flex items-center",
                isMalayalam && "text-base"
              )}>
                <FileText className="w-4 h-4 mr-2" />
                {language === 'ml' ? 'ചിത്രത്തിൽ നിന്ന് തിരിച്ചറിഞ്ഞ വാചകം' : 'Text extracted from image'}
              </p>
              {content && (
                <p className={clsx(
                  "mt-2 text-gray-700 dark:text-gray-300 border-l-2 border-blue-300 pl-3",
                  isMalayalam && "text-base leading-relaxed"
                )}>
                  {content}
                </p>
              )}
            </div>
          )}

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

          {/* Reverse Search Results for Extracted Text */}
          {extractedFromImage && (
            <div className="mb-6">
              <h3 className={clsx(
                "text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100 flex items-center",
                isMalayalam && "text-xl leading-relaxed"
              )}>
                <Search className="w-5 h-5 mr-2" />
                {language === 'ml' ? 'വാചക തിരയൽ ഫലങ്ങൾ' : 'Text Search Results'}
              </h3>
              {renderReverseSearchResults()}
            </div>
          )}

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
};
