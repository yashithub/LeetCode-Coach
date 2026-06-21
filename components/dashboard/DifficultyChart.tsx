'use client';

import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DifficultyChartProps {
  easy: number;
  medium: number;
  hard: number;
}

export default function DifficultyChart({ easy, medium, hard }: DifficultyChartProps) {
  const data = [
    { name: 'Easy', value: easy, color: '#3ED598' },
    { name: 'Medium', value: medium, color: '#FFA116' },
    { name: 'Hard', value: hard, color: '#FF6B6B' },
  ];

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 24 }}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={70}
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#8B92A5', fontFamily: 'var(--font-mono)', fontSize: 12 }}
          />
          <Tooltip
            cursor={{ fill: '#1C212E' }}
            contentStyle={{
              background: '#131722',
              border: '1px solid #262C3B',
              borderRadius: 8,
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
            }}
            labelStyle={{ color: '#ECEAE5' }}
          />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={22}>
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
