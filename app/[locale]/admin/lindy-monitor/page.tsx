'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { triggerLindyQ7Suggestions } from '@/app/actions/trigger-lindy';

interface LindyResponse {
  id: string;
  business_id: string;
  question_id: string;
  content: any;
  suggestions: any[];
  created_at: string;
}

interface ActivityLog {
  id: string;
  timestamp: string;
  direction: 'outgoing' | 'incoming';
  status: 'success' | 'pending' | 'error';
  businessId?: string;
  conversationId?: string;
  payload?: any;
  response?: LindyResponse;
}

export default function LindyMonitorPage() {
  const [responses, setResponses] = useState<LindyResponse[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<LindyResponse | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<ActivityLog | null>(null);
  const [activeTab, setActiveTab] = useState<'timeline' | 'responses'>('timeline');

  const supabase = createClient();

  const fetchResponses = async () => {
    const { data, error } = await supabase
      .from('lindy_responses')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data) {
      setResponses(data);

      // Convert responses to activity log entries
      const incomingActivities: ActivityLog[] = data.map(r => ({
        id: `incoming-${r.id}`,
        timestamp: r.created_at,
        direction: 'incoming',
        status: 'success',
        businessId: r.business_id,
        conversationId: r.content?.conversationId,
        response: r
      }));

      setActivityLog(prev => {
        // Keep existing outgoing activities, merge with incoming
        const outgoingActivities = prev.filter(a => a.direction === 'outgoing');
        const combined = [...outgoingActivities, ...incomingActivities];

        // Remove duplicates by ID and sort by timestamp
        const unique = Array.from(new Map(combined.map(a => [a.id, a])).values());
        return unique.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchResponses();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('lindy_responses_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'lindy_responses',
        },
        (payload) => {
          const newResponse = payload.new as LindyResponse;
          setResponses((prev) => [newResponse, ...prev]);

          // Add to activity log
          setActivityLog(prev => [{
            id: `incoming-${newResponse.id}`,
            timestamp: newResponse.created_at,
            direction: 'incoming',
            status: 'success',
            businessId: newResponse.business_id,
            response: newResponse
          }, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleTrigger = async () => {
    setTriggering(true);
    const businessId = '2b8f7bb2-17ea-4051-b605-8ce44451c1f1';

    // Add outgoing activity immediately
    const outgoingActivity: ActivityLog = {
      id: `outgoing-${Date.now()}`,
      timestamp: new Date().toISOString(),
      direction: 'outgoing',
      status: 'pending',
      businessId,
      payload: {
        project_id: businessId,
        business_name: 'JPM',
        callback_url: process.env.NEXT_PUBLIC_LINDY_CALLBACK_URL
      }
    };

    setActivityLog(prev => [outgoingActivity, ...prev]);

    try {
      const result = await triggerLindyQ7Suggestions({ businessId });

      // Update outgoing activity with result
      setActivityLog(prev => prev.map(a =>
        a.id === outgoingActivity.id
          ? {
              ...a,
              status: result.success ? 'success' : 'error',
              conversationId: result.lindyResponse?.data?.conversationId,
              payload: { ...a.payload, result }
            }
          : a
      ));

      setTimeout(fetchResponses, 3000); // Refresh after 3 seconds to catch incoming webhook
    } catch (error) {
      setActivityLog(prev => prev.map(a =>
        a.id === outgoingActivity.id
          ? { ...a, status: 'error' as const, payload: { ...a.payload, error: String(error) } }
          : a
      ));
    } finally {
      setTriggering(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Lindy Integration Monitor</h1>
          <button
            onClick={handleTrigger}
            disabled={triggering}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {triggering ? 'Triggering Lindy...' : 'Trigger Lindy'}
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'timeline'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Activity Timeline ({activityLog.length})
            </button>
            <button
              onClick={() => setActiveTab('responses')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'responses'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Responses Only ({responses.length})
            </button>
          </nav>
        </div>

        {activeTab === 'timeline' ? (
          /* Timeline View with Side Panel */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Activity Timeline */}
            <div className="space-y-4 max-h-[700px] overflow-y-auto">
              {activityLog.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                  No activity yet. Click "Trigger Lindy" to start.
                </div>
              ) : (
                activityLog.map((activity) => (
                  <button
                    key={activity.id}
                    onClick={() => {
                      setSelectedActivity(activity);
                      setSelectedResponse(activity.response || null);
                    }}
                    className={`w-full bg-white rounded-lg p-6 text-left hover:shadow-md transition border-2 ${
                      selectedActivity?.id === activity.id
                        ? 'border-blue-500 shadow-lg'
                        : 'border-transparent shadow'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Direction Icon */}
                      <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                        activity.direction === 'outgoing'
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-green-100 text-green-600'
                      }`}>
                        {activity.direction === 'outgoing' ? '→' : '←'}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {activity.direction === 'outgoing' ? 'Triggered Lindy' : 'Received from Lindy'}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {new Date(activity.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            activity.status === 'success'
                              ? 'bg-green-100 text-green-800'
                              : activity.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {activity.status}
                          </span>
                        </div>

                        {/* Quick Details */}
                        <div className="space-y-1">
                          {activity.businessId && (
                            <div className="text-sm text-gray-600">
                              Business: <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                                {activity.businessId.slice(0, 8)}...
                              </code>
                            </div>
                          )}

                          {activity.conversationId && (
                            <div className="text-sm text-gray-600">
                              Conversation: <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                                {activity.conversationId.slice(0, 12)}...
                              </code>
                            </div>
                          )}

                          {activity.direction === 'incoming' && activity.response && (
                            <div className="text-sm font-medium text-green-600 mt-2">
                              {activity.response.suggestions?.length || 0} suggestions received
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Right: Details Panel */}
            <div className="bg-white rounded-lg shadow sticky top-0">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">
                  {selectedActivity?.direction === 'outgoing' ? 'Outgoing Request' : 'Incoming Response'}
                </h2>
              </div>

              {selectedActivity?.direction === 'outgoing' ? (
                /* Outgoing Request Details */
                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Request Details</h3>
                    <div className="bg-gray-50 p-3 rounded text-sm space-y-2">
                      <div>
                        <strong>Status:</strong>{' '}
                        <span className={`px-2 py-1 rounded text-xs ${
                          selectedActivity.status === 'success'
                            ? 'bg-green-100 text-green-800'
                            : selectedActivity.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedActivity.status}
                        </span>
                      </div>
                      <div><strong>Timestamp:</strong> {new Date(selectedActivity.timestamp).toLocaleString()}</div>
                      {selectedActivity.businessId && (
                        <div><strong>Business ID:</strong> <code>{selectedActivity.businessId}</code></div>
                      )}
                      {selectedActivity.conversationId && (
                        <div><strong>Conversation ID:</strong> <code>{selectedActivity.conversationId}</code></div>
                      )}
                    </div>
                  </div>

                  {selectedActivity.payload && (
                    <div>
                      <h3 className="font-semibold mb-2">Payload Sent to Lindy</h3>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-auto text-xs max-h-96">
                        {JSON.stringify(selectedActivity.payload, null, 2)}
                      </pre>
                    </div>
                  )}

                  {selectedActivity.conversationId && (
                    <div>
                      <h3 className="font-semibold mb-2">View in Lindy</h3>
                      <a
                        href={`https://chat.lindy.ai/florian-auckenthalers-workspace/lindy/strategic-foundation-system-68d8e39a161035c1e6f3f860/tasks?task=${selectedActivity.conversationId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Open conversation in Lindy →
                      </a>
                    </div>
                  )}
                </div>
              ) : selectedResponse ? (
                <div className="p-6 space-y-6 max-h-[650px] overflow-y-auto">
                  {/* Business Context */}
                  {selectedResponse.content?.business_context && (
                    <div>
                      <h3 className="font-semibold mb-2">Business Context</h3>
                      <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
                        <div><strong>Name:</strong> {selectedResponse.content.business_context.business_name}</div>
                        <div><strong>Industry:</strong> {selectedResponse.content.business_context.industry || 'N/A'}</div>
                        <div><strong>Type:</strong> {selectedResponse.content.business_context.business_type || 'N/A'}</div>
                      </div>
                    </div>
                  )}

                  {/* Q7 Suggestions */}
                  <div>
                    <h3 className="font-semibold mb-3">Q7 Suggestions</h3>
                    <div className="space-y-4">
                      {selectedResponse.suggestions?.map((suggestion: any, idx: number) => (
                        <div key={idx} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium">Option {suggestion.id}</span>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {Math.round(suggestion.confidence * 100)}% confidence
                            </span>
                          </div>
                          <p className="text-sm mb-2">{suggestion.text}</p>
                          <div className="text-xs text-gray-600">
                            <div><strong>Approach:</strong> {suggestion.approach}</div>
                            <div className="mt-1"><strong>Reasoning:</strong> {suggestion.reasoning}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Confidence Scores */}
                  {selectedResponse.content?.confidence_scores && (
                    <div>
                      <h3 className="font-semibold mb-2">Confidence Scores</h3>
                      <div className="space-y-2">
                        {Object.entries(selectedResponse.content.confidence_scores).map(([key, value]) => (
                          <div key={key} className="flex items-center">
                            <div className="w-48 text-sm text-gray-600">{key}:</div>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${(value as number) * 100}%` }}
                              />
                            </div>
                            <div className="ml-2 text-sm font-medium w-12 text-right">
                              {Math.round((value as number) * 100)}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Raw JSON */}
                  <details>
                    <summary className="cursor-pointer font-semibold text-sm text-gray-700 hover:text-gray-900">
                      View Raw JSON
                    </summary>
                    <pre className="mt-2 bg-gray-900 text-gray-100 p-4 rounded overflow-auto text-xs max-h-64">
                      {JSON.stringify(selectedResponse.content, null, 2)}
                    </pre>
                  </details>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <p className="mb-2">Click on an incoming response to view details</p>
                  <p className="text-sm">(Outgoing requests don't have response data)</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Responses View (existing) */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: List of responses */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">Incoming Responses</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {responses.length} responses
                </p>
              </div>

              <div className="divide-y max-h-[600px] overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center text-gray-500">Loading...</div>
                ) : responses.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No responses yet.
                  </div>
                ) : (
                  responses.map((response) => (
                    <button
                      key={response.id}
                      onClick={() => setSelectedResponse(response)}
                      className={`w-full text-left p-4 hover:bg-gray-50 transition ${
                        selectedResponse?.id === response.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">
                            {response.content?.business_context?.business_name || 'Unknown Business'}
                          </div>
                          <div className="text-sm text-gray-600">
                            {response.suggestions?.length || 0} suggestions
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(response.created_at).toLocaleTimeString()}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Right: Response details */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">Response Details</h2>
              </div>

              {selectedResponse ? (
                <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto">
                  {/* Business Context */}
                  {selectedResponse.content?.business_context && (
                    <div>
                      <h3 className="font-semibold mb-2">Business Context</h3>
                      <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
                        <div><strong>Name:</strong> {selectedResponse.content.business_context.business_name}</div>
                        <div><strong>Industry:</strong> {selectedResponse.content.business_context.industry || 'N/A'}</div>
                        <div><strong>Type:</strong> {selectedResponse.content.business_context.business_type || 'N/A'}</div>
                      </div>
                    </div>
                  )}

                  {/* Q7 Suggestions */}
                  <div>
                    <h3 className="font-semibold mb-3">Q7 Suggestions</h3>
                    <div className="space-y-4">
                      {selectedResponse.suggestions?.map((suggestion: any, idx: number) => (
                        <div key={idx} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium">Option {suggestion.id}</span>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {Math.round(suggestion.confidence * 100)}% confidence
                            </span>
                          </div>
                          <p className="text-sm mb-2">{suggestion.text}</p>
                          <div className="text-xs text-gray-600">
                            <div><strong>Approach:</strong> {suggestion.approach}</div>
                            <div className="mt-1"><strong>Reasoning:</strong> {suggestion.reasoning}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Confidence Scores */}
                  {selectedResponse.content?.confidence_scores && (
                    <div>
                      <h3 className="font-semibold mb-2">Confidence Scores</h3>
                      <div className="space-y-2">
                        {Object.entries(selectedResponse.content.confidence_scores).map(([key, value]) => (
                          <div key={key} className="flex items-center">
                            <div className="w-48 text-sm text-gray-600">{key}:</div>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${(value as number) * 100}%` }}
                              />
                            </div>
                            <div className="ml-2 text-sm font-medium w-12 text-right">
                              {Math.round((value as number) * 100)}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  Select a response to view details
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
