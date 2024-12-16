export interface TrendingNews {
    id: string;
    title: string;
    searchCount: number;
    reliability: 'reliable' | 'suspicious';
    date: string;
    summary?: string;
  }