import React, { useEffect, useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '../common/Button';
import { useLanguage } from '../../contexts/LanguageContext';

interface FeedbackFormProps {
  onSubmit: (feedback: string) => void;
}

export function FeedbackForm({ onSubmit }: FeedbackFormProps) {
  const [feedback, setFeedback] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const { language } = useLanguage();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback.trim()) {
      onSubmit(feedback);
      setFeedback('');
      setShowSuccess(true);
    }
  };

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="mt-4">
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder={language === 'ml' ? 'നിങ്ങളുടെ അഭിപ്രായം പങ്കുവയ്ക്കുക...' : 'Share your feedback...'}
          className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
          rows={4}
        />
        <div className="mt-2 flex justify-end">
          <Button
            type="submit"
            disabled={!feedback.trim() || showSuccess}
            className="flex items-center space-x-2"
          >
            <Send className="h-4 w-4" />
            <span>{language === 'ml' ? 'സമർപ്പിക്കുക' : 'Submit'}</span>
          </Button>
        </div>
      </form>
      {showSuccess && (
        <div className="mt-4 text-white text-sm bg-green-600 p-2 rounded-lg text-center animate-fade-in">
          {language === 'ml' ? 'അഭിപ്രായം സമർപ്പിച്ചു!' : 'Feedback submitted successfully!'}
        </div>
      )}
    </div>
  );
}
