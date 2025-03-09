import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, BarChart2, MessageSquare } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../locales/translations';
import { Card } from '../components/common/Card';
import { StatsCard } from '../components/admin/StatsCard';
import { TabButton } from '../components/admin/TabButton';
import { supabaseAdmin } from '../lib/supabaseAdmin';
import { format } from 'date-fns';

// Type definitions for our data
interface AnalysisData {
  id: string;
  type: string;
  input: any;
  result: any;
  user_id?: string;
  created_at: string;
}

interface UserData {
  id: string;
  email?: string;
  created_at: string;
  last_sign_in_at?: string;
  user_metadata?: {
    full_name?: string;
  };
}

interface FeedbackData {
  id: string;
  analysis_result_id?: string;
  user_id?: string;
  rating?: number;
  comment?: string;
  feedback_text?: string;
  created_at: string;
}

export default function AdminPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // State for our data
  const [analyses, setAnalyses] = useState<AnalysisData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [feedback, setFeedback] = useState<FeedbackData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { label: t.totalAnalyses, value: '0' },
    { label: t.accuracyRate, value: '0%' },
    { label: t.userFeedback, value: '0' }
  ]);
  
  // Selected analysis for detailed view
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisData | null>(null);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all analyses using the admin client
        const { data: analysesData, error: analysesError } = await supabaseAdmin
          .from('analysis_result')
          .select('*')
          .order('created_at', { ascending: false });
        
        // Fetch all feedback using the admin client
        const { data: feedbackData, error: feedbackError } = await supabaseAdmin
          .from('feedback')
          .select('*')
          .order('created_at', { ascending: false });
        
        // Fetch users using the admin auth API
        // Note: This requires the service_role key to have admin:all scope
        const { data: { users: usersData }, error: usersError } = await supabaseAdmin
          .auth.admin.listUsers();
        
        if (analysesError) console.error('Error fetching analyses:', analysesError);
        if (feedbackError) console.error('Error fetching feedback:', feedbackError);
        if (usersError) console.error('Error fetching users:', usersError);
        
        console.log('Fetched analyses:', analysesData);
        console.log('Fetched feedback:', feedbackData);
        console.log('Fetched users:', usersData);
        
        // Update state with fetched data
        if (analysesData) setAnalyses(analysesData);
        if (feedbackData) setFeedback(feedbackData);
        if (usersData) setUsers(usersData);
        
        // Calculate stats
        const totalAnalyses = analysesData?.length || 0;
        
        // For accuracyRate, calculate from analysis results
        let accuracyRate = 0;
        if (analysesData && analysesData.length > 0) {
          const analysesWithScores = analysesData.filter(a => 
            a.result && 
            (typeof a.result.score === 'number' || 
             typeof a.result.accuracy === 'number' || 
             typeof a.result.CONFIDENCE === 'number')
          );
          
          if (analysesWithScores.length > 0) {
            const totalScore = analysesWithScores.reduce((sum, a) => {
              const score = typeof a.result?.score === 'number' 
                ? a.result.score 
                : (typeof a.result?.accuracy === 'number' 
                    ? a.result.accuracy 
                    : (typeof a.result?.CONFIDENCE === 'number' 
                        ? a.result.CONFIDENCE / 100 
                        : 0));
              return sum + score;
            }, 0);
            accuracyRate = (totalScore / analysesWithScores.length) * 100;
          }
        }
        
        const totalFeedback = feedbackData?.length || 0;
        
        setStats([
          { label: t.totalAnalyses, value: totalAnalyses.toString() },
          { label: t.accuracyRate, value: `${accuracyRate.toFixed(1)}%` },
          { label: t.userFeedback, value: totalFeedback.toString() }
        ]);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [t]);

  const tabs = [
    { id: 'dashboard', icon: BarChart2, label: t.dashboard },
    { id: 'users', icon: Users, label: t.users },
    { id: 'feedback', icon: MessageSquare, label: t.feedback }
  ];

  // Format date safely
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP');
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Enhanced method to get better input summary
  const getInputSummary = (input: any) => {
    if (!input) return 'No input';
    
    if (typeof input === 'string') {
      return input.length > 50 ? input.substring(0, 50) + '...' : input;
    }
    
    if (typeof input === 'object') {
      if (input.text) {
        return '"' + (input.text.length > 50 ? input.text.substring(0, 50) + '..."' : input.text + '"');
      }
      if (input.url) return `URL: ${input.url}`;
      if (input.image_url) return `Image: ${input.image_url}`;
    }
    
    return 'Complex input';
  };

  // Function to get analysis explanation
  const getAnalysisExplanation = (analysis: AnalysisData) => {
    if (!analysis.result) return 'No explanation available';
    
    if (typeof analysis.result === 'object') {
      if (analysis.result.EXPLANATION_EN) {
        return analysis.result.EXPLANATION_EN.substring(0, 100) + '...';
      }
      if (analysis.result.explanation) {
        return analysis.result.explanation.substring(0, 100) + '...';
      }
      if (analysis.result.verdict) {
        return analysis.result.verdict;
      }
      if (analysis.result.summary) {
        return analysis.result.summary;
      }
    }
    
    return 'No explanation available';
  };

  // Function to format analysis result for display
  const formatAnalysisResult = (result: any) => {
    if (!result) return { verdict: 'No results', explanation: 'No explanation available', confidence: 'N/A' };
    
    const verdict = result.is_fake !== undefined
      ? result.is_fake ? 'FAKE' : 'NOT FAKE'
      : result.ISFAKE !== undefined
        ? result.ISFAKE > 0.5 ? 'FAKE' : 'NOT FAKE'
        : 'Unknown';
        
    const explanation = result.EXPLANATION_EN || result.explanation || 'No explanation provided';
    
    const confidence = result.score !== undefined
      ? `${(result.score * 100).toFixed(1)}%`
      : result.CONFIDENCE !== undefined
        ? `${result.CONFIDENCE.toFixed(1)}%`
        : 'N/A';
        
    return { verdict, explanation, confidence };
  };

  // Get user email or name by ID
  const getUserById = (userId?: string) => {
    if (!userId) return 'Anonymous';
    const user = users.find(u => u.id === userId);
    if (!user) return 'Unknown User';
    
    // Return full name from user metadata if available, otherwise email
    return user.user_metadata?.full_name || user.email || 'No email';
  };

  // Function to get analysis details view
  const renderAnalysisDetails = (analysis: AnalysisData) => {
    const { verdict, explanation, confidence } = formatAnalysisResult(analysis.result);
    
    return (
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Analysis Details</h3>
          <button 
            onClick={() => setSelectedAnalysis(null)}
            className="text-sm text-blue-500 hover:text-blue-700"
          >
            Back to list
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Type</p>
            <p className="text-gray-900 dark:text-white">{analysis.type}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Date</p>
            <p className="text-gray-900 dark:text-white">
              {analysis.created_at ? formatDate(analysis.created_at) : 'Unknown date'}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">User</p>
            <p className="text-gray-900 dark:text-white">
              {getUserById(analysis.user_id)}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Analysis ID</p>
            <p className="text-gray-900 dark:text-white">{analysis.id}</p>
          </div>
        </div>
        
        {/* Enhanced Input Display */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-3">Input</h4>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            {typeof analysis.input === 'object' && analysis.input.text ? (
              <div className="border-l-4 border-gray-300 dark:border-gray-500 pl-4 py-2 italic text-gray-800 dark:text-gray-200">
                {analysis.input.text}
              </div>
            ) : typeof analysis.input === 'object' && analysis.input.url ? (
              <div>
                <p className="mb-2 font-medium">URL Input:</p>
                <a 
                  href={analysis.input.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                >
                  {analysis.input.url}
                </a>
              </div>
            ) : typeof analysis.input === 'object' && analysis.input.image_url ? (
              <div>
                <p className="mb-2 font-medium">Image Input:</p>
                <div className="mt-2">
                  <img 
                    src={analysis.input.image_url} 
                    alt="Analysis input" 
                    className="max-w-full max-h-64 object-contain rounded-lg border border-gray-200 dark:border-gray-600"
                  />
                </div>
              </div>
            ) : (
              <div className="whitespace-pre-wrap text-gray-900 dark:text-white">
                {typeof analysis.input === 'string' 
                  ? analysis.input 
                  : JSON.stringify(analysis.input, null, 2)}
              </div>
            )}
          </div>
        </div>
        
        {/* Enhanced Result Display */}
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold mb-3">Analysis Results</h4>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-4">
              <div className="flex flex-col md:flex-row md:items-center md:space-x-6 space-y-4 md:space-y-0">
                <div className="flex-1">
                  <h5 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Verdict</h5>
                  <div className={`text-lg font-bold ${
                    verdict === 'FAKE' 
                      ? 'text-red-600 dark:text-red-400' 
                      : verdict === 'NOT FAKE'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-yellow-600 dark:text-yellow-400'
                  }`}>
                    {verdict}
                  </div>
                </div>
                
                <div className="flex-1">
                  <h5 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Confidence</h5>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {confidence}
                  </div>
                </div>
              </div>

              <div>
                <h5 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Explanation</h5>
                <div className="bg-gray-100 dark:bg-gray-600 p-3 rounded-lg text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {explanation}
                </div>
              </div>

              {/* Additional details if available */}
              {analysis.result?.details && (
                <div>
                  <h5 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Technical Details</h5>
                  <div className="bg-gray-100 dark:bg-gray-600 p-3 rounded-lg overflow-auto">
                    <pre className="text-sm text-gray-800 dark:text-gray-200">
                      {JSON.stringify(analysis.result.details, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Full result data (collapsible) */}
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium text-blue-600 dark:text-blue-400">
                  Show all raw analysis data
                </summary>
                <div className="mt-2 bg-gray-100 dark:bg-gray-600 p-3 rounded-lg overflow-auto">
                  <pre className="text-xs text-gray-800 dark:text-gray-200">
                    {JSON.stringify(analysis.result, null, 2)}
                  </pre>
                </div>
              </details>
            </div>
          </div>

          {/* Related Feedback Section */}
          {feedback.some(f => f.analysis_result_id === analysis.id) && (
            <div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Related Feedback</p>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                {feedback
                  .filter(f => f.analysis_result_id === analysis.id)
                  .map(f => (
                    <div key={f.id} className="mb-4 last:mb-0">
                      <div className="flex justify-between">
                        <span className="font-semibold">
                          {getUserById(f.user_id)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(f.created_at)}
                        </span>
                      </div>
                      {f.rating && (
                        <div className="text-yellow-500">
                          {'★'.repeat(f.rating)}{'☆'.repeat(5-f.rating)}
                        </div>
                      )}
                      <p className="text-gray-900 dark:text-white mt-1">
                        {f.feedback_text || f.comment || '-'}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Update the table row to be clickable
  const renderAnalysisRow = (analysis: AnalysisData) => {
    const { verdict, explanation } = formatAnalysisResult(analysis.result);
    
    return (
      <tr 
        key={analysis.id}
        onClick={() => setSelectedAnalysis(analysis)}
        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
          {analysis.type || 'Unknown'}
        </td>
        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300 max-w-xs truncate">
          {getInputSummary(analysis.input)}
        </td>
        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300 max-w-md truncate">
          {explanation.substring(0, 80) + (explanation.length > 80 ? '...' : '')}
        </td>
        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
          verdict === 'FAKE'
            ? 'text-red-600 dark:text-red-400'
            : verdict === 'NOT FAKE'
              ? 'text-green-600 dark:text-green-400'
              : 'text-yellow-600 dark:text-yellow-400'
        }`}>
          {verdict}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
          {getUserById(analysis.user_id)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
          {analysis.created_at ? formatDate(analysis.created_at) : 'Unknown date'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <button 
            onClick={(e) => {
              e.stopPropagation(); // Prevent row click
              setSelectedAnalysis(analysis);
            }}
            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
          >
            View
          </button>
        </td>
      </tr>
    );
  };

  // Helper function to get feedback sentiment (positive or negative)
  const getFeedbackSentiment = (rating?: number) => {
    if (rating === undefined) return 'Unknown';
    return rating > 3 ? 'Positive' : rating === 3 ? 'Neutral' : 'Negative';
  };

  // Helper function to get sentiment color class
  const getSentimentColorClass = (rating?: number) => {
    if (rating === undefined) return 'text-gray-500';
    return rating > 3 ? 'text-green-500 dark:text-green-400' : 
           rating === 3 ? 'text-yellow-500 dark:text-yellow-400' : 
           'text-red-500 dark:text-red-400';
  };

  // Function to find an analysis by ID
  const findAnalysisById = (analysisId?: string) => {
    if (!analysisId) return null;
    return analyses.find(a => a.id === analysisId);
  };

  // Enhanced function for feedback display - get related analysis info
  const getRelatedAnalysisInfo = (feedbackItem: FeedbackData) => {
    if (!feedbackItem.analysis_result_id) return null;
    
    const relatedAnalysis = analyses.find(a => a.id === feedbackItem.analysis_result_id);
    if (!relatedAnalysis) return null;
    
    const { verdict } = formatAnalysisResult(relatedAnalysis.result);
    
    return {
      type: relatedAnalysis.type,
      input: getInputSummary(relatedAnalysis.input),
      verdict,
      date: relatedAnalysis.created_at,
      id: relatedAnalysis.id
    };
  };

  // Function to render the active tab content
  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">{t.dashboard}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.map((stat, index) => (
                <StatsCard
                  key={index}
                  label={stat.label}
                  value={stat.value}
                  index={index}
                />
              ))}
            </div>
            
            {selectedAnalysis ? (
              renderAnalysisDetails(selectedAnalysis)
            ) : (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Recent Analyses</h3>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Input</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Explanation</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Verdict</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {analyses.length > 0 ? (
                        analyses.slice(0, 10).map(analysis => renderAnalysisRow(analysis))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-300">No analyses found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );
      case 'users':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">{t.users}</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Joined</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Last Sign In</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Analyses</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {users.length > 0 ? (
                    users.map(user => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {user.email || 'No email'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {user.created_at ? formatDate(user.created_at) : 'Unknown date'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {user.last_sign_in_at ? formatDate(user.last_sign_in_at) : 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {analyses.filter(a => a.user_id === user.id).length}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-300">No users found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">Anonymous Usage</h3>
              <p className="text-blue-700 dark:text-blue-300 mt-2">
                {analyses.filter(a => !a.user_id).length} analyses were performed by non-logged in users.
              </p>
            </div>
          </div>
        );
      case 'feedback':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">{t.feedback}</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Feedback</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rating</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Related Analysis</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Verdict</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">From</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {feedback.length > 0 ? (
                    feedback.map(item => {
                      const relatedAnalysis = getRelatedAnalysisInfo(item);
                      
                      return (
                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white max-w-md truncate">
                            {item.feedback_text || item.comment || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-500 dark:text-yellow-400">
                            {item.rating !== undefined ? `${'★'.repeat(item.rating)}${'☆'.repeat(5-item.rating)}` : '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300 max-w-xs truncate">
                            {relatedAnalysis ? (
                              <div>
                                <div className="font-medium">{relatedAnalysis.type}</div>
                                <div className="text-xs text-gray-500">{relatedAnalysis.input}</div>
                              </div>
                            ) : (
                              <span className="text-gray-400">No related analysis</span>
                            )}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                            relatedAnalysis?.verdict === 'FAKE' 
                              ? 'text-red-600 dark:text-red-400' 
                              : relatedAnalysis?.verdict === 'NOT FAKE'
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-gray-400 dark:text-gray-500'
                          }`}>
                            {relatedAnalysis?.verdict || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {getUserById(item.user_id)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {item.created_at ? formatDate(item.created_at) : 'Unknown date'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button 
                              onClick={() => {
                                const analysis = findAnalysisById(item.analysis_result_id);
                                if (analysis) {
                                  setSelectedAnalysis(analysis);
                                  setActiveTab('dashboard');
                                }
                              }}
                              className={`text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 ${
                                !item.analysis_result_id ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                              disabled={!item.analysis_result_id}
                            >
                              {item.analysis_result_id ? 'View Details' : 'No Analysis'}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-300">No feedback found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Feedback Statistics</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Feedback</p>
                    <p className="text-2xl font-bold">{feedback.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Average Rating</p>
                    <p className="text-2xl font-bold">
                      {feedback.filter(f => f.rating !== undefined).length > 0
                        ? (feedback.reduce((sum, f) => sum + (f.rating || 0), 0) / 
                          feedback.filter(f => f.rating !== undefined).length).toFixed(1)
                        : 'N/A'
                      }
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-green-50 dark:bg-green-900 p-3 rounded-lg">
                      <p className="text-sm text-green-700 dark:text-green-300">Positive</p>
                      <p className="text-xl font-bold text-green-700 dark:text-green-300">
                        {feedback.filter(f => f.rating !== undefined && f.rating > 3).length}
                      </p>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900 p-3 rounded-lg">
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">Neutral</p>
                      <p className="text-xl font-bold text-yellow-700 dark:text-yellow-300">
                        {feedback.filter(f => f.rating !== undefined && f.rating === 3).length}
                      </p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900 p-3 rounded-lg">
                      <p className="text-sm text-red-700 dark:text-red-300">Negative</p>
                      <p className="text-xl font-bold text-red-700 dark:text-red-300">
                        {feedback.filter(f => f.rating !== undefined && f.rating < 3).length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Comments</h3>
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {feedback
                    .filter(f => f.feedback_text || f.comment)
                    .slice(0, 5)
                    .map(f => {
                      const relatedAnalysis = getRelatedAnalysisInfo(f);
                      
                      return (
                        <div key={f.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex justify-between">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColorClass(f.rating)}`}>
                              {getFeedbackSentiment(f.rating)}
                            </span>
                            <span className="text-sm text-gray-500">
                              {formatDate(f.created_at)}
                            </span>
                          </div>
                          <p className="mt-2 text-gray-800 dark:text-gray-200">
                            "{f.feedback_text || f.comment}"
                          </p>
                          <div className="mt-3 border-t border-gray-200 dark:border-gray-600 pt-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              From: {getUserById(f.user_id)}
                            </p>
                            
                            {relatedAnalysis && (
                              <div className="mt-2 text-sm">
                                <p className="font-semibold text-gray-700 dark:text-gray-300">Related Analysis:</p>
                                <div className="bg-gray-100 dark:bg-gray-600 px-3 py-2 rounded-lg mt-1">
                                  <div className="flex justify-between items-center">
                                    <span>{relatedAnalysis.type}</span>
                                    <span className={`font-semibold ${
                                      relatedAnalysis.verdict === 'FAKE' 
                                        ? 'text-red-600 dark:text-red-400' 
                                        : 'text-green-600 dark:text-green-400'
                                    }`}>
                                      {relatedAnalysis.verdict}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                                    Input: {relatedAnalysis.input}
                                  </p>
                                  <button 
                                    onClick={() => {
                                      const analysis = findAnalysisById(f.analysis_result_id);
                                      if (analysis) {
                                        setSelectedAnalysis(analysis);
                                        setActiveTab('dashboard');
                                      }
                                    }}
                                    className="mt-2 text-xs text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                  >
                                    View full analysis
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  {feedback.filter(f => f.feedback_text || f.comment).length === 0 && (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">No comments found</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card>
        <Card.Header>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t.adminDashboard}
          </h1>
        </Card.Header>
        <Card.Body>
          <div className="flex space-x-4 mb-6">
            {tabs.map(({ id, icon, label }) => (
              <TabButton
                key={id}
                id={id}
                icon={icon}
                label={label}
                isActive={activeTab === id}
                onClick={() => setActiveTab(id)}
              />
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
            </div>
          ) : (
            <Card className="bg-gray-50 dark:bg-gray-700 p-6">
              {renderActiveTabContent()}
            </Card>
          )}
        </Card.Body>
      </Card>
    </motion.div>
  );
}
