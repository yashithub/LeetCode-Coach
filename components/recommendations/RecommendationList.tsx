import type { Recommendation } from '@/lib/recommendations/engine';
import RecommendationCard from '@/components/recommendations/RecommendationCard';
import GlassCard from '@/components/ui/GlassCard';

interface RecommendationListProps {
  recommendations: Recommendation[];
}

export default function RecommendationList({ recommendations }: RecommendationListProps) {
  return (
    <GlassCard className="p-6 sm:p-8">
      <h2 className="font-mono text-xs text-orange uppercase tracking-wide mb-1">
        Personalized Recommendations
      </h2>
      <p className="text-xs text-ink-muted mb-6">
        Curated progression — weak topics first, increasing difficulty, no random picks.
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        {recommendations.map((rec, i) => (
          <RecommendationCard key={`${rec.problem.id}-${i}`} recommendation={rec} index={i} />
        ))}
      </div>
    </GlassCard>
  );
}
