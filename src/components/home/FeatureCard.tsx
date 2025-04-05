import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index: number;
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export const FeatureCard = memo(function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <motion.div
      variants={itemVariants}
      className="relative p-4 sm:p-6 bg-white/60 dark:bg-gray-800/60 rounded-xl shadow-lg backdrop-blur-md group hover:shadow-xl transition-all duration-300 transform-gpu will-change-transform hover:-translate-y-1"
      style={{ willChange: 'transform, box-shadow' }}
    >
      <div className="absolute -top-4 left-4">
        <motion.div
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className="p-3 bg-blue-600 rounded-lg shadow-md group-hover:shadow-lg transition-shadow duration-300 transform-gpu"
          style={{ willChange: 'transform' }}
        >
          <Icon className="h-6 w-6 text-white" />
        </motion.div>
      </div>
      <h3 className="mt-8 text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
        {description}
      </p>
    </motion.div>
  );
});
