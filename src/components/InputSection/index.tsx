import React, { useState, useEffect } from 'react';
import { InputTabs } from './InputTabs';
import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../locales/translations';
import { VerificationButton } from '../common/buttons/VerificationButton';
import { UnifiedInput } from './UnifiedInput';
import type { InputType } from '../../types';

interface Props {
  onAnalyze: (data: { type: InputType; content: string; imageContent?: string }) => void;
}

export function InputSection({ onAnalyze }: Props) {
  const [activeTab, setActiveTab] = useState<InputType>('text');
  const [inputValue, setInputValue] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { language } = useLanguage();
  const t = translations[language];

  // Clear content when switching tabs via tab buttons (but not via auto-detection)
  const handleTabChange = (newTab: InputType) => {
    if (newTab !== activeTab) {
      setInputValue('');
      setImagePreview(null);
      setActiveTab(newTab);
    }
  };

  const handleImageSelect = (file: File | null) => {
    if (!file) {
      setImagePreview(null);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const isValid = () => {
    // If we have an image, it's always valid regardless of the tab
    if (imagePreview) {
      return true;
    }
    
    // If no image, then check based on the selected tab
    if (activeTab === 'text') {
      return inputValue.length >= 20;
    }
    
    if (activeTab === 'url') {
      return /^https?:\/\/.+/.test(inputValue);
    }
    
    // For image tab with no image
    return false;
  };

  const handleVerification = async () => {
    if (isValid()) {
      // If we have an image, always include it in analysis
      if (imagePreview) {
        await onAnalyze({ 
          type: activeTab, 
          content: inputValue, 
          imageContent: imagePreview 
        });
      } else if (activeTab === 'url' && /^https?:\/\/.+/.test(inputValue)) {
        // For URL analysis without image
        await onAnalyze({ 
          type: 'url', 
          content: inputValue 
        });
      } else if (activeTab === 'text' && inputValue.length >= 20) {
        // For text-only analysis
        await onAnalyze({ 
          type: 'text', 
          content: inputValue
        });
      }
    }
  };

  // Called by UnifiedInput when content type changes
  const handleTypeChange = (detectedType: InputType) => {
    setActiveTab(detectedType);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
      <InputTabs activeTab={activeTab} onTabChange={handleTabChange} />
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t.inputLabel}
        </label>
        
        <UnifiedInput 
          value={inputValue} 
          onChange={setInputValue}
          onFileSelect={handleImageSelect}
          imagePreview={imagePreview}
          onTypeChange={handleTypeChange}
        />
      </div>

      {!isValid() && (
        <div className="flex items-center text-yellow-600 text-sm mb-4">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <span>
            {activeTab === 'text' && !inputValue.length && !imagePreview && t.minLengthWarning}
            {activeTab === 'url' && !imagePreview && (language === 'ml' ? 'സാധുവായ URL നൽകുക' : 'Please enter a valid URL')}
            {activeTab === 'image' && !imagePreview && (language === 'ml' ? 'ദയവായി ഒരു ചിത്രം തിരഞ്ഞെടുക്കുക' : 'Please select an image')}
          </span>
        </div>
      )}

      <VerificationButton
        onClick={handleVerification}
        isDisabled={!isValid()}
        className="w-full"
      />
    </div>
  );
}
