import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InputSection } from '../InputSection';
import { ResultCard } from '../ResultCard';
import { ImageResultCard } from '../ImageResultCard';
import { UrlAnalysisCard } from '../UrlAnalysisCard';
import { ComprehensiveAnalysisCard } from '../ComprehensiveAnalysisCard';
import { FeedbackSection } from '../FeedbackSection';
import { LoadingSpinner } from './LoadingSpinner';
import { AnalysisHistory } from '../AnalysisHistory';
import type { AnalysisResult, ImageAnalysisResult, TextAnalysisResult, InputType } from '../../types/analysis';
import { analyzeService } from '../../services/analyzeService';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import clsx from 'clsx';
import { feedbackService } from '../../services/feedbackService';
import { UrlErrorCard } from '../UrlErrorCard';

const DEBUG_OCR = true; // Enable debug mode for OCR

function isTextAnalysisResult(result: AnalysisResult): result is TextAnalysisResult {
  return 'ISFAKE' in result && 'type' in result;
}

function isImageAnalysisResult(result: AnalysisResult): result is ImageAnalysisResult {
  return 'details' in result && 'type' in result;
}

function hasUrlError(result: any): result is { error: { type: string; message: string } } {
  return result && 
         typeof result === 'object' && 
         'error' in result && 
         typeof result.error === 'object' && 
         result.error !== null &&
         'type' in result.error &&
         'message' in result.error;
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

  // Helper function to convert undefined to null for ImageResultCard
  const imageUrlForCard = (url: string | undefined): string | null => url || null;

  const handleAnalyze = async ({ 
    type, 
    content, 
    imageContent 
  }: { 
    type: InputType; 
    content: string; 
    imageContent?: string 
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
      // URL CASE: Analyze URL
      if (type === 'url' && processedContent) {
        try {
          const result = await analyzeService.analyzeUrl(processedContent, user?.id);
          
          // Check if this is a mock result with error information
          if (hasUrlError(result) && result.error.type === 'URL_ERROR') {
            // Handle it as an error by showing the URL error card
            setUrlError({
              message: result.error.message || 'Failed to analyze URL',
              url: processedContent
            });
            
            // Clear any text or image results
            setTextResult(null);
            setImageResult(null);
            setIsAnalyzing(false);
            return;
          }
          
          // Successful URL analysis
          if (isTextAnalysisResult(result)) {
            setTextResult({
              ...result,
              type: 'url'
            });
            
            // If there's an image URL in the input, set it
            if (result.input?.image_url) {
              setCurrentImageContent(result.input.image_url);
            }
            
            // If we have image analysis results from the URL, set them
            if (result.imageAnalysis) {
              setImageResult({
                ...result.imageAnalysis,
                type: 'image'
              });
            }
            
            // Show text analysis
            setActiveResultIndex(0);
          }
        } catch (error: any) {
          console.error('URL analysis failed:', error);
          
          // Set URL error state with clear message
          let errorMessage = '';
          
          // Extract error message based on available data
          if (typeof error === 'string') {
            errorMessage = error;
          } else if (error.message) {
            errorMessage = error.message;
          } else {
            errorMessage = 'An unknown error occurred while analyzing the URL';
          }
          
          // Check if it's a specific error format that includes status code
          if (errorMessage.includes('status 400')) {
            errorMessage = 'Request failed with status 400. Sorry, we had trouble finding contents for the given URL.';
          } else if (errorMessage.includes('status 404')) {
            errorMessage = 'Request failed with status 404. The URL could not be found. Please check if the URL is correct.';
          } else if (errorMessage.includes('status 500')) {
            errorMessage = 'Request failed with status 500. The server encountered an internal error. Please try again later.';
          }
          
          setUrlError({
            message: errorMessage,
            url: processedContent
          });
          
          // Make sure we don't have any text or image results that could trigger other UI components
          setTextResult(null);
          setImageResult(null);
        }
        setIsAnalyzing(false);
        return;
      }
      
      // TEXT ONLY CASE: Analyze text without image
      if (processedContent && !imageContent) {
        try {
          const result = await analyzeService.analyzeContent(processedContent, user?.id);
          if (isTextAnalysisResult(result)) {
            setTextResult({
              ...result,
              type: 'text'
            });
            setActiveResultIndex(0); // Show text analysis
          }
        } catch (error) {
          console.error('Text analysis failed:', error);
          toast.error(
            language === 'ml' 
              ? 'വാചക വിശകലനം പരാജയപ്പെട്ടു' 
              : 'Text analysis failed'
          );
        }
        setIsAnalyzing(false);
        return;
      }

      // IMAGE CASE: Handle image analysis
      if (imageContent) {
        try {
          const result = await analyzeService.analyzeImage(imageContent, processedContent || undefined, user?.id);
          if (isImageAnalysisResult(result)) {
            setImageResult({
              ...result,
              type: 'image'
            });

            // If there's text analysis in the response, set it
            if (result.details?.text_analysis) {
              const extractedText = result.details.text_analysis.extracted_text;
              if (extractedText) {
                setExtractedText(extractedText);
                
                // If no user text was provided, analyze the extracted text
                if (!processedContent) {
                  try {
                    const textResult = await analyzeService.analyzeContent(extractedText, user?.id);
                    if (isTextAnalysisResult(textResult)) {
                      setTextResult({
                        ...textResult,
                        type: 'text'
                      });
                      setCurrentContent(extractedText);
                    }
                  } catch (error) {
                    console.error('Extracted text analysis failed:', error);
                  }
                }
              }
            }

            // If user provided text, analyze it
            if (processedContent) {
              try {
                const textResult = await analyzeService.analyzeContent(processedContent, user?.id);
                if (isTextAnalysisResult(textResult)) {
                  setTextResult({
                    ...textResult,
                    type: 'text'
                  });
                }
              } catch (error) {
                console.error('Text analysis failed:', error);
              }
            }

            // After analysis is complete, show text analysis first if it exists
            setActiveResultIndex(textResult ? 0 : 1);
          }
        } catch (error) {
          console.error('Image analysis failed:', error);
          toast.error(
            language === 'ml' 
              ? 'ചിത്ര വിശകലനം പരാജയപ്പെട്ടു' 
              : 'Image analysis failed'
          );
        }
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error(
        language === 'ml' 
          ? 'വിശകലനം പരാജയപ്പെട്ടു' 
          : 'Analysis failed'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const dataURLtoBlob = (dataURL: string): Blob => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const hasMultipleResults = (
    (textResult && imageResult) || 
    (textResult?.type === 'url' && textResult?.urlAnalysis)
  );

  const navigateResults = (direction: 'next' | 'prev') => {
    const total = getTotalResults();
    if (total <= 1) return;
    setActiveResultIndex((prevIndex) => (prevIndex + (direction === 'next' ? 1 : -1) + total) % total);
  };

  const announceCardChange = (type: 'comprehensive' | 'image' | 'text' | 'url') => {
    // Update announcement based on type
    const message = type === 'image'
      ? language === 'ml' ? 'ചിത്ര വിശകലനം കാണിക്കുന്നു' : 'Showing image analysis'
      : type === 'url'
        ? language === 'ml' ? 'URL വിശകലനം കാണിക്കുന്നു' : 'Showing URL analysis'
        : type === 'comprehensive'
          ? language === 'ml' ? 'സമഗ്ര വിശകലനം കാണിക്കുന്നു' : 'Showing comprehensive analysis'
          : language === 'ml' ? 'വാചക വിശകലനം കാണിക്കുന്നു' : 'Showing text analysis';
    
    // Create and clean up aria live region
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('class', 'sr-only');
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  };

  // Add a function to handle feedback submission
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
        analysisType: currentAnalysisType,
        resultId: currentResultId,
        rating,
        comment,
        userId: user?.id
      });
      toast.success(language === 'ml' ? 'ഫീഡ്\u200cബാക്ക് ലഭിച്ചു!' : 'Feedback submitted!');
      setFeedbackSubmitted(true);
    } catch (error) {
      console.error("Feedback submission failed:", error);
      toast.error(language === 'ml' ? 'ഫീഡ്\u200cബാക്ക് നൽകുന്നതിൽ പിശക്' : 'Failed to submit feedback');
    } finally {
      setFeedbackLoading(false);
    }
  };

  // Add keyboard navigation handler for the entire component
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

  // Calculate total number of results
  const getTotalResults = () => {
    let count = 0;
    if (textResult) count++;
    if (imageResult) count++;
    // Add other potential result types here if needed
    return count;
  };

  // Add a retry handler for URL errors
  const handleRetryUrl = () => {
    if (urlError?.url) {
      const urlToRetry = urlError.url;
      setUrlError(null);
      handleAnalyze({ type: 'url', content: urlToRetry });
    }
  };

  // Refresh history when user changes or component mounts
  useEffect(() => {
    setAnalysisHistoryKey(Date.now());
  }, [user]);

  // Updated handleSelectHistory with better type handling
  const handleSelectHistory = (analysis: any) => {
    setTextResult(null);
    setImageResult(null);
    setUrlError(null);
    setFeedbackSubmitted(false);
    setIsAnalyzing(false);
    setCurrentContent('');
    setCurrentImageContent(null);
    setExtractedText('');

    try {
      const input = analysis.input || {}; // Default to empty object if input is missing
      const result = analysis.result || {}; // Default to empty object if result is missing
      const errorInfo = analysis.error || {}; // Default to empty object if error is missing

      if (analysis.type === 'text' || analysis.type === 'url') {
        if (isTextAnalysisResult(result)) {
          setTextResult({ ...result, type: analysis.type, id: analysis.id });
          setCurrentContent(input.text || input.url || '');
        } else {
           console.warn('History item result is not a valid TextAnalysisResult', result);
           // Optionally set an error state or default view
        }
      } else if (analysis.type === 'image' || analysis.type === 'text_image') {
        if (isImageAnalysisResult(result)) {
          setImageResult({ ...result, type: 'image', id: analysis.id });
          setCurrentImageContent(input.image_url || null);
          setCurrentContent(input.text || '');

          const embeddedTextAnalysis = result.details?.text_analysis;
          if (embeddedTextAnalysis && isTextAnalysisResult(embeddedTextAnalysis)) {
            // Use 'extractedText' property if available, fallback to empty string
            const extracted = embeddedTextAnalysis.extractedText || ''; 
            setTextResult({ ...embeddedTextAnalysis, type: 'text', id: analysis.id });
            setExtractedText(extracted);
          } 
        } else {
           console.warn('History item result is not a valid ImageAnalysisResult', result);
        }
      } else if (analysis.type === 'url_error') {
        setUrlError({ 
          message: errorInfo.message || 'Unknown error from history', 
          url: input.url || '' 
        });
        setCurrentContent(input.url || '');
      } else {
         console.warn(`Unsupported history item type: ${analysis.type}`);
      }
      // Determine active index after processing
      setActiveResultIndex(textResult && isTextAnalysisResult(textResult) ? 0 : (imageResult && isImageAnalysisResult(imageResult) ? 0 : 0));
    } catch (error) {
      console.error("Error loading from history:", error);
      toast.error(language === 'ml' ? 'ചരിത്രത്തിൽ നിന്ന് ലോഡുചെയ്യുന്നതിൽ പിശക്' : 'Error loading from history');
      setTextResult(null);
      setImageResult(null);
      setUrlError(null);
    }
  };

  const feedbackAnalysisType = textResult?.type || imageResult?.type || (urlError ? 'url' : undefined);
  const feedbackResultId = textResult?.id || imageResult?.id;

  return (
    <div className="space-y-8 px-2 sm:px-0">
      <InputSection 
        onAnalyze={handleAnalyze} 
        isAnalyzing={isAnalyzing} 
      />

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
            <UrlErrorCard 
              url={urlError.url} 
              errorMessage={urlError.message} 
              onRetry={handleRetryUrl} 
            />
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
                  {/* Pass only expected props */} 
                  {textResult && activeResultIndex === 0 && (
                    <motion.div key="comprehensive" variants={cardVariants} initial="enter" animate="center" exit="exit" custom={0} layout>
                      <ComprehensiveAnalysisCard textAnalysis={textResult} />
                    </motion.div>
                  )}
                  
                  {/* Pass only expected props */} 
                  {imageResult && activeResultIndex === (textResult ? 1 : 0) && (
                    <motion.div key="image" variants={cardVariants} initial="enter" animate="center" exit="exit" custom={1} layout>
                       <ImageResultCard result={imageResult} imageUrl={currentImageContent} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Navigation Controls */} 
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
      
      {/* Pass only expected props */} 
      {!isAnalyzing && feedbackAnalysisType && feedbackResultId && (
        <FeedbackSection 
          analysisType={feedbackAnalysisType} 
          resultId={feedbackResultId} 
          onFeedback={handleFeedback}
          feedbackLoading={feedbackLoading}
          feedbackSubmitted={feedbackSubmitted}
        />
      )}
      
      {/* Pass only expected props */} 
      {user && (
        <AnalysisHistory key={analysisHistoryKey} userId={user.id} onSelectAnalysis={handleSelectHistory} />
      )}
    </div>
  );
}

// Animation variants for cards
const cardVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
    width: '100%'
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: 'easeOut' }
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
    width: '100%',
    transition: { duration: 0.3, ease: 'easeIn' }
  })
};
