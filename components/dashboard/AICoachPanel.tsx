'use client';

import { useEffect, useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import type { CoachProfile, CoachInsights } from '@/app/api/ai/coach/route';

type AIState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; insights: CoachInsights };

interface AICoachPanelProps {
  profile: CoachProfile;
}

export default function AICoachPanel({ profile }: AICoachPanelProps) {
  const [state, setState] = useState<AIState>({ status: 'idle' });

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });

    fetch('/api/ai/coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'AI coaching unavailable.');
        return json.data as CoachInsights;
      })
      .then((insights) => {
        if (!cancelled) setState({ status: 'ready', insights });
      })
      .catch((err: Error) => {
        if (!cancelled) setState({ status: 'error', message: err.message });
      });

    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.totalSolved, profile.easySolved, profile.mediumSolved, profile.hardSolved]);

  if (state.status === 'loading') {
    return (
      <GlassCard glow="mint" className="p-6 sm:p-8 animate-fade-up">
        <p className="font-mono text-xs text-mint uppercase tracking-widest mb-4">
          AI Coach — Gemini
        </p>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-3 rounded bg-surface-2 animate-pulse"
              style={{ width: `${85 - i * 10}%`, animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
        <p className="font-mono text-xs text-ink-muted mt-4">Generating personalized insights…</p>
      </GlassCard>
    );
  }

  if (state.status === 'error') {
    return (
      <GlassCard className="p-6 sm:p-8">
        <p className="font-mono text-xs text-coral uppercase tracking-widest mb-2">AI Coach</p>
        <p className="text-xs text-ink-muted">{state.message}</p>
      </GlassCard>
    );
  }

  if (state.status === 'idle') return null;

  const { insights } = state;

  return (
    <GlassCard glow="mint" className="p-6 sm:p-8 animate-fade-up">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <p className="font-mono text-xs text-mint uppercase tracking-widest mb-1">
            AI Coach — Gemini
          </p>
          <h3 className="font-display text-xl font-semibold">Personalized Coaching</h3>
        </div>
        <span className="shrink-0 font-mono text-[10px] text-mint px-2 py-0.5 rounded border border-mint/30 bg-mint/5">
          AI
        </span>
      </div>

      {/* Summary */}
      <p className="text-sm text-ink-muted leading-relaxed mb-6">{insights.summary}</p>

      <div className="grid sm:grid-cols-2 gap-4 mb-5">
        {/* Strengths */}
        <div className="rounded-lg border border-mint/20 bg-mint/5 px-4 py-3">
          <p className="font-mono text-[10px] text-mint uppercase tracking-wide mb-2">Strengths</p>
          <ul className="space-y-1">
            {insights.strengths.map((s, i) => (
              <li key={i} className="text-xs text-ink flex items-start gap-1.5">
                <span className="text-mint mt-0.5">✓</span>
                {s}
              </li>
            ))}
          </ul>
        </div>

        {/* Focus Areas */}
        <div className="rounded-lg border border-orange/20 bg-orange/5 px-4 py-3">
          <p className="font-mono text-[10px] text-orange uppercase tracking-wide mb-2">Focus Areas</p>
          <ul className="space-y-1">
            {insights.focusAreas.map((f, i) => (
              <li key={i} className="text-xs text-ink flex items-start gap-1.5">
                <span className="text-orange mt-0.5">→</span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recommendations */}
      <div className="mb-5">
        <p className="font-mono text-[10px] text-ink-muted uppercase tracking-wide mb-2">Recommendations</p>
        <ul className="space-y-2">
          {insights.recommendations.map((r, i) => (
            <li
              key={i}
              className="text-xs text-ink-muted flex items-start gap-2 rounded-lg border border-border/60 bg-surface-2/50 px-3 py-2"
            >
              <span className="font-mono text-orange shrink-0">{i + 1}.</span>
              {r}
            </li>
          ))}
        </ul>
      </div>

      {/* Coach Tip */}
      <div className="rounded-lg border border-mint/20 bg-mint/5 px-4 py-3">
        <p className="font-mono text-[10px] text-mint uppercase tracking-wide mb-1">Coach Tip</p>
        <p className="text-sm text-ink italic">"{insights.coachTip}"</p>
      </div>
    </GlassCard>
  );
}
