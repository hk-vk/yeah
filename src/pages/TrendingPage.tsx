import React, { useEffect, useState } from 'react';
import { TrendingList } from '../components/trending/TrendingList';
import { TrendingNews } from '../types/trending';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../locales/translations';

export const TrendingPage: React.FC = () => {
  const [trendingNews, setTrendingNews] = useState<TrendingNews[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    const fetchTrendingNews = async () => {
      try {
        setIsLoading(true);
        // Replace with actual API call
        const mockData: TrendingNews[] = [
          {
            id: '1',
            title: 'മുല്ലപ്പെരിയാർ ഡാം പൊട്ടി ',
            searchCount: 1500,
            reliability: 'suspicious',
            date: new Date().toISOString()
          },
          {
            id: '2',
            title: '2024 ഓസ്കർ ആവാർഡുകൾ പ്രഖ്യാപിച്ചു. മികച്ച ഓൾറൌണ്ടർ സന്തോഷ് പണ്ഡിറ്റ് ',
            searchCount: 1200,
            reliability: 'reliable',
            date: new Date().toISOString()
          }
        ];
        setTrendingNews(mockData);
      } catch (error) {
        console.error('Error fetching trending news:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingNews();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-blue-600">
      <h1 className="text-3xl font-bold mb-6 text-indigo-700">
        {translations[language].trendingTitle}
      </h1>
      <TrendingList trendingNews={trendingNews} isLoading={isLoading} />
    </div>
  );
};