'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface WeeklyImprovementProps {
  data: { day: string; score: number }[];
}

export default function WeeklyImprovement({ data }: WeeklyImprovementProps) {
  return (
    <div className="h-48 w-full animate-fade-up">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3ED598" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#3ED598" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#8B92A5', fontFamily: 'var(--font-mono)', fontSize: 11 }}
          />
          <YAxis hide domain={[0, 100]} />
          <Tooltip
            contentStyle={{
              background: '#131722',
              border: '1px solid #262C3B',
              borderRadius: 8,
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#3ED598"
            fill="url(#scoreGrad)"
            strokeWidth={2}
            animationDuration={900}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
