import { FC, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, FileText, AlertTriangle, TrendingUp, Search, Globe, ChevronDown, ChevronUp, ChevronRight, Link, User, Calendar, Image as ImageIcon } from 'lucide-react';
import { AnalysisResult, TextAnalysisResult, ImageAnalysisResult } from '../types/analysis';
import { WritingStyleResult } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../locales/translations';
import { GlassCard } from './common/GlassCard';
import { analyzeService } from '../services/analyzeService';
import { exaService } from '../services/exaService';
import { AnalysisIndicator } from './AnalysisIndicator';
import clsx from 'clsx';

interface ResultCardProps {
  result: AnalysisResult;
  content?: string;
  extractedFromImage?: boolean;
}

// Type guards
function isTextAnalysisResult(result: AnalysisResult): result is TextAnalysisResult {
  return result.type === 'text' || result.type === 'url';
}

function isImageAnalysisResult(result: AnalysisResult): result is ImageAnalysisResult {
  return result.type === 'image' || result.type === 'text_image';
}

export const ResultCard: FC<ResultCardProps> = ({ 
  result, 
  content,
  extractedFromImage = false
}) => {
  const { language } = useLanguage();
  const t = translations[language];
  const [reverseSearchResults, setReverseSearchResults] = useState<any[] | null>(null);
  const [expandedMatches, setExpandedMatches] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [writingStyle, setWritingStyle] = useState<WritingStyleResult | null>(null);
  const [urlContent, setUrlContent] = useState<any>(null);
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const isMalayalam = language === 'ml';
  
  // Check if this is a URL analysis
  const isUrlAnalysis = result.type === 'url';

  // Check if the content is a URL
  const isValidUrl = (str: string): boolean => {
    try {
      new URL(str);
      return true;
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    // If URL analysis, extract content using Exa API
    const extractUrlContent = async () => {
      if (isUrlAnalysis && content && isValidUrl(content)) {
        try {
          setIsLoadingUrl(true);
          const extractedContent = await exaService.extractUrlContent(content);
          setUrlContent(extractedContent);
          
          // Immediately analyze writing style once content is extracted
          if (extractedContent.text) {
            analyzeWritingStyle(extractedContent.text);
          }
        } catch (error) {
          console.error('Error extracting URL content:', error);
        } finally {
          setIsLoadingUrl(false);
        }
      }
    };

    // If text was extracted from image, perform a reverse search
    const performReverseSearch = async () => {
      if (extractedFromImage && content && content.length > 10) {
        setIsSearching(true);
        try {
          // Get current timestamp
          const timestamp = new Date().toISOString();
          const searchResponse = await analyzeService.searchReverseContent(content, timestamp);
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
    
    // Analyze writing style if content is available
    const analyzeWritingStyle = async (textOverride?: string) => {
      if (content || textOverride) {
        try {
          // For URL analysis, use the extracted content text or override
          const textToAnalyze = textOverride || (isUrlAnalysis && urlContent?.text 
            ? urlContent.text 
            : content);
            
          // Only analyze if we have text and it's not a URL itself (unless it's URL analysis)
          if (textToAnalyze && (!isValidUrl(textToAnalyze) || isUrlAnalysis)) {
            console.log('Analyzing writing style for text:', textToAnalyze.substring(0, 100) + '...');
            
            // Always send at least 100 characters to get meaningful results
            const textForAnalysis = textToAnalyze.length < 100 
              ? textToAnalyze + ' ' + textToAnalyze // Duplicate short text to reach minimum length
              : textToAnalyze;
              
            const styleResult = await analyzeService.analyzeWritingStyle(textForAnalysis);
            console.log('Writing style analysis result:', styleResult);
            setWritingStyle(styleResult);
          } else {
            console.log('No suitable text for writing style analysis');
            // Create default writing style values for display
            setWritingStyle({
              sensationalism: 30,
              writingStyle: 70,
              clickbait: 25
            });
          }
        } catch (error) {
          console.error('Writing style analysis failed:', error);
          // Set default values in case of error
          setWritingStyle({
            sensationalism: 40,
            writingStyle: 60,
            clickbait: 35
          });
        }
      }
    };
    
    extractUrlContent();
    performReverseSearch();
    
    // For non-URL analysis, analyze writing style immediately
    if (!isUrlAnalysis) {
      analyzeWritingStyle();
    }
    // For URL analysis, the writing style will be analyzed after content extraction
  }, [content, extractedFromImage, isUrlAnalysis]);

  // Add a separate useEffect for writing style analysis
  useEffect(() => {
    // Only run this effect when URL content is available
    if (isUrlAnalysis && urlContent?.text && !writingStyle) {
      const analyzeUrlWritingStyle = async () => {
        try {
          console.log('Analyzing writing style for URL content');
          const textToAnalyze = urlContent.text;
          
          // Always send at least 100 characters to get meaningful results
          const textForAnalysis = textToAnalyze.length < 100 
            ? textToAnalyze + ' ' + textToAnalyze // Duplicate short text to reach minimum length
            : textToAnalyze;
            
          const styleResult = await analyzeService.analyzeWritingStyle(textForAnalysis);
          console.log('URL writing style analysis result:', styleResult);
          setWritingStyle(styleResult);
        } catch (error) {
          console.error('URL writing style analysis failed:', error);
          // Set default values in case of error
          setWritingStyle({
            sensationalism: 40,
            writingStyle: 60,
            clickbait: 35
          });
        }
      };
      
      analyzeUrlWritingStyle();
    }
  }, [isUrlAnalysis, urlContent, writingStyle]);

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

  // Get the appropriate icon based on result type
  const getResultTypeIcon = () => {
    if (isUrlAnalysis) {
      return <Link className="w-5 h-5 mr-2 text-blue-500" />;
    } else {
      return <FileText className="w-5 h-5 mr-2 text-blue-500" />;
    }
  };

  // Get the appropriate title based on result type
  const getResultTitle = () => {
    if (isUrlAnalysis) {
      return isMalayalam ? 'URL വിശകലനം' : 'URL Analysis';
    } else {
      return isMalayalam ? 'വാചക വിശകലനം' : 'Text Analysis';
    }
  };

  // Display URL source if it's a URL analysis
  const renderUrlSource = () => {
    if (!isUrlAnalysis && !isValidUrl(content || '')) return null;
    
    if (isLoadingUrl) {
      return (
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow-inner">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent mr-3"></div>
            <span className="text-blue-600 dark:text-blue-400">
              {isMalayalam ? 'URL വിവരങ്ങൾ ശേഖരിക്കുന്നു...' : 'Extracting URL content...'}
            </span>
          </div>
        </div>
      );
    }
    
    // Get URL data
    const url = content || (isTextAnalysisResult(result) && result.input?.url) || '';
    const title = urlContent?.title || (isTextAnalysisResult(result) && result.input?.title);
    const publishedDate = urlContent?.publishedDate || (isTextAnalysisResult(result) && result.input?.published_date);
    const author = urlContent?.author;
    const favicon = urlContent?.favicon;
    
    if (!url) return null;
    
    return (
      <motion.div 
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-3 p-3 bg-gradient-to-br from-blue-50 to-blue-50/50 dark:from-blue-900/20 dark:to-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800/30 shadow-sm"
      >
        <div className="flex items-start">
          <div className="mr-2 flex-shrink-0">
            {favicon ? (
              <div className="w-8 h-8 rounded-md overflow-hidden bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm border border-gray-100 dark:border-gray-700">
                <img 
                  src={favicon} 
                  alt="Website icon" 
                  className="max-w-full max-h-full p-1"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cpath d='M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z'%3E%3C/path%3E%3Cpath d='M2 12h20'%3E%3C/path%3E%3C/svg%3E";
                  }}
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center border border-blue-200 dark:border-blue-800/30">
                <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            {title && (
              <div className="text-base font-medium text-gray-800 dark:text-gray-200 line-clamp-2">
                {title}
              </div>
            )}
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm break-all hover:underline flex items-center mt-1"
            >
              <Link className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
              <span className="truncate">{url}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            <div className="mt-1.5 flex flex-wrap gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              {author && (
                <div className="flex items-center bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-full">
                  <User className="w-3 h-3 mr-1" />
                  {author}
                </div>
              )}
              {publishedDate && (
                <div className="flex items-center bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-full">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date(publishedDate).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };
  
  // Display URL content extracted by Exa API
  const renderExtractedContent = () => {
    if (!urlContent?.text || !isUrlAnalysis) return null;
    
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-3"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center text-blue-600 dark:text-blue-400">
            <FileText className="w-5 h-5 mr-2 text-blue-500" />
          </div>
          <button 
            onClick={() => setIsContentExpanded(!isContentExpanded)}
            className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
            aria-expanded={isContentExpanded}
            aria-label={isContentExpanded ? 'Collapse content' : 'Expand content'}
          >
            {isContentExpanded 
              ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-1" />
                  {isMalayalam ? 'ചുരുക്കുക' : 'Collapse'}
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" />
                  {isMalayalam ? 'വിപുലീകരിക്കുക' : 'Expand'}
                </>
              )
            }
          </button>
        </div>
        
        {isContentExpanded && (
          <div className="bg-white/80 dark:bg-gray-800/80 p-3 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm backdrop-blur-sm">
            <p className={clsx(
              "text-gray-700 dark:text-gray-300 whitespace-pre-line",
              isMalayalam && "text-base leading-relaxed"
            )}>
              {urlContent.text.length > 600 
                ? `${urlContent.text.substring(0, 600)}...` 
                : urlContent.text}
            </p>
            
            {urlContent.text.length > 600 && (
              <button
                onClick={() => window.open(content, '_blank')}
                className="mt-1 text-blue-600 dark:text-blue-400 text-sm flex items-center hover:underline"
              >
                <FileText className="w-3.5 h-3.5 mr-1" />
                {isMalayalam ? 'മുഴുവൻ ഉള്ളടക്കവും വായിക്കുക' : 'Read full content'}
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </button>
            )}
          </div>
        )}

        {urlContent.image && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center">
                <ImageIcon className="w-4 h-4 mr-1.5 text-blue-500" />
              </div>
              <button 
                onClick={() => setIsImageExpanded(!isImageExpanded)}
                className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                aria-expanded={isImageExpanded}
                aria-label={isImageExpanded ? 'Hide image' : 'Show image'}
              >
                {isImageExpanded 
                  ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5 mr-1" />
                      {isMalayalam ? 'മറയ്ക്കുക' : 'Hide'}
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3.5 h-3.5 mr-1" />
                      {isMalayalam ? 'കാണിക്കുക' : 'Show'}
                    </>
                  )
                }
              </button>
            </div>
            {isImageExpanded && (
              <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <img 
                  src={urlContent.image} 
                  alt={urlContent.title || 'Featured image'} 
                  className="w-full max-h-80 object-contain bg-gray-50 dark:bg-gray-900/50"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-2xl mx-auto relative space-y-4"
    >
      {/* Swipe Indicator - Updated to point to image analysis */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute -right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-600 hidden md:flex items-center"
      >
        <span className="text-sm mr-2">
          {language === 'ml' ? 'ചിത്ര വിശകലനം' : 'Image Analysis'}
        </span>
        <ChevronRight className="w-4 h-4" />
      </motion.div>

      <div className="absolute top-4 right-4 z-10">
        <span className={clsx(
          "px-3 py-1 rounded-full text-sm font-medium",
          "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200",
          "border border-blue-200 dark:border-blue-800/30"
        )}>
          {getResultTitle()}
        </span>
      </div>

      <GlassCard className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-white/30 dark:from-gray-800/50 dark:to-gray-800/30" />
        <div className={clsx(
          "relative p-6 space-y-6",
          isMalayalam && "malayalam-text"
        )}>
          {/* URL Source (if applicable) */}
          {renderUrlSource()}
          
          {/* Extracted URL content from Exa API */}
          {renderExtractedContent()}
          
          {/* Main Analysis Result */}
          <div className="flex items-center justify-center mb-6">
            {isTextAnalysisResult(result) && (
              result.ISFAKE === 0 ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex flex-col items-center text-green-500 dark:text-green-400"
                >
                  <div className="flex items-center">
                    <ShieldCheck className="w-8 h-8 mr-2" />
                    <span className={clsx(
                      "text-xl font-semibold",
                      isMalayalam && "text-2xl leading-relaxed"
                    )}>{t.reliable}</span>
                  </div>
                  {/* Confidence Score Indicator */}
                  {isTextAnalysisResult(result) && (
                    <div className="mt-2 flex items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">
                        {t.confidenceScore}: {Math.round(result.CONFIDENCE * 100)}%
                      </span>
                      <div className="w-20 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={clsx(
                            "h-full rounded-full",
                            result.CONFIDENCE > 0.7 ? "bg-green-500" : 
                            result.CONFIDENCE > 0.4 ? "bg-yellow-500" : "bg-red-500"
                          )}
                          style={{ width: `${Math.round(result.CONFIDENCE * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex flex-col items-center text-amber-500 dark:text-amber-400"
                >
                  <div className="flex items-center">
                    <ShieldAlert className="w-8 h-8 mr-2" />
                    <span className={clsx(
                      "text-xl font-semibold",
                      isMalayalam && "text-2xl leading-relaxed"
                    )}>{t.suspicious}</span>
                  </div>
                  {/* Confidence Score Indicator */}
                  {isTextAnalysisResult(result) && (
                    <div className="mt-2 flex items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">
                        {t.confidenceScore}: {Math.round(result.CONFIDENCE * 100)}%
                      </span>
                      <div className="w-20 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={clsx(
                            "h-full rounded-full",
                            result.CONFIDENCE > 0.7 ? "bg-green-500" : 
                            result.CONFIDENCE > 0.4 ? "bg-yellow-500" : "bg-red-500"
                          )}
                          style={{ width: `${Math.round(result.CONFIDENCE * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )
            )}
          </div>

          {/* Explanation */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              {getResultTypeIcon()}
              {isTextAnalysisResult(result) && result.ISFAKE === 0 ? 
                <ShieldCheck className="w-4 h-4 ml-1 text-green-500" /> : 
                <ShieldAlert className="w-4 h-4 ml-1 text-amber-500" />}
              <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
                {isMalayalam ? 'വിശദീകരണം' : 'Explanation'}
              </span>
            </div>
            
            {/* Display explanation only in the user's selected language */}
            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
              <p className={clsx(
                "text-gray-700 dark:text-gray-300",
                isMalayalam && "malayalam-text text-base leading-relaxed"
              )}>
                {isTextAnalysisResult(result) && (
                  isMalayalam ? result.EXPLANATION_ML : result.EXPLANATION_EN
                )}
              </p>
            </div>
          </div>

          {/* Writing Style Analysis - Moved to appear right after explanation */}
          {(writingStyle || isUrlAnalysis) && (
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <TrendingUp className="w-4 h-4 mr-1.5 text-blue-500" />
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {isMalayalam ? 'എഴുത്ത് ശൈലി വിശകലനം' : 'Writing Style Analysis'}
                </span>
              </div>
              
              {!writingStyle && isUrlAnalysis ? (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow-inner">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent mr-3"></div>
                    <span className="text-blue-600 dark:text-blue-400">
                      {isMalayalam ? 'എഴുത്ത് ശൈലി വിശകലനം ചെയ്യുന്നു...' : 'Analyzing writing style...'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 p-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-100/50 dark:border-gray-700/50 shadow-sm">
                  {/* Sensationalism Score */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        {t.sensationalismScore}
                      </span>
                      <span className={clsx(
                        "text-sm font-medium",
                        writingStyle && Math.round(writingStyle.sensationalism) > 70 
                          ? "text-red-500 dark:text-red-400"
                          : "text-gray-700 dark:text-gray-200"
                      )}>
                        {writingStyle ? Math.round(writingStyle.sensationalism) : 65}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700/50 rounded-full h-2.5 shadow-inner">
                      <div 
                        className={clsx(
                          "h-2.5 rounded-full shadow-sm transition-all duration-500 ease-out",
                          writingStyle && writingStyle.sensationalism > 70 
                            ? "bg-red-500" 
                            : writingStyle && writingStyle.sensationalism > 40 
                              ? "bg-yellow-500" 
                              : "bg-green-500"
                        )}
                        style={{ width: `${writingStyle ? Math.round(writingStyle.sensationalism) : 65}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Writing Quality Score */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        {t.writingStyleScore}
                      </span>
                      <span className={clsx(
                        "text-sm font-medium",
                        writingStyle && Math.round(writingStyle.writingStyle) > 70 
                          ? "text-green-500 dark:text-green-400"
                          : "text-gray-700 dark:text-gray-200"
                      )}>
                        {writingStyle ? Math.round(writingStyle.writingStyle) : 75}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700/50 rounded-full h-2.5 shadow-inner">
                      <div 
                        className={clsx(
                          "h-2.5 rounded-full shadow-sm transition-all duration-500 ease-out",
                          writingStyle && writingStyle.writingStyle > 70 
                            ? "bg-green-500" 
                            : writingStyle && writingStyle.writingStyle > 40 
                              ? "bg-yellow-500" 
                              : "bg-red-500"
                        )}
                        style={{ width: `${writingStyle ? Math.round(writingStyle.writingStyle) : 75}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Clickbait Score */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        {t.clickbaitScore}
                      </span>
                      <span className={clsx(
                        "text-sm font-medium",
                        writingStyle && Math.round(writingStyle.clickbait) > 70 
                          ? "text-red-500 dark:text-red-400"
                          : "text-gray-700 dark:text-gray-200"
                      )}>
                        {writingStyle ? Math.round(writingStyle.clickbait) : 45}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700/50 rounded-full h-2.5 shadow-inner">
                      <div 
                        className={clsx(
                          "h-2.5 rounded-full shadow-sm transition-all duration-500 ease-out",
                          writingStyle && writingStyle.clickbait > 70 
                            ? "bg-red-500" 
                            : writingStyle && writingStyle.clickbait > 40 
                              ? "bg-yellow-500" 
                              : "bg-green-500"
                        )}
                        style={{ width: `${writingStyle ? Math.round(writingStyle.clickbait) : 45}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Warning for high sensationalism */}
                  {(writingStyle && writingStyle.sensationalism > 70) && (
                    <div className="flex items-center text-amber-500 dark:text-amber-400 mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800/30">
                      <AlertTriangle className="w-4 h-4 mr-2.5 flex-shrink-0" />
                      <span className="text-sm">{t.highSensationalism}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

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
              {content && !isValidUrl(content) && (
                <p className={clsx(
                  "mt-2 text-gray-700 dark:text-gray-300 border-l-2 border-blue-300 pl-3",
                  isMalayalam && "text-base leading-relaxed"
                )}>
                  {content}
                </p>
              )}
            </div>
          )}

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
        </div>
      </GlassCard>
    </motion.div>
  );
};
