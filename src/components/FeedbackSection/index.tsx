import { useState } from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown, MessageCircle, Star } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import clsx from 'clsx';
import { analyzeService } from '../../services/analyzeService';
import { useAuth } from '../../contexts/AuthContext';
import { translations } from '../../locales/translations';

interface Props {
  onFeedback: (rating: number, comment?: string) => Promise<void>;
  analysisId?: string;
}

export function FeedbackSection({ onFeedback, analysisId }: Props) {
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const { language } = useLanguage();
  const { user } = useAuth();
  const isMalayalam = language === 'ml';
  const t = translations[language];

  const handleRatingClick = (rating: number) => {
    setSelectedRating(rating);
    setShowCommentBox(true);
  };

  const handleFeedback = async (skipComment: boolean = false) => {
    if (isSubmitting || feedbackSubmitted || selectedRating === null) return;
    
    setIsSubmitting(true);
    try {
      console.log('FeedbackSection handleFeedback called with:', {
        analysisId,
        rating: selectedRating,
        hasComment: !!comment,
        hasUserId: !!user?.id
      });
      
      if (analysisId && user?.id) {
        await analyzeService.saveFeedback(analysisId, selectedRating, comment, user.id);
      } else {
        await onFeedback(selectedRating, comment);
      }
      
      setShowCommentBox(false);
      setComment('');
      setFeedbackSubmitted(true);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipComment = () => {
    handleFeedback(true);
  };

  if (feedbackSubmitted) {
    return (
      <div className="mt-6 flex flex-col items-center space-y-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={clsx(
            "text-green-600 dark:text-green-400 font-medium",
            isMalayalam && "text-base"
          )}
        >
          {language === 'ml' 
            ? 'നന്ദി! നിങ്ങളുടെ പ്രതികരണം സ്വീകരിച്ചു.' 
            : 'Thank you! Your feedback has been received.'}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-col items-center space-y-4">
      <p className={clsx(
        "text-gray-700 dark:text-gray-400",
        isMalayalam && "text-base"
      )}>
        {language === 'ml' 
          ? 'ഈ വിശകലനം സഹായകരമായിരുന്നോ?' 
          : 'Was this analysis helpful?'}
      </p>
      
      <div className="flex gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleRatingClick(1)}
          disabled={isSubmitting}
          className={clsx(
            "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
            "bg-green-50 text-green-700 border border-green-200",
            "dark:bg-green-900/30 dark:text-green-300 dark:border-green-800/30",
            "hover:bg-green-100 dark:hover:bg-green-800/40",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            isMalayalam && "text-base",
            selectedRating === 1 && "ring-2 ring-green-500 dark:ring-green-400"
          )}
        >
          <ThumbsUp className="w-5 h-5" />
          {language === 'ml' ? 'അതെ' : 'Yes'}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleRatingClick(0)}
          disabled={isSubmitting}
          className={clsx(
            "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
            "bg-red-50 text-red-700 border border-red-200",
            "dark:bg-red-900/30 dark:text-red-300 dark:border-red-800/30",
            "hover:bg-red-100 dark:hover:bg-red-800/40",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            isMalayalam && "text-base",
            selectedRating === 0 && "ring-2 ring-red-500 dark:ring-red-400"
          )}
        >
          <ThumbsDown className="w-5 h-5" />
          {language === 'ml' ? 'അല്ല' : 'No'}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCommentBox(!showCommentBox)}
          className={clsx(
            "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
            "bg-blue-50 text-blue-700 border border-blue-200",
            "dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/30",
            "hover:bg-blue-100 dark:hover:bg-blue-800/40",
            isMalayalam && "text-base"
          )}
        >
          <MessageCircle className="w-5 h-5" />
          {language === 'ml' ? 'അഭിപ്രായം' : 'Comment'}
        </motion.button>
      </div>

      {showCommentBox && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg"
        >
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={language === 'ml' 
              ? 'നിങ്ങളുടെ അഭിപ്രായം ഇവിടെ രേഖപ്പെടുത്തുക...' 
              : 'Write your feedback here...'}
            className={clsx(
              "w-full p-3 rounded-lg border resize-none",
              "bg-white text-gray-900 dark:bg-gray-800 dark:text-white",
              "border-gray-200 dark:border-gray-700",
              "focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              "placeholder-gray-400 dark:placeholder-gray-500",
              isMalayalam && "text-base"
            )}
            rows={4}
          />
          <div className="flex justify-between mt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSkipComment}
              disabled={isSubmitting || selectedRating === null}
              className={clsx(
                "px-4 py-2 rounded-lg font-medium",
                "bg-gray-200 text-gray-700",
                "hover:bg-gray-300",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                isMalayalam && "text-base"
              )}
            >
              {language === 'ml' ? 'അഭിപ്രായം ഒഴിവാക്കുക' : 'Skip Comment'}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleFeedback}
              disabled={isSubmitting || selectedRating === null}
              className={clsx(
                "px-4 py-2 rounded-lg font-medium",
                "bg-blue-600 text-white",
                "hover:bg-blue-700",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                isMalayalam && "text-base"
              )}
            >
              {isSubmitting
                ? (language === 'ml' ? 'സമർപ്പിക്കുന്നു...' : 'Submitting...')
                : (language === 'ml' ? 'സമർപ്പിക്കുക' : 'Submit')}
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
