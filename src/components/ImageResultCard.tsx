import { FC, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Check, X, Globe, ChevronLeft, Calendar, ShieldCheck, ShieldAlert,
  Image as ImageIcon, ChevronUp, ChevronDown, AlertTriangle, Cpu, Copy, Share2,
  Camera, Scissors, Search, FileText
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { GlassCard } from './common/GlassCard';
import clsx from 'clsx';
import { ImageAnalysisSliders } from './ImageAnalysisSliders';
import { imageService } from '../services/imageService';
import toast from 'react-hot-toast';

interface ImageAnalysisDetails {
  ai_generated: boolean;
  reverse_search: {
    found: boolean;
    matches?: Array<{
      url: string;
      title: string;
    }>;
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
    reverse_search?: {
      found: boolean;
      matches?: Array<{
        url: string;
        title: string;
      }>;
      reliability_score?: number;
    };
  };
  date_analysis?: {
    image_dates: string[];
    text_dates: string[];
    match: boolean;
    similarity: number;
    mismatch: boolean;
  };
}

interface ImageAnalysisResult {
  id?: string;
  verdict: string;
  score: number;
  details: ImageAnalysisDetails;
  type?: 'image' | 'text_image';
}

interface ImageResultCardProps {
  result: ImageAnalysisResult;
  imageUrl: string | null | undefined;
  extractedText?: string;
}

export const ImageResultCard: FC<ImageResultCardProps> = ({ result, imageUrl, extractedText }) => {
  const { language } = useLanguage();
  const isMalayalam = language === 'ml';
  const [expandedMatches, setExpandedMatches] = useState(false);
  const [expandedTextMatches, setExpandedTextMatches] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  console.log('ImageResultCard rendered with props:', { resultId: result?.id, imageUrl, extractedText: !!extractedText });

  useEffect(() => {
    setImageError(false);
  }, [imageUrl]);

  const handleImageError = () => {
    console.error('Failed to load image:', imageUrl);
    setImageError(true);
  };

  const handleShare = async () => {
    const analysisId = result.id;

    if (!analysisId || analysisId.startsWith('local-')) {
      toast.error(
        language === 'ml' ? 'പങ്കിടാൻ സാധുവായ വിശകലന ഐഡി കണ്ടെത്താനായില്ല' : 'Could not find valid Analysis ID to share'
      );
      console.error("Error sharing: Analysis ID is missing or local", { analysisId, result });
      return;
    }

    let shareableUrl = `${window.location.origin}/analysis/${analysisId}`;
    let supabaseImageUrl: string | null = null;

    try {
        console.log(`Fetching image details for analysis ID: ${analysisId}`);
        const storedImages = await imageService.getAnalysisImages(analysisId);

        if (storedImages && storedImages.length > 0) {
            const imageToShare = storedImages[0];
            if (imageToShare.storage_path) {
                supabaseImageUrl = await imageService.getImageUrl(imageToShare.storage_path);
                console.log(`Got Supabase image URL: ${supabaseImageUrl}`);
            } else if (imageToShare.original_url) {
                supabaseImageUrl = imageToShare.original_url;
                console.log(`Using original image URL: ${supabaseImageUrl}`);
            }

            if (supabaseImageUrl) {
                shareableUrl += `?imageUrl=${encodeURIComponent(supabaseImageUrl)}`;
            }
        } else {
            console.log(`No stored image found for analysis ID: ${analysisId}`);
        }
    } catch (error) {
        console.error(`Error fetching image URL for sharing analysis ${analysisId}:`, error);
    }

    const shareTitle = language === 'ml' ? 'ചിത്ര വിശകലന ഫലം' : 'Image Analysis Result';
    const shareText = language === 'ml' ? 'ഈ ചിത്ര വിശകലന ഫലം പരിശോധിക്കുക' : 'Check out this image analysis result';

    console.log("Attempting to share URL:", shareableUrl);

    try {
      if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareableUrl
        });
      } else {
        await navigator.clipboard.writeText(shareableUrl);
        toast.success(language === 'ml' ? 'ലിങ്ക് പകർത്തി' : 'Link copied to clipboard');
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Error sharing analysis:', err);
        toast.error(language === 'ml' ? 'പങ്കിടൽ പരാജയപ്പെട്ടു' : 'Failed to share analysis');
      }
    }
  };

  const handleCopy = async () => {
     try {
        const verdictText = getVerdict();
        const scoreText = `${confidencePercentage}% ${language === 'ml' ? 'വിശ്വസനീയത' : 'Reliability'}`;
        const caption = image_caption || (language === 'ml' ? 'വിവരണം ലഭ്യമല്ല' : 'No description');
        const detailsSummary = [
            ai_generated ? (language === 'ml' ? 'AI നിർമ്മിതം' : 'AI Generated') : null,
            deepfake ? (language === 'ml' ? 'ഡീപ്‌ഫേക്ക്' : 'Deepfake') : null,
            tampering_analysis ? (language === 'ml' ? 'കൃത്രിമ മാറ്റം' : 'Tampered') : null,
            reverse_search.found ? (language === 'ml' ? 'ഓൺലൈനിൽ കണ്ടെത്തി' : 'Found Online') : null
        ].filter(Boolean).join(', ');

        const textToCopy = `${language === 'ml' ? 'ചിത്ര വിശകലനം' : 'Image Analysis'}: ${verdictText} (${scoreText})\n${language === 'ml' ? 'വിവരണം' : 'Description'}: ${caption}\n${language === 'ml' ? ' കണ്ടെത്തലുകൾ' : 'Findings'}: ${detailsSummary}`;

        await navigator.clipboard.writeText(textToCopy);
        toast.success(language === 'ml' ? 'വിശകലനം പകർത്തി' : 'Analysis copied');
     } catch (error) {
        console.error('Error copying image analysis:', error);
        toast.error(language === 'ml' ? 'പകർത്താൻ കഴിഞ്ഞില്ല' : 'Failed to copy');
     }
  };

  console.log('ImageResultCard checking imageUrl value:', imageUrl);
  if (!imageUrl) {
    console.error('Image URL is missing when rendering ImageResultCard for analysis:', result?.id);
    return (
      <div className="text-yellow-500 text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        {language === 'ml' ? 'ചിത്രം ലഭ്യമല്ല' : 'Image not available'}
      </div>
    );
  }

  if (!result) {
    return (
      <div className="text-red-500 text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        {language === 'ml' ? 'ഫലങ്ങൾ ലഭ്യമല്ല' : 'Results not available'}
      </div>
    );
  }

  if (!result.details) {
    console.error('Image analysis result is missing details:', result);
    return (
      <div className="text-red-500 text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        {language === 'ml' ? 'അസാധുവായ ഫലങ്ങൾ' : 'Invalid results - missing details'}
      </div>
    );
  }

  const {
    ai_generated = false,
    reverse_search = { found: false, matches: [] },
    deepfake = false,
    tampering_analysis = false,
    image_caption = '',
    text_analysis,
    date_analysis
  } = result.details;

  const confidencePercentage = Math.min(100, Math.max(0, Math.round(result.score)));
  const isReliable = result.verdict.toLowerCase() === 'real' || 
                     result.verdict.toLowerCase() === 'authentic' ||
                     result.verdict.toLowerCase() === 'genuine';

  const getVerdict = () => {
    if (language === 'ml') {
      return isReliable ? 'വിശ്വസനീയം' : 'സംശയാസ്പദം';
    }
    return isReliable ? 'Authentic' : 'Manipulated';
  };

  const renderWebMatches = () => {
    const matches = reverse_search.matches || [];
    if (!matches.length) {
      return (
        <span className={clsx(
          "text-green-600 dark:text-green-400",
          isMalayalam ? "text-base" : "text-sm"
        )}>
          {language === 'ml' ? 'ഇന്റർനെറ്റിൽ കണ്ടെത്തിയില്ല' : 'No online matches found'}
        </span>
      );
    }

    const displayedMatches = expandedMatches ? matches : matches.slice(0, 1);
    
    return (
      <div className="space-y-2">
        {displayedMatches.map((match, index) => (
          <div key={index} className={clsx("break-all", isMalayalam ? "text-base" : "text-sm")}>
            <a
              href={match.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline flex items-start"
            >
              <Globe className="w-3.5 h-3.5 mt-0.5 mr-1.5 flex-shrink-0" />
              <span>{match.title || match.url}</span>
            </a>
          </div>
        ))}
        
        {matches.length > 1 && (
          <button
            onClick={() => setExpandedMatches(!expandedMatches)}
            className={clsx(
              "flex items-center mt-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400",
              "dark:hover:text-blue-300 transition-colors duration-200 rounded px-2 py-0.5 hover:bg-blue-50 dark:hover:bg-blue-900/20",
              isMalayalam ? "text-base" : "text-sm"
            )}
          >
            {expandedMatches 
              ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5 mr-1" />
                  {language === 'ml' ? 'ചുരുക്കുക' : 'Show less'}
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5 mr-1" />
                  {language === 'ml' 
                    ? `${matches.length - 1} കൂടുതൽ` 
                    : `Show ${matches.length - 1} more`}
                </>
              )
            }
          </button>
        )}
      </div>
    );
  };

  const renderTextReverseSearch = () => {
    const textAnalysis = result.details.text_analysis;
    if (!textAnalysis || !textAnalysis.reverse_search) return null;
    
    const reverseSearch = textAnalysis.reverse_search;
    const matches = reverseSearch.matches || [];
    
    if (!matches.length) {
      return (
        <span className={clsx(
          "text-green-600 dark:text-green-400",
          isMalayalam ? "text-base" : "text-sm"
        )}>
          {language === 'ml' ? 'വാചകത്തിന് സമാനങ്ങൾ കണ്ടെത്തിയില്ല' : 'No matches found for text'}
        </span>
      );
    }

    const displayedMatches = expandedTextMatches ? matches : matches.slice(0, 1);
    
    return (
      <div className="space-y-2">
        {displayedMatches.map((match, index) => (
          <div key={index} className={clsx("break-all", isMalayalam ? "text-base" : "text-sm")}>
            <a
              href={match.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline flex items-start"
            >
              <Globe className="w-3.5 h-3.5 mt-0.5 mr-1.5 flex-shrink-0" />
              <span>{match.title || match.url}</span>
            </a>
          </div>
        ))}
        
        {matches.length > 1 && (
          <button
            onClick={() => setExpandedTextMatches(!expandedTextMatches)}
            className={clsx(
              "flex items-center mt-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400",
              "dark:hover:text-blue-300 transition-colors duration-200 rounded px-2 py-0.5 hover:bg-blue-50 dark:hover:bg-blue-900/20",
              isMalayalam ? "text-base" : "text-sm"
            )}
          >
            {expandedTextMatches 
              ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5 mr-1" />
                  {language === 'ml' ? 'ചുരുക്കുക' : 'Show less'}
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5 mr-1" />
                  {language === 'ml' 
                    ? `${matches.length - 1} കൂടുതൽ` 
                    : `Show ${matches.length - 1} more`}
                </>
              )
            }
          </button>
        )}
      </div>
    );
  };

  const renderTextAnalysis = () => {
    if (!text_analysis && extractedText && extractedText.length > 10) {
      return (
        <div className="space-y-3">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
            <p className={clsx(
              "text-blue-700 dark:text-blue-300",
              isMalayalam && "text-base"
            )}>
              {language === 'ml' ? 'ചിത്രത്തിൽ നിന്ന് തിരിച്ചറിഞ്ഞ വാചകം' : 'Text detected from image'}:
            </p>
            <p className={clsx(
              "mt-2 text-gray-700 dark:text-gray-300 border-l-2 border-blue-300 pl-3",
              isMalayalam && "text-base leading-relaxed"
            )}>
              {extractedText}
            </p>
          </div>
        </div>
      );
    }
    
    if (!text_analysis) return null;

    const similarity = Math.round(text_analysis.context_similarity * 100);
    const hasUserText = !!text_analysis.user_text;
    const hasExtractedText = !!text_analysis.extracted_text;

    return (
      <div className="space-y-3">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
          <div
            className={clsx(
              "h-2.5 rounded-full transition-all duration-500",
              similarity >= 70 ? "bg-green-500" :
              similarity >= 40 ? "bg-yellow-500" :
              "bg-red-500"
            )}
            style={{ width: `${similarity}%` }}
          />
        </div>
        
        <div className="flex justify-between">
          <span className={clsx(isMalayalam ? "text-base" : "text-sm")}>
            {language === 'ml' ? 'കോൺടെക്സ്റ്റ് സാമ്യത' : 'Context Similarity'}: {similarity}%
          </span>
          <span className={clsx(
            text_analysis.context_mismatch ? "text-red-500" : "text-green-500",
            "flex items-center",
            isMalayalam ? "text-base" : "text-sm"
          )}>
            {text_analysis.context_mismatch 
              ? <X className="w-3.5 h-3.5 mr-1" /> 
              : <Check className="w-3.5 h-3.5 mr-1" />}
            {text_analysis.context_mismatch 
              ? (language === 'ml' ? 'പൊരുത്തക്കേട്' : 'Mismatch') 
              : (language === 'ml' ? 'പൊരുത്തം' : 'Match')}
          </span>
        </div>

        {(hasUserText || hasExtractedText) && (
          <div className="space-y-3 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg backdrop-blur-sm">
            {hasUserText && (
              <div>
                <span className={clsx("font-medium", isMalayalam && "text-lg")}>
                  {language === 'ml' ? 'നൽകിയ വാചകം' : 'Provided Text'}:
                </span>
                <p className={clsx(
                  "text-gray-600 dark:text-gray-400 mt-1 border-l-2 border-blue-300 pl-3",
                  isMalayalam && "text-base leading-relaxed"
                )}>
                  {text_analysis.user_text}
                </p>
              </div>
            )}
            {hasExtractedText && (
              <div>
                <span className={clsx("font-medium", isMalayalam && "text-lg")}>
                  {language === 'ml' ? 'ചിത്രത്തിൽ നിന്നുള്ള വാചകം' : 'Text from Image'}:
                </span>
                <p className={clsx(
                  "text-gray-600 dark:text-gray-400 mt-1 border-l-2 border-purple-300 pl-3",
                  isMalayalam && "text-base leading-relaxed"
                )}>
                  {text_analysis.extracted_text}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat(language === 'ml' ? 'ml-IN' : 'en-US', {
        year: 'numeric', 
        month: 'short', 
        day: 'numeric'
      }).format(date);
    } catch (e) {
      return dateStr;
    }
  };

  const renderDateAnalysis = () => {
    const dateAnalysis = result.details.date_analysis;
    if (!dateAnalysis) return null;

    const hasImageDates = dateAnalysis.image_dates && dateAnalysis.image_dates.length > 0;
    const hasTextDates = dateAnalysis.text_dates && dateAnalysis.text_dates.length > 0;
    
    if (!hasImageDates && !hasTextDates) return null;
    
    const similarityPercentage = Math.round(dateAnalysis.similarity * 100);

    return (
      <div className="space-y-3">
        {hasImageDates && (
          <div>
            <span className={clsx("font-medium", isMalayalam ? "text-base" : "text-sm")}>
              {language === 'ml' ? 'ചിത്രത്തിലെ തീയതികൾ' : 'Dates from Image Metadata'}:
            </span>
            <div className="flex flex-wrap gap-2 mt-1">
              {dateAnalysis.image_dates.map((date, index) => (
                <span 
                  key={index} 
                  className={clsx(
                    "px-2 py-1 rounded-md text-xs",
                    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200"
                  )}>
                  {formatDate(date)}
                </span>
              ))}
            </div>
          </div>
        )}

        {hasTextDates && (
          <div>
            <span className={clsx("font-medium", isMalayalam ? "text-base" : "text-sm")}>
              {language === 'ml' ? 'വാചകത്തിൽ നിന്നുള്ള തീയതികൾ' : 'Dates from Text'}:
            </span>
            <div className="flex flex-wrap gap-2 mt-1">
              {dateAnalysis.text_dates.map((date, index) => (
                <span 
                  key={index} 
                  className={clsx(
                    "px-2 py-1 rounded-md text-xs",
                    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200"
                  )}>
                  {formatDate(date)}
                </span>
              ))}
            </div>
          </div>
        )}

        {hasImageDates && hasTextDates && (
          <div className="mt-3">
            <div className="flex justify-between mb-1">
              <span className={clsx("font-medium", isMalayalam ? "text-base" : "text-sm")}>
                {language === 'ml' ? 'തീയതി സാമ്യത' : 'Date Similarity'}
              </span>
              <span className={clsx(
                dateAnalysis.match ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400",
                "font-medium",
                isMalayalam ? "text-base" : "text-sm"
              )}>
                {similarityPercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
              <div
                className={clsx(
                  "h-2.5 rounded-full transition-all duration-500",
                  dateAnalysis.match 
                    ? "bg-green-500" 
                    : "bg-amber-500"
                )}
                style={{ width: `${similarityPercentage}%` }}
              />
            </div>

            <div className="mt-2">
              <span className={clsx(
                dateAnalysis.match
                  ? "text-green-600 dark:text-green-400"
                  : "text-amber-600 dark:text-amber-400",
                "flex items-center",
                isMalayalam ? "text-sm" : "text-xs"
              )}>
                {dateAnalysis.match
                  ? <Check className="w-3.5 h-3.5 mr-1" />
                  : <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                }
                {dateAnalysis.match
                  ? (language === 'ml' ? 'തീയതികൾ പൊരുത്തപ്പെടുന്നു' : 'Dates match')
                  : (language === 'ml' ? 'തീയതികൾ പൊരുത്തപ്പെടുന്നില്ല' : 'Date mismatch detected')
                }
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-full mx-auto relative"
    >
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button
           onClick={handleCopy}
           className={clsx(
               "p-1.5 rounded-full transition-colors",
               "text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200",
               "hover:bg-gray-100 dark:hover:bg-gray-800/50"
           )}
           title={language === 'ml' ? 'വിശകലനം പകർത്തുക' : 'Copy analysis'}
           >
           <Copy className="w-4 h-4" />
       </button>
       <button
           onClick={handleShare}
           className={clsx(
               "p-1.5 rounded-full transition-colors",
               "text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200",
               "hover:bg-gray-100 dark:hover:bg-gray-800/50"
           )}
           title={language === 'ml' ? 'പങ്കിടുക' : 'Share'}
           >
           <Share2 className="w-4 h-4" />
       </button>
        <span className={clsx(
          "px-3 py-1 rounded-full text-sm font-medium",
          "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200",
          "border border-purple-200 dark:border-purple-800/30"
        )}>
          {language === 'ml' ? 'ചിത്ര വിശകലനം' : 'Image Analysis'}
        </span>
      </div>

      <GlassCard className="relative overflow-hidden backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-white/30 dark:from-gray-800/50 dark:to-gray-800/30" />
        <div className={clsx(
          "relative p-6 space-y-6",
          isMalayalam && "malayalam-text"
        )}>
          {imageUrl && (
            <div className="mb-6">
              {!imageError ? (
                <div className="flex justify-center">
                  <div className="max-w-md mx-auto">
                    <img
                      src={imageUrl}
                      alt="Analyzed image"
                      className="rounded-lg shadow-lg object-contain w-full h-auto max-h-[35vh]"
                      onError={handleImageError}
                    />
                  </div>
                </div>
              ) : (
                <div className="w-full aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center max-w-md mx-auto">
                  <div className="text-center">
                    <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-500">
                      {language === 'ml' ? 'ചിത്രം ലോഡ് ചെയ്യാൻ കഴിഞ്ഞില്ല' : 'Failed to load image'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-center mb-6">
            {isReliable ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center text-green-500 dark:text-green-400"
              >
                <ShieldCheck className="w-8 h-8 mr-2" />
                <span className={clsx(
                  "text-xl font-semibold",
                  isMalayalam && "text-2xl leading-relaxed"
                )}>{getVerdict()}</span>
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center text-amber-500 dark:text-amber-400"
              >
                <ShieldAlert className="w-8 h-8 mr-2" />
                <span className={clsx(
                  "text-xl font-semibold",
                  isMalayalam && "text-2xl leading-relaxed"
                )}>{getVerdict()}</span>
              </motion.div>
            )}
          </div>

          <div className="mb-6">
            <div className="flex justify-between mb-1">
              <span className={clsx("font-medium", isMalayalam ? "text-base" : "text-sm")}>
                {language === 'ml' ? 'വിശ്വസനീയതാ സ്കോർ' : 'Reliability Score'}
              </span>
              <span className={clsx(
                "font-medium",
                isReliable ? "text-green-600" : "text-amber-600",
                isMalayalam ? "text-base" : "text-sm"
              )}>
                {confidencePercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
              <div
                className={clsx(
                  "h-2.5 rounded-full transition-all duration-500",
                  isReliable 
                    ? "bg-green-500" 
                    : "bg-amber-500"
                )}
                style={{ width: `${confidencePercentage}%` }}
              />
            </div>
          </div>

          <div className="mb-6">
            <h3 className={clsx(
              "text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100 flex items-center",
              isMalayalam && "text-xl leading-relaxed"
            )}>
              <ImageIcon className="w-5 h-5 mr-2" />
              {language === 'ml' ? 'ചിത്രത്തിന്റെ വിവരണം' : 'Image Description'}
            </h3>
            <p className={clsx(
              "text-gray-600 dark:text-gray-300",
              isMalayalam && "text-lg leading-loose"
            )}>
              {image_caption || (language === 'ml' ? 'വിവരണം ലഭ്യമല്ല' : 'No description available')}
            </p>
          </div>

          {date_analysis && (
            <div className="mb-6 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg backdrop-blur-sm">
              <h3 className={clsx(
                "text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100 flex items-center",
                isMalayalam && "text-xl leading-relaxed"
              )}>
                <Calendar className="w-5 h-5 mr-2" />
                {language === 'ml' ? 'തീയതി വിശകലനം' : 'Date Analysis'}
              </h3>
              {renderDateAnalysis()}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className={clsx(
              "p-4 rounded-lg",
              ai_generated
                ? "bg-amber-50 dark:bg-amber-900/10 border border-amber-200" 
                : "bg-green-50 dark:bg-green-900/10 border border-green-200"
            )}>
              <h4 className="font-medium mb-2 flex items-center">
                <Cpu className="w-4 h-4 mr-2" />
                {language === 'ml' ? 'AI നിർമ്മിതം' : 'AI Generated'}
              </h4>
              <p className="flex items-center text-sm">
                {ai_generated ? (
                  <>
                    <AlertTriangle className="w-4 h-4 mr-1.5 text-amber-500" />
                    <span className={clsx(
                      "text-amber-700 dark:text-amber-400",
                      isMalayalam && "text-base"
                    )}>
                      {language === 'ml' ? 'AI സൃഷ്ടിച്ച ചിത്രം' : 'AI generated image detected'}
                    </span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-1.5 text-green-500" />
                    <span className={clsx(
                      "text-green-700 dark:text-green-400",
                      isMalayalam && "text-base"
                    )}>
                      {language === 'ml' ? 'AI സൃഷ്ടിച്ച ചിത്രമല്ല' : 'No AI generation detected'}
                    </span>
                  </>
                )}
              </p>
            </div>

            <div className={clsx(
              "p-4 rounded-lg",
              deepfake
                ? "bg-amber-50 dark:bg-amber-900/10 border border-amber-200" 
                : "bg-green-50 dark:bg-green-900/10 border border-green-200"
            )}>
              <h4 className="font-medium mb-2 flex items-center">
                <Camera className="w-4 h-4 mr-2" />
                {language === 'ml' ? 'ഡീപ്‌ഫേക്ക്' : 'Deepfake'}
              </h4>
              <p className="flex items-center text-sm">
                {deepfake ? (
                  <>
                    <AlertTriangle className="w-4 h-4 mr-1.5 text-amber-500" />
                    <span className={clsx(
                      "text-amber-700 dark:text-amber-400",
                      isMalayalam && "text-base"
                    )}>
                      {language === 'ml' ? 'ഡീപ്‌ഫേക്ക് ചിത്രം' : 'Deepfake detected'}
                    </span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-1.5 text-green-500" />
                    <span className={clsx(
                      "text-green-700 dark:text-green-400",
                      isMalayalam && "text-base"
                    )}>
                      {language === 'ml' ? 'ഡീപ്‌ഫേക്കല്ല' : 'No deepfake detected'}
                    </span>
                  </>
                )}
              </p>
            </div>

            <div className={clsx(
              "p-4 rounded-lg",
              tampering_analysis
                ? "bg-amber-50 dark:bg-amber-900/10 border border-amber-200" 
                : "bg-green-50 dark:bg-green-900/10 border border-green-200"
            )}>
              <h4 className="font-medium mb-2 flex items-center">
                <Scissors className="w-4 h-4 mr-2" />
                {language === 'ml' ? 'കൃത്രിമ മാറ്റങ്ങൾ' : 'Image Tampering'}
              </h4>
              <p className="flex items-center text-sm">
                {tampering_analysis ? (
                  <>
                    <AlertTriangle className="w-4 h-4 mr-1.5 text-amber-500" />
                    <span className={clsx(
                      "text-amber-700 dark:text-amber-400",
                      isMalayalam && "text-base"
                    )}>
                      {language === 'ml' ? 'കൃത്രിമ മാറ്റങ്ങൾ കണ്ടെത്തി' : 'Tampering detected'}
                    </span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-1.5 text-green-500" />
                    <span className={clsx(
                      "text-green-700 dark:text-green-400",
                      isMalayalam && "text-base"
                    )}>
                      {language === 'ml' ? 'കൃത്രിമ മാറ്റങ്ങൾ ഇല്ല' : 'No tampering detected'}
                    </span>
                  </>
                )}
              </p>
            </div>

            <div className={clsx(
              "p-4 rounded-lg",
              reverse_search.found
                ? "bg-amber-50 dark:bg-amber-900/10 border border-amber-200" 
                : "bg-green-50 dark:bg-green-900/10 border border-green-200"
            )}>
              <h4 className="font-medium mb-2 flex items-center">
                <Search className="w-4 h-4 mr-2" />
                {language === 'ml' ? 'ഓൺലൈൻ തിരയൽ' : 'Online Search'}
              </h4>
              {renderWebMatches()}
            </div>
          </div>

          {(text_analysis || (extractedText && extractedText.length > 10)) && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className={clsx(
                "text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center",
                isMalayalam && "text-xl leading-relaxed"
              )}>
                <FileText className="w-5 h-5 mr-2" />
                {language === 'ml' ? 'വാചക വിശകലനം' : 'Text Analysis'}
              </h3>
              {renderTextAnalysis()}
              
              {text_analysis?.reverse_search && (
                <div className="mt-6">
                  <h4 className={clsx(
                    "font-medium mb-3 flex items-center",
                    isMalayalam && "text-lg"
                  )}>
                    <Search className="w-4 h-4 mr-2" />
                    {language === 'ml' ? 'വാചക തിരയൽ ഫലങ്ങൾ' : 'Text Search Results'}
                  </h4>
                  {renderTextReverseSearch()}
                </div>
              )}
            </div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
};