import { FC, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ComprehensiveAnalysisCard } from './ComprehensiveAnalysisCard';
import { TextAnalysisResult, ImageAnalysisResult } from '../types/analysis';
import { motion } from 'framer-motion';
import { ArrowLeft, Type, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { analyzeService } from '../services/analyzeService';

interface SharedAnalysisViewProps {}

interface AnalysisState {
  textAnalysis: TextAnalysisResult | null;
  imageAnalysis: ImageAnalysisResult | null;
  urlAnalysis: any | null;
  input: { text?: string; image_url?: string; url?: string } | null;
}

export const SharedAnalysisView: FC<SharedAnalysisViewProps> = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<AnalysisState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      } catch (err) {
        console.error("SharedAnalysisView: Error fetching analysis:", err);
        setError('Failed to load analysis');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [id]);

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

  const renderInput = () => {
    if (!analysis.input) return null;

    const inputType = analysis.imageAnalysis ? 'image' : (analysis.urlAnalysis || analysis.textAnalysis?.type === 'url') ? 'url' : 'text';
    const inputValue = analysis.input.text || analysis.input.url || analysis.input.image_url;

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
            <p className="text-gray-600 dark:text-gray-400 break-words">
                {inputType === 'image' ? "(Image input processed)" : inputValue}
            </p>
        </div>
    );
  };

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

      <ComprehensiveAnalysisCard
        textAnalysis={analysis.textAnalysis}
        imageAnalysis={analysis.imageAnalysis}
        urlAnalysis={analysis.urlAnalysis}
      />
    </motion.div>
  );
};