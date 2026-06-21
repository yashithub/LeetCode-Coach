import type { StudyPlan } from '@/lib/recommendations/study-plan';
import GlassCard from '@/components/ui/GlassCard';

interface StudyPlanCardProps {
  plan: StudyPlan;
}

export default function StudyPlanCard({ plan }: StudyPlanCardProps) {
  return (
    <GlassCard className="p-6 sm:p-8 animate-fade-up [animation-delay:100ms]">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="font-mono text-xs text-mint uppercase tracking-widest mb-1">AI Study Plan</p>
          <h3 className="font-display text-xl font-semibold">Today&rsquo;s Plan</h3>
        </div>
        <div className="text-right">
          <p className="font-mono text-xs text-ink-muted">Estimated time</p>
          <p className="font-mono text-lg text-orange font-semibold">{plan.estimatedMinutes} min</p>
        </div>
      </div>

      <ul className="space-y-3 mb-6">
        {plan.todayItems.map((item, i) => (
          <li
            key={i}
            className="flex items-center justify-between rounded-lg border border-border/60 bg-surface-2/50 px-4 py-3"
          >
            <span className="font-mono text-sm">
              <span className="text-orange font-semibold">{item.count}</span>{' '}
              <span className="text-ink">{item.topic}</span>{' '}
              <span className="text-ink-muted">problem{item.count > 1 ? 's' : ''}</span>
            </span>
            <span className="font-mono text-xs text-ink-muted">{item.difficulty}</span>
          </li>
        ))}
        {plan.revisionTopic && (
          <li className="flex items-center justify-between rounded-lg border border-border/60 bg-surface-2/50 px-4 py-3">
            <span className="font-mono text-sm">
              <span className="text-mint font-semibold">1</span>{' '}
              <span className="text-ink">Revision</span>{' '}
              <span className="text-ink-muted">problem</span>
            </span>
            <span className="font-mono text-xs text-ink-muted">{plan.revisionTopic}</span>
          </li>
        )}
      </ul>

      <div className="rounded-lg border border-mint/20 bg-mint/5 px-4 py-3">
        <p className="font-mono text-xs text-mint uppercase tracking-wide mb-1">Weekly Goal</p>
        <p className="text-sm text-ink">{plan.weeklyGoal}</p>
      </div>
    </GlassCard>
  );
}
