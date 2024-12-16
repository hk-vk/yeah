import React from 'react';
import { Type, Link, Image } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { InputType } from '../../types';

interface Props {
  activeTab: InputType;
  onTabChange: (tab: InputType) => void;
}

export function InputTabs({ activeTab, onTabChange }: Props) {
  const { language } = useLanguage();
  
  const tabs = [
    { id: 'text' as const, icon: Type, labelMl: 'വാചകം', labelEn: 'Text' },
    { id: 'url' as const, icon: Link, labelMl: 'URL', labelEn: 'URL' },
    { id: 'image' as const, icon: Image, labelMl: 'ചിത്രം', labelEn: 'Image' },
  ];

  return (
    <div className="flex space-x-2 mb-4">
      {tabs.map(({ id, icon: Icon, labelMl, labelEn }) => (
        <button
          key={id}
          onClick={() => onTabChange(id)}
          className={`flex items-center px-4 py-2 rounded-md ${
            activeTab === id
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Icon className="w-4 h-4 mr-2" />
          <span>{language === 'ml' ? labelMl : labelEn}</span>
        </button>
      ))}
    </div>
  );
}
