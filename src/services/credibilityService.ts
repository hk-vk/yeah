import { API_CONFIG } from '../config';
import Papa from 'papaparse';

export interface NewsWebsite {
  domain: string;
  realNewsPercentage: number;
  articleCount: number;
  lastUpdated: string;
  rank: number;
  politicalBias?: string;
  description?: string;
}

export interface CredibilityAnalysis {
  fakeRealCounts: {
    fake_news: number;
    real_news: number;
    total: number;
  };
  websiteRankings: NewsWebsite[];
}

function extractDomain(url: string): string {
  try {
    if (!url || typeof url !== 'string') {
      return 'unknown';
    }
    
    // Handle URLs without http/https prefix
    let processedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      processedUrl = 'https://' + url;
    }
    
    // Extract the hostname
    const hostname = new URL(processedUrl).hostname;
    
    // Extract the top-level domain (considering subdomains)
    const domainParts = hostname.split('.');
    
    // Handle special cases like co.uk, com.au
    if (domainParts.length >= 3) {
      // Check for country-specific second-level domains
      const lastTwo = domainParts[domainParts.length - 2] + '.' + domainParts[domainParts.length - 1];
      if (['co.uk', 'co.in', 'com.au', 'co.nz'].includes(lastTwo)) {
        // Get the third-level domain for these cases
        return domainParts[domainParts.length - 3] + '.' + lastTwo;
      }
    }
    
    // For regular domains, get the second-level domain
    if (domainParts.length >= 2) {
      return domainParts[domainParts.length - 2] + '.' + domainParts[domainParts.length - 1];
    }
    
    return hostname;
  } catch (error) {
    return 'invalid-url';
  }
}

function analyzeNewsData(data: { "News Url": string; Class: string }[]): CredibilityAnalysis {
  const fakeRealCounts = {
    fake_news: 0,
    real_news: 0,
    total: data.length
  };
  
  const domainStats: Record<string, { total: number; real: number; realPercentage: number }> = {};
  
  // Calculate statistics
  data.forEach(row => {
    const isReal = parseInt(row.Class) === 1;
    isReal ? fakeRealCounts.real_news++ : fakeRealCounts.fake_news++;
    
    const domain = extractDomain(row["News Url"]);
    
    if (!domainStats[domain]) {
      domainStats[domain] = {
        total: 0,
        real: 0,
        realPercentage: 0
      };
    }
    
    domainStats[domain].total += 1;
    if (isReal) {
      domainStats[domain].real += 1;
    }
  });
  
  // Predefined domain information
  const domainInfo: Record<string, { bias: string; description: string }> = {
    'asianetnews.com': {
      bias: 'Center-Right',
      description: 'Major Malayalam news channel with high credibility in online reporting'
    },
    'manoramanews.com': {
      bias: 'Center',
      description: 'Highly trusted Malayalam news source with balanced reporting'
    },
    'indiatoday.in': {
      bias: 'Center',
      description: 'National news outlet with reliable Malayalam coverage'
    },
    'news18.com': {
      bias: 'Center-Right',
      description: 'Major news network with consistent factual reporting'
    },
    'manoramaonline.com': {
      bias: 'Center-Right',
      description: 'One of the largest Malayalam news portals with established credibility'
    },
    'mathrubhumi.com': {
      bias: 'Center',
      description: 'Traditional newspaper with mixed online reporting accuracy'
    },
    'oneindia.com': {
      bias: 'Mixed',
      description: 'News aggregator with varying content quality'
    },
    'samayam.com': {
      bias: 'Not Rated',
      description: 'News portal with concerns about content verification'
    }
  };
  
  // Calculate percentages and create rankings
  const websiteRankings: NewsWebsite[] = Object.entries(domainStats)
    .filter(([_, stats]) => stats.total >= 2) // Only include domains with at least 2 articles
    .map(([domain, stats]) => ({
      domain,
      realNewsPercentage: parseFloat(((stats.real / stats.total) * 100).toFixed(2)),
      articleCount: stats.total,
      lastUpdated: new Date().toISOString().split('T')[0], // Current date as default
      rank: 0, // Will be set after sorting
      politicalBias: domainInfo[domain]?.bias || 'Not Rated',
      description: domainInfo[domain]?.description || 'Information not available'
    }))
    .sort((a, b) => {
      // Sort by percentage first, then by article count
      if (b.realNewsPercentage !== a.realNewsPercentage) {
        return b.realNewsPercentage - a.realNewsPercentage;
      }
      return b.articleCount - a.articleCount;
    })
    .map((website, index) => ({
      ...website,
      rank: index + 1
    }));

  return {
    fakeRealCounts,
    websiteRankings
  };
}

export const credibilityService = {
  async getCredibilityAnalysis(): Promise<CredibilityAnalysis> {
    try {
      const response = await fetch('/src/data/mal_train.csv');
      const csvText = await response.text();
      
      return new Promise((resolve, reject) => {
        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            const analysis = analyzeNewsData(results.data as { "News Url": string; Class: string }[]);
            resolve(analysis);
          },
          error: (error: Error) => {
            reject(new Error('Failed to parse CSV data: ' + error.message));
          }
        });
      });
    } catch (error) {
      console.error('Error fetching credibility analysis:', error);
      throw error;
    }
  },

  // Client-side update function
  updateWebsiteData(websiteRankings: NewsWebsite[], domain: string, updates: Partial<NewsWebsite>): NewsWebsite[] {
    return websiteRankings.map(website => {
      if (website.domain === domain) {
        return {
          ...website,
          ...updates,
          lastUpdated: new Date().toISOString().split('T')[0]
        };
      }
      return website;
    }).sort((a, b) => {
      if (b.realNewsPercentage !== a.realNewsPercentage) {
        return b.realNewsPercentage - a.realNewsPercentage;
      }
      return b.articleCount - a.articleCount;
    }).map((website, index) => ({
      ...website,
      rank: index + 1
    }));
  }
}; 