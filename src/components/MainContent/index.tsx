import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InputSection } from '../InputSection';
import { ImageResultCard } from '../ImageResultCard';
import { ComprehensiveAnalysisCard } from '../ComprehensiveAnalysisCard';
import { FeedbackSection } from '../FeedbackSection';
import { LoadingSpinner } from './LoadingSpinner';
import { AnalysisHistory } from '../AnalysisHistory';
import type { AnalysisResult, ImageAnalysisResult, TextAnalysisResult, InputType, BaseAnalysisResult } from '../../types/analysis';
import { analyzeService } from '../../services/analyzeService';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { feedbackService } from '../../services/feedbackService';
import { UrlErrorCard } from '../UrlErrorCard';
import { UrlAnalysisCard } from '../UrlAnalysisCard';

interface AnalysisError {
  error: { type: string; message: string };
}

// Type guards
function isTextAnalysisResult(result: any): result is TextAnalysisResult {
  return result && ('ISFAKE' in result || 'verdict' in result) && 'type' in result;
}

function isImageAnalysisResult(result: any): result is ImageAnalysisResult {
  return result && 'details' in result && 'type' in result;
}

export function MainContent() {
  const [textResult, setTextResult] = useState<TextAnalysisResult | null>(null);
  const [imageResult, setImageResult] = useState<ImageAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentContent, setCurrentContent] = useState<string>('');
  const [currentImageContent, setCurrentImageContent] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [activeResultIndex, setActiveResultIndex] = useState(0);
  const { language } = useLanguage();
  const { user } = useAuth();
  const [urlError, setUrlError] = useState<{ message: string; url: string } | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [analysisHistoryKey, setAnalysisHistoryKey] = useState(Date.now());

  const handleAnalyzeUrl = async (url: string) => {
    try {
      const result = await analyzeService.analyzeUrl(url, user?.id);

      if (result && 'error' in result) {
        const urlError = result as AnalysisError;
        setUrlError({
          message: urlError.error.message || 'Failed to analyze URL',
          url: url,
        });
        setTextResult(null);
        setImageResult(null);
        return;
      }

      if (isTextAnalysisResult(result)) {
        setTextResult({
          ...result,
          type: 'url',
        });

        if (result.input?.image_url) {
          setCurrentImageContent(result.input.image_url);
        }

        if (result.imageAnalysis) {
          setImageResult(result.imageAnalysis);
        }

        setActiveResultIndex(0);
      }
    } catch (error: any) {
      console.error('URL analysis failed:', error);
      let errorMessage = '';

      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error.message) {
        errorMessage = error.message;
      } else {
        errorMessage = 'An unknown error occurred while analyzing the URL';
      }

      if (errorMessage.includes('status 400')) {
        errorMessage = 'Request failed with status 400. Sorry, we had trouble finding contents for the given URL.';
      } else if (errorMessage.includes('status 404')) {
        errorMessage = 'Request failed with status 404. The URL could not be found. Please check if the URL is correct.';
      } else if (errorMessage.includes('status 500')) {
        errorMessage = 'Request failed with status 500. The server encountered an internal error. Please try again later.';
      }

      setUrlError({
        message: errorMessage,
        url: url,
      });

      setTextResult(null);
      setImageResult(null);
    }
  };

  const handleAnalyze = async ({
    type,
    content,
    imageContent,
  }: {
    type: InputType;
    content: string;
    imageContent?: string;
  }) => {
    setIsAnalyzing(true);
    setTextResult(null);
    setImageResult(null);
    setExtractedText('');
    setUrlError(null);

    const processedContent = content.trim();
    setCurrentContent(processedContent);
    setCurrentImageContent(imageContent || null);

    try {
      if (type === 'url' && processedContent) {
        await handleAnalyzeUrl(processedContent);
        setIsAnalyzing(false);
        return;
      }

      if (processedContent && !imageContent) {
        try {
          const result = await analyzeService.analyzeContent(processedContent, user?.id);
          if (isTextAnalysisResult(result)) {
            setTextResult({
              ...result,
              type: 'text',
            });
            setActiveResultIndex(0);
          }
        } catch (error) {
          console.error('Text analysis failed:', error);
          toast.error(language === 'ml' ? 'വാചക വിശകലനം പരാജയപ്പെട്ടു' : 'Text analysis failed');
        }
        setIsAnalyzing(false);
        return;
      }

      if (imageContent) {
        try {
          const result = await analyzeService.analyzeImage(imageContent, processedContent || undefined, user?.id);
          if (isImageAnalysisResult(result)) {
            setImageResult({
              ...result,
              type: 'image',
            });

            if (result.details?.text_analysis) {
              const extractedText = result.details.text_analysis.extracted_text;
              if (extractedText) {
                setExtractedText(extractedText);

                if (!processedContent) {
                  try {
                    const textResult = await analyzeService.analyzeContent(extractedText, user?.id);
                    if (isTextAnalysisResult(textResult)) {
                      setTextResult({
                        ...textResult,
                        type: 'text',
                      });
                      setCurrentContent(extractedText);
                    }
                  } catch (error) {
                    console.error('Extracted text analysis failed:', error);
                  }
                }
              }
            }

            if (processedContent) {
              try {
                const textResult = await analyzeService.analyzeContent(processedContent, user?.id);
                if (isTextAnalysisResult(textResult)) {
                  setTextResult({
                    ...textResult,
                    type: 'text',
                  });
                }
              } catch (error) {
                console.error('Text analysis failed:', error);
              }
            }

            setActiveResultIndex(textResult ? 0 : 1);
          }
        } catch (error) {
          console.error('Image analysis failed:', error);
          toast.error(language === 'ml' ? 'ചിത്ര വിശകലനം പരാജയപ്പെട്ടു' : 'Image analysis failed');
        }
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error(language === 'ml' ? 'വിശകലനം പരാജയപ്പെട്ടു' : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const hasMultipleResults = (textResult && imageResult) || (textResult?.type === 'url' && textResult?.urlAnalysis);

  const navigateResults = (direction: 'next' | 'prev') => {
    const total = getTotalResults();
    if (total <= 1) return;
    setActiveResultIndex((prevIndex) => (prevIndex + (direction === 'next' ? 1 : -1) + total) % total);
  };

  const handleFeedback = async (rating: number, comment?: string) => {
    const currentAnalysisType = textResult?.type || imageResult?.type || (urlError ? 'url' : undefined);
    const currentResultId = textResult?.id || imageResult?.id;

    if (!currentAnalysisType || !currentResultId) {
      toast.error(language === 'ml' ? 'ഫീഡ്\u200cബാക്ക് നൽകുന്നതിൽ പിശക്' : 'Error submitting feedback');
      return;
    }

    setFeedbackLoading(true);
    setFeedbackSubmitted(false);
    try {
      await feedbackService.submitFeedback({
        analysis_result_id: currentResultId,
        rating,
        comment,
        user_id: user?.id,
      });
      toast.success(language === 'ml' ? 'ഫീഡ്\u200cബാക്ക് ലഭിച്ചു!' : 'Feedback submitted!');
      setFeedbackSubmitted(true);
    } catch (error) {
      console.error('Feedback submission failed:', error);
      toast.error(language === 'ml' ? 'ഫീഡ്\u200cബാക്ക് നൽകുന്നതിൽ പിശക്' : 'Failed to submit feedback');
    } finally {
      setFeedbackLoading(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!hasMultipleResults) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigateResults('next');
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigateResults('prev');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [hasMultipleResults, navigateResults]);

  const getTotalResults = () => {
    let count = 0;
    if (textResult) {
      count++; // Comprehensive Analysis
      if (textResult.type === 'url') {
        if (textResult.urlAnalysis) count++; // URL Analysis
        if (textResult.imageAnalysis) count++; // Image Analysis if available
      }
    }
    if (imageResult) count++;
    return count;
  };

  const handleRetryUrl = () => {
    if (urlError?.url) {
      const urlToRetry = urlError.url;
      setUrlError(null);
      handleAnalyze({ type: 'url', content: urlToRetry });
    }
  };

  useEffect(() => {
    setAnalysisHistoryKey(Date.now());
  }, [user]);

  const handleSelectHistory = (analysis: BaseAnalysisResult) => {
    setTextResult(null);
    setImageResult(null);
    setUrlError(null);
    setFeedbackSubmitted(false);
    setIsAnalyzing(false);
    setCurrentContent('');
    setCurrentImageContent(null);
    setExtractedText('');

    try {
      const input = analysis.input || {};
      
      if (input.text) setCurrentContent(input.text);
      if (input.url) setCurrentContent(input.url);
      if (input.image_url) setCurrentImageContent(input.image_url);

      switch (analysis.type) {
        case 'text':
        case 'url':
          setTextResult(analysis as TextAnalysisResult);
          setActiveResultIndex(0);
          break;
        case 'image':
          setImageResult(analysis as ImageAnalysisResult);
          setActiveResultIndex(0);
          break;
        case 'text_image':
          if ('details' in analysis && analysis.details?.text_analysis) {
            setTextResult({
              ...analysis,
              type: 'text',
              ISFAKE: 0,
              CONFIDENCE: 1,
              EXPLANATION_EN: '',
              EXPLANATION_ML: ''
            });
            setExtractedText(analysis.details.text_analysis.extractedText || 
                           analysis.details.text_analysis.extracted_text || '');
          }
          setImageResult(analysis as ImageAnalysisResult);
          setActiveResultIndex(analysis.details?.text_analysis ? 0 : 1);
          break;
      }
    } catch (error) {
      console.error('Error loading from history:', error);
      toast.error(language === 'ml' ? 'ചരിത്രത്തിൽ നിന്ന് ലോഡുചെയ്യുന്നതിൽ പിശക്' : 'Error loading from history');
    }
  };

  const feedbackAnalysisType = textResult?.type || imageResult?.type || (urlError ? 'url' : undefined);
  const feedbackResultId = textResult?.id || imageResult?.id;

  return (
    <div className="space-y-8 px-2 sm:px-0">
      <InputSection onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />

      <AnimatePresence mode="wait">
        {isAnalyzing && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center items-center py-12"
          >
            <LoadingSpinner />
          </motion.div>
        )}

        {!isAnalyzing && urlError && (
          <motion.div
            key="url-error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <UrlErrorCard url={urlError.url} errorMessage={urlError.message} onRetry={handleRetryUrl} />
          </motion.div>
        )}

        {!isAnalyzing && !urlError && (textResult || imageResult) && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <div className="flex flex-col space-y-6">
              <div className="relative overflow-hidden min-h-[400px]">
                <AnimatePresence initial={false} custom={activeResultIndex} mode="popLayout">
                  {/* Comprehensive Analysis */}
                  {textResult && activeResultIndex === 0 && (
                    <motion.div
                      key="comprehensive"
                      variants={cardVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      custom={0}
                      layout
                    >
                      <ComprehensiveAnalysisCard 
                        textAnalysis={textResult} 
                        imageAnalysis={textResult.type === 'url' ? textResult.imageAnalysis : null}
                        urlAnalysis={textResult.type === 'url' ? textResult.urlAnalysis : null}
                      />
                    </motion.div>
                  )}

                  {/* URL Analysis */}
                  {textResult?.type === 'url' && textResult.urlAnalysis && activeResultIndex === 1 && (
                    <motion.div
                      key="url"
                      variants={cardVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      custom={1}
                      layout
                    >
                      <UrlAnalysisCard 
                        urlAnalysis={textResult.urlAnalysis}
                        onNavigate={navigateResults}
                      />
                    </motion.div>
                  )}

                  {/* Image Analysis - either from URL or direct upload */}
                  {((textResult?.type === 'url' && textResult.imageAnalysis && activeResultIndex === 2) ||
                    (imageResult && activeResultIndex === (textResult ? 1 : 0))) && (
                    <motion.div
                      key="image"
                      variants={cardVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      custom={2}
                      layout
                    >
                      <ImageResultCard 
                        result={textResult?.type === 'url' ? textResult.imageAnalysis : imageResult} 
                        imageUrl={currentImageContent}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Navigation controls */}
              {getTotalResults() > 1 && (
                <div className="flex justify-center items-center space-x-4 mt-4">
                  <button
                    onClick={() => navigateResults('prev')}
                    className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Previous result"
                    disabled={isAnalyzing}
                  >
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {activeResultIndex + 1} / {getTotalResults()}
                  </span>
                  <button
                    onClick={() => navigateResults('next')}
                    className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Next result"
                    disabled={isAnalyzing}
                  >
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isAnalyzing && feedbackAnalysisType && feedbackResultId && (
        <FeedbackSection
          analysisType={feedbackAnalysisType}
          resultId={feedbackResultId}
          onFeedback={handleFeedback}
          feedbackLoading={feedbackLoading}
          feedbackSubmitted={feedbackSubmitted}
        />
      )}

      {user && (
        <AnalysisHistory key={analysisHistoryKey} userId={user.id} onSelectAnalysis={handleSelectHistory} />
      )}
    </div>
  );
}

const cardVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
    width: '100%',
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
    width: '100%',
    transition: { duration: 0.3, ease: 'easeIn' },
  }),
};
