import type { ProfileSummary } from '@/lib/leetcode/types';

export default function ProfileHeader({ profile }: { profile: ProfileSummary }) {
  return (
    <div className="flex items-center gap-4">
      {profile.avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={profile.avatar}
          alt=""
          width={56}
          height={56}
          className="rounded-full border border-border"
        />
      ) : (
        <div className="w-14 h-14 rounded-full bg-surface-2 border border-border flex items-center justify-center font-display font-semibold text-lg text-orange">
          {profile.username.slice(0, 2).toUpperCase()}
        </div>
      )}
      <div>
        <h1 className="font-display text-xl font-semibold">
          {profile.realName || profile.username}
        </h1>
        <p className="font-mono text-xs text-ink-muted">
          @{profile.username}
          {profile.ranking ? ` · rank #${profile.ranking.toLocaleString()}` : ''}
        </p>
      </div>
    </div>
  );
}
