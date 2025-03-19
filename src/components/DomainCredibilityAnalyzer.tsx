import React, { useState, useEffect } from 'react';
import { Card } from './common/Card';
import Papa from 'papaparse';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Loader2, AlertTriangle, Info, Bug } from 'lucide-react';
import clsx from 'clsx';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DomainStats {
  domain: string;
  total: number;
  real: number;
  realPercentage: number;
  confidenceScore: number;
  credibilityRating: string;
}

interface CredibilityData {
  totalArticles: number;
  realNews: number;
  fakeNews: number;
  domains: DomainStats[];
}

interface SortConfig {
  key: keyof DomainStats;
  direction: 'ascending' | 'descending';
}

interface DomainCredibilityAnalyzerProps {
  showDebugPanel?: boolean;
}

export const DomainCredibilityAnalyzer: React.FC<DomainCredibilityAnalyzerProps> = ({ 
  showDebugPanel = false 
}) => {
  const [credibilityData, setCredibilityData] = useState<CredibilityData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'realPercentage',
    direction: 'descending',
  });
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [debugData, setDebugData] = useState<{
    csvSample: string;
    headers: string[];
    sampleRows: any[];
  } | null>(null);
  
  // Add state for the new domain form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEntry, setNewEntry] = useState({
    url: '',
    class: '1' // Default to real news
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Function to extract domain from URL
  const extractDomain = (url: string): string => {
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
  };

  // Calculate confidence score based on sample size
  const calculateConfidenceScore = (sampleSize: number): number => {
    // Simple confidence calculation - increases with sample size but plateaus
    if (sampleSize <= 5) return 0.5;
    if (sampleSize <= 10) return 0.7;
    if (sampleSize <= 20) return 0.8;
    if (sampleSize <= 50) return 0.9;
    return 1.0;
  };

  // Determine credibility rating based on percentage and confidence
  const getCredibilityRating = (percentage: number, confidence: number): string => {
    // The percentage is already between 0-100 when passed to this function
    // No need to multiply by 100 again
    const adjustedScore = percentage * confidence;
    
    if (adjustedScore >= 90) return 'Very High';
    if (adjustedScore >= 70) return 'High';
    if (adjustedScore >= 50) return 'Moderate';
    if (adjustedScore >= 30) return 'Low';
    return 'Very Low';
  };

  // Get color class based on credibility rating
  const getCredibilityColorClass = (rating: string): string => {
    switch (rating) {
      case 'Very High': return 'text-green-600 dark:text-green-400';
      case 'High': return 'text-blue-600 dark:text-blue-400';
      case 'Moderate': return 'text-yellow-600 dark:text-yellow-400';
      case 'Low': return 'text-orange-600 dark:text-orange-400';
      case 'Very Low': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  // Get background color for charts based on credibility rating
  const getChartBackgroundColor = (rating: string): string => {
    switch (rating) {
      case 'Very High': return 'rgba(34, 197, 94, 0.7)';
      case 'High': return 'rgba(59, 130, 246, 0.7)';
      case 'Moderate': return 'rgba(234, 179, 8, 0.7)';
      case 'Low': return 'rgba(249, 115, 22, 0.7)';
      case 'Very Low': return 'rgba(239, 68, 68, 0.7)';
      default: return 'rgba(156, 163, 175, 0.7)';
    }
  };

  // Load and process CSV data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/mal_train.csv');
        if (!response.ok) {
          throw new Error(`Failed to fetch CSV file: ${response.statusText}`);
        }
        
        const csvText = await response.text();
        const csvSample = csvText.substring(0, 200);
        console.log("First 200 characters of CSV:", csvSample);
        
        // Remove comment lines (starting with # or //) if present
        const cleanCsvLines = csvText
          .split('\n')
          .filter(line => !line.trim().startsWith('#') && !line.trim().startsWith('//'));
        const cleanCsv = cleanCsvLines.join('\n');
        
        // Processing options to handle potential CSV format issues
        Papa.parse(cleanCsv, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header) => header.trim(), // Trim whitespace from headers
          complete: (results) => {
            // Process the parsed data
            const data = results.data as any[];
            const headers = results.meta.fields || [];
            const sampleRows = data.slice(0, 5);
            
            console.log("CSV headers:", headers);
            console.log("Sample data (first 5 rows):", sampleRows);
            
            // Set debug data
            setDebugData({
              csvSample,
              headers,
              sampleRows
            });
            
            if (data.length === 0) {
              setError("No data found in CSV file or format is invalid");
              setIsLoading(false);
              return;
            }
            
            // Determine the field names by inspecting the first row
            const firstRow = data[0];
            
            // Look for URL field - check different possible column names
            const urlFieldCandidates = ['News Url', 'News_Url', 'url', 'URL', 'link', 'Link'];
            const urlField = urlFieldCandidates.find(field => firstRow[field] !== undefined);
            
            // Look for Class field - check different possible column names
            const classFieldCandidates = ['Class', 'class', 'label', 'Label', 'is_real', 'is_fake'];
            const classField = classFieldCandidates.find(field => firstRow[field] !== undefined);
            
            if (!urlField) {
              setError("Could not find URL column in CSV data. Expected column names: " + urlFieldCandidates.join(", "));
              setIsLoading(false);
              return;
            }
            
            if (!classField) {
              setError("Could not find Class column in CSV data. Expected column names: " + classFieldCandidates.join(", "));
              setIsLoading(false);
              return;
            }
            
            console.log(`Found URL field: "${urlField}", Class field: "${classField}"`);
            
            // Count total articles
            const totalArticles = data.length;
            let realNews = 0;
            let fakeNews = 0;
            
            // Process domain statistics
            const domainStats: Record<string, { total: number; real: number }> = {};
            
            data.forEach((row, index) => {
              // Skip if we can't find the required fields
              if (row[urlField] === undefined || row[classField] === undefined) {
                console.warn(`Skipping row ${index} due to missing fields:`, row);
                return;
              }
              
              // Count real/fake news based on Class value
              const classValue = row[classField];
              // Ensure we're dealing with a number by parsing it
              let classNum: number;
              
              if (typeof classValue === 'number') {
                classNum = classValue;
              } else if (typeof classValue === 'string') {
                // Try to parse as number
                classNum = parseInt(classValue.trim());
                
                // If parsing failed, try to interpret as text
                if (isNaN(classNum)) {
                  const lowerValue = classValue.toLowerCase().trim();
                  if (lowerValue === 'real' || lowerValue === 'true' || lowerValue === 'yes' || lowerValue === '1') {
                    classNum = 1;
                  } else {
                    classNum = 0;
                  }
                }
              } else {
                // Default to fake news if value can't be interpreted
                classNum = 0;
              }
              
              // Class 1 = Real News, Class 0 = Fake News
              const isReal = classNum === 1;
              
              if (isReal) {
                realNews++;
              } else {
                fakeNews++;
              }
              
              // Extract domain and update stats
              const url = row[urlField];
              if (!url || typeof url !== 'string') {
                console.warn(`Skipping row ${index} due to invalid URL:`, url);
                return;
              }
              
              const domain = extractDomain(url);
              
              if (!domainStats[domain]) {
                domainStats[domain] = { total: 0, real: 0 };
              }
              
              domainStats[domain].total += 1;
              if (isReal) {
                domainStats[domain].real += 1;
              }
            });
            
            console.log("Real News Count:", realNews);
            console.log("Fake News Count:", fakeNews);
            console.log("Total Articles:", totalArticles);
            console.log("Domain Stats Summary:", Object.keys(domainStats).length, "domains found");
            
            // Calculate percentages and create final domain stats
            const domains: DomainStats[] = Object.entries(domainStats)
              .filter(([domain, stats]) => stats.total >= 2) // Only include domains with at least 2 articles
              .map(([domain, stats]) => {
                const realPercentage = (stats.real / stats.total) * 100;
                const confidenceScore = calculateConfidenceScore(stats.total);
                
                return {
                  domain,
                  total: stats.total,
                  real: stats.real,
                  realPercentage,
                  confidenceScore,
                  credibilityRating: getCredibilityRating(realPercentage, confidenceScore)
                };
              });
            
            // Set the processed data
            setCredibilityData({
              totalArticles,
              realNews,
              fakeNews,
              domains
            });
            
            setIsLoading(false);
          },
          error: (error: Error) => {
            setError(`Failed to parse CSV data: ${error.message}`);
            setIsLoading(false);
          }
        });
      } catch (error) {
        setError(`Error loading data: ${error instanceof Error ? error.message : String(error)}`);
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Sort domains based on current sort configuration
  const sortedDomains = React.useMemo(() => {
    if (!credibilityData) return [];
    
    return [...credibilityData.domains].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }, [credibilityData, sortConfig]);

  // Handle column header click for sorting
  const handleSort = (key: keyof DomainStats) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'descending' 
        ? 'ascending' 
        : 'descending'
    }));
  };

  // Prepare data for top 10 most credible domains chart
  const topCredibleDomainsChart = React.useMemo(() => {
    if (!credibilityData) return null;
    
    // Get top 10 domains by real percentage (with at least 5 articles)
    const topDomains = [...credibilityData.domains]
      .filter(domain => domain.total >= 5)
      .sort((a, b) => b.realPercentage - a.realPercentage)
      .slice(0, 10);
    
    return {
      labels: topDomains.map(d => d.domain),
      datasets: [
        {
          label: 'Credibility Score (%)',
          data: topDomains.map(d => d.realPercentage),
          backgroundColor: topDomains.map(d => getChartBackgroundColor(d.credibilityRating)),
          borderWidth: 1,
        },
      ],
    };
  }, [credibilityData]);

  // Prepare data for top 10 least credible domains chart
  const leastCredibleDomainsChart = React.useMemo(() => {
    if (!credibilityData) return null;
    
    // Get bottom 10 domains by real percentage (with at least 5 articles)
    const bottomDomains = [...credibilityData.domains]
      .filter(domain => domain.total >= 5)
      .sort((a, b) => a.realPercentage - b.realPercentage)
      .slice(0, 10);
    
    return {
      labels: bottomDomains.map(d => d.domain),
      datasets: [
        {
          label: 'Credibility Score (%)',
          data: bottomDomains.map(d => d.realPercentage),
          backgroundColor: bottomDomains.map(d => getChartBackgroundColor(d.credibilityRating)),
          borderWidth: 1,
        },
      ],
    };
  }, [credibilityData]);

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Domain Credibility Analysis',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Percentage of Real News (%)'
        }
      }
    }
  };

  // Add this before the return statement
  const renderDebugInfo = () => {
    // If showDebugPanel is false, don't render the debug info at all
    if (!showDebugPanel || !debugData) return null;
    
    return (
      <Card className="p-6 mt-6 bg-slate-50 dark:bg-slate-900 border border-yellow-200 dark:border-yellow-900">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-yellow-700 dark:text-yellow-400 flex items-center">
            <Bug className="w-5 h-5 mr-2" />
            CSV Parsing Debug Information
          </h3>
          <button 
            onClick={() => setShowDebugInfo(!showDebugInfo)}
            className="text-sm px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-md"
          >
            {showDebugInfo ? 'Hide Details' : 'Show Details'}
          </button>
        </div>
        
        {showDebugInfo && (
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium mb-1 text-yellow-800 dark:text-yellow-300">CSV Sample (first 200 chars):</h4>
              <pre className="bg-slate-100 dark:bg-slate-800 p-3 rounded overflow-x-auto text-xs">
                {debugData.csvSample}
              </pre>
            </div>
            
            <div>
              <h4 className="font-medium mb-1 text-yellow-800 dark:text-yellow-300">Detected Headers:</h4>
              <pre className="bg-slate-100 dark:bg-slate-800 p-3 rounded overflow-x-auto text-xs">
                {JSON.stringify(debugData.headers, null, 2)}
              </pre>
            </div>
            
            <div>
              <h4 className="font-medium mb-1 text-yellow-800 dark:text-yellow-300">Sample Rows (first 5):</h4>
              <pre className="bg-slate-100 dark:bg-slate-800 p-3 rounded overflow-x-auto text-xs max-h-64">
                {JSON.stringify(debugData.sampleRows, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </Card>
    );
  };

  // Add a function to handle form submission
  const handleAddDomain = async () => {
    if (!newEntry.url) {
      setSubmitError("Please enter a URL");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Call the analyze service to get article data
      const response = await fetch(`/api/analyze?url=${encodeURIComponent(newEntry.url)}`);
      
      if (!response.ok) {
        throw new Error(`Failed to analyze URL: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Extract domain from the URL
      const domain = extractDomain(newEntry.url);
      
      // Use the manually set class value
      const isReal = newEntry.class === '1';
      
      // Update existing domain or add new one
      if (credibilityData) {
        const existingDomainIndex = credibilityData.domains.findIndex(d => d.domain === domain);
        
        if (existingDomainIndex >= 0) {
          // Update existing domain stats
          const updatedDomains = [...credibilityData.domains];
          const existingDomain = updatedDomains[existingDomainIndex];
          
          const updatedDomain = {
            ...existingDomain,
            total: existingDomain.total + 1,
            real: existingDomain.real + (isReal ? 1 : 0),
            realPercentage: ((existingDomain.real + (isReal ? 1 : 0)) / (existingDomain.total + 1)) * 100,
            confidenceScore: calculateConfidenceScore(existingDomain.total + 1)
          };
          
          // Update credibility rating
          updatedDomain.credibilityRating = getCredibilityRating(
            updatedDomain.realPercentage, 
            updatedDomain.confidenceScore
          );
          
          updatedDomains[existingDomainIndex] = updatedDomain;
          
          setCredibilityData({
            ...credibilityData,
            domains: updatedDomains,
            totalArticles: credibilityData.totalArticles + 1,
            realNews: credibilityData.realNews + (isReal ? 1 : 0),
            fakeNews: credibilityData.fakeNews + (isReal ? 0 : 1)
          });
        } else {
          // Add new domain
          const newDomain: DomainStats = {
            domain,
            total: 1,
            real: isReal ? 1 : 0,
            realPercentage: isReal ? 100 : 0,
            confidenceScore: calculateConfidenceScore(1),
            credibilityRating: getCredibilityRating(isReal ? 100 : 0, calculateConfidenceScore(1))
          };
          
          setCredibilityData({
            ...credibilityData,
            domains: [...credibilityData.domains, newDomain],
            totalArticles: credibilityData.totalArticles + 1,
            realNews: credibilityData.realNews + (isReal ? 1 : 0),
            fakeNews: credibilityData.fakeNews + (isReal ? 0 : 1)
          });
        }
      }
      
      // Reset form
      setNewEntry({
        url: '',
        class: '1'
      });
      setShowAddForm(false);
    } catch (error) {
      setSubmitError(`Error analyzing URL: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-lg flex items-start">
        <AlertTriangle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-medium">Error Loading Data</h3>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-700 dark:text-gray-300">Loading credibility data...</span>
      </div>
    );
  }

  if (!credibilityData) {
    return (
      <div className="flex items-center gap-2 text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
        <Info className="w-5 h-5" />
        <p>No data available for analysis.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4">Dataset Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">Total Articles</p>
              <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{credibilityData.totalArticles.toLocaleString()}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
              <p className="text-sm text-green-700 dark:text-green-300">Real News</p>
              <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                {credibilityData.realNews.toLocaleString()} 
                <span className="text-sm font-normal ml-1">
                  ({((credibilityData.realNews / credibilityData.totalArticles) * 100).toFixed(1)}%)
                </span>
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">Fake News</p>
              <p className="text-2xl font-bold text-red-800 dark:text-red-200">
                {credibilityData.fakeNews.toLocaleString()}
                <span className="text-sm font-normal ml-1">
                  ({((credibilityData.fakeNews / credibilityData.totalArticles) * 100).toFixed(1)}%)
                </span>
              </p>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Domain Rankings */}
      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Domain Credibility Rankings</h3>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add New
            </button>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            The table below shows all domains in the dataset with at least 2 articles. 
            Click on column headers to sort the table.
          </p>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('domain')}
                  >
                    Domain
                    {sortConfig.key === 'domain' && (
                      <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('realPercentage')}
                  >
                    Credibility Score
                    {sortConfig.key === 'realPercentage' && (
                      <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('credibilityRating')}
                  >
                    Rating
                    {sortConfig.key === 'credibilityRating' && (
                      <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('total')}
                  >
                    Articles
                    {sortConfig.key === 'total' && (
                      <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('confidenceScore')}
                  >
                    Confidence
                    {sortConfig.key === 'confidenceScore' && (
                      <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                    )}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {sortedDomains.map((domain) => (
                  <tr key={domain.domain} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {domain.domain}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                          <div
                            className={clsx(
                              "h-2 rounded-full",
                              domain.realPercentage >= 90 ? "bg-green-500" :
                              domain.realPercentage >= 70 ? "bg-blue-500" :
                              domain.realPercentage >= 50 ? "bg-yellow-500" :
                              domain.realPercentage >= 30 ? "bg-orange-500" :
                              "bg-red-500"
                            )}
                            style={{ width: `${domain.realPercentage}%` }}
                          />
                        </div>
                        <span className={clsx(
                          "text-sm font-medium",
                          domain.realPercentage >= 90 ? "text-green-600 dark:text-green-400" :
                          domain.realPercentage >= 70 ? "text-blue-600 dark:text-blue-400" :
                          domain.realPercentage >= 50 ? "text-yellow-600 dark:text-yellow-400" :
                          domain.realPercentage >= 30 ? "text-orange-600 dark:text-orange-400" :
                          "text-red-600 dark:text-red-400"
                        )}>
                          {domain.realPercentage.toFixed(2)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={clsx(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        getCredibilityColorClass(domain.credibilityRating)
                      )}>
                        {domain.credibilityRating}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {domain.total} ({domain.real} real, {domain.total - domain.real} fake)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {(domain.confidenceScore * 100).toFixed(0)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Debug Info Panel */}
      {renderDebugInfo()}

      {/* Methodology Explanation */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Methodology</h3>
        <div className="text-sm text-gray-700 dark:text-gray-300 space-y-3">
          <p>
            <strong>Data Classification:</strong> In the dataset, articles are classified as follows:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Class 1:</strong> Real news (factually accurate)</li>
            <li><strong>Class 0:</strong> Fake news (contains misinformation)</li>
          </ul>
          <p>
            <strong>Credibility Score:</strong> Percentage of articles from a domain classified as real news.
          </p>
          <p>
            <strong>Confidence Score:</strong> Measure of statistical reliability based on sample size.
            Domains with more articles have higher confidence scores.
          </p>
          <p>
            <strong>Rating System:</strong>
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li className="text-green-600 dark:text-green-400">Very High: 90-100% credibility with high confidence</li>
            <li className="text-blue-600 dark:text-blue-400">High: 70-90% credibility</li>
            <li className="text-yellow-600 dark:text-yellow-400">Moderate: 50-70% credibility</li>
            <li className="text-orange-600 dark:text-orange-400">Low: 30-50% credibility</li>
            <li className="text-red-600 dark:text-red-400">Very Low: 0-30% credibility</li>
          </ul>
        </div>
      </Card>

      {/* Add Domain Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Article</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  URL
                </label>
                <input
                  type="text"
                  value={newEntry.url}
                  onChange={e => setNewEntry({ ...newEntry, url: e.target.value })}
                  placeholder="https://example.com/article"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Class
                </label>
                <select
                  value={newEntry.class}
                  onChange={e => setNewEntry({ ...newEntry, class: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                >
                  <option value="1">Real News (1)</option>
                  <option value="0">Fake News (0)</option>
                </select>
              </div>
              
              {submitError && (
                <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-md text-sm">
                  <p>{submitError}</p>
                </div>
              )}
              
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                <p>Enter a news article URL and classify it as real or fake news. Other data will be fetched automatically.</p>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddDomain}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                  disabled={!newEntry.url || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Add Article'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DomainCredibilityAnalyzer; 