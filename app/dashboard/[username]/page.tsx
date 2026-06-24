'use client';

import { useEffect, useState, use, useMemo } from 'react';
import Link from 'next/link';
import ProfileHeader from '@/components/dashboard/ProfileHeader';
import StatCard from '@/components/dashboard/StatCard';
import DifficultyChart from '@/components/dashboard/DifficultyChart';
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton';
import DashboardNav from '@/components/dashboard/DashboardNav';
import NextBestProblem from '@/components/dashboard/NextBestProblem';
import StudyPlanCard from '@/components/dashboard/StudyPlanCard';
import AICoachPanel from '@/components/dashboard/AICoachPanel';
import WeakTopicsPanel from '@/components/topic-analysis/WeakTopicsPanel';
import StrongTopicsPanel from '@/components/topic-analysis/StrongTopicsPanel';
import RecommendationList from '@/components/recommendations/RecommendationList';
import MasteryBars from '@/components/charts/MasteryBars';
import ProgressRing from '@/components/charts/ProgressRing';
import TopicRadar from '@/components/charts/TopicRadar';
import WeeklyImprovement from '@/components/charts/WeeklyImprovement';
import ActivityHeatmap from '@/components/charts/ActivityHeatmap';
import GlassCard from '@/components/ui/GlassCard';
import { analyzeMastery, getProfileAverageMastery, getStrongestTopics, getWeakestTopics } from '@/lib/scoring/mastery';
import { generateRecommendations } from '@/lib/recommendations/engine';
import {
  generateStudyPlan,
  generateWeeklyTrend,
  generateActivityHeatmap,
  getRadarData,
} from '@/lib/recommendations/study-plan';
import type { ProfileSummary } from '@/lib/leetcode/types';
import type { CoachProfile } from '@/app/api/ai/coach/route';

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; profile: ProfileSummary };

export default function DashboardPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });

    fetch(`/api/leetcode/profile?username=${encodeURIComponent(username)}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Something went wrong.');
        return json.data as ProfileSummary;
      })
      .then((profile) => {
        if (!cancelled) setState({ status: 'ready', profile });
      })
      .catch((err: Error) => {
        if (!cancelled) setState({ status: 'error', message: err.message });
      });

    return () => {
      cancelled = true;
    };
  }, [username]);

  const analysis = useMemo(() => {
    if (state.status !== 'ready') return null;
    const mastery = analyzeMastery(state.profile.topics);
    const recs = generateRecommendations(state.profile, mastery);
    const plan = generateStudyPlan(mastery, recs.recommendations);
    const weekly = generateWeeklyTrend(mastery);
    const heatmap = generateActivityHeatmap(state.profile.solved.all);
    const radar = getRadarData(mastery);
    const avgMastery = getProfileAverageMastery(mastery);

    const totalSubmissions =
      state.profile.solved.easy * 2 +
      state.profile.solved.medium * 3 +
      state.profile.solved.hard * 5;
    const acceptanceRate =
      totalSubmissions > 0
        ? Math.min(100, Math.round((state.profile.solved.all / totalSubmissions) * 100))
        : 0;

    const strongestTopics = getStrongestTopics(mastery, 5).map((t) => t.category);
    const weakestTopics = getWeakestTopics(mastery, 5).map((t) => t.category);

    const coachProfile: CoachProfile = {
      username: state.profile.username,
      totalSolved: state.profile.solved.all,
      easySolved: state.profile.solved.easy,
      mediumSolved: state.profile.solved.medium,
      hardSolved: state.profile.solved.hard,
      acceptanceRate,
      strongestTopics,
      weakestTopics,
    };

    return { mastery, recs, plan, weekly, heatmap, radar, avgMastery, coachProfile };
  }, [state]);

  if (state.status === 'loading') return <DashboardSkeleton />;

  if (state.status === 'error') {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <p className="font-mono text-coral text-sm mb-2">analysis failed</p>
        <h1 className="font-display text-xl font-semibold mb-3">
          Couldn&rsquo;t load this profile
        </h1>
        <p className="text-ink-muted text-sm mb-8">{state.message}</p>
        <Link
          href="/"
          className="inline-block rounded-lg border border-border px-5 py-2.5 font-mono text-sm hover:bg-surface transition-colors"
        >
          ← try another username
        </Link>
      </div>
    );
  }

  const { profile } = state;
  const { mastery, recs, plan, weekly, heatmap, radar, avgMastery, coachProfile } = analysis!;

  return (
    <div className={`min-h-screen ${mounted ? 'animate-page-in' : ''}`}>
      <DashboardNav username={profile.username} />

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <ProfileHeader profile={profile} />
          <p className="font-mono text-xs text-ink-muted">
            Personalized DSA coaching · {mastery.filter((t) => t.solved > 0).length} topics tracked
          </p>
        </div>

        <section id="next-problem">
          <NextBestProblem
            recommendation={recs.nextBest}
            fallbackMessage="Building your personalized recommendation..."
          />
        </section>

        <div className="grid lg:grid-cols-2 gap-6">
          <section id="study-plan">
            <StudyPlanCard plan={plan} />
          </section>

          <GlassCard className="p-6 flex flex-col items-center justify-center">
            <p className="font-mono text-xs text-ink-muted uppercase tracking-wide mb-4 self-start">
              Overall Mastery
            </p>
            <ProgressRing value={avgMastery} label="Profile average" color="#FFA116" />
          </GlassCard>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Total solved" value={profile.solved.all} accent="orange" />
          <StatCard label="Easy" value={profile.solved.easy} accent="mint" />
          <StatCard label="Medium" value={profile.solved.medium} accent="orange" />
          <StatCard label="Hard" value={profile.solved.hard} accent="coral" />
        </div>

        <section id="recommendations">
          <RecommendationList recommendations={recs.recommendations} />
        </section>

        <section id="ai-coach">
          <AICoachPanel profile={coachProfile} />
        </section>

        <section id="analysis" className="grid lg:grid-cols-2 gap-6">
          <WeakTopicsPanel topics={mastery} isAdvancedMode={recs.isAdvancedMode} />
          <StrongTopicsPanel topics={mastery} />
        </section>

        <div className="grid lg:grid-cols-3 gap-6">
          <GlassCard className="p-6">
            <h2 className="font-mono text-xs text-ink-muted uppercase tracking-wide mb-4">
              Topic Mastery
            </h2>
            <MasteryBars topics={mastery} />
          </GlassCard>

          <GlassCard className="p-6">
            <h2 className="font-mono text-xs text-ink-muted uppercase tracking-wide mb-4">
              Skill Radar
            </h2>
            <TopicRadar data={radar} />
          </GlassCard>

          <GlassCard className="p-6">
            <h2 className="font-mono text-xs text-ink-muted uppercase tracking-wide mb-4">
              Weekly Trend
            </h2>
            <WeeklyImprovement data={weekly} />
          </GlassCard>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <h2 className="font-mono text-xs text-ink-muted uppercase tracking-wide mb-4">
              Difficulty Distribution
            </h2>
            <DifficultyChart
              easy={profile.solved.easy}
              medium={profile.solved.medium}
              hard={profile.solved.hard}
            />
          </GlassCard>

          <GlassCard className="p-6">
            <h2 className="font-mono text-xs text-ink-muted uppercase tracking-wide mb-4">
              Practice Activity
            </h2>
            <ActivityHeatmap data={heatmap} />
          </GlassCard>
        </div>
      </div>

      <footer className="border-t border-border/40 py-8 px-6 mt-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
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
    </div>
  );
}
