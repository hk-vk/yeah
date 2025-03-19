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
  const cardRefs = {
    image: useRef<HTMLDivElement>(null),
    text: useRef<HTMLDivElement>(null),
    url: useRef<HTMLDivElement>(null)
  };
  const [urlError, setUrlError] = useState<{ message: string; url: string } | null>(null);

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
    if (!hasMultipleResults) return;
    
    // Calculate total number of results
    const totalResults = getTotalResults();
    
    // Calculate new index with wrap-around
    const newIndex = direction === 'next' 
      ? (activeResultIndex + 1) % totalResults
      : (activeResultIndex - 1 + totalResults) % totalResults;
    
    setActiveResultIndex(newIndex);
    
    // Focus appropriate card based on index
    switch(newIndex) {
      case 0:
        // Comprehensive Analysis
        cardRefs.text.current?.focus();
        announceCardChange('comprehensive');
        break;
      case 1:
        // Text Analysis
        cardRefs.text.current?.focus();
        announceCardChange('text');
        break;
      case 2:
        if (textResult?.type === 'url' && textResult?.urlAnalysis) {
          // URL Analysis
          cardRefs.url.current?.focus();
          announceCardChange('url');
        } else if (imageResult) {
          // Image Analysis
          cardRefs.image.current?.focus();
          announceCardChange('image');
        }
        break;
      case 3:
        // Image Analysis (when URL analysis is present)
        cardRefs.image.current?.focus();
        announceCardChange('image');
        break;
    }
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
    try {
      // Get the relevant analysis result ID if available
      const analysisResultId = textResult?.id || imageResult?.id || undefined;
      
      console.log('Submitting feedback with:', {
        analysisResultId,
        rating,
        hasComment: !!comment,
        hasUserId: !!user?.id
      });
      
      // Submit the feedback using the feedback service
      await feedbackService.submitFeedback({
        rating,
        comment: comment || undefined,
        analysis_result_id: analysisResultId,
        user_id: user?.id
      });
      
      toast.success(
        language === 'ml' 
          ? 'നിങ്ങളുടെ പ്രതികരണത്തിന് നന്ദി!' 
          : 'Thank you for your feedback!'
      );
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error(
        language === 'ml' 
          ? 'പ്രതികരണം സമർപ്പിക്കുന്നതിൽ പിശക്' 
          : 'Error submitting feedback'
      );
      return Promise.reject(error);
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
    if (textResult && imageResult) count++; // Comprehensive Analysis
    if (textResult) count++; // Text Analysis
    if (imageResult) count++; // Image Analysis
    if (textResult?.type === 'url' && textResult?.urlAnalysis) count++; // URL Analysis
    return count;
  };

  // Add a retry handler for URL errors
  const handleRetryUrl = () => {
    if (urlError) {
      handleAnalyze({ type: 'url', content: urlError.url });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-indigo-500/5 rounded-3xl blur-3xl -z-10"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 2, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      />
      {user?.id && (
        <AnalysisHistory 
          onSelectAnalysis={(analysis) => {
            // Handle selecting a past analysis
            if (analysis.type === 'text' || analysis.type === 'url') {
              setTextResult({
                ...analysis.result,
                type: analysis.type,
                id: analysis.id
              });
              setCurrentContent(analysis.input.text || analysis.input.url || '');
            } else if (analysis.type === 'image' || analysis.type === 'text_image') {
              setImageResult({
                ...analysis.result,
                type: analysis.type,
                id: analysis.id
              });
              if (analysis.input.text) {
                setCurrentContent(analysis.input.text);
                setTextResult({
                  ...analysis.result,
                  type: 'text',
                  id: analysis.id
                });
              }
              // Handle image URL with type checking
              if (typeof analysis.input.image_url === 'string') {
                setCurrentImageContent(analysis.input.image_url);
              } else {
                setCurrentImageContent(null);
              }
            }
          }} 
        />
      )}
      <InputSection onAnalyze={handleAnalyze} />
      
      <AnimatePresence mode="wait">
        {isAnalyzing ? (
          <LoadingSpinner />
        ) : (
          <>
            {/* URL Error State */}
            {urlError && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="min-h-[400px] mb-24"
              >
                <UrlErrorCard 
                  errorMessage={urlError.message} 
                  url={urlError.url}
                  onRetry={handleRetryUrl}
                />
              </motion.div>
            )}
            
            {/* TEXT-ONLY RESULT */}
            {!urlError && textResult && !imageResult && !(textResult.type === 'url' && textResult.urlAnalysis) && (
              <div className="min-h-[400px] mb-24">
                <ResultCard 
                  result={textResult} 
                  content={currentContent}
                  extractedFromImage={false}
                />
                {/* Feedback Section - Add onFeedback prop */}
                <div className="mt-12">
                  <FeedbackSection onFeedback={handleFeedback} />
                </div>
              </div>
            )}
            
            {/* IMAGE-ONLY RESULT */}
            {!urlError && imageResult && !textResult && (
              <div className="min-h-[400px] mb-24">
                <ImageResultCard 
                  result={imageResult} 
                  imageUrl={currentImageContent} 
                  extractedText={extractedText}
                />
                {/* Feedback Section - Add onFeedback prop */}
                <div className="mt-12">
                  <FeedbackSection onFeedback={handleFeedback} />
                </div>
              </div>
            )}
            
            {/* COMBINED RESULTS WITH SWIPE UI */}
            {!urlError && hasMultipleResults && (
              <div className="min-h-[600px] mb-24" tabIndex={0} 
                   aria-label={language === 'ml' ? 'വിശകലന ഫലങ്ങൾ' : 'Analysis Results'} 
                   role="region"
                   aria-live="polite"
                   aria-roledescription={
                     language === 'ml' 
                       ? 'ഇടത്തേക്കും വലത്തേക്കും അമ്പ് കീകൾ ഉപയോഗിച്ച് ഫലങ്ങൾ മാറ്റുക' 
                       : 'Use left and right arrow keys to switch between results'
                   }>
                {/* Navigation Dots */}
                <div className="flex justify-center space-x-2 mt-4">
                  {/* Comprehensive Analysis Dot */}
                  {textResult && imageResult && (
                    <button
                      onClick={() => setActiveResultIndex(0)}
                      aria-label="Show comprehensive analysis"
                      className={clsx(
                        "w-2 h-2 rounded-full transition-all duration-200",
                        activeResultIndex === 0
                          ? "bg-blue-500 scale-125"
                          : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                      )}
                    />
                  )}
                  
                  {/* Text Analysis Dot */}
                  {textResult && (
                    <button
                      onClick={() => setActiveResultIndex(1)}
                      aria-label="Show text analysis"
                      className={clsx(
                        "w-2 h-2 rounded-full transition-all duration-200",
                        activeResultIndex === 1
                          ? "bg-blue-500 scale-125"
                          : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                      )}
                    />
                  )}

                  {/* Image Analysis Dot */}
                  {imageResult && (
                    <button
                      onClick={() => setActiveResultIndex(2)}
                      aria-label="Show image analysis"
                      className={clsx(
                        "w-2 h-2 rounded-full transition-all duration-200",
                        activeResultIndex === 2
                          ? "bg-blue-500 scale-125"
                          : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                      )}
                    />
                  )}

                  {/* URL Analysis Dot */}
                  {textResult?.type === 'url' && textResult?.urlAnalysis && (
                    <button
                      onClick={() => setActiveResultIndex(3)}
                      aria-label="Show URL analysis"
                      className={clsx(
                        "w-2 h-2 rounded-full transition-all duration-200",
                        activeResultIndex === 3
                          ? "bg-blue-500 scale-125"
                          : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                      )}
                    />
                  )}
                </div>

                {/* Results Cards */}
                <div className="relative mt-6">
                  <div className="flex-grow w-full" style={{ height: '1px' }}></div>
                  
                  {/* Comprehensive Analysis Card */}
                  {textResult && imageResult && (
                    <div 
                      className={clsx(
                        "transition-all duration-500 w-full max-w-4xl mx-auto",
                        activeResultIndex === 0 ? "opacity-100 block" : "opacity-0 hidden"
                      )}
                      tabIndex={activeResultIndex === 0 ? 0 : -1}
                      onKeyDown={(e) => {
                        if (e.key === 'ArrowRight') {
                          e.preventDefault();
                          navigateResults('next');
                        } else if (e.key === 'ArrowLeft') {
                          e.preventDefault();
                          navigateResults('prev');
                        }
                      }}
                    >
                      <ComprehensiveAnalysisCard
                        textAnalysis={textResult}
                        imageAnalysis={imageResult}
                        urlAnalysis={textResult.urlAnalysis}
                      />
                    </div>
                  )}

                  {/* Text Analysis Card */}
                  {textResult && (
                    <div 
                      className={clsx(
                        "transition-all duration-500 w-full max-w-4xl mx-auto",
                        activeResultIndex === 1 ? "opacity-100 block" : "opacity-0 hidden"
                      )}
                      tabIndex={activeResultIndex === 1 ? 0 : -1}
                      onKeyDown={(e) => {
                        if (e.key === 'ArrowRight') {
                          e.preventDefault();
                          navigateResults('next');
                        } else if (e.key === 'ArrowLeft') {
                          e.preventDefault();
                          navigateResults('prev');
                        }
                      }}
                    >
                      <ResultCard 
                        result={textResult} 
                        content={currentContent}
                        extractedFromImage={false}
                      />
                    </div>
                  )}

                  {/* Image Analysis Card */}
                  {imageResult && (
                    <div 
                      className={clsx(
                        "transition-all duration-500 w-full max-w-4xl mx-auto",
                        activeResultIndex === 2 ? "opacity-100 block" : "opacity-0 hidden"
                      )}
                      tabIndex={activeResultIndex === 2 ? 0 : -1}
                      onKeyDown={(e) => {
                        if (e.key === 'ArrowRight') {
                          e.preventDefault();
                          navigateResults('next');
                        } else if (e.key === 'ArrowLeft') {
                          e.preventDefault();
                          navigateResults('prev');
                        }
                      }}
                    >
                      <ImageResultCard
                        result={imageResult}
                        imageUrl={currentImageContent}
                        extractedText={extractedText}
                      />
                    </div>
                  )}

                  {/* URL Analysis Card */}
                  {textResult?.type === 'url' && textResult?.urlAnalysis && (
                    <div 
                      className={clsx(
                        "transition-all duration-500 w-full max-w-4xl mx-auto",
                        activeResultIndex === 3 ? "opacity-100 block" : "opacity-0 hidden"
                      )}
                      tabIndex={activeResultIndex === 3 ? 0 : -1}
                      onKeyDown={(e) => {
                        if (e.key === 'ArrowRight') {
                          e.preventDefault();
                          navigateResults('next');
                        } else if (e.key === 'ArrowLeft') {
                          e.preventDefault();
                          navigateResults('prev');
                        }
                      }}
                    >
                      <UrlAnalysisCard 
                        urlAnalysis={textResult.urlAnalysis}
                        onNavigate={navigateResults}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
