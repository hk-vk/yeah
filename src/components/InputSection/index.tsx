import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Image, FileText, X, Globe, Link } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../locales/translations';
import toast from 'react-hot-toast';
import { GlassCard } from '../common/GlassCard';
import clsx from 'clsx';
import type { InputType } from '../../types';

interface Props {
  onAnalyze: (data: { type: InputType; content: string; imageContent?: string }) => void;
  isAnalyzing?: boolean;
}

export function InputSection({ onAnalyze, isAnalyzing = false }: Props) {
  const [text, setText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageHovered, setIsImageHovered] = useState(false);
  const [isUrl, setIsUrl] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const { language } = useLanguage();
  const isMalayalam = language === 'ml';

  // Check if the text is a valid URL
  const isValidUrl = (text: string): boolean => {
    try {
      new URL(text);
      return true;
    } catch (e) {
      return false;
    }
  };

  // Update URL status when text changes
  useEffect(() => {
    setIsUrl(isValidUrl(text.trim()));
  }, [text]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate text input - at least some text or an image is required
    if (!text.trim() && !selectedImage) {
      toast.error(
        language === 'ml'
          ? 'ദയവായി വാചകം നൽകുക അല്ലെങ്കിൽ ചിത്രം തിരഞ്ഞെടുക്കുക'
          : 'Please enter text or select an image'
      );
      return;
    }

    // Different validation for URLs vs. regular text
    if (text.trim() && !isUrl && text.trim().length < 20) {
      toast.error(
        language === 'ml' 
          ? 'കുറഞ്ഞത് 20 അക്ഷരങ്ങളെങ്കിലും നൽകുക' 
          : 'Please enter at least 20 characters'
      );
      return;
    }

    // Determine input type, checking if it's a URL
    let type: InputType = selectedImage ? 'image' : 'text';
    if (isUrl) {
      type = 'url';
    }

    // Pass data to parent component
    onAnalyze({ 
      type, 
      content: text.trim(),
      imageContent: selectedImage || undefined 
    });
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    
    // Auto-expand textarea as content grows
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = `${Math.min(300, textAreaRef.current.scrollHeight)}px`;
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.match('image.*')) {
        toast.error(
          language === 'ml'
            ? 'ദയവായി ശരിയായ ചിത്ര ഫോർമാറ്റ് തിരഞ്ഞെടുക്കുക'
            : 'Please select a valid image format'
        );
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(
          language === 'ml'
            ? 'ചിത്രം 5MB-ൽ കുറവായിരിക്കണം'
            : 'Image must be less than 5MB'
        );
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          setSelectedImage(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <GlassCard className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            {/* Label */}
            <div className="text-blue-600 dark:text-blue-400 text-xs mb-2 ml-1">
              {translations[language].inputLabel}
            </div>

            {/* URL Indicator */}
            {isUrl && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute top-3 left-3 z-10 pointer-events-none"
              >
                <div className="flex items-center px-2.5 py-1 bg-blue-100 dark:bg-blue-900/40 rounded-full border border-blue-300 dark:border-blue-700/50 shadow-sm">
                  <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="ml-1.5 text-xs font-medium text-blue-700 dark:text-blue-300">
                    URL
                  </span>
                </div>
              </motion.div>
            )}

            {/* Text Input Area */}
            <textarea
              ref={textAreaRef}
              value={text}
              onChange={handleTextChange}
              placeholder={translations[language].placeholder}
              className={clsx(
                "w-full bg-white/50 dark:bg-gray-800/50 rounded-lg resize-none shadow-sm",
                "border border-gray-200 dark:border-gray-700",
                "focus:border-blue-400 focus:ring-2 focus:ring-blue-300/30 dark:focus:ring-blue-700/30 focus:outline-none",
                "placeholder:text-gray-400 dark:placeholder:text-gray-500",
                "transition-all duration-200",
                isUrl ? "pt-12 pb-4 px-4" : "pt-4 pb-4 px-4",
                "min-h-[120px]",
                isMalayalam && "text-lg",
                isUrl && "border-blue-400 dark:border-blue-600"
              )}
            />

            {/* Character Count */}
            {text && !isUrl && (
              <div className={clsx(
                "absolute bottom-3 right-4 text-xs",
                text.length < 20 ? "text-amber-500 dark:text-amber-400" : "text-gray-500 dark:text-gray-400"
              )}>
                {text.length} {text.length < 20 && <span>/ 20</span>}
              </div>
            )}

            {/* URL hint if detected */}
            {isUrl && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-2 ml-1 text-xs flex items-center"
              >
                <div className="flex items-center text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md">
                  <Link className="w-3 h-3 mr-1.5" />
                  {language === 'ml' 
                    ? 'URL വിശകലനം നടത്തുന്നു' 
                    : 'URL detected - content will be extracted and analyzed'}
                </div>
              </motion.div>
            )}
          </div>

          {/* Preview Image if selected */}
          {selectedImage && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative mt-4"
            >
              <div 
                className="relative rounded-lg overflow-hidden border border-blue-200 dark:border-blue-800 shadow-md"
                onMouseEnter={() => setIsImageHovered(true)}
                onMouseLeave={() => setIsImageHovered(false)}
              >
                <img 
                  src={selectedImage} 
                  alt="Preview" 
                  className="w-full max-h-64 object-contain" 
                />
                <motion.div 
                  className="absolute inset-0 bg-black/50 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isImageHovered ? 0.5 : 0 }}
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                <span className="bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md">
                  {language === 'ml' ? 'ചിത്രം തിരിച്ചറിയുന്നതാണ്' : 'Image will be processed for analysis'}
                </span>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-2">
            {/* Image Upload Button */}
            <motion.button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isAnalyzing}
              whileHover={{ scale: isAnalyzing ? 1 : 1.02 }}
              whileTap={{ scale: isAnalyzing ? 1 : 0.98 }}
              className={clsx(
                "flex items-center gap-1.5 px-4 py-2 rounded-lg transition-colors shadow-sm",
                "bg-indigo-50 text-indigo-700 border border-indigo-200",
                "dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800/30",
                "hover:bg-indigo-100 dark:hover:bg-indigo-800/40",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                isMalayalam && "text-base"
              )}
            >
              <Image className="w-5 h-5" />
              {selectedImage
                ? (language === 'ml' ? 'ചിത്രം മാറ്റുക' : 'Change Image')
                : (language === 'ml' ? 'ചിത്രം ചേർക്കുക' : 'Add Image')
              }
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                className="hidden"
                disabled={isAnalyzing}
              />
            </motion.button>
            
            {/* Analyze Button */}
            <motion.button
              type="submit"
              disabled={isAnalyzing}
              className={clsx(
                "flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all shadow-md",
                isUrl ? (
                  "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                ) : (
                  "bg-blue-600 hover:bg-blue-700"
                ),
                "text-white border border-transparent",
                "dark:border-blue-700/50",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                isMalayalam && "text-base"
              )}
              whileHover={{ scale: isAnalyzing ? 1 : 1.02 }}
              whileTap={{ scale: isAnalyzing ? 1 : 0.98 }}
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{language === 'ml' ? 'വിശകലനം ചെയ്യുന്നു...' : 'Analyzing...'}</span>
                </>
              ) : (
                <>
                  {isUrl ? <Globe className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                  {isUrl 
                    ? (language === 'ml' ? 'URL വിശകലനം ചെയ്യുക' : 'Analyze URL')
                    : translations[language].analyzeButton}
                </>
              )}
            </motion.button>
          </div>
        </form>
      </GlassCard>
    </motion.div>
  );
}
