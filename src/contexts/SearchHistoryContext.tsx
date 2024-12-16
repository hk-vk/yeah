import React, { createContext, useContext, useState } from 'react';
import type { InputType } from '../types';

interface SearchRecord {
  id: string;
  type: InputType;
  content: string;
  timestamp: Date;
  result: {
    isReliable: boolean;
    confidence: number;
  };
}

interface SearchHistoryContextType {
  history: SearchRecord[];
  addSearch: (search: Omit<SearchRecord, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
}

const SearchHistoryContext = createContext<SearchHistoryContextType | undefined>(undefined);

export function SearchHistoryProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<SearchRecord[]>([]);

  const addSearch = (search: Omit<SearchRecord, 'id' | 'timestamp'>) => {
    const newSearch: SearchRecord = {
      ...search,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    };
    setHistory(prev => [newSearch, ...prev]);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <SearchHistoryContext.Provider value={{ history, addSearch, clearHistory }}>
      {children}
    </SearchHistoryContext.Provider>
  );
}

export function useSearchHistory() {
  const context = useContext(SearchHistoryContext);
  if (context === undefined) {
    throw new Error('useSearchHistory must be used within a SearchHistoryProvider');
  }
  return context;
}
