import React from 'react';
import { cn } from '@/lib/utils';

interface TabItem {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
}

interface TabBarProps {
  tabs: TabItem[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}

export const TabBar: React.FC<TabBarProps> = ({ tabs, active, onChange, className }) => (
  <div className={cn('flex flex-wrap gap-1 border-b border-zinc-800', className)}>
    {tabs.map((t) => (
      <button
        key={t.id}
        onClick={() => onChange(t.id)}
        className={cn(
          'flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors',
          active === t.id
            ? 'border-emerald-500 text-zinc-50'
            : 'border-transparent text-zinc-500 hover:text-zinc-300'
        )}
      >
        {t.icon}
        {t.label}
      </button>
    ))}
  </div>
);
