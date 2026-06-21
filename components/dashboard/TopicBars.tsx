import type { ScoredTopic } from "@/lib/leetcode/analyze";

const SEGMENTS = 20;

const LABEL_COLOR: Record<ScoredTopic["label"], string> = {
  Excellent: "bg-mint",
  Solid: "bg-orange",
  Developing: "bg-ember",
  Weak: "bg-coral",
};

const LABEL_TEXT: Record<ScoredTopic["label"], string> = {
  Excellent: "text-mint",
  Solid: "text-orange",
  Developing: "text-ember",
  Weak: "text-coral",
};

function Segments({
  score,
  label,
}: {
  score: number;
  label: ScoredTopic["label"];
}) {
  const filled = Math.round((score / 100) * SEGMENTS);
  return (
    <div className="flex gap-[2px]" aria-hidden="true">
      {Array.from({ length: SEGMENTS }).map((_, i) => (
        <span
          key={i}
          className={`h-3 w-1.5 rounded-[1px] ${
            i < filled ? LABEL_COLOR[label] : "bg-surface-2"
          }`}
        />
      ))}
    </div>
  );
}

export default function TopicBars({ topics }: { topics: ScoredTopic[] }) {
  if (topics.length === 0) {
    return (
      <p className="font-mono text-sm text-ink-muted py-6 text-center leading-relaxed">
        You&rsquo;re performing well across most topics. Push into advanced Dynamic Programming and Hard Graph problems to continue improving.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {topics.map((t) => (
        <li
          key={t.slug}
          className="flex items-center justify-between gap-4 py-3 font-mono text-sm"
        >
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="text-ink">{t.name}</span>
              <span className={`text-xs ${LABEL_TEXT[t.label]}`}>
                {t.label}
              </span>
            </div>
            <p className="text-xs text-ink-muted mt-0.5">
              {t.solved} solved &middot; {t.tier}
            </p>
          </div>
          <div className="hidden sm:block">
            <Segments score={t.score} label={t.label} />
          </div>
          <span className={`w-10 text-right ${LABEL_TEXT[t.label]}`}>
            {t.score}%
          </span>
        </li>
      ))}
    </ul>
  );
}
