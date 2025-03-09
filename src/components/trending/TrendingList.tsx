import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Loader2, ChevronRight, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { TrendingNews } from '../../types/trending';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../locales/translations';
import { GlassCard } from '../common/GlassCard';
import clsx from 'clsx';
import { TrendingListSkeleton } from './TrendingListSkeleton';

interface Props {
  trendingNews: TrendingNews[];
  isLoading: boolean;
  onItemClick?: (news: TrendingNews) => void;
}

export const TrendingList: React.FC<Props> = ({ trendingNews, isLoading, onItemClick }) => {
  const { language } = useLanguage();
  const isMalayalam = language === 'ml';

  // Format date to a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return language === 'ml' ? 'ഇന്ന്' : 'Today';
    } else if (diffDays === 1) {
      return language === 'ml' ? 'ഇന്നലെ' : 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} ${language === 'ml' ? 'ദിവസം മുമ്പ്' : 'days ago'}`;
    } else {
      return date.toLocaleDateString(language === 'ml' ? 'ml-IN' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  // Limit title length with ellipsis
  const truncateTitle = (title: string, maxLength: number = 60) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  };

  if (isLoading) {
    return <TrendingListSkeleton />;
  }

  if (!trendingNews.length) {
    return (
      <GlassCard className="py-12 text-center">
        <p className={clsx(
          "text-gray-600 dark:text-gray-400",
          isMalayalam && "text-lg"
        )}>
          {translations[language].noTrendingData}
        </p>
      </GlassCard>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <TrendingUp className="w-6 h-6 text-blue-500 dark:text-blue-400 mr-2" />
          <h2 className={clsx(
            "text-xl font-semibold text-gray-800 dark:text-gray-100",
            isMalayalam && "text-2xl"
          )}>
            {translations[language].trendingTitle}
          </h2>
        </div>
        
        <div className={clsx(
          "text-sm text-gray-500 dark:text-gray-400",
          isMalayalam && "text-base"
        )}>
          {language === 'ml' ? 'അവലോകനങ്ങളുടെ എണ്ണം' : 'Analysis Count'}
        </div>
      </div>

      {/* Trending List */}
      <GlassCard className="overflow-hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          <AnimatePresence>
            {trendingNews.map((news, index) => (
              <motion.div
                key={news.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onItemClick?.(news)}
                className={clsx(
                  "flex items-center p-4 group cursor-pointer",
                  "hover:bg-blue-50/50 dark:hover:bg-blue-900/20",
                  "transition-colors duration-200"
                )}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onItemClick?.(news);
                  }
                }}
              >
                {/* Rank Number */}
                <div className={clsx(
                  "flex-shrink-0 w-10 h-10 flex items-center justify-center",
                  "rounded-full bg-blue-50 dark:bg-blue-900/30",
                  "text-lg font-bold text-blue-600 dark:text-blue-400"
                )}>
                  {index + 1}
                </div>

                {/* Content */}
                <div className="ml-4 flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className={clsx(
                        "font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400",
                        "transition-colors duration-200",
                        isMalayalam ? "text-base" : "text-sm"
                      )}>
                        {truncateTitle(news.title)}
                      </h3>
                      
                      <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400 space-x-2">
                        <div className="flex items-center">
                          <Calendar className="w-3.5 h-3.5 mr-1" />
                          <span>{formatDate(news.date)}</span>
                        </div>
                        
                        <div className="flex items-center">
                          {news.reliability === 'reliable' ? (
                            <CheckCircle className="w-3.5 h-3.5 mr-1 text-green-500" />
                          ) : (
                            <AlertCircle className="w-3.5 h-3.5 mr-1 text-red-500" />
                          )}
                          <span className={clsx(
                            news.reliability === 'reliable' 
                              ? "text-green-600 dark:text-green-400" 
                              : "text-red-600 dark:text-red-400"
                          )}>
                            {translations[language][news.reliability]}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center ml-2">
                      <div className={clsx(
                        "bg-blue-100 dark:bg-blue-900/40 rounded-full px-2.5 py-1",
                        "text-blue-800 dark:text-blue-300 font-medium",
                        isMalayalam ? "text-sm" : "text-xs"
                      )}>
                        {news.searchCount}
                      </div>
                    </div>
                  </div>
                </div>
                
                <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-600 ml-2 
                  opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </GlassCard>
    </motion.div>
  );
};