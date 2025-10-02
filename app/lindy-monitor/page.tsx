'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, ChevronDown, ChevronRight, ArrowRight, ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RequestLog {
  id: string;
  business_id: string;
  direction: 'outgoing' | 'incoming';
  endpoint: string;
  method: string;
  payload: any;
  response_status: number | null;
  response_body: any;
  success: boolean;
  error_message: string | null;
  processing_time_ms: number | null;
  question_id: string | null;
  created_at: string;
}

interface BusinessGroup {
  business_id: string;
  business_name: string;
  logs: RequestLog[];
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  last_activity: string;
}

export default function LindyMonitorPage() {
  const [businessGroups, setBusinessGroups] = useState<BusinessGroup[]>([]);
  const [expandedBusinesses, setExpandedBusinesses] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchLogs = async () => {
    const supabase = createClient();

    // Fetch all logs with business info
    const { data: logs, error } = await supabase
      .from('lindy_request_logs')
      .select(`
        *,
        businesses!inner(id, name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching logs:', error);
      return;
    }

    // Group by business_id
    const grouped = logs.reduce((acc, log: any) => {
      const businessId = log.business_id;
      if (!acc[businessId]) {
        acc[businessId] = {
          business_id: businessId,
          business_name: log.businesses.name || 'Unknown Business',
          logs: [],
          total_requests: 0,
          successful_requests: 0,
          failed_requests: 0,
          last_activity: log.created_at
        };
      }

      acc[businessId].logs.push(log);
      acc[businessId].total_requests++;
      if (log.success) {
        acc[businessId].successful_requests++;
      } else {
        acc[businessId].failed_requests++;
      }

      // Track most recent activity
      if (new Date(log.created_at) > new Date(acc[businessId].last_activity)) {
        acc[businessId].last_activity = log.created_at;
      }

      return acc;
    }, {} as Record<string, BusinessGroup>);

    // Convert to array and sort by last activity
    const groupsArray = Object.values(grouped).sort((a, b) =>
      new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime()
    );

    setBusinessGroups(groupsArray);
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchLogs, 3000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const toggleBusiness = (businessId: string) => {
    const newExpanded = new Set(expandedBusinesses);
    if (newExpanded.has(businessId)) {
      newExpanded.delete(businessId);
    } else {
      newExpanded.add(businessId);
    }
    setExpandedBusinesses(newExpanded);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatDuration = (ms: number | null) => {
    if (!ms) return 'N/A';
    return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lindy Request Monitor</h1>
          <p className="text-muted-foreground mt-1">
            Track API interactions grouped by business
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            onClick={() => setAutoRefresh(!autoRefresh)}
            size="sm"
          >
            <RefreshCw className={cn('h-4 w-4 mr-2', autoRefresh && 'animate-spin')} />
            Auto-refresh {autoRefresh && '(3s)'}
          </Button>
          <Button onClick={fetchLogs} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Now
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Businesses</div>
          <div className="text-2xl font-bold mt-1">{businessGroups.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Requests</div>
          <div className="text-2xl font-bold mt-1">
            {businessGroups.reduce((sum, g) => sum + g.total_requests, 0)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Success Rate</div>
          <div className="text-2xl font-bold mt-1">
            {businessGroups.length > 0
              ? Math.round(
                  (businessGroups.reduce((sum, g) => sum + g.successful_requests, 0) /
                    businessGroups.reduce((sum, g) => sum + g.total_requests, 0)) *
                    100
                )
              : 0}
            %
          </div>
        </Card>
      </div>

      {/* Business Groups */}
      <div className="space-y-3">
        {businessGroups.length === 0 ? (
          <Card className="p-12 text-center text-muted-foreground">
            No Lindy requests logged yet. Requests will appear here when you trigger Lindy during onboarding.
          </Card>
        ) : (
          businessGroups.map((group) => {
            const isExpanded = expandedBusinesses.has(group.business_id);

            return (
              <Card key={group.business_id} className="overflow-hidden">
                {/* Business Header */}
                <button
                  onClick={() => toggleBusiness(group.business_id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div className="text-left">
                      <div className="font-semibold">{group.business_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {group.total_requests} request{group.total_requests !== 1 ? 's' : ''} · Last activity: {formatTime(group.last_activity)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {group.successful_requests}
                    </Badge>
                    {group.failed_requests > 0 && (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        <XCircle className="h-3 w-3 mr-1" />
                        {group.failed_requests}
                      </Badge>
                    )}
                  </div>
                </button>

                {/* Request Logs */}
                {isExpanded && (
                  <div className="border-t">
                    {group.logs.map((log, index) => (
                      <div
                        key={log.id}
                        className={cn(
                          'p-4 border-b last:border-b-0',
                          log.direction === 'outgoing' ? 'bg-blue-50/30' : 'bg-purple-50/30'
                        )}
                      >
                        {/* Request Header */}
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {log.direction === 'outgoing' ? (
                              <ArrowRight className="h-4 w-4 text-blue-600" />
                            ) : (
                              <ArrowLeft className="h-4 w-4 text-purple-600" />
                            )}
                            <Badge
                              variant="outline"
                              className={cn(
                                log.direction === 'outgoing'
                                  ? 'bg-blue-100 text-blue-700 border-blue-200'
                                  : 'bg-purple-100 text-purple-700 border-purple-200'
                              )}
                            >
                              {log.direction.toUpperCase()}
                            </Badge>
                            {log.question_id && (
                              <Badge variant="secondary">{log.question_id}</Badge>
                            )}
                            {log.success ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                            {log.processing_time_ms && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDuration(log.processing_time_ms)}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(log.created_at)}
                          </span>
                        </div>

                        {/* Request Details */}
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium">Endpoint:</span>{' '}
                            <code className="text-xs bg-muted px-1 py-0.5 rounded">
                              {log.endpoint}
                            </code>
                          </div>

                          {log.error_message && (
                            <div className="text-red-600">
                              <span className="font-medium">Error:</span> {log.error_message}
                            </div>
                          )}

                          {/* Payload (collapsible) */}
                          <details className="mt-2">
                            <summary className="cursor-pointer font-medium text-muted-foreground hover:text-foreground">
                              View Payload
                            </summary>
                            <pre className="mt-2 p-3 bg-muted rounded-lg overflow-x-auto text-xs">
                              {JSON.stringify(log.payload, null, 2)}
                            </pre>
                          </details>

                          {/* Response (collapsible) */}
                          {log.response_body && (
                            <details className="mt-2">
                              <summary className="cursor-pointer font-medium text-muted-foreground hover:text-foreground">
                                View Response
                              </summary>
                              <pre className="mt-2 p-3 bg-muted rounded-lg overflow-x-auto text-xs">
                                {JSON.stringify(log.response_body, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
