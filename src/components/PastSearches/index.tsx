import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { SupabaseService } from '../../services/supabaseService';
import { useLanguage } from '../../contexts/LanguageContext';
import { Clock, Image, Link, FileText, AlertCircle, Check, X, Info, ExternalLink, BarChart, ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';
import type { AnalysisResult } from '../../types/supabase';

interface Props {
  onSelectAnalysis?: (analysis: AnalysisResult) => void;
}

export function PastSearches({ onSelectAnalysis }: Props) {
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 20;

  const { user } = useAuth();
  const { language } = useLanguage();
  const isMalayalam = language === 'ml';

  useEffect(() => {
    const fetchAnalyses = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const { data, count } = await SupabaseService.getAnalysisByUserId(user.id, 1, limit);
        console.log('Fetched analyses from analysis_result table:', {
          count: count,
          samples: data.slice(0, 2).map(item => ({
            id: item.id,
            type: item.type,
            hasInput: !!item.input,
            hasResult: !!item.result,
            resultSample: item.result,
            created: item.created_at
          }))
        });
        setAnalyses(data);
        setTotalCount(count);
        setHasMore(data.length < count);
      } catch (error) {
        console.error('Error fetching analyses from analysis_result table:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyses();
  }, [user?.id]);

  const loadMore = async () => {
    if (!user?.id || loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const { data, count } = await SupabaseService.getAnalysisByUserId(user.id, nextPage, limit);

      if (data.length > 0) {
        setAnalyses(prev => [...prev, ...data]);
        setPage(nextPage);
        setHasMore(analyses.length + data.length < count);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more analyses:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleAnalysisClick = (analysis: AnalysisResult) => {
    if (onSelectAnalysis) {
      onSelectAnalysis(analysis);
    }
  };

  const getTypeIcon = (type: AnalysisResult['type']) => {
    switch (type) {
      case 'text':
        return <FileText className="w-4 h-4" />;
      case 'image':
        return <Image className="w-4 h-4" />;
      case 'url':
        return <Link className="w-4 h-4" />;
      case 'text_image':
        return (
          <div className="flex -space-x-1">
            <Image className="w-4 h-4" />
            <FileText className="w-4 h-4" />
          </div>
        );
    }
  };

  const getTypeName = (type: AnalysisResult['type']) => {
    switch (type) {
      case 'text':
        return isMalayalam ? 'ടെക്സ്റ്റ് വിശകലനം' : 'Text Analysis';
      case 'image':
        return isMalayalam ? 'ചിത്ര വിശകലനം' : 'Image Analysis';
      case 'url':
        return isMalayalam ? 'URL വിശകലനം' : 'URL Analysis';
      case 'text_image':
        return isMalayalam ? 'ടെക്സ്റ്റ് & ചിത്ര വിശകലനം' : 'Text & Image Analysis';
    }
  };

  const getAnalysisPreview = (analysis: AnalysisResult) => {
    if (analysis.input.text) {
      const text = analysis.input.text;
      return text.length > 100 ? text.slice(0, 100) + '...' : text;
    }
    if (analysis.input.url) {
      return (
        <div className="flex items-center gap-2">
          <span className="truncate">{analysis.input.url}</span>
          <a 
            href={analysis.input.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      );
    }
    if (analysis.input.image_url) {
      return (
        <div className="flex items-center gap-2">
          <span>Image analysis</span>
          {analysis.input.image_url && (
            <a 
              href={analysis.input.image_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      );
    }
    return 'No preview available';
  };

  const getVerdictDisplay = (analysis: AnalysisResult) => {
    // For debugging purposes
    console.log(`Analysis ${analysis.id} verdict details:`, {
      result: analysis.result,
      ISFAKE: analysis.result?.ISFAKE,
      CONFIDENCE: analysis.result?.CONFIDENCE
    });

    // Check if we have the ISFAKE field (from the CSV sample)
    if (analysis.result?.ISFAKE !== undefined) {
      // ISFAKE: 0 means real, 1 means fake
      const isReal = analysis.result.ISFAKE === 0;
      console.log(`Using ISFAKE field: ${analysis.result.ISFAKE} -> isReal:`, isReal);
      
      return (
        <div className={clsx(
          "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
          isReal 
            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
        )}>
          {isReal ? (
            <Check className="w-3 h-3" />
          ) : (
            <X className="w-3 h-3" />
          )}
          <span>
            {isReal 
              ? (isMalayalam ? 'യഥാർത്ഥം' : 'Real') 
              : (isMalayalam ? 'വ്യാജം' : 'Fake')}
          </span>
        </div>
      );
    }

    // Fall back to the previous logic if ISFAKE is not present
    // Default to showing fake unless proven real
    let isReal = false;

    // If there's an explicit verdict, use it
    if (analysis.result?.verdict) {
      const verdict = analysis.result.verdict.toLowerCase();
      isReal = verdict.includes('real') || verdict.includes('genuine') || verdict === 'true';
      console.log(`Using explicit verdict: "${analysis.result.verdict}" -> isReal:`, isReal);
    } 
    // If there's a score, use it
    else if (analysis.result?.score !== undefined) {
      isReal = analysis.result.score > 0.5;
      console.log(`Using score: ${analysis.result.score} -> isReal:`, isReal);
    }
    // Check details if available
    else if (analysis.result?.details) {
      const details = analysis.result.details;
      
      // For text analysis
      if (analysis.type === 'text' || analysis.type === 'text_image') {
        if (details.text_analysis) {
          const { context_similarity, context_mismatch } = details.text_analysis;
          if (context_similarity !== undefined) {
            isReal = context_similarity > 0.7 && !context_mismatch;
            console.log(`Using text analysis: similarity=${context_similarity}, mismatch=${context_mismatch} -> isReal:`, isReal);
          }
        }
      }
      
      // For image analysis
      if ((analysis.type === 'image' || analysis.type === 'text_image') && !isReal) {
        const isAIGenerated = details.ai_generated === true;
        const isDeepfake = details.deepfake === true;
        const isTampered = details.tampering_analysis === true;
        
        // If any negative indicators are present, it's not real
        if (isAIGenerated || isDeepfake || isTampered) {
          isReal = false;
          console.log(`Using image analysis: AI=${isAIGenerated}, deepfake=${isDeepfake}, tampered=${isTampered} -> isReal:`, isReal);
        } else if (details.ai_generated === false || details.deepfake === false || details.tampering_analysis === false) {
          // If explicitly marked as not fake, consider real
          isReal = true;
          console.log(`Using negative image analysis indicators -> isReal:`, isReal);
        }
      }
    } else {
      // If we have no evidence either way, return with "indeterminate"
      console.log(`No clear verdict indicators found -> showing indeterminate`);
      return (
        <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400">
          <AlertCircle className="w-3 h-3" />
          <span>{isMalayalam ? 'നിർണ്ണയിക്കാനായില്ല' : 'Indeterminate'}</span>
        </div>
      );
    }

    return (
      <div className={clsx(
        "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
        isReal 
          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      )}>
        {isReal ? (
          <Check className="w-3 h-3" />
        ) : (
          <X className="w-3 h-3" />
        )}
        <span>
          {isReal 
            ? (isMalayalam ? 'യഥാർത്ഥം' : 'Real') 
            : (isMalayalam ? 'വ്യാജം' : 'Fake')}
        </span>
      </div>
    );
  };

  const getScoreDisplay = (analysis: AnalysisResult) => {
    // Check for CONFIDENCE field from the CSV sample
    if (analysis.result?.CONFIDENCE !== undefined) {
      const confidence = analysis.result.CONFIDENCE;
      const confidencePercent = Math.round(confidence * 100);
      
      return (
        <div className="flex items-center gap-1 text-xs">
          <BarChart className="w-3 h-3 text-gray-500" />
          <span className={clsx(
            "font-medium",
            confidence > 0.7 ? "text-green-600 dark:text-green-400" : 
            confidence > 0.4 ? "text-yellow-600 dark:text-yellow-400" : 
            "text-red-600 dark:text-red-400"
          )}>
            {confidencePercent}%
          </span>
        </div>
      );
    }
    
    // Fall back to the previous logic
    if (analysis.result?.score === undefined) return null;
    
    const score = analysis.result.score;
    const scorePercent = Math.round(score * 100);
    
    return (
      <div className="flex items-center gap-1 text-xs">
        <BarChart className="w-3 h-3 text-gray-500" />
        <span className={clsx(
          "font-medium",
          score > 0.7 ? "text-green-600 dark:text-green-400" : 
          score > 0.4 ? "text-yellow-600 dark:text-yellow-400" : 
          "text-red-600 dark:text-red-400"
        )}>
          {scorePercent}%
        </span>
      </div>
    );
  };

  const getExplanation = (analysis: AnalysisResult) => {
    // Check for EXPLANATION fields from the CSV sample
    if (analysis.result?.EXPLANATION_EN || analysis.result?.EXPLANATION_ML) {
      // Use the appropriate language based on the current language setting
      return isMalayalam && analysis.result.EXPLANATION_ML 
        ? analysis.result.EXPLANATION_ML 
        : analysis.result.EXPLANATION_EN;
    }
    
    // Fall back to the previous logic
    if (analysis.result?.explanation) {
      return analysis.result.explanation;
    }

    // Generate explanation based on available data
    const details = analysis.result?.details;
    if (!details) return null;

    const explanationParts: string[] = [];

    if (analysis.type === 'text' || analysis.type === 'text_image') {
      const textAnalysis = details.text_analysis;
      if (textAnalysis) {
        if (textAnalysis.context_mismatch) {
          explanationParts.push(isMalayalam 
            ? 'സന്ദർഭത്തിൽ പൊരുത്തക്കേട് കണ്ടെത്തി.' 
            : 'Context mismatch detected.');
        }
        if (textAnalysis.context_similarity !== undefined) {
          const similarityPercent = Math.round(textAnalysis.context_similarity * 100);
          explanationParts.push(isMalayalam 
            ? `സന്ദർഭ സാമ്യത: ${similarityPercent}%` 
            : `Context similarity: ${similarityPercent}%`);
        }
      }
    }

    if (analysis.type === 'image' || analysis.type === 'text_image') {
      if (details.ai_generated) {
        explanationParts.push(isMalayalam 
          ? 'AI ഉപയോഗിച്ച് സൃഷ്ടിച്ചതാണെന്ന് കണ്ടെത്തി.' 
          : 'AI-generated content detected.');
      }
      if (details.deepfake) {
        explanationParts.push(isMalayalam 
          ? 'ഡീപ്‌ഫേക്ക് സാങ്കേതികവിദ്യ ഉപയോഗിച്ചതായി കണ്ടെത്തി.' 
          : 'Deepfake technology detected.');
      }
      if (details.tampering_analysis) {
        explanationParts.push(isMalayalam 
          ? 'ചിത്രം എഡിറ്റ് ചെയ്തതായി കണ്ടെത്തി.' 
          : 'Image manipulation detected.');
      }
      if (details.reverse_search?.found) {
        explanationParts.push(isMalayalam 
          ? 'സമാന ചിത്രങ്ങൾ ഇന്റർനെറ്റിൽ കണ്ടെത്തി.' 
          : 'Similar images found online.');
      }
    }

    return explanationParts.length > 0 ? explanationParts.join(' ') : null;
  };

  const toggleExplanation = (analysisId: string) => {
    setSelectedAnalysis(selectedAnalysis === analysisId ? null : analysisId);
  };

  if (!user) return null;

  return (
    <div className="mt-8 w-full max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <h2 className={clsx(
          "text-lg font-semibold text-gray-900 dark:text-white",
          isMalayalam && "text-base"
        )}>
          {isMalayalam ? 'മുൻ വിശകലനങ്ങൾ' : 'Analysis History'}
        </h2>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-600 dark:text-gray-400">
          {isMalayalam ? 'ലോഡ് ചെയ്യുന്നു...' : 'Loading...'}
        </div>
      ) : analyses.length === 0 ? (
        <div className="text-center py-8 text-gray-600 dark:text-gray-400">
          {isMalayalam ? 'വിശകലന ചരിത്രം ഇല്ല' : 'No analysis history yet'}
        </div>
      ) : (
        <div className="space-y-4">
          {analyses.map((analysis) => (
            <div
              key={analysis.id}
              onClick={() => handleAnalysisClick(analysis)}
              className={clsx(
                "p-4 rounded-lg border transition-colors cursor-pointer",
                "bg-white/90 dark:bg-gray-800/90",
                "border-gray-100 dark:border-gray-700",
                "hover:bg-gray-50 dark:hover:bg-gray-700/50"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-md bg-gray-100 dark:bg-gray-700">
                      {getTypeIcon(analysis.type)}
                    </div>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {getTypeName(analysis.type)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {format(new Date(analysis.created_at), 'MMM d, yyyy h:mm a')}
                    </span>
                    {/* Show analysis ID for debugging */}
                    <span className="text-xs text-gray-400 dark:text-gray-500 italic">
                      ID: {analysis.id.substring(0, 8)}...
                    </span>
                  </div>
                  <div className="text-sm text-gray-900 dark:text-gray-100 break-words">
                    {getAnalysisPreview(analysis)}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getVerdictDisplay(analysis)}
                  {getScoreDisplay(analysis)}
                  <button
                    onClick={() => toggleExplanation(analysis.id)}
                    className={clsx(
                      "flex items-center gap-1 text-xs",
                      "text-gray-600 hover:text-gray-900",
                      "dark:text-gray-400 dark:hover:text-gray-100",
                      selectedAnalysis === analysis.id && "text-blue-600 dark:text-blue-400"
                    )}
                  >
                    <Info className="w-3 h-3" />
                    {isMalayalam ? 'വിശദീകരണം' : 'Explanation'}
                  </button>
                </div>
              </div>
              {selectedAnalysis === analysis.id && (
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {getExplanation(analysis) || (isMalayalam ? 'വിശദീകരണം ലഭ്യമല്ല' : 'No explanation available')}
                  </p>
                </div>
              )}
            </div>
          ))}
          
          {hasMore && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className={clsx(
                  "flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150",
                  "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20",
                  "hover:bg-blue-100 dark:hover:bg-blue-800/30",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50",
                  "border border-blue-200 dark:border-blue-800/50",
                  loadingMore && "opacity-70 cursor-not-allowed"
                )}
              >
                {loadingMore ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    {isMalayalam ? 'ലോഡിംഗ്...' : 'Loading...'}
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    {isMalayalam ? 'കൂടുതൽ കാണിക്കുക' : 'Load More'}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}