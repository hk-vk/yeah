import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Loader } from 'lucide-react';

interface ButtonIconProps {
  isLoading: boolean;
  isSuccess: boolean;
}

export function ButtonIcon({ isLoading, isSuccess }: ButtonIconProps) {
  if (isLoading) {
    return (
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <Loader className="w-5 h-5" />
      </motion.div>
    );
  }

  if (isSuccess) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        <CheckCircle className="w-5 h-5" />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ x: 0 }}
      animate={{ x: [0, 5, 0] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
    </motion.div>
  );
}
