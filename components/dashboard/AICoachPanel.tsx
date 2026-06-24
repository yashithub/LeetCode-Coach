'use client';

import { useState, useCallback } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import type { CoachProfile, CoachInsights, CoachResponse } from '@/app/api/ai/coach/route';

// ─── Types ─────────────────────────────────────────────────────────────────────

type AIState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; insights: CoachInsights; cached: boolean; fallback: boolean; generatedAt: number };

interface AICoachPanelProps {
  profile: CoachProfile;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatTimestamp(ms: number): string {
  const d = new Date(ms);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
    ', ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function AICoachPanel({ profile }: AICoachPanelProps) {
  const [state, setState] = useState<AIState>({ status: 'idle' });

  const runAnalysis = useCallback(async (forceRefresh = false) => {
    setState({ status: 'loading' });
    try {
      const res = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...profile, forceRefresh }),
      });
      const json = await res.json() as Partial<CoachResponse> & { error?: string; message?: string };

      if (!res.ok) {
        // Map status codes to user-friendly messages (raw JSON never shown)
        let msg = json.message ?? 'AI coaching unavailable.';
        if (res.status === 429) msg = 'Daily AI quota reached. Please try again tomorrow.';
        else if (res.status === 503) msg = 'AI service is temporarily busy. Please try again later.';
        else if (res.status === 502) msg = 'Unable to contact AI service.';
        throw new Error(msg);
      }

      setState({
        status: 'ready',
        insights: json.data!,
        cached: json.cached ?? false,
        fallback: json.fallback ?? false,
        generatedAt: json.generatedAt ?? Date.now(),
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.';
      setState({ status: 'error', message: msg });
    }
  }, [profile]);

  // ── Idle: show the generate button ──────────────────────────────────────────
  if (state.status === 'idle') {
    return (
      <GlassCard className="p-6 sm:p-8 animate-fade-up">
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <p className="font-mono text-xs text-mint uppercase tracking-widest">AI Coach — Gemini</p>
          <h3 className="font-display text-xl font-semibold">Personalized Coaching</h3>
          <p className="text-xs text-ink-muted max-w-sm">
            Get AI-generated insights based on your LeetCode profile. Analysis is cached for 24 hours to save API quota.
          </p>
          <button
            onClick={() => runAnalysis(false)}
            className="mt-2 rounded-xl bg-ember-gradient text-bg font-semibold text-sm px-6 py-2.5 hover:opacity-90 transition-opacity active:scale-[0.97]"
          >
            Generate AI Analysis
          </button>
        </div>
      </GlassCard>
    );
  }

  // ── Loading skeleton ─────────────────────────────────────────────────────────
  if (state.status === 'loading') {
    return (
      <GlassCard glow="mint" className="p-6 sm:p-8 animate-fade-up">
        <p className="font-mono text-xs text-mint uppercase tracking-widest mb-4">AI Coach — Gemini</p>
        <div className="space-y-3">
          {[85, 72, 60, 48].map((w, i) => (
            <div
              key={i}
              className="h-3 rounded bg-surface-2 animate-pulse"
              style={{ width: `${w}%`, animationDelay: `${i * 80}ms` }}
            />
          ))}
        </div>
        <p className="font-mono text-xs text-ink-muted mt-4">Generating personalized insights…</p>
      </GlassCard>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────────
  if (state.status === 'error') {
    return (
      <GlassCard className="p-6 sm:p-8">
        <p className="font-mono text-xs text-coral uppercase tracking-widest mb-2">AI Coach</p>
        <p className="text-xs text-ink-muted mb-4">{state.message}</p>
        <button
          onClick={() => setState({ status: 'idle' })}
          className="font-mono text-xs text-orange hover:underline"
        >
          ← Try again
        </button>
      </GlassCard>
    );
  }

  // ── Ready: render insights ───────────────────────────────────────────────────
  const { insights, cached, fallback, generatedAt } = state;

  return (
    <GlassCard glow="mint" className="p-6 sm:p-8 animate-fade-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <p className="font-mono text-xs text-mint uppercase tracking-widest mb-1">AI Coach — Gemini</p>
          <h3 className="font-display text-xl font-semibold">Personalized Coaching</h3>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="font-mono text-[10px] text-mint px-2 py-0.5 rounded border border-mint/30 bg-mint/5">
            {fallback ? 'Local' : 'AI'}
          </span>
          {cached && (
            <span className="font-mono text-[10px] text-ink-muted px-2 py-0.5 rounded border border-border bg-surface-2">
              cached
            </span>
          )}
        </div>
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
                <span className="text-mint mt-0.5">✓</span>{s}
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
                <span className="text-orange mt-0.5">→</span>{f}
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
              <span className="font-mono text-orange shrink-0">{i + 1}.</span>{r}
            </li>
          ))}
        </ul>
      </div>

      {/* Coach Tip */}
      <div className="rounded-lg border border-mint/20 bg-mint/5 px-4 py-3 mb-5">
        <p className="font-mono text-[10px] text-mint uppercase tracking-wide mb-1">Coach Tip</p>
        <p className="text-sm text-ink italic">&ldquo;{insights.coachTip}&rdquo;</p>
      </div>

      {/* Footer: cache info + regenerate */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-3 border-t border-border/40">
        <p className="font-mono text-[10px] text-ink-muted">
          {fallback ? 'Local analysis · ' : 'AI analysis is cached to reduce API usage · '}
          Generated {formatTimestamp(generatedAt)}
        </p>
        <button
          onClick={() => runAnalysis(true)}
          className="font-mono text-[10px] text-orange hover:underline self-start sm:self-auto"
        >
          Regenerate AI Analysis →
        </button>
      </div>
    </GlassCard>
  );
}
