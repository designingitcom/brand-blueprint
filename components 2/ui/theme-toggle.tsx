'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/contexts/theme-context';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
  showLabels?: boolean;
}

export function ThemeToggle({ className, showLabels = true }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
        'hover:bg-secondary/50 hover:text-primary text-muted-foreground',
        'w-full justify-start',
        className
      )}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5 flex-shrink-0" />
      ) : (
        <Sun className="h-5 w-5 flex-shrink-0" />
      )}
      {showLabels && (
        <span>
          {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        </span>
      )}
    </button>
  );
}

export function CompactThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200',
        'hover:bg-secondary/50 hover:text-primary text-muted-foreground',
        'border border-border'
      )}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </button>
  );
}