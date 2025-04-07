import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InputSection } from '../InputSection';
import { ImageResultCard } from '../ImageResultCard';
import { ComprehensiveAnalysisCard } from '../ComprehensiveAnalysisCard';
import { FeedbackSection } from '../FeedbackSection';
import { LoadingSpinner } from './LoadingSpinner';
import { AnalysisHistory } from '../AnalysisHistory';
import type { AnalysisResult, ImageAnalysisResult, TextAnalysisResult, InputType, HistoryItem } from '../../types';
import { analyzeService } from '../../services/analyzeService';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { feedbackService } from '../../services/feedbackService';
import { UrlErrorCard } from '../UrlErrorCard';
import { UrlAnalysisCard } from '../UrlAnalysisCard';

// Type guards
function isTextAnalysisResult(result: any): result is TextAnalysisResult {
  return result && ('ISFAKE' in result || 'verdict' in result) && 'type' in result;
}

function isImageAnalysisResult(result: any): result is ImageAnalysisResult {
  return result && 'details' in result && 'type' in result;
}

// Function to determine the correct card order when dealing with URL analysis
const getCardType = (index: number, textResult: TextAnalysisResult | null, imageResult: ImageAnalysisResult | null): string => {
  // For URL analysis with image: 0=Comprehensive, 1=Image, 2=URL Analysis
  if (textResult?.type === 'url' && textResult.imageAnalysis) {
    if (index === 0) return 'comprehensive';
    if (index === 1) return 'image';
    if (index === 2) return 'url';
  } 
  // For URL analysis without image: 0=Comprehensive, 1=URL Analysis
  else if (textResult?.type === 'url' && textResult.urlAnalysis) {
    if (index === 0) return 'comprehensive';
    if (index === 1) return 'url';
  } 
  // For image only analysis: 0=Image
  else if (imageResult && !textResult) {
    return 'image';
  } 
  // For text+image analysis: 0=Comprehensive, 1=Image
  else if (textResult && imageResult) {
    if (index === 0) return 'comprehensive';
    if (index === 1) return 'image';
  }
  // Simple text analysis: just show comprehensive
  else if (textResult) {
    return 'comprehensive';
  }
  
  // Default case
  return 'none';
};

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
        try {
          const result = await analyzeService.analyzeUrl(processedContent, user?.id);

          if (
            result && 
            typeof result === 'object' && 
            'error' in result && 
            typeof result.error === 'object' && 
            result.error !== null &&
            'type' in result.error &&
            result.error.type === 'URL_ERROR'
          ) {
            const errorMessage = (typeof (result.error as any).message === 'string') 
              ? (result.error as any).message 
              : 'Failed to analyze URL';
              
            setUrlError({
              message: errorMessage,
              url: processedContent,
            });
            setTextResult(null);
            setImageResult(null);
            setIsAnalyzing(false);
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
              setImageResult({
                ...result.imageAnalysis,
                type: 'image',
              });
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
            url: processedContent,
          });

          setTextResult(null);
          setImageResult(null);
        }
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

            // Update active index again after text analysis completes
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
    
    // Calculate next index with wrapping
    const newIndex = (activeResultIndex + (direction === 'next' ? 1 : -1) + total) % total;
    
    // Verify the new index is valid by checking if there's a card type for it
    if (getCardType(newIndex, textResult, imageResult) !== 'none') {
      setActiveResultIndex(newIndex);
    } else {
      // Skip this invalid index and try the next one
      setActiveResultIndex((activeResultIndex + (direction === 'next' ? 2 : -2) + total) % total);
    }
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
    // For URL analysis with image
    if (textResult?.type === 'url' && textResult.imageAnalysis && textResult.urlAnalysis) {
      return 3; // Comprehensive, Image, URL
    }
    // For URL analysis without image
    else if (textResult?.type === 'url' && textResult.urlAnalysis) {
      return 2; // Comprehensive, URL
    }
    // For image only analysis
    else if (imageResult && !textResult) {
      return 1; // Image only
    }
    // For text + image analysis
    else if (textResult && imageResult) {
      return 2; // Comprehensive, Image
    }
    // For text only analysis
    else if (textResult) {
      return 1; // Comprehensive only
    }
    
    return 0; // No results
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

  const handleSelectHistory = (item: HistoryItem) => {
    setTextResult(null);
    setImageResult(null);
    setUrlError(null);
    setFeedbackSubmitted(false);
    setIsAnalyzing(false);
    setCurrentContent('');
    setCurrentImageContent(null);
    setExtractedText('');

    try {
      const inputData = item.input || {};
      const resultData = item.result || {};

      switch (item.type) {
        case 'text':
        case 'url':
          setCurrentContent(inputData.text || inputData.url || '');
          if (isTextAnalysisResult(resultData)) {
            setTextResult({ ...resultData, type: item.type as 'text' | 'url' });
          } else {
            console.warn('History item result does not match TextAnalysisResult structure', resultData);
            toast.error('Error loading text/url history item');
          }
          setActiveResultIndex(0);
          break;
        case 'image':
          setCurrentImageContent(inputData.image_url || null);
          if (isImageAnalysisResult(resultData)) {
            setImageResult({ ...resultData, type: 'image' });
          } else {
            console.warn('History item result does not match ImageAnalysisResult structure', resultData);
            toast.error('Error loading image history item');
          }
          setActiveResultIndex(0);
          break;
        case 'text_image':
          setCurrentContent(inputData.text || '');
          setCurrentImageContent(inputData.image_url || null);
          
          if (isImageAnalysisResult(resultData)) {
             setImageResult({ ...resultData, type: 'text_image' });

             if (resultData.details?.text_analysis && isTextAnalysisResult(resultData.details.text_analysis)) {
               setTextResult({ ...resultData.details.text_analysis, type: 'text' }); 
               setExtractedText(resultData.details.text_analysis.extracted_text || '');
             } else {
               setTextResult(null);
             }
          } else {
             console.warn('History item result does not match ImageAnalysisResult structure for text_image', resultData);
             toast.error('Error loading text+image history item');
          }
          setActiveResultIndex(resultData.details?.text_analysis ? 0 : 1);
          break;
        default:
          console.warn('Unknown history item type:', item.type);
          toast.error('Unknown analysis type in history');
          break;
      }
    } catch (error) {
      console.error('Error processing history item:', error);
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
                  {/* Comprehensive Analysis Card */}
                  {(getCardType(activeResultIndex, textResult, imageResult) === 'comprehensive' && textResult) && (
                    <motion.div
                      key="comprehensive"
                      variants={cardVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      custom={activeResultIndex}
                      layout
                    >
                      <ComprehensiveAnalysisCard 
                        textAnalysis={textResult} 
                        imageAnalysis={textResult.type === 'url' ? textResult.imageAnalysis : null}
                        urlAnalysis={textResult.type === 'url' ? textResult.urlAnalysis : null}
                      />
                    </motion.div>
                  )}

                  {/* Image Analysis Card */}
                  {(getCardType(activeResultIndex, textResult, imageResult) === 'image') && (
                    <motion.div
                      key="image"
                      variants={cardVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      custom={activeResultIndex}
                      layout
                    >
                      <ImageResultCard 
                        result={imageResult || (textResult?.imageAnalysis as ImageAnalysisResult)} 
                        imageUrl={currentImageContent}
                        extractedText={extractedText}
                      />
                    </motion.div>
                  )}
                  
                  {/* URL Analysis Card */}
                  {(getCardType(activeResultIndex, textResult, imageResult) === 'url' && textResult?.type === 'url' && textResult.urlAnalysis) && (
                    <motion.div
                      key="url"
                      variants={cardVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      custom={activeResultIndex}
                      layout
                    >
                      <UrlAnalysisCard 
                        urlAnalysis={textResult.urlAnalysis}
                        onNavigate={navigateResults}
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
          analysisId={feedbackResultId}
          onFeedback={handleFeedback}
        />
      )}

      {user && (
        <AnalysisHistory key={analysisHistoryKey} onSelectAnalysis={handleSelectHistory} />
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
