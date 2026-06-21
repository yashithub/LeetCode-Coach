import type { Recommendation } from '@/lib/recommendations/engine';
import GlassCard from '@/components/ui/GlassCard';

const DIFF_COLOR = {
  Easy: 'bg-mint/15 text-mint border-mint/30',
  Medium: 'bg-orange/15 text-orange border-orange/30',
  Hard: 'bg-coral/15 text-coral border-coral/30',
};

interface NextBestProblemProps {
  recommendation: Recommendation | null;
  fallbackMessage?: string;
}

export default function NextBestProblem({ recommendation, fallbackMessage }: NextBestProblemProps) {
  if (!recommendation) {
    return (
      <GlassCard glow="orange" className="p-8 text-center">
        <p className="font-mono text-xs text-orange uppercase tracking-widest mb-3">Next Best Problem</p>
        <p className="text-ink-muted text-sm">{fallbackMessage ?? 'Analyzing your profile for the best next step...'}</p>
      </GlassCard>
    );
  }

  const { problem, reason, primaryTopic, leetcodeUrl } = recommendation;

  return (
    <GlassCard glow="orange" className="relative overflow-hidden p-8 sm:p-10 animate-fade-up">
      <div className="absolute inset-0 bg-ember-gradient opacity-[0.04] pointer-events-none" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-orange/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />

      <p className="font-mono text-xs text-orange uppercase tracking-[0.2em] mb-4">
        Next Best Problem
      </p>

      <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4 leading-tight">
        {problem.title}
      </h2>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <span className={`font-mono text-xs px-3 py-1 rounded-full border ${DIFF_COLOR[problem.difficulty]}`}>
          {problem.difficulty}
        </span>
        <span className="font-mono text-xs text-ink-muted px-3 py-1 rounded-full border border-border">
          {primaryTopic}
        </span>
        <span className="font-mono text-xs text-ink-muted">
          ~{problem.estimatedMinutes} min
        </span>
      </div>

      <p className="text-ink-muted text-sm sm:text-base leading-relaxed max-w-2xl mb-8">
        {reason}
      </p>

      <a
        href={leetcodeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-xl bg-ember-gradient text-bg font-semibold px-8 py-3.5 hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98]"
      >
        Solve Now
        <span aria-hidden="true">→</span>
      </a>
    </GlassCard>
  );
}
