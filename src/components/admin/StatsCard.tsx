import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../common/Card';

interface StatsCardProps {
  label: string;
  value: string;
  index: number;
}

export function StatsCard({ label, value, index }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="p-6">
        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {value}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {label}
        </div>
      </Card>
    </motion.div>
  );
}
