import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Paperclip, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../locales/translations';
import { InputType } from '../../types';
import './styles.css';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onFileSelect: (file: File | null) => void;
  imagePreview: string | null;
  onTypeChange: (type: InputType) => void;
}

export function UnifiedInput({ value, onChange, onFileSelect, imagePreview, onTypeChange }: Props) {
  const { language } = useLanguage();
  const t = translations[language];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [inputType, setInputType] = useState<InputType>('text');

  // Update parent component about type changes
  useEffect(() => {
    onTypeChange(inputType);
  }, [inputType, onTypeChange]);

  // Auto-detect content type
  useEffect(() => {
    if (value && /^https?:\/\/.+/.test(value.trim())) {
      setInputType('url');
    } else if (value && !imagePreview) {
      setInputType('text');
    } else if (imagePreview && !value.trim()) {
      setInputType('image');
    } else if (imagePreview && value.trim()) {
      // If both image and text are present, consider it a hybrid but prioritize text for UI
      setInputType('text');
    }
  }, [value, imagePreview]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onFileSelect(file);
      
      // If there's no text, switch to image mode
      if (!value.trim()) {
        setInputType('image');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    
    // Handle image drops
    if (e.dataTransfer.files?.length) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onFileSelect(file);
        if (!value.trim()) {
          setInputType('image');
        }
        return;
      }
    }

    // Handle URL or text drops
    const text = e.dataTransfer.getData('text');
    if (text) {
      onChange(text);
      if (/^https?:\/\/.+/.test(text.trim())) {
        setInputType('url');
      } else {
        setInputType('text');
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    // Handle pasted images without preventing text paste
    const items = e.clipboardData.items;
    
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          onFileSelect(file);
          // Don't set input type here - let the useEffect handle it based on whether text is also pasted
          break;
        }
      }
    }
    
    // Don't prevent default paste operation - allow the text to be pasted
    // Type detection will happen via the onChange event and useEffect
  };

  const removeImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Clear the image preview by calling onFileSelect with null
    onFileSelect(null);
    
    // Reset to text type if we have no text content
    setInputType(!value.trim() ? 'text' : inputType);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <div 
        className={`input-container ${dragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <textarea
          rows={6}
          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm 
                   focus:border-blue-500 focus:ring-blue-500 
                   transition-all duration-300
                   hover:border-blue-400
                   dark:bg-gray-800 dark:border-gray-600 
                   dark:text-white dark:placeholder-gray-400
                   focus:scale-[1.01]"
          placeholder={language === 'ml' 
            ? 'ടെക്സ്റ്റ് ചേർക്കുക, URL പേസ്റ്റ് ചെയ്യുക, അല്ലെങ്കിൽ ഇവിടെ ചിത്രം ഡ്രോപ്പ് ചെയ്യുക...' 
            : 'Type text, paste URL, or drop an image here...'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onPaste={handlePaste}
          dir="auto"
        />
        
        {imagePreview && (
          <div className="relative p-2 flex justify-center">
            <img
              src={imagePreview}
              alt="Preview"
              className="preview-image"
            />
            <button 
              onClick={removeImage}
              className="absolute top-4 right-4 bg-white rounded-full p-1 shadow-md hover:bg-red-100"
            >
              <X size={16} className="text-gray-700" />
            </button>
          </div>
        )}
        
        <div className="drag-overlay">
          {language === 'ml' 
            ? 'ഫയൽ ഇവിടെ വലിച്ചിടുക' 
            : 'Drop file here'}
        </div>
      </div>

      <div className="flex justify-between items-center mt-2">
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center px-2 py-1 border border-gray-300 rounded-md text-xs text-gray-700 hover:bg-gray-50"
        >
          <Paperclip className="w-3 h-3 mr-1" />
          {language === 'ml' ? 'ചിത്രം ചേർക്കുക' : 'Add Image'}
        </button>

        <div className="text-xs text-gray-500 flex items-center space-x-2">
          {value.length > 0 && (
            <motion.div
              initial={false}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs text-gray-500"
            >
              {value.length} {(language === 'ml' ? 'അക്ഷരങ്ങൾ' : 'characters')}
            </motion.div>
          )}
          
          {imagePreview && (
            <motion.div
              initial={false}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs text-gray-500 flex items-center"
            >
              {value.length > 0 && <span className="mx-1">•</span>}
              <span>{language === 'ml' ? 'ചിത്രം' : 'Image'}</span>
            </motion.div>
          )}
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </motion.div>
  );
}