import React from 'react';
import { motion } from 'framer-motion';
import { useSearchHistory } from '../../contexts/SearchHistoryContext';
import { formatDistanceToNow } from '../../utils/date';

export function SearchHistory() {
  const { history, clearHistory } = useSearchHistory();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Search History</h2>
        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            Clear History
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">No search history yet.</p>
      ) : (
        <div className="space-y-4">
          {history.map((record, index) => (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDistanceToNow(record.timestamp)} ago
                  </p>
                  <p className="mt-1 text-gray-900 dark:text-white line-clamp-2">
                    {record.content}
                  </p>
                </div>
                <div className="ml-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      record.result.isReliable
                        ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400'
                    }`}
                  >
                    {record.result.confidence}% {record.result.isReliable ? 'Reliable' : 'Suspicious'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
