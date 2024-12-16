import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface Props {
  onImageSelect: (file: File) => void;
  previewUrl: string | null;
}

export function ImageInput({ onImageSelect, previewUrl }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { language } = useLanguage();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onImageSelect(file);
    }
  };

  return (
    <div className="mt-1">
      <div
        onClick={() => fileInputRef.current?.click()}
        className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 cursor-pointer"
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Preview"
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-1 text-sm text-gray-600">
              {language === 'ml' ? 'ചിത്രം അപ്‌ലോഡ് ചെയ്യുക' : 'Upload Image'}
            </p>
            <p className="text-xs text-gray-500">
              {language === 'ml' ? 'PNG, JPG, GIF' : 'PNG, JPG, GIF'}
            </p>
          </div>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
}
