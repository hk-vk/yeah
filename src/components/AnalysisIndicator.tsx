import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { INDICATORS } from '../constants/indicators';
import type { IndicatorResult } from '../types';

interface Props {
  indicator: IndicatorResult;
}

export function AnalysisIndicator({ indicator }: Props) {
  const { language } = useLanguage();
  const indicatorType = INDICATORS[indicator.id];

  if (!indicatorType) return null;

  const { name, description } = indicatorType.translations[language];

  const getColorClass = (score: number) => {
    if (score < 33) return 'bg-green-500';
    if (score < 66) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{name}</span>
        <span className="text-sm text-gray-600 dark:text-gray-300">{indicator.score}%</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full ${getColorClass(indicator.score)}`}
          style={{ width: `${indicator.score}%` }}
        ></div>
      </div>
      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{description}</p>
    </div>
  );
}
