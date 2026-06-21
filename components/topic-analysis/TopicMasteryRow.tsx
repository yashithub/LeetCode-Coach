import type { MasteryTopic } from '@/lib/scoring/mastery';

const LABEL_COLOR: Record<MasteryTopic['label'], string> = {
  Excellent: 'bg-mint',
  Solid: 'bg-orange',
  Developing: 'bg-ember',
  Weak: 'bg-coral',
  Untouched: 'bg-ink-muted/40',
};

const SKILL_COLOR: Record<MasteryTopic['skillLevel'], string> = {
  Beginner: 'text-coral',
  Intermediate: 'text-orange',
  Advanced: 'text-mint',
};

interface TopicMasteryRowProps {
  topic: MasteryTopic;
  index?: number;
}

export default function TopicMasteryRow({ topic, index = 0 }: TopicMasteryRowProps) {
  const barColor = LABEL_COLOR[topic.label];

  return (
    <li
      className="py-4 animate-fade-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-mono text-sm text-ink">{topic.name}</span>
            <span className={`font-mono text-[10px] uppercase tracking-wide ${SKILL_COLOR[topic.skillLevel]}`}>
              {topic.skillLevel}
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-1">{topic.solved} solved</p>
        </div>
        <span className="font-mono text-sm text-ink tabular-nums">{topic.masteryPercent}%</span>
      </div>

      <div className="h-2 rounded-full bg-surface-2 overflow-hidden mb-2">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
          style={{ width: `${Math.max(topic.masteryPercent, 2)}%` }}
        />
      </div>

      <p className="text-xs text-ink-muted leading-relaxed">{topic.suggestion}</p>
    </li>
  );
}
