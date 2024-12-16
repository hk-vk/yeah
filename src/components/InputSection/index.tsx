import React, { useState } from 'react';
import { InputTabs } from './InputTabs';
import { TextInput } from './TextInput';
import { URLInput } from './URLInput';
import { ImageInput } from './ImageInput';
import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../locales/translations';
import { VerificationButton } from '../common/buttons/VerificationButton';
import type { InputType } from '../../types';

interface Props {
  onAnalyze: (data: { type: InputType; content: string }) => void;
}

export function InputSection({ onAnalyze }: Props) {
  const [activeTab, setActiveTab] = useState<InputType>('text');
  const [textInput, setTextInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { language } = useLanguage();
  const t = translations[language];

  const handleImageSelect = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const getContent = () => {
    switch (activeTab) {
      case 'text':
        return textInput;
      case 'url':
        return urlInput;
      case 'image':
        return imagePreview || '';
    }
  };

  const isValid = () => {
    const content = getContent();
    switch (activeTab) {
      case 'text':
        return content.length >= 20;
      case 'url':
        return /^https?:\/\/.+/.test(content);
      case 'image':
        return !!content;
    }
  };

  const handleVerification = async () => {
    if (isValid()) {
      await onAnalyze({ type: activeTab, content: getContent() });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
      <InputTabs activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t.inputLabel}
        </label>
        
        {activeTab === 'text' && (
          <TextInput value={textInput} onChange={setTextInput} />
        )}
        
        {activeTab === 'url' && (
          <URLInput value={urlInput} onChange={setUrlInput} />
        )}
        
        {activeTab === 'image' && (
          <ImageInput onImageSelect={handleImageSelect} previewUrl={imagePreview} />
        )}
      </div>

      {!isValid() && (
        <div className="flex items-center text-yellow-600 text-sm mb-4">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <span>
            {activeTab === 'text' && t.minLengthWarning}
            {activeTab === 'url' && (language === 'ml' ? 'സാധുവായ URL നൽകുക' : 'Please enter a valid URL')}
            {activeTab === 'image' && (language === 'ml' ? 'ദയവായി ഒരു ചിത്രം തിരഞ്ഞെടുക്കുക' : 'Please select an image')}
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
