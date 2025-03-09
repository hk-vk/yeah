import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SupabaseService } from '../../services/supabaseService';
import { useAuth } from '../../contexts/AuthContext';
import { Clock, FileText, Image, Link as LinkIcon, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../locales/translations';
import { HistoryItem } from '../../types';
import clsx from 'clsx';

export function AnalysisHistory({ onSelectAnalysis }: { onSelectAnalysis: (analysis: HistoryItem) => void }) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      try {
        const data = await SupabaseService.getAnalysisByUserId(user.id);
        setHistory(data);
      } catch (error) {
        console.error('Error fetching analysis history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [user?.id]);

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
          isExpanded ? "max-h-96 overflow-y-auto" : "max-h-12"
        )}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div 
          className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300">
              {t.analysisHistory || 'Analysis History'}
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
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {history.slice(0, 10).map((item) => (
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