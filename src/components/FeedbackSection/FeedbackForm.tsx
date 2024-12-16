import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '../common/Button';
import { useLanguage } from '../../contexts/LanguageContext';

interface FeedbackFormProps {
  onSubmit: (feedback: string) => void;
}

export function FeedbackForm({ onSubmit }: FeedbackFormProps) {
  const [feedback, setFeedback] = useState('');
  const { language } = useLanguage();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback.trim()) {
      onSubmit(feedback);
      setFeedback('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder={language === 'ml' ? 'നിങ്ങളുടെ അഭിപ്രായം പങ്കുവയ്ക്കുക...' : 'Share your feedback...'}
        className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        rows={4}
      />
      <div className="mt-2 flex justify-end">
        <Button
          type="submit"
          disabled={!feedback.trim()}
          className="flex items-center space-x-2"
        >
          <Send className="h-4 w-4" />
          <span>{language === 'ml' ? 'സമർപ്പിക്കുക' : 'Submit'}</span>
        </Button>
      </div>
    </form>
  );
}
