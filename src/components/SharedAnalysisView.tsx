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

        setAnalysis(result as AnalysisState);
        // Set initial active index based on available results
        if (result.textAnalysis) {
          setActiveResultIndex(0);
        } else if (result.urlAnalysis) {
          setActiveResultIndex(1);
        } else if (result.imageAnalysis) {
          setActiveResultIndex(2);
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

  // Navigation functions
  const navigateResults = (direction: 'prev' | 'next') => {
    const maxIndex = getMaxResultIndex();
    if (direction === 'next') {
      setActiveResultIndex(prev => (prev + 1) % (maxIndex + 1));
    } else {
      setActiveResultIndex(prev => (prev - 1 + maxIndex + 1) % (maxIndex + 1));
    }
  };

  const getMaxResultIndex = () => {
    let maxIndex = 0;
    if (analysis?.textAnalysis) maxIndex = 0;
    if (analysis?.urlAnalysis) maxIndex = 1;
    if (analysis?.imageAnalysis) maxIndex = analysis.textAnalysis?.type === 'url' ? 2 : 1;
    return maxIndex;
  };

  const renderInput = () => {
    if (!analysis?.input) return null;

    const inputType = analysis.imageAnalysis ? 'image' : (analysis.urlAnalysis || analysis.textAnalysis?.type === 'url') ? 'url' : 'text';
    const inputValue = analysis.input.text || analysis.input.url;
    const images = analysis.input.images || [];

    let IconComponent = Type;
    let label = "Original Text";
    if (inputType === 'image') {
        IconComponent = ImageIcon;
        label = "Original Image Input";
    } else if (inputType === 'url') {
        IconComponent = LinkIcon;
        label = "Original URL";
    }

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
            {images.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                {images.map((img, index) => (
                  <div key={index} className="relative aspect-video">
                    <img
                      src={img.url}
                      alt={`Analysis ${img.type} image ${index + 1}`}
                      className="rounded-lg object-cover w-full h-full"
                    />
                    <span className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 text-xs rounded">
                      {img.type}
                    </span>
                  </div>
                ))}
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

  const maxIndex = getMaxResultIndex();
  const showNavigation = maxIndex > 0;

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
          {analysis.textAnalysis && activeResultIndex === 0 && (
            <motion.div
              key="text"
              variants={cardVariants}
              initial="enter"
              animate="center"
              exit="exit"
              custom={0}
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
          {analysis.urlAnalysis && activeResultIndex === 1 && (
            <motion.div
              key="url"
              variants={cardVariants}
              initial="enter"
              animate="center"
              exit="exit"
              custom={1}
              className="w-full"
            >
              <UrlAnalysisCard urlAnalysis={analysis.urlAnalysis} />
            </motion.div>
          )}

          {/* Image Analysis */}
          {analysis.imageAnalysis && activeResultIndex === (analysis.textAnalysis?.type === 'url' ? 2 : 1) && (
            <motion.div
              key="image"
              variants={cardVariants}
              initial="enter"
              animate="center"
              exit="exit"
              custom={2}
              className="w-full"
            >
              <ImageResultCard
                result={analysis.imageAnalysis}
                imageUrl={analysis.input?.images?.[0]?.url ?? null}
                extractedText={analysis.input?.text}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Controls */}
        {showNavigation && (
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
              {Array.from({ length: maxIndex + 1 }).map((_, index) => (
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