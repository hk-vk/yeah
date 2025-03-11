import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SupabaseService } from '../../services/supabaseService';
import { useAuth } from '../../contexts/AuthContext';
import { Clock, FileText, Image, Link as LinkIcon, ChevronRight, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../locales/translations';
import { HistoryItem } from '../../types';
import clsx from 'clsx';

export function AnalysisHistory({ onSelectAnalysis }: { onSelectAnalysis: (analysis: HistoryItem) => void }) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 20;
  
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      try {
        const { data, count } = await SupabaseService.getAnalysisByUserId(user.id, 1, limit);
        setHistory(data);
        setTotalCount(count);
        setHasMore(data.length < count);
      } catch (error) {
        console.error('Error fetching analysis history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [user?.id]);

  const loadMore = async () => {
    if (!user?.id || isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const { data, count } = await SupabaseService.getAnalysisByUserId(user.id, nextPage, limit);
      
      if (data.length > 0) {
        setHistory(prev => [...prev, ...data]);
        setPage(nextPage);
        setHasMore(history.length + data.length < count);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more history:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(language === 'ml' ? 'ml-IN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <FileText className="h-4 w-4" />;
      case 'image':
      case 'text_image':
        return <Image className="h-4 w-4" />;
      case 'url':
        return <LinkIcon className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getInputSummary = (item: HistoryItem) => {
    switch (item.type) {
      case 'text':
        return item.input?.text ? 
          (item.input.text.length > 50 ? `${item.input.text.substring(0, 50)}...` : item.input.text) : 
          'Text analysis';
      case 'image':
        return 'Image analysis';
      case 'text_image':
        return 'Image with text analysis';
      case 'url':
        return item.input?.url || 'URL analysis';
      default:
        return 'Analysis';
    }
  };

  const getVerdict = (item: HistoryItem) => {
    if (!item.result) return '';
    
    // Check if it's a fake news or not based on ISFAKE value
    if (item.result.ISFAKE !== undefined) {
      return item.result.ISFAKE > 0.5 ? 
        (language === 'ml' ? 'വ്യാജം' : 'Fake') : 
        (language === 'ml' ? 'യഥാർത്ഥം' : 'Real');
    }
    
    return '';
  };

  const getVerdictColor = (verdict: string) => {
    if (!verdict) return 'text-gray-500';
    
    if (verdict.toLowerCase().includes('fake') || 
        verdict.toLowerCase() === 'വ്യാജം') {
      return 'text-red-500';
    }
    
    if (verdict.toLowerCase().includes('real') || 
        verdict.toLowerCase() === 'യഥാർത്ഥം') {
      return 'text-green-500';
    }
    
    return 'text-yellow-500';
  };

  if (!user?.id) return null;

  return (
    <div className="mb-6">
      <motion.div 
        className={clsx(
          "bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-300",
          isExpanded ? "max-h-[500px] overflow-y-auto" : "max-h-12"
        )}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div 
          className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 cursor-pointer sticky top-0 z-10"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300">
              {t.analysisHistory || 'Analysis History'} 
              {totalCount > 0 && <span className="ml-2 text-xs text-blue-500 dark:text-blue-400">({totalCount})</span>}
            </h3>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </motion.div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-3"
            >
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : history.length > 0 ? (
                <>
                  <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {history.map((item) => (
                      <li key={item.id} className="py-2">
                        <button
                          className="w-full text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded-md transition-colors duration-150"
                          onClick={() => {
                            onSelectAnalysis(item);
                            setIsExpanded(false);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <span className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                {getTypeIcon(item.type)}
                              </span>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {getInputSummary(item)}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatDate(item.created_at)}
                                </p>
                              </div>
                            </div>
                            <span className={clsx("text-xs font-medium", getVerdictColor(getVerdict(item)))}>
                              {getVerdict(item)}
                            </span>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                  
                  {hasMore && (
                    <div className="mt-4 flex justify-center">
                      <button
                        onClick={loadMore}
                        disabled={isLoadingMore}
                        className={clsx(
                          "flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150",
                          "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20",
                          "hover:bg-blue-100 dark:hover:bg-blue-800/30",
                          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50",
                          isLoadingMore && "opacity-70 cursor-not-allowed"
                        )}
                      >
                        {isLoadingMore ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                            {language === 'ml' ? 'ലോഡിംഗ്...' : 'Loading...'}
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-1" />
                            {language === 'ml' ? 'കൂടുതൽ കാണിക്കുക' : 'Load More'}
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                  {t.noAnalysisHistory || 'No analysis history found'}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
} 