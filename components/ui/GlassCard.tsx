import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glow?: 'orange' | 'mint' | 'none';
}

const GLOW: Record<NonNullable<GlassCardProps['glow']>, string> = {
  orange: 'shadow-[0_0_40px_-8px_rgba(255,161,22,0.25)]',
  mint: 'shadow-[0_0_40px_-8px_rgba(62,213,152,0.2)]',
  none: '',
};

export default function GlassCard({ children, className = '', glow = 'none' }: GlassCardProps) {
  return (
    <div
      className={`rounded-2xl border border-border/80 bg-surface/80 backdrop-blur-md ${GLOW[glow]} ${className}`}
    >
      {children}
    </div>
  );
}
