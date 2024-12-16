import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function URLInput({ value, onChange }: Props) {
  const { language } = useLanguage();
  
  return (
    <input
      type="url"
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      placeholder={language === 'ml' ? 'വാർത്തയുടെ URL ഇവിടെ നൽകുക...' : 'Enter news URL here...'}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
