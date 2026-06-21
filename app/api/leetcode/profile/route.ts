import { NextRequest, NextResponse } from 'next/server';
import {
  fetchLeetCodeProfile,
  LeetCodeUserNotFoundError,
  LeetCodeFetchError,
} from '@/lib/leetcode/client';
import { getCached, setCached, TTL } from '@/lib/cache';
import type { ProfileSummary } from '@/lib/leetcode/types';

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get('username')?.trim();

  if (!username) {
    return NextResponse.json(
      { error: 'missing_username', message: 'Pass ?username=' },
      { status: 400 }
    );
  }

  const cacheKey = `profile:${username.toLowerCase()}`;
  const cached = getCached<ProfileSummary>(cacheKey);
  if (cached) {
    return NextResponse.json({ data: cached, cached: true });
  }

  try {
    const profile = await fetchLeetCodeProfile(username);
    setCached(cacheKey, profile, TTL.PROFILE);
    return NextResponse.json({ data: profile, cached: false });
  } catch (err) {
    if (err instanceof LeetCodeUserNotFoundError) {
      return NextResponse.json(
        { error: 'user_not_found', message: err.message },
        { status: 404 }
      );
    }
    if (err instanceof LeetCodeFetchError) {
      return NextResponse.json(
        { error: 'upstream_error', message: err.message },
        { status: 502 }
      );
    }
    return NextResponse.json(
      { error: 'unknown_error', message: 'Something went wrong fetching this profile.' },
      { status: 500 }
    );
  }
}
