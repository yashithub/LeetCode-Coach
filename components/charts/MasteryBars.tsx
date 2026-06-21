'use client';

import type { MasteryTopic } from '@/lib/scoring/mastery';

interface MasteryBarsProps {
  topics: MasteryTopic[];
  limit?: number;
}

const COLORS = ['bg-coral', 'bg-ember', 'bg-orange', 'bg-mint/70', 'bg-mint'];

export default function MasteryBars({ topics, limit = 8 }: MasteryBarsProps) {
  const data = [...topics]
    .filter((t) => t.solved > 0)
    .sort((a, b) => b.masteryPercent - a.masteryPercent)
    .slice(0, limit);

  if (data.length === 0) {
    return <p className="text-xs text-ink-muted text-center py-4">Solve problems to see mastery bars.</p>;
  }

  const max = Math.max(...data.map((d) => d.masteryPercent), 1);

  return (
    <div className="space-y-3">
      {data.map((t, i) => (
        <div key={t.slug} className="animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
          <div className="flex justify-between mb-1">
            <span className="font-mono text-xs text-ink truncate">{t.name}</span>
            <span className="font-mono text-xs text-ink-muted">{t.masteryPercent}%</span>
          </div>
          <div className="h-3 rounded-full bg-surface-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${COLORS[i % COLORS.length]}`}
              style={{ width: `${(t.masteryPercent / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
