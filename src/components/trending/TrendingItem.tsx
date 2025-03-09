import React from 'react';
import { motion } from 'framer-motion';
import { TrendingNews } from '../../types/trending';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../locales/translations';
import { GlassCard } from '../common/GlassCard';
import { ChartBarIcon, TrendingUpIcon } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  news: TrendingNews;
  rank: number;
  onClick: () => void;
}

export const TrendingItem: React.FC<Props> = ({ news, rank, onClick }) => {
  const { language } = useLanguage();
  const isMalayalam = language === 'ml';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <GlassCard 
        className={clsx(
          "p-4 cursor-pointer hover:shadow-lg transition-shadow duration-300",
          "group hover:bg-blue-50/30 dark:hover:bg-blue-900/20"
        )}
        onClick={onClick}
      >
        <div className="flex items-center gap-4">
          <div className={clsx(
            "flex-shrink-0 w-12 h-12 rounded-full",
            "bg-gradient-to-br from-blue-400 to-purple-500 dark:from-blue-500 dark:to-purple-600",
            "flex items-center justify-center text-white font-bold",
            "shadow-md group-hover:shadow-lg transition-shadow duration-300",
            isMalayalam ? "text-xl" : "text-lg"
          )}>
            {rank}
          </div>

          <div className="flex-grow">
            <h3 className={clsx(
              "font-semibold text-gray-800 dark:text-gray-100 mb-2",
              "group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors",
              isMalayalam ? "text-xl leading-relaxed" : "text-lg"
            )}>
              {news.title}
            </h3>

            <div className="flex justify-between items-center">
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <ChartBarIcon className="w-4 h-4 mr-1.5" />
                <span className={clsx(
                  isMalayalam ? "text-base" : "text-sm"
                )}>
                  {translations[language].searchCount}: {news.searchCount.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className={clsx(
                  "px-3 py-1 rounded-full font-medium transition-colors",
                  isMalayalam ? "text-sm" : "text-xs",
                  news.reliability === 'reliable' 
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                )}>
                  {translations[language][news.reliability]}
                </span>
                <TrendingUpIcon className="w-4 h-4 text-blue-500 dark:text-blue-400 
                  opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};