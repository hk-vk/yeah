import React from 'react';
import { TrendingNews } from '../../types/trending';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../locales/translations';

interface Props {
  news: TrendingNews;
  rank: number;
  onClick: () => void;
}

export const TrendingItem: React.FC<Props> = ({ news, rank, onClick }) => {
  const { language } = useLanguage();

  return (
    <div 
      className="bg-white rounded-lg shadow-md p-4 mb-2 hover:shadow-lg transition-all hover:scale-102 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
          {rank}
        </div>
        <div className="flex-grow">
          <h3 className="text-xl font-semibold mb-1">{news.title}</h3>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">
              {translations[language].searchCount}: {news.searchCount.toLocaleString()}
            </span>
            <span className={`px-3 py-1 rounded-full ${
              news.reliability === 'reliable' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {translations[language][news.reliability]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};