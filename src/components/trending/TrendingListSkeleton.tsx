import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../common/GlassCard';
import clsx from 'clsx';

export const TrendingListSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center mb-6">
        <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded mr-2 animate-pulse" />
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>

      {/* List Skeleton */}
      <GlassCard>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {[1, 2, 3, 4, 5].map((item) => (
            <motion.div
              key={item}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: item * 0.1 }}
              className="p-4 flex items-center"
            >
              {/* Rank Skeleton */}
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />

              {/* Content Skeleton */}
              <div className="flex-grow px-4 space-y-2">
                <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>

              {/* Badge Skeleton */}
              <div className="w-20 h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};