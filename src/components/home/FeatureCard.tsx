import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index: number;
}

export function FeatureCard({ icon: Icon, title, description, index }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      className="relative p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg backdrop-blur-lg backdrop-filter bg-opacity-80 dark:bg-opacity-80 group hover:scale-105 transition-transform duration-300"
    >
      <div className="absolute -top-4 left-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="p-3 bg-blue-600 rounded-lg group-hover:scale-110 transition-transform duration-300"
        >
          <Icon className="h-6 w-6 text-white" />
        </motion.div>
      </div>
      <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-300">
        {description}
      </p>
    </motion.div>
  );
}
