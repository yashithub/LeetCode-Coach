import type { MasteryTopic } from '@/lib/scoring/mastery';
import TopicMasteryRow from '@/components/topic-analysis/TopicMasteryRow';
import EmptyStateMessage from '@/components/topic-analysis/EmptyStateMessage';
import GlassCard from '@/components/ui/GlassCard';

interface StrongTopicsPanelProps {
  topics: MasteryTopic[];
}

export default function StrongTopicsPanel({ topics }: StrongTopicsPanelProps) {
  const strong = [...topics]
    .filter((t) => t.solved > 0)
    .sort((a, b) => b.masteryPercent - a.masteryPercent)
    .slice(0, 5);

  return (
    <GlassCard className="p-6">
      <h2 className="font-mono text-xs text-mint uppercase tracking-wide mb-1">
        Strongest Topics
      </h2>
      <p className="text-xs text-ink-muted mb-4">Where you outperform your own average.</p>

      {strong.length === 0 ? (
        <EmptyStateMessage message="Keep solving — your strengths will emerge as you build topic coverage." />
      ) : (
        <ul className="divide-y divide-border/60">
          {strong.map((t, i) => (
            <TopicMasteryRow key={t.slug} topic={t} index={i} />
          ))}
        </ul>
      )}
    </GlassCard>
  );
}
