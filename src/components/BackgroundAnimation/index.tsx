import React from 'react';
import { FloatingLetter } from './FloatingLetter';
import { NewsItem } from './NewsItem';
import { MALAYALAM_LETTERS, ANIMATION_CONFIG } from './constants';

export function BackgroundAnimation() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Malayalam Letters */}
      {Array.from({ length: ANIMATION_CONFIG.letterCount }).map((_, index) => (
        <FloatingLetter
          key={`letter-${index}`}
          letter={MALAYALAM_LETTERS[index % MALAYALAM_LETTERS.length]}
          index={index}
          className="absolute"
        />
      ))}
      
      {/* News Icons */}
      {Array.from({ length: ANIMATION_CONFIG.newsItemCount }).map((_, index) => (
        <NewsItem key={`news-${index}`} index={index} />
      ))}
    </div>
  );
}
