'use client';

import Link from 'next/link';

interface DashboardNavProps {
  username: string;
}

export default function DashboardNav({ username }: DashboardNavProps) {
  const links = [
    { href: '#next-problem', label: 'Next Problem' },
    { href: '#study-plan', label: 'Study Plan' },
    { href: '#recommendations', label: 'Recommendations' },
    { href: '#analysis', label: 'Analysis' },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-border/60 bg-bg/80 backdrop-blur-lg">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="font-mono text-xs text-ink-muted hover:text-orange transition-colors">
          ← roadmap
        </Link>
        <div className="hidden sm:flex items-center gap-6">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="font-mono text-xs text-ink-muted hover:text-ink transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>
        <span className="font-mono text-xs text-orange">@{username}</span>
      </div>
    </nav>
  );
}
