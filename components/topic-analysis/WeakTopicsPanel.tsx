import type { MasteryTopic } from '@/lib/scoring/mastery';
import { getAdvancedPracticeMessage } from '@/lib/scoring/mastery';
import TopicMasteryRow from '@/components/topic-analysis/TopicMasteryRow';
import EmptyStateMessage from '@/components/topic-analysis/EmptyStateMessage';
import GlassCard from '@/components/ui/GlassCard';

interface WeakTopicsPanelProps {
  topics: MasteryTopic[];
  isAdvancedMode: boolean;
}

export default function WeakTopicsPanel({ topics, isAdvancedMode }: WeakTopicsPanelProps) {
  const weakest = topics.filter((t) => t.isWeakest).slice(0, 5);

  return (
    <GlassCard className="p-6">
      <h2 className="font-mono text-xs text-coral uppercase tracking-wide mb-1">
        Growth Areas
      </h2>
      <p className="text-xs text-ink-muted mb-4">
        Bottom 5 topics relative to your profile — always prioritized for practice.
      </p>

      {isAdvancedMode && (
        <div className="mb-4">
          <EmptyStateMessage
            variant="success"
            message={getAdvancedPracticeMessage(topics)}
          />
        </div>
      )}

      <ul className="divide-y divide-border/60">
        {weakest.map((t, i) => (
          <TopicMasteryRow key={t.slug} topic={t} index={i} />
        ))}
      </ul>
    </GlassCard>
  );
}
