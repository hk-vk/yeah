import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InputSection } from '../InputSection';
import { ResultCard } from '../ResultCard';
import { ImageResultCard } from '../ImageResultCard';
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

const DEBUG_OCR = true; // Enable debug mode for OCR

function isTextAnalysisResult(result: AnalysisResult): result is TextAnalysisResult {
  return 'ISFAKE' in result && 'type' in result;
}

function isImageAnalysisResult(result: AnalysisResult): result is ImageAnalysisResult {
  return 'details' in result && 'type' in result;
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
    text: useRef<HTMLDivElement>(null)
  };

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
    
    const processedContent = content.trim();
    setCurrentContent(processedContent);
    setCurrentImageContent(imageContent || null);
    
    try {
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

  const hasMultipleResults = imageResult && textResult;

  const navigateResults = (direction: 'next' | 'prev') => {
    const newIndex = direction === 'next' ? 1 : 0;
    setActiveResultIndex(newIndex);
    const ref = newIndex === 0 ? cardRefs.text : cardRefs.image;
    ref.current?.focus();
    announceCardChange(newIndex === 0 ? 'text' : 'image');
  };

  const announceCardChange = (type: 'image' | 'text') => {
    const message = type === 'image'
      ? (language === 'ml' ? 'ചിത്ര വിശകലനം കാണിക്കുന്നു' : 'Showing image analysis')
      : (language === 'ml' ? 'വാചക വിശകലനം കാണിക്കുന്നു' : 'Showing text analysis');
    
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

  // Add keyboard navigation handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!hasMultipleResults) return;
      
      if (e.key === 'ArrowRight' && activeResultIndex === 0) {
        e.preventDefault();
        setActiveResultIndex(1);
        cardRefs.image.current?.focus();
        announceCardChange('image');
      } else if (e.key === 'ArrowLeft' && activeResultIndex === 1) {
        e.preventDefault();
        setActiveResultIndex(0);
        cardRefs.text.current?.focus();
        announceCardChange('text');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasMultipleResults, activeResultIndex]);

  return (
    <div className="relative space-y-8 max-w-4xl mx-auto">
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
            {/* TEXT-ONLY RESULT */}
            {textResult && !imageResult && (
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
            {imageResult && !textResult && (
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
            {hasMultipleResults && (
              <div className="min-h-[600px] mb-24" tabIndex={0} 
                   aria-label={language === 'ml' ? 'വിശകലന ഫലങ്ങൾ' : 'Analysis Results'} 
                   role="region"
                   aria-live="polite"
                   aria-roledescription={
                     language === 'ml' 
                       ? 'ഇടത്തേക്കും വലത്തേക്കും അമ്പ് കീകൾ ഉപയോഗിച്ച് ഫലങ്ങൾ മാറ്റുക' 
                       : 'Use left and right arrow keys to switch between results'
                   }>
                <div className={clsx(
                  "transition-opacity duration-300",
                  activeResultIndex === 0 ? "opacity-100" : "opacity-0 hidden"
                )}>
                  <div
                    ref={cardRefs.text}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowRight') {
                        e.preventDefault();
                        navigateResults('next');
                      }
                    }}
                    className="outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-lg"
                  >
                    <ResultCard 
                      result={textResult} 
                      content={currentContent}
                      extractedFromImage={!!extractedText && !currentContent}
                    />
                  </div>
                </div>
                
                <div className={clsx(
                  "transition-opacity duration-300",
                  activeResultIndex === 1 ? "opacity-100" : "opacity-0 hidden"
                )}>
                  <div
                    ref={cardRefs.image}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowLeft') {
                        e.preventDefault();
                        navigateResults('prev');
                      }
                    }}
                    className="outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-lg"
                  >
                    <ImageResultCard 
                      result={imageResult} 
                      imageUrl={currentImageContent} 
                      extractedText={extractedText}
                    />
                  </div>
                </div>

                {/* Navigation Controls */}
                <div className="flex flex-col items-center mt-8 space-y-4">
                  <div className="flex justify-center items-center space-x-4">
                    <button
                      onClick={() => navigateResults('prev')}
                      disabled={activeResultIndex === 0}
                      className={`p-2 rounded-full flex items-center justify-center ${
                        activeResultIndex === 0 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-blue-500 hover:bg-blue-50'
                      }`}
                      aria-label={language === 'ml' ? 'മുൻപത്തെ ഫലം' : 'Previous result'}
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setActiveResultIndex(0)}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          activeResultIndex === 0 
                            ? 'bg-blue-500' 
                            : 'bg-gray-300 hover:bg-blue-200'
                        }`}
                        aria-label={language === 'ml' ? 'വാചക വിശകലനം കാണിക്കുക' : 'Show text analysis'}
                        aria-pressed={activeResultIndex === 0}
                      />
                      <button
                        onClick={() => setActiveResultIndex(1)}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          activeResultIndex === 1 
                            ? 'bg-blue-500' 
                            : 'bg-gray-300 hover:bg-blue-200'
                        }`}
                        aria-label={language === 'ml' ? 'ചിത്ര വിശകലനം കാണിക്കുക' : 'Show image analysis'}
                        aria-pressed={activeResultIndex === 1}
                      />
                    </div>
                    
                    <button
                      onClick={() => navigateResults('next')}
                      disabled={activeResultIndex === 1}
                      className={`p-2 rounded-full flex items-center justify-center ${
                        activeResultIndex === 1 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-blue-500 hover:bg-blue-50'
                      }`}
                      aria-label={language === 'ml' ? 'അടുത്ത ഫലം' : 'Next result'}
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
                  
                  {/* Keyboard Navigation Hint */}
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {language === 'ml' 
                      ? 'ഇടത്തേക്കും വലത്തേക്കും അമ്പ് കീകൾ ഉപയോഗിച്ച് മാറുക ↔️'
                      : 'Use left and right arrow keys to switch ↔️'}
                  </p>
                </div>
                
                {/* Feedback Section - Add onFeedback prop */}
                <div className="mt-12">
                  <FeedbackSection onFeedback={handleFeedback} />
                </div>
              </div>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
