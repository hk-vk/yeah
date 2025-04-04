import React, { useState, useEffect, useCallback, memo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../../contexts/LanguageContext';
import { quotes } from './quotes';
import { QuoteCard } from './QuoteCard';

export const QuoteSlider = memo(function QuoteSlider() {
  const { language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const currentQuotes = quotes[language];

  const nextQuote = useCallback(() => {
    if (!isPaused) {
      setCurrentIndex((prev) => (prev + 1) % currentQuotes.length);
    }
  }, [currentQuotes.length, isPaused]);

  useEffect(() => {
    const timer = setInterval(nextQuote, 7000);
    return () => clearInterval(timer);
  }, [nextQuote]);

  const handleQuoteClick = useCallback((index: number) => {
    setCurrentIndex(index);
    // Pause for a moment when user interacts
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 5000);
  }, []);

  return (
    <section className="py-12 overflow-hidden">
      <div className="relative max-w-4xl mx-auto px-4">
        <AnimatePresence mode="wait" initial={false}>
          <QuoteCard
            key={currentIndex}
            text={currentQuotes[currentIndex].text}
            author={currentQuotes[currentIndex].author}
            index={currentIndex}
          />
        </AnimatePresence>

        <div className="flex justify-center mt-6 space-x-2">
          {currentQuotes.map((_, index) => (
            <button
              key={index}
              onClick={() => handleQuoteClick(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 transform-gpu ${
                index === currentIndex
                  ? 'bg-blue-600 w-6'
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
              }`}
              aria-label={`Go to quote ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
});
