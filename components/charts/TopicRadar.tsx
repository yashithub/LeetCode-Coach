'use client';

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';

interface TopicRadarProps {
  data: { topic: string; value: number }[];
}

export default function TopicRadar({ data }: TopicRadarProps) {
  return (
    <div className="h-64 w-full animate-fade-up">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="#262C3B" />
          <PolarAngleAxis
            dataKey="topic"
            tick={{ fill: '#8B92A5', fontFamily: 'var(--font-mono)', fontSize: 11 }}
          />
          <Radar
            name="Mastery"
            dataKey="value"
            stroke="#FFA116"
            fill="#FFA116"
            fillOpacity={0.25}
            animationDuration={800}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
