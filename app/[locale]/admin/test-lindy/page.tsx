'use client';

import { useState } from 'react';
import { triggerLindyQ7Suggestions } from '@/app/actions/trigger-lindy';

export default function TestLindyPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [businessId] = useState('2b8f7bb2-17ea-4051-b605-8ce44451c1f1');

  const handleTrigger = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await triggerLindyQ7Suggestions({ businessId });
      setResult(response);
    } catch (error) {
      setResult({ success: false, error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Test Lindy Integration</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Trigger Lindy</h2>
          <p className="text-gray-600 mb-4">
            Business ID: <code className="bg-gray-100 px-2 py-1 rounded">{businessId}</code>
          </p>

          <button
            onClick={handleTrigger}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Triggering Lindy...' : 'Trigger Lindy Q7 Generation'}
          </button>
        </div>

        {result && (
          <div className={`rounded-lg shadow p-6 ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
            <h2 className="text-xl font-semibold mb-4">
              {result.success ? '✅ Success' : '❌ Error'}
            </h2>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold mb-2">📊 Monitoring:</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <strong>Terminal:</strong> Watch Next.js console for outgoing request logs
            </li>
            <li>
              <strong>ngrok:</strong>{' '}
              <a
                href="https://dashboard.ngrok.com/traffic-inspector"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View incoming webhooks
              </a>
            </li>
            <li>
              <strong>Supabase:</strong> Check <code>lindy_responses</code> table for results
            </li>
            <li>
              <strong>Lindy:</strong> View conversation in Lindy dashboard
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
