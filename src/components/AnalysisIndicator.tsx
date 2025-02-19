import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { INDICATORS } from '../constants/indicators';
import type { IndicatorResult } from '../types';
import clsx from 'clsx';

interface Props {
  indicator: IndicatorResult & { title?: string };
}

export function AnalysisIndicator({ indicator }: Props) {
  const { language } = useLanguage();
  const indicatorType = INDICATORS[indicator.id];
  const isMalayalam = language === 'ml';

  if (!indicatorType) return null;

  const { name, description } = indicatorType.translations[language];

  const getColorClass = (score: number) => {
    if (indicator.id === 'sensationalism' || indicator.id === 'clickbait') {
      // For negative indicators, reverse the color scale
      if (score < 33) return 'bg-green-500 dark:bg-green-600';
      if (score < 66) return 'bg-amber-500 dark:bg-amber-600';
      return 'bg-red-500 dark:bg-red-600';
    } else {
      // For positive indicators like writing style, keep normal scale
      if (score > 66) return 'bg-green-500 dark:bg-green-600';
      if (score > 33) return 'bg-amber-500 dark:bg-amber-600';
      return 'bg-red-500 dark:bg-red-600';
    }
  };

  const getBgClass = (score: number) => {
    if (indicator.id === 'sensationalism' || indicator.id === 'clickbait') {
      if (score < 33) return 'bg-green-100 dark:bg-green-900/20';
      if (score < 66) return 'bg-amber-100 dark:bg-amber-900/20';
      return 'bg-red-100 dark:bg-red-900/20';
    } else {
      if (score > 66) return 'bg-green-100 dark:bg-green-900/20';
      if (score > 33) return 'bg-amber-100 dark:bg-amber-900/20';
      return 'bg-red-100 dark:bg-red-900/20';
    }
  };

  return (
    <div className="mb-6 last:mb-0">
      <div className="flex items-center justify-between mb-2">
        <span className={clsx(
          "text-sm font-medium text-gray-800 dark:text-gray-100",
          isMalayalam && "malayalam-text indicator-text"
        )}>
          {name}
        </span>
        <span className={clsx(
          "text-sm px-2.5 py-1 rounded-full font-medium ml-4",
          getBgClass(indicator.score),
          getColorClass(indicator.score).replace('bg-', 'text-')
        )}>
          {indicator.score}%
        </span>
      </div>
      <div className={clsx(
        "w-full rounded-full h-2.5 mb-2",
        getBgClass(indicator.score)
      )}>
        <div
          className={clsx(
            "h-2.5 rounded-full transition-all duration-500",
            getColorClass(indicator.score)
          )}
          style={{ width: `${indicator.score}%` }}
        ></div>
      </div>
      <p className={clsx(
        "text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed",
        isMalayalam && "malayalam-text"
      )}>
        {description}
      </p>
    </div>
  );
}
