'use client';

import AnimatedCounter from '@/components/ui/AnimatedCounter';

interface StatCardProps {
  label: string;
  value: number | string;
  accent?: 'orange' | 'mint' | 'coral' | 'ink';
  animate?: boolean;
}

const ACCENT_CLASS: Record<NonNullable<StatCardProps['accent']>, string> = {
  orange: 'text-orange',
  mint: 'text-mint',
  coral: 'text-coral',
  ink: 'text-ink',
};

export default function StatCard({ label, value, accent = 'ink', animate = true }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-surface px-5 py-4 hover:border-orange/30 transition-colors">
      <p className="font-mono text-xs text-ink-muted uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className={`font-mono text-2xl font-semibold ${ACCENT_CLASS[accent]}`}>
        {typeof value === 'number' && animate ? (
          <AnimatedCounter value={value} />
        ) : (
          value
        )}
      </p>
    </div>
  );
}
