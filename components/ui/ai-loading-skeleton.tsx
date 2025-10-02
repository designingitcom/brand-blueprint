'use client';

import { Sparkles, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AILoadingSkeletonProps {
  title?: string;
  subtitle?: string;
  className?: string;
  showRefresh?: boolean;
  onRefresh?: () => void;
  businessId?: string; // For test trigger button
}

export function AILoadingSkeleton({
  title = 'AI is analyzing your information',
  subtitle = 'This usually takes 10-30 seconds...',
  className,
  showRefresh = false,
  onRefresh,
  businessId,
}: AILoadingSkeletonProps) {
  const handleTestTrigger = async () => {
    if (!businessId) return;

    try {
      console.log('🧪 Triggering test suggestions...');
      const response = await fetch(`/api/test-lindy-trigger?business_id=${businessId}`);
      const result = await response.json();
      console.log('✅ Test suggestions loaded:', result);

      // Call onRefresh if provided to refetch data, otherwise reload
      if (onRefresh) {
        onRefresh();
      } else {
        // Force reload as last resort
        window.location.reload();
      }
    } catch (error) {
      console.error('❌ Test trigger failed:', error);
    }
  };
  return (
    <div
      className={cn(
        'w-full bg-purple-50/50 dark:bg-purple-950/10 rounded-xl border border-purple-200 dark:border-purple-800',
        'backdrop-blur-sm',
        className
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-purple-200 dark:border-purple-800">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-600 animate-pulse" />
          <span className="font-medium text-purple-600">AI Suggestions</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Test trigger button (only when Lindy is skipped in development) */}
          {businessId &&
           process.env.NODE_ENV === 'development' &&
           process.env.SKIP_LINDY_IN_DEV !== 'false' && (
            <button
              type="button"
              onClick={handleTestTrigger}
              className="text-xs px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              title="Load test suggestions (Lindy skipped in dev)"
            >
              🧪 Test
            </button>
          )}
          {showRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="text-purple-600 hover:text-purple-700 hover:bg-purple-100 p-2 rounded-lg transition-colors"
              title="Retry"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Loading Header */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-purple-600 animate-pulse" />
            </div>
            <div className="absolute inset-0 rounded-full border-2 border-purple-400 animate-ping opacity-75" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-purple-900 dark:text-purple-100">
              {title}
            </h4>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Loading Skeleton */}
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="h-16 bg-white dark:bg-gray-900/50 rounded-xl border border-purple-100 dark:border-purple-800/50 overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-100/50 dark:via-purple-800/20 to-transparent animate-shimmer" />
            </div>
          ))}
        </div>

        {/* Progress Indicator */}
        <div className="mt-4">
          <div className="h-1 bg-purple-100 dark:bg-purple-900/30 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full animate-progress w-full" />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        @keyframes progress {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

interface AIErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function AIErrorState({
  title = 'Unable to load AI suggestions',
  message = 'There was an error connecting to the AI service. Please try again.',
  onRetry,
  className,
}: AIErrorStateProps) {
  return (
    <div
      className={cn(
        'w-full bg-red-50/50 dark:bg-red-950/10 rounded-xl border border-red-200 dark:border-red-800',
        className
      )}
    >
      <div className="p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
          <RefreshCw className="h-6 w-6 text-red-600" />
        </div>
        <h4 className="text-sm font-medium text-red-900 dark:text-red-100 mb-2">
          {title}
        </h4>
        <p className="text-xs text-red-600 dark:text-red-400 mb-4">
          {message}
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
