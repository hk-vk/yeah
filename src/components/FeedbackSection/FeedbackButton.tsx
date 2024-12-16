import React from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '../common/Button';
import { cn } from '../../utils/cn';

interface FeedbackButtonProps {
  type: 'helpful' | 'unhelpful';
  isSelected: boolean;
  onClick: () => void;
}

export function FeedbackButton({ type, isSelected, onClick }: FeedbackButtonProps) {
  const Icon = type === 'helpful' ? ThumbsUp : ThumbsDown;
  
  return (
    <Button
      variant="outline"
      onClick={onClick}
      className={cn(
        'flex items-center space-x-2 transition-all',
        isSelected && type === 'helpful' && 'bg-green-50 text-green-600 border-green-200',
        isSelected && type === 'unhelpful' && 'bg-red-50 text-red-600 border-red-200'
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{type === 'helpful' ? 'Helpful' : 'Not Helpful'}</span>
    </Button>
  );
}
