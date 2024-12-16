import React from 'react';
import { Newspaper } from 'lucide-react';
import { LanguageToggle } from './LanguageToggle';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../locales/translations';
import { Logo } from './Logo';

export function Header() {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Newspaper className="h-8 w-8 text-blue-600 mr-3" />
            <Logo />
          </div>
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}
