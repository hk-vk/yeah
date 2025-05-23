import { FC, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ComprehensiveAnalysisCard } from './ComprehensiveAnalysisCard';
import { ImageResultCard } from './ImageResultCard';
import { UrlAnalysisCard } from './UrlAnalysisCard';
import { TextAnalysisResult, ImageAnalysisResult } from '../types/analysis';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Type, Link as LinkIcon, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { analyzeService } from '../services/analyzeService';
import clsx from 'clsx';

interface SharedAnalysisViewProps {}

interface AnalysisState {
  textAnalysis: TextAnalysisResult | null;
  imageAnalysis: ImageAnalysisResult | null;
  urlAnalysis: any | null;
  input: {
    text?: string;
    image_url?: string;
    url?: string;
    images?: Array<{
      url: string;
      type: 'uploaded' | 'url' | 'extracted';
    }>;
  } | null;
}

export const SharedAnalysisView: FC<SharedAnalysisViewProps> = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<AnalysisState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeResultIndex, setActiveResultIndex] = useState(0);

  useEffect(() => {
    const fetchAnalysis = async () => {
      console.log("SharedAnalysisView: Fetching analysis for ID:", id);
      if (!id) {
        setError('No analysis ID provided');
        setLoading(false);
        return;
      }

      try {
        const result = await analyzeService.getSharedAnalysis(id);
        console.log("SharedAnalysisView: Fetched analysis result:", result);
        
        if (!result) {
          setError('Analysis not found');
          setLoading(false);
          return;
        }

        // Fix and normalize image analysis data
        if (result.imageAnalysis) {
          // Make sure imageAnalysis has the necessary structure
          const imageUrl = result.input?.images?.[0]?.url || result.input?.image_url;
          
          // Ensure the details object exists and has the required fields
          if (!result.imageAnalysis.details) {
            result.imageAnalysis.details = {
              ai_generated: false,
              deepfake: false,
              tampering_analysis: false,
              reverse_search: { found: false },
              image_caption: ''
            };
          }
          
          // Normalize tampering_analysis if it's an object instead of boolean
          if (typeof result.imageAnalysis.details.tampering_analysis === 'object' && 
              result.imageAnalysis.details.tampering_analysis !== null) {
            const tamperingObj = result.imageAnalysis.details.tampering_analysis as { tampered?: boolean };
            result.imageAnalysis.details.tampering_analysis = !!tamperingObj.tampered;
          }
          
          // Fix reverse_search if it has exists instead of found
          if (result.imageAnalysis.details.reverse_search && 
              typeof result.imageAnalysis.details.reverse_search === 'object') {
            const reverseSearchObj = result.imageAnalysis.details.reverse_search as any;
            if ('exists' in reverseSearchObj && !('found' in reverseSearchObj)) {
              reverseSearchObj.found = !!reverseSearchObj.exists;
            }
            if (!('found' in reverseSearchObj)) {
              reverseSearchObj.found = false;
            }
          } else if (!result.imageAnalysis.details.reverse_search) {
            result.imageAnalysis.details.reverse_search = { found: false };
          }
          
          // Ensure we have required score and verdict fields
          if (typeof result.imageAnalysis.score !== 'number') {
            result.imageAnalysis.score = 0;
          }
          
          if (!result.imageAnalysis.verdict) {
            result.imageAnalysis.verdict = 'Unknown';
          }
          
          console.log("Normalized image analysis details:", result.imageAnalysis.details);
        }

        setAnalysis(result as AnalysisState);
        
        // Set initial active index based on available results
        const availableResults = [];
        if (result.textAnalysis) availableResults.push('text');
        if (result.imageAnalysis) availableResults.push('image');
        if (result.urlAnalysis) availableResults.push('url');
        
        // Default to text analysis if available, otherwise show the first available result
        if (result.textAnalysis) {
          setActiveResultIndex(availableResults.indexOf('text'));
        } else if (availableResults.length > 0) {
          setActiveResultIndex(0); // Show the first available result
        }
      } catch (err) {
        console.error("SharedAnalysisView: Error fetching analysis:", err);
        setError('Failed to load analysis');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [id]);

  const getMaxResultIndex = () => {
    let availableResults = [];
    
    // Add each available result type in the same order as getCurrentResultType
    if (analysis?.textAnalysis) {
      availableResults.push('text');
    }
    if (analysis?.imageAnalysis) {
      availableResults.push('image');
    }
    if (analysis?.urlAnalysis) {
      availableResults.push('url');
    }
    
    return Math.max(0, availableResults.length - 1);
  };

  const getCurrentResultType = (index: number) => {
    const availableResults = [];
    
    // Add results in the order we want them to appear
    if (analysis?.textAnalysis) {
      availableResults.push('text');
    }
    if (analysis?.imageAnalysis) {
      availableResults.push('image');
    }
    if (analysis?.urlAnalysis) {
      availableResults.push('url');
    }
    
    // Return the type at the current index or default to the first available
    return availableResults[index] || availableResults[0] || 'text';
  };

  // Navigation functions
  const navigateResults = (direction: 'prev' | 'next') => {
    const maxIndex = getMaxResultIndex();
    if (direction === 'next') {
      setActiveResultIndex(prev => (prev + 1) % (maxIndex + 1));
    } else {
      setActiveResultIndex(prev => (prev - 1 + maxIndex + 1) % (maxIndex + 1));
    }
  };

  const renderInput = () => {
    if (!analysis?.input) return null;

    const inputType = analysis.imageAnalysis ? 'image' : (analysis.urlAnalysis || analysis.textAnalysis?.type === 'url') ? 'url' : 'text';
    const inputValue = analysis.input.text || analysis.input.url;
    const images = analysis.input.images || [];
    const imageUrl = analysis.input.image_url; // Get direct image URL if available

    let IconComponent = Type;
    let label = "Original Text";
    if (inputType === 'image') {
        IconComponent = ImageIcon;
        label = "Original Image Input";
    } else if (inputType === 'url') {
        IconComponent = LinkIcon;
        label = "Original URL";
    }

    // Get the most relevant image URL
    const displayImageUrl = images[0]?.url || imageUrl || null;

    return (
        <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
            <h3 className="text-lg font-semibold mb-2 flex items-center text-gray-700 dark:text-gray-300">
                <IconComponent className="w-5 h-5 mr-2" />
                {label}
            </h3>
            {inputValue && (
              <p className="text-gray-600 dark:text-gray-400 break-words mb-4">
                  {inputValue}
              </p>
            )}
            {displayImageUrl && (
              <div className="mt-2 flex justify-center">
                <div className="relative max-w-2xl w-full">
                  <img
                    src={displayImageUrl}
                    alt="Analysis image"
                    className="rounded-lg object-contain w-full h-auto max-h-[60vh]"
                  />
                </div>
              </div>
            )}
        </div>
    );
  };

  // Animation variants
  const cardVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <p className="text-red-500">{error || 'Analysis not found'}</p>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-8"
    >
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 mb-6 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </button>

      {renderInput()}

      <div className="relative">
        <AnimatePresence mode="wait" custom={activeResultIndex}>
          {/* Text Analysis */}
          {analysis.textAnalysis && getCurrentResultType(activeResultIndex) === 'text' && (
            <motion.div
              key="text"
              variants={cardVariants}
              initial="enter"
              animate="center"
              exit="exit"
              custom={activeResultIndex}
              className="w-full"
            >
              <ComprehensiveAnalysisCard
                textAnalysis={analysis.textAnalysis}
                imageAnalysis={null}
                urlAnalysis={null}
              />
            </motion.div>
          )}

          {/* URL Analysis */}
          {analysis.urlAnalysis && getCurrentResultType(activeResultIndex) === 'url' && (
            <motion.div
              key="url"
              variants={cardVariants}
              initial="enter"
              animate="center"
              exit="exit"
              custom={activeResultIndex}
              className="w-full"
            >
              <UrlAnalysisCard urlAnalysis={analysis.urlAnalysis} />
            </motion.div>
          )}

          {/* Image Analysis */}
          {analysis.imageAnalysis && getCurrentResultType(activeResultIndex) === 'image' && (
            <motion.div
              key="image"
              variants={cardVariants}
              initial="enter"
              animate="center"
              exit="exit"
              custom={activeResultIndex}
              className="w-full"
            >
              <ImageResultCard
                result={analysis.imageAnalysis}
                imageUrl={analysis.input?.images?.[0]?.url || analysis.input?.image_url || ''}
                extractedText={analysis.input?.text || ''}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Controls */}
        {getMaxResultIndex() > 0 && (
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => navigateResults('prev')}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                "text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              )}
              disabled={loading}
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>
            <div className="flex gap-2">
              {Array.from({ length: getMaxResultIndex() + 1 }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveResultIndex(index)}
                  className={clsx(
                    "w-3 h-3 rounded-full transition-colors",
                    activeResultIndex === index
                      ? "bg-blue-600 dark:bg-blue-400"
                      : "bg-gray-300 dark:bg-gray-600"
                  )}
                />
              ))}
            </div>
            <button
              onClick={() => navigateResults('next')}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                "text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              )}
              disabled={loading}
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};