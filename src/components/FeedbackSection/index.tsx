import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { FeedbackButton } from './FeedbackButton';
import { FeedbackForm } from './FeedbackForm';
import { useLanguage } from '../../contexts/LanguageContext';

export function FeedbackSection() {
  const [feedbackType, setFeedbackType] = useState<'helpful' | 'unhelpful' | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { language } = useLanguage();

  const handleFeedbackSubmit = (feedback: string) => {
    console.log('Feedback submitted:', { type: feedbackType, feedback });
    setShowForm(false);
    setFeedbackType(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto"
    >
      <GlassCard className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-white/30 dark:from-gray-800/50 dark:to-gray-800/30" />
        <div className="relative p-6">
          <div className="flex items-center space-x-2 mb-4">
            <MessageSquare className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {language === 'ml' ? 'ഫീഡ്ബാക്ക്' : 'Feedback'}
            </h3>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {language === 'ml' 
              ? 'ഈ വിശകലനം നിങ്ങൾക്ക് സഹായകരമായിരുന്നോ?'
              : 'Was this analysis accurate?'}
          </p>
          
          <div className="flex space-x-4">
            <FeedbackButton
              type="helpful"
              isSelected={feedbackType === 'helpful'}
              onClick={() => {
                setFeedbackType('helpful');
                setShowForm(true);
              }}
            />
            <FeedbackButton
              type="unhelpful"
              isSelected={feedbackType === 'unhelpful'}
              onClick={() => {
                setFeedbackType('unhelpful');
                setShowForm(true);
              }}
            />
          </div>
          
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <FeedbackForm onSubmit={handleFeedbackSubmit} />
            </motion.div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
