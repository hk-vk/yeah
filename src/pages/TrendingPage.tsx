import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Search } from 'lucide-react';
import { TrendingList } from '../components/trending/TrendingList';
import { TrendingNews } from '../types/trending';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../locales/translations';
import { GlassCard } from '../components/common/GlassCard';
import { SupabaseService } from '../services/supabaseService';
import clsx from 'clsx';

export const TrendingPage: React.FC = () => {
  const [trendingNews, setTrendingNews] = useState<TrendingNews[]>([]);
  const [filteredNews, setFilteredNews] = useState<TrendingNews[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { language } = useLanguage();
  const isMalayalam = language === 'ml';

  useEffect(() => {
    const fetchTrendingNews = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await SupabaseService.getTrendingNews();
        setTrendingNews(data);
        setFilteredNews(data);
      } catch (error) {
        console.error('Error fetching trending news:', error);
        setError(language === 'ml' 
          ? 'വിവരങ്ങൾ ലഭ്യമാക്കുന്നതിൽ പിശക് സംഭവിച്ചു'
          : 'Error fetching trending news');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingNews();
  }, [language]);

  // Filter news based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredNews(trendingNews);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = trendingNews.filter(news =>
      news.title.toLowerCase().includes(query)
    );
    setFilteredNews(filtered);
  }, [searchQuery, trendingNews]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 
        dark:from-gray-900 dark:via-gray-900 dark:to-gray-900"
    >
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center p-2 bg-blue-100 dark:bg-blue-900/30 
            rounded-full mb-4">
            <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className={clsx(
            "text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent",
            "dark:from-blue-400 dark:to-purple-400",
            isMalayalam && "text-5xl leading-relaxed"
          )}>
            {translations[language].trendingTitle}
          </h1>
          <p className={clsx(
            "mt-4 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto",
            isMalayalam ? "text-lg leading-relaxed" : "text-base"
          )}>
            {translations[language].trendingDescription}
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <GlassCard className="p-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 
                text-gray-400 dark:text-gray-600 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={translations[language].searchInTrending}
                className={clsx(
                  "w-full pl-10 pr-4 py-2 rounded-lg",
                  "bg-transparent border border-gray-200 dark:border-gray-700",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                  "placeholder-gray-400 dark:placeholder-gray-600",
                  "text-gray-800 dark:text-gray-200",
                  isMalayalam && "text-lg"
                )}
              />
            </div>
          </GlassCard>
        </motion.div>

        {/* Background Animation */}
        <div className="fixed inset-0 -z-10">
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-indigo-500/5"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 2, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
        </div>

        {/* Content */}
        <div className="relative">
          {error ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center p-8"
            >
              <p className={clsx(
                "text-red-500 dark:text-red-400",
                isMalayalam && "text-lg"
              )}>
                {error}
              </p>
            </motion.div>
          ) : (
            <TrendingList 
              trendingNews={filteredNews} 
              isLoading={isLoading} 
              onItemClick={(news) => {
                // Handle item click - you can add navigation or other actions here
                console.log('Clicked news:', news);
              }}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};