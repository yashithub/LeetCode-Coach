'use client';

interface ActivityHeatmapProps {
  data: { week: number; day: number; count: number }[];
}

const LEVELS = ['bg-surface-2', 'bg-mint/20', 'bg-mint/40', 'bg-mint/60', 'bg-mint'];

const DAYS = ['', 'M', '', 'W', '', 'F', ''];

export default function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const weeks = 12;

  return (
    <div className="animate-fade-up">
      <div className="flex gap-[3px] overflow-x-auto pb-2">
        {Array.from({ length: weeks }).map((_, w) => (
          <div key={w} className="flex flex-col gap-[3px]">
            {Array.from({ length: 7 }).map((_, d) => {
              const cell = data.find((c) => c.week === w && c.day === d);
              const level = Math.min(cell?.count ?? 0, 4);
              return (
                <div
                  key={d}
                  className={`w-3 h-3 rounded-sm ${LEVELS[level]} transition-colors hover:ring-1 hover:ring-orange/50`}
                  title={`Week ${w + 1}, ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]}: ${level} activities`}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2 px-1">
        {DAYS.map((d, i) => (
          <span key={i} className="font-mono text-[9px] text-ink-muted w-3 text-center">
            {d}
          </span>
        ))}
      </div>
      <p className="font-mono text-[10px] text-ink-muted mt-3">
        Practice activity (estimated from profile)
      </p>
    </div>
  );
}
