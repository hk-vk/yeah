import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

interface SuccessMessageProps {
  isVisible: boolean;
  message: string;
}

export function SuccessMessage({ isVisible, message }: SuccessMessageProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full left-0 right-0 mt-2 text-center"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg"
          >
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">{message}</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
