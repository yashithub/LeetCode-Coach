import type { Recommendation } from '@/lib/recommendations/engine';

const DIFF_COLOR = {
  Easy: 'text-mint bg-mint/10 border-mint/25',
  Medium: 'text-orange bg-orange/10 border-orange/25',
  Hard: 'text-coral bg-coral/10 border-coral/25',
};

interface RecommendationCardProps {
  recommendation: Recommendation;
  index: number;
}

export default function RecommendationCard({ recommendation, index }: RecommendationCardProps) {
  const { problem, reason, concept, learningValue, leetcodeUrl, primaryTopic } = recommendation;

  return (
    <article
      className="group rounded-xl border border-border bg-surface p-5 hover:border-orange/40 hover:bg-surface-2/50 transition-all duration-300 animate-fade-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h4 className="font-display text-base font-semibold group-hover:text-orange transition-colors">
          {problem.title}
        </h4>
        <span className={`shrink-0 font-mono text-[10px] px-2 py-0.5 rounded border ${DIFF_COLOR[problem.difficulty]}`}>
          {problem.difficulty}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <span className="font-mono text-[10px] text-ink-muted px-2 py-0.5 rounded bg-surface-2">
          {primaryTopic}
        </span>
        <span className="font-mono text-[10px] text-mint px-2 py-0.5 rounded bg-mint/10">
          Value: {learningValue}/10
        </span>
      </div>

      <p className="text-xs text-ink-muted mb-2 leading-relaxed">
        <span className="text-orange font-mono">Why: </span>{reason}
      </p>
      <p className="text-xs text-ink-muted mb-4 leading-relaxed">
        <span className="text-mint font-mono">Teaches: </span>{concept}
      </p>

      <a
        href={leetcodeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex font-mono text-xs text-orange hover:underline"
      >
        Open on LeetCode →
      </a>
    </article>
  );
}
