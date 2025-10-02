import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: LucideIcon;
  iconColor?: string;
  className?: string;
}

export function KPICard({
  label,
  value,
  change,
  changeLabel,
  icon: Icon,
  iconColor = 'text-primary',
  className,
}: KPICardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-white rounded-2xl border border-neutral-200 p-6 transition-all duration-300',
        'hover:border-neutral-300 hover:shadow-lg',
        className
      )}
    >
      {/* Background Icon */}
      {Icon && (
        <div className="absolute right-4 top-4 opacity-5">
          <Icon className="h-12 w-12 text-neutral-900" />
        </div>
      )}

      {/* Content */}
      <div className="relative space-y-2">
        <p className="text-sm text-neutral-600">{label}</p>
        <p className="text-4xl font-bold tracking-tight text-neutral-900">{value}</p>

        {change !== undefined && (
          <div className="flex items-center gap-1.5">
            {isPositive && <TrendingUp className="h-4 w-4 text-green-500" />}
            {isNegative && <TrendingDown className="h-4 w-4 text-red-500" />}
            <span
              className={cn(
                'text-xs font-medium',
                isPositive && 'text-green-500',
                isNegative && 'text-red-500',
                !isPositive && !isNegative && 'text-neutral-500'
              )}
            >
              {isPositive && '+'}
              {change}%{changeLabel && ` ${changeLabel}`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
