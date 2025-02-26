import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InputSection } from '../InputSection';
import { ResultCard } from '../ResultCard';
import { ImageResultCard } from '../ImageResultCard';
import { FeedbackSection } from '../FeedbackSection';
import { LoadingSpinner } from './LoadingSpinner';
import type { AnalysisResult, InputType } from '../../types';
import { analyzeService } from '../../services/analyzeService';
import { ocrService } from '../../services/ocrService';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLanguage } from '../../contexts/LanguageContext';
import clsx from 'clsx';

interface ImageAnalysisResult {
  verdict: string;
  score: number;
  details: {
    ai_generated: boolean;
    reverse_search: {
      found: boolean;
      matches?: any[];
    };
    deepfake: boolean;
    tampering_analysis: boolean;
    image_caption: string;
    text_analysis?: {
      user_text: string;
      extracted_text: string;
      mismatch: boolean;
      context_similarity: number;
      context_mismatch: boolean;
    };
  };
}

export function MainContent() {
  const [textResult, setTextResult] = useState<AnalysisResult | null>(null);
  const [imageResult, setImageResult] = useState<ImageAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentContent, setCurrentContent] = useState<string>('');
  const [currentImageContent, setCurrentImageContent] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [analysisType, setAnalysisType] = useState<InputType>('text');
  const [activeResultIndex, setActiveResultIndex] = useState(0);
  const { language } = useLanguage();

  // Add keyboard navigation controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keyboard navigation if we have both results
      if (textResult && imageResult) {
        if (e.key === 'ArrowLeft' && activeResultIndex === 1) {
          navigateResults('prev');
        } else if (e.key === 'ArrowRight' && activeResultIndex === 0) {
          navigateResults('next');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeResultIndex, textResult, imageResult]);

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
    setAnalysisType(type);
    
    const processedContent = content.trim();
    setCurrentContent(processedContent);
    setCurrentImageContent(imageContent || null);
    
    try {
      // TEXT ONLY CASE: Analyze text without image
      if (processedContent && !imageContent) {
        try {
          const textResult = await analyzeService.analyzeContent(processedContent);
          setTextResult(textResult);
          setActiveResultIndex(0); // Default to showing text result for text-only input
        } catch (error) {
          console.error('Text analysis failed:', error);
          toast.error('Text analysis failed. Please try again.');
        }
        setIsAnalyzing(false);
        return;
      }

      // Perform OCR on image if available
      let detectedText = '';
      if (imageContent) {
        try {
          const ocrToastId = toast.loading(
            language === 'ml' 
              ? 'ചിത്രത്തിൽ നിന്ന് വാചകം കണ്ടെത്തുന്നു...' 
              : 'Detecting text from image...'
          );
          
          // Use a timeout to ensure we don't wait forever
          const timeoutPromise = new Promise<{text: string, confidence: number}>((_, reject) => {
            setTimeout(() => reject(new Error('OCR timed out')), 30000);
          });
          
          // Race between OCR and timeout
          const { text, confidence } = await Promise.race([
            ocrService.detectText(imageContent),
            timeoutPromise
          ]);
          
          detectedText = text;
          setExtractedText(text);
          
          if (text && text.length > 5) {
            toast.success(
              language === 'ml' 
                ? 'ചിത്രത്തിൽ നിന്ന് വാചകം കണ്ടെത്തി' 
                : 'Text detected from image',
              { id: ocrToastId }
            );
            console.log('Detected text from image:', text, 'Confidence:', confidence);
          } else {
            toast.dismiss(ocrToastId);
          }
        } catch (ocrError) {
          console.error('OCR failed:', ocrError);
          toast.error(
            language === 'ml' 
              ? 'ചിത്രത്തിൽ നിന്ന് വാചകം കണ്ടെത്താൻ കഴിഞ്ഞില്ല' 
              : 'Could not detect text from image'
          );
        }
      }
      
      // IMAGE ONLY CASE with extracted text
      if (imageContent && !processedContent && detectedText.length > 10) {
        // Run both image analysis and text analysis from extracted text
        const imageBlob = dataURLtoBlob(imageContent);
        const formData = new FormData();
        formData.append('image', imageBlob, 'image.jpg');
        
        const [imageAnalysisResult, textAnalysisResult] = await Promise.allSettled([
          // Image analysis
          fetch('https://settling-presently-giraffe.ngrok-free.app/analyze', {
            method: 'POST',
            body: formData,
            mode: 'cors',
          }).then(response => {
            if (!response.ok) {
              throw new Error(`Image analysis failed with status: ${response.status}`);
            }
            return response.json();
          }),
          // Text analysis of the extracted text
          analyzeService.analyzeContent(detectedText)
        ]);
        
        if (imageAnalysisResult.status === 'fulfilled') {
          setImageResult(imageAnalysisResult.value);
        } else {
          toast.error(
            language === 'ml' 
              ? 'ചിത്ര വിശകലനം പരാജയപ്പെട്ടു. ദയവായി വീണ്ടും ശ്രമിക്കുക.' 
              : 'Image analysis failed. Please try again.'
          );
        }
        
        if (textAnalysisResult.status === 'fulfilled') {
          setTextResult(textAnalysisResult.value);
          setCurrentContent(detectedText); // Display the extracted text in the result
        } else {
          toast.error(
            language === 'ml' 
              ? 'വാചക വിശകലനം പരാജയപ്പെട്ടു. ദയവായി വീണ്ടും ശ്രമിക്കുക.' 
              : 'Text analysis failed. Please try again.'
          );
        }
        
        setActiveResultIndex(0); // Default to showing image result first
        setIsAnalyzing(false);
        return;
      }
      
      // IMAGE ONLY CASE: Analyze image without text or extracted text is too short
      if (imageContent && (!processedContent && detectedText.length <= 10)) {
        try {
          const imageBlob = dataURLtoBlob(imageContent);
          const formData = new FormData();
          formData.append('image', imageBlob, 'image.jpg');
          
          const response = await fetch('https://settling-presently-giraffe.ngrok-free.app/analyze', {
            method: 'POST',
            body: formData,
            mode: 'cors',
          });
          
          if (!response.ok) {
            throw new Error(`Image analysis failed with status: ${response.status}`);
          }
          
          const imageAnalysisResult = await response.json();
          console.log("Image-only analysis response:", imageAnalysisResult);
          setImageResult(imageAnalysisResult);
          setActiveResultIndex(0); // Default to showing image result for image-only input
        } catch (error) {
          console.error('Image analysis failed:', error);
          toast.error(
            language === 'ml' 
              ? 'ചിത്ര വിശകലനം പരാജയപ്പെട്ടു. ദയവായി വീണ്ടും ശ്രമിക്കുക.' 
              : 'Image analysis failed. Please try again.'
          );
        }
        setIsAnalyzing(false);
        return;
      }
      
      // COMBINED CASE: Both image and text provided (user entered text or extracted from image)
      if (imageContent && (processedContent || detectedText.length > 10)) {
        // For combined analysis, we'll do both and enable swipe navigation
        const textToAnalyze = processedContent || detectedText;
        const imageBlob = dataURLtoBlob(imageContent);
        const formData = new FormData();
        formData.append('image', imageBlob, 'image.jpg');
        formData.append('text', textToAnalyze); // Pass text to backend for context analysis
        
        console.log("Sending combined analysis request with:", {
          imageSize: imageBlob.size,
          text: textToAnalyze,
          userProvidedText: !!processedContent,
          extractedText: !!detectedText
        });
        
        try {
          // Run both analyses in parallel
          const [imageAnalysisResult, textAnalysisResult] = await Promise.allSettled([
            // Image analysis
            fetch('https://settling-presently-giraffe.ngrok-free.app/analyze', {
              method: 'POST',
              body: formData,
              mode: 'cors',
            }).then(response => {
              if (!response.ok) {
                throw new Error(`Image analysis failed with status: ${response.status}`);
              }
              return response.json();
            }),
            // Text analysis
            analyzeService.analyzeContent(textToAnalyze)
          ]);
          
          if (imageAnalysisResult.status === 'fulfilled') {
            setImageResult(imageAnalysisResult.value);
          } else {
            toast.error(
              language === 'ml' 
                ? 'ചിത്ര വിശകലനം പരാജയപ്പെട്ടു. ദയവായി വീണ്ടും ശ്രമിക്കുക.' 
                : 'Image analysis failed. Please try again.'
            );
          }
          
          if (textAnalysisResult.status === 'fulfilled') {
            setTextResult(textAnalysisResult.value);
            // If we're using extracted text but user didn't provide any, set the current content
            // to the extracted text for display in the result card
            if (!processedContent && detectedText) {
              setCurrentContent(detectedText);
            }
          } else {
            toast.error(
              language === 'ml' 
                ? 'വാചക വിശകലനം പരാജയപ്പെട്ടു. ദയവായി വീണ്ടും ശ്രമിക്കുക.' 
                : 'Text analysis failed. Please try again.'
            );
          }
          
          // Default to showing image result first for combined input
          setActiveResultIndex(0);
        } catch (error) {
          console.error('Combined analysis failed:', error);
          toast.error(
            language === 'ml' 
              ? 'വിശകലനം പരാജയപ്പെട്ടു. ദയവായി വീണ്ടും ശ്രമിക്കുക.' 
              : 'Analysis failed. Please try again.'
          );
        }
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error(
        language === 'ml' 
          ? 'വിശകലനം പരാജയപ്പെട്ടു. ദയവായി വീണ്ടും ശ്രമിക്കുക.' 
          : 'Analysis failed. Please try again.'
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
    if (direction === 'next') {
      setActiveResultIndex(1);
    } else {
      setActiveResultIndex(0);
    }
  };

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
                {/* Feedback Section */}
                <div className="mt-12">
                  <FeedbackSection />
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
                {/* Feedback Section */}
                <div className="mt-12">
                  <FeedbackSection />
                </div>
              </div>
            )}
            
            {/* COMBINED RESULTS WITH SWIPE UI */}
            {hasMultipleResults && (
              <div className="min-h-[600px] mb-24" tabIndex={0} 
                   aria-label={language === 'ml' ? 'വിശകലന ഫലങ്ങൾ' : 'Analysis Results'} 
                   role="region">
                <div className={clsx(
                  "transition-opacity duration-300",
                  activeResultIndex === 0 ? "opacity-100" : "opacity-0 hidden"
                )}>
                  <ImageResultCard 
                    result={imageResult} 
                    imageUrl={currentImageContent} 
                    extractedText={extractedText}
                  />
                </div>
                
                <div className={clsx(
                  "transition-opacity duration-300",
                  activeResultIndex === 1 ? "opacity-100" : "opacity-0 hidden"
                )}>
                  <ResultCard 
                    result={textResult} 
                    content={currentContent}
                    extractedFromImage={!!extractedText && !currentContent}
                  />
                </div>

                {/* Navigation Controls */}
                <div className="flex justify-center items-center mt-8 space-x-4">
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
                      aria-label={language === 'ml' ? 'ചിത്ര വിശകലനം കാണിക്കുക' : 'Show image analysis'}
                      aria-pressed={activeResultIndex === 0}
                    />
                    <button
                      onClick={() => setActiveResultIndex(1)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        activeResultIndex === 1 
                          ? 'bg-blue-500' 
                          : 'bg-gray-300 hover:bg-blue-200'
                      }`}
                      aria-label={language === 'ml' ? 'വാചക വിശകലനം കാണിക്കുക' : 'Show text analysis'}
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
                
                {/* Feedback Section */}
                <div className="mt-12">
                  <FeedbackSection />
                </div>
              </div>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
