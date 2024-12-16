import React from 'react';
import { TrendingNews } from '../../types/trending';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../locales/translations';

interface Props {
  trendingNews: TrendingNews[];
  isLoading: boolean;
  onItemClick?: (news: TrendingNews) => void;
}

export const TrendingList: React.FC<Props> = ({ trendingNews, isLoading, onItemClick }) => {
  const { language } = useLanguage();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!trendingNews.length) {
    return (
      <div className="text-center py-8 text-gray-600">
        {translations[language].noTrendingData}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {trendingNews.map((news, index) => (
        <div
          key={news.id}
          onClick={() => onItemClick?.(news)}
          className="flex items-center p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
        >
          <div className="flex-shrink-0 w-8 text-xl font-bold text-gray-500">
            {index + 1}
          </div>
          <div className="flex-grow px-4">
            <h3 className="text-lg font-semibold">{news.title}</h3>
            <span className="text-sm text-gray-600">
              {translations[language].searchCount}: {news.searchCount}
            </span>
          </div>
          <div className="flex-shrink-0">
            <span className={`px-3 py-1 rounded-full text-sm ${
              news.reliability === 'reliable' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {translations[language][news.reliability]}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};