import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../../contexts/LanguageContext';
import { quotes } from './quotes';
import { QuoteCard } from './QuoteCard';

export function QuoteSlider() {
  const { language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentQuotes = quotes[language];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % currentQuotes.length);
    }, 7000); // Increased interval to 7 seconds

    return () => clearInterval(timer);
  }, [currentQuotes.length]);

  return (
    <section className="py-12">
      <div className="relative max-w-4xl mx-auto px-4">
        <AnimatePresence mode="wait">
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
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
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
}
