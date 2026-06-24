'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

const FEATURES = [
  {
    label: 'Strength scan',
    body: 'Every topic you\u2019ve touched, scored by how solid it actually is \u2014 not just a solved count.',
  },
  {
    label: 'Weak-spot map',
    body: 'See exactly which topics are thin before an interviewer does.',
  },
  {
    label: 'Next problem',
    body: 'One recommendation at a time, picked to close your biggest gap.',
  },
];

export default function LandingPage() {
  const [username, setUsername] = useState('');
  const router = useRouter();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) return;
    router.push(`/dashboard/${encodeURIComponent(trimmed)}`);
  }

  return (
    <main className="min-h-screen flex flex-col">
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24">
        <div className="w-full max-w-xl">
          <p className="font-mono text-xs text-ink-muted tracking-widest uppercase mb-4 text-center">
            leetcode-roadmap
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-center leading-tight mb-3">
            You don&rsquo;t need more problems.
            <br />
            <span className="bg-ember-gradient bg-clip-text text-transparent">
              You need to know which ones.
            </span>
          </h1>
          <p className="text-ink-muted text-center mb-10 max-w-md mx-auto">
            Enter a LeetCode username. We&rsquo;ll read the topics behind the
            solved count and tell you what&rsquo;s actually weak.
          </p>

          {/* Terminal hero — signature element */}
          <form onSubmit={handleSubmit}>
            <div className="rounded-xl border border-border bg-surface shadow-2xl shadow-black/40 overflow-hidden">
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border bg-surface-2">
                <span className="w-2.5 h-2.5 rounded-full bg-coral/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-orange/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-mint/70" />
                <span className="ml-3 font-mono text-xs text-ink-muted">
                  analyze.sh
                </span>
              </div>
              <div className="px-5 py-5 font-mono text-sm">
                <div className="flex items-center gap-2 text-ink-muted">
                  <span className="text-mint">$</span>
                  <span>leetcode-roadmap analyze --user</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-orange">&gt;</span>
                  <input
                    autoFocus
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="your-leetcode-username"
                    aria-label="LeetCode username"
                    className="flex-1 bg-transparent outline-none text-ink placeholder:text-ink-muted/50 caret-orange"
                  />
                  <span className="w-2 h-4 bg-orange animate-blink" aria-hidden="true" />
                </div>
              </div>
            </div>
            <button
              type="submit"
              disabled={!username.trim()}
              className="mt-4 w-full rounded-xl bg-ember-gradient text-bg font-semibold py-3 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
            >
              Run analysis
            </button>
          </form>
        </div>
      </section>

      <section className="border-t border-border px-6 py-14">
        <div className="max-w-3xl mx-auto grid sm:grid-cols-3 gap-8">
          {FEATURES.map((f) => (
            <div key={f.label}>
              <p className="font-mono text-xs text-orange tracking-wide uppercase mb-2">
                {f.label}
              </p>
              <p className="text-sm text-ink-muted leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border/40 px-6 py-6">
        <div className="max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-mono text-xs text-ink-muted">
            Built with{' '}
            <span role="img" aria-label="love">❤️</span>
            {' '}by{' '}
            <span className="text-orange">Yash</span>
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/yashithub"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-ink-muted hover:text-ink transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://linkedin.com/in/yashpradeep23"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-ink-muted hover:text-ink transition-colors"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
