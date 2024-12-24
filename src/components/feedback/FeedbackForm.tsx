import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '../common/Button';
import { useLanguage } from '../../contexts/LanguageContext';

interface FeedbackFormProps {
  onSubmit: (feedback: string) => void;
}

export function FeedbackForm({ onSubmit }: FeedbackFormProps) {
  const [feedback, setFeedback] = useState('');
  const [success, setSuccess] = useState(false);
  const { language } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback.trim()) {
      try {
        await onSubmit(feedback);
        setSuccess(true);
        setFeedback('');
        // Hide message after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
      } catch (error) {
        console.error('Error submitting feedback:', error);
      }
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder={language === 'ml' ? 'നിങ്ങളുടെ അഭിപ്രായം പങ്കുവയ്ക്കുക...' : 'Share your feedback...'}
          className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
          rows={4}
        />
        
        <div className="flex justify-between items-center">
          <Button
            type="submit"
            disabled={!feedback.trim()}
            className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600"
          >
            <Send className="h-4 w-4" />
            <span>{language === 'ml' ? 'സമർപ്പിക്കുക' : 'Submit'}</span>
          </Button>
          
          {success && (
            <div className="inline-block px-4 py-2 bg-green-500 text-white rounded-md ml-4">
              {language === 'ml' ? 'അഭിപ്രായം സമർപ്പിച്ചു!' : 'Feedback submitted!'}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
