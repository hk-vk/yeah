import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Loader2, ChevronRight } from 'lucide-react';
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
      <div className="flex items-center mb-6">
        <TrendingUp className="w-6 h-6 text-blue-500 dark:text-blue-400 mr-2" />
        <h2 className={clsx(
          "text-xl font-semibold text-gray-800 dark:text-gray-100",
          isMalayalam && "text-2xl"
        )}>
          {translations[language].trendingTitle}
        </h2>
      </div>

      {/* Trending List */}
      <GlassCard>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          <AnimatePresence>
            {trendingNews.map((news, index) => (
              <motion.div
                key={news.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
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
                  "flex-shrink-0 w-12 h-12 flex items-center justify-center",
                  "rounded-full bg-blue-50 dark:bg-blue-900/30",
                  "text-xl font-bold text-blue-600 dark:text-blue-400"
                )}>
                  {index + 1}
                </div>

                {/* Content */}
                <div className="flex-grow px-4">
                  <h3 className={clsx(
                    "font-semibold text-gray-800 dark:text-gray-100",
                    isMalayalam ? "text-lg leading-relaxed" : "text-base"
                  )}>
                    {news.title}
                  </h3>
                  <p className={clsx(
                    "text-gray-600 dark:text-gray-400",
                    isMalayalam ? "text-base" : "text-sm"
                  )}>
                    {translations[language].searchCount}: {news.searchCount}
                  </p>
                </div>

                {/* Reliability Badge */}
                <div className="flex items-center space-x-2">
                  <span className={clsx(
                    "px-3 py-1 rounded-full text-sm font-medium",
                    news.reliability === 'reliable' 
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                  )}>
                    {translations[language][news.reliability]}
                  </span>
                  <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-600 
                    opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </GlassCard>
    </motion.div>
  );
};