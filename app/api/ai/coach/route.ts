import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { getCached, setCached, TTL } from '@/lib/cache';

// ─── Public types ──────────────────────────────────────────────────────────────

export interface CoachProfile {
  username: string;          // used as part of cache key
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  acceptanceRate: number;
  strongestTopics: string[];
  weakestTopics: string[];
}

export interface CoachInsights {
  summary: string;
  strengths: string[];
  focusAreas: string[];
  recommendations: string[];
  coachTip: string;
}

export interface CoachResponse {
  data: CoachInsights;
  cached: boolean;
  generatedAt: number;  // Unix ms timestamp
  fallback: boolean;    // true → deterministic fallback, not Gemini
}

// ─── Cache key ─────────────────────────────────────────────────────────────────
// Key is stable for the same username + exact solve counts.
// Any new solve invalidates the key → fresh analysis is available via "Regenerate".

function cacheKey(p: CoachProfile): string {
  return `ai:coach:${p.username.toLowerCase()}:${p.totalSolved}:${p.easySolved}:${p.mediumSolved}:${p.hardSolved}`;
}

// ─── Deterministic fallback ────────────────────────────────────────────────────
// Generated from the profile stats alone — never empty, never fabricated.

function deterministicFallback(p: CoachProfile): CoachInsights {
  const hardRatio = p.totalSolved > 0 ? p.hardSolved / p.totalSolved : 0;
  const medRatio  = p.totalSolved > 0 ? p.mediumSolved / p.totalSolved : 0;

  const strengths: string[] = [];
  const focusAreas: string[] = [];
  const recommendations: string[] = [];

  if (p.strongestTopics.length > 0) {
    strengths.push(`Strong grasp of ${p.strongestTopics.slice(0, 2).join(' and ')}`);
  }
  if (p.hardSolved >= 10) strengths.push(`Comfortable with Hard problems (${p.hardSolved} solved)`);
  if (p.mediumSolved >= 30) strengths.push(`Solid Medium-problem depth (${p.mediumSolved} solved)`);
  if (strengths.length === 0) strengths.push('Building a consistent practice habit', 'Steady progress across difficulty levels');

  if (p.weakestTopics.length > 0) {
    focusAreas.push(...p.weakestTopics.slice(0, 3).map(t => `Improve ${t} fundamentals`));
  }
  if (p.acceptanceRate < 50) focusAreas.push('Work on debugging and edge-case handling (low acceptance rate)');
  if (focusAreas.length === 0) focusAreas.push('Push into underexplored topics', 'Increase Hard problem volume');

  if (p.weakestTopics[0]) recommendations.push(`Start with 2 Easy ${p.weakestTopics[0]} problems daily to build the pattern.`);
  if (p.weakestTopics[1]) recommendations.push(`Solve 1 Medium ${p.weakestTopics[1]} problem every other day.`);
  if (hardRatio < 0.1) recommendations.push('Attempt at least one Hard problem per week to stretch your ceiling.');
  if (medRatio < 0.4) recommendations.push('Balance your problem mix — aim for 40%+ Medium problems.');
  if (p.acceptanceRate < 55) recommendations.push('Before submitting, trace through your solution with 2 edge cases.');
  if (recommendations.length < 3) recommendations.push('Review editorials after each solve, even when you get AC.');
  recommendations.push('Track time-per-problem to build realistic interview pacing.');

  const summary =
    `You have solved ${p.totalSolved} problems (${p.easySolved} Easy · ${p.mediumSolved} Medium · ${p.hardSolved} Hard). ` +
    (p.weakestTopics.length > 0
      ? `Prioritize ${p.weakestTopics.slice(0, 2).join(' and ')} to address your largest gaps.`
      : 'Your profile is well-rounded — push into advanced patterns to keep improving.');

  return {
    summary,
    strengths: strengths.slice(0, 3),
    focusAreas: focusAreas.slice(0, 3),
    recommendations: recommendations.slice(0, 4),
    coachTip: hardRatio < 0.1
      ? 'Consistency beats intensity — 30 focused minutes every day outperforms a 4-hour weekend session.'
      : 'After each Hard problem, write a one-sentence note on what pattern it used. That note is worth 10 future solves.',
  };
}

// ─── Prompt (compact) ──────────────────────────────────────────────────────────

const SYSTEM_INSTRUCTION =
  'You are a LeetCode coach. Return ONLY a JSON object — no markdown, no fences, no extra text — with exactly these keys: ' +
  '"summary" (string), "strengths" (string[3]), "focusAreas" (string[3]), "recommendations" (string[4]), "coachTip" (string). ' +
  'Use ONLY the numbers and topics provided. Do NOT invent any solved counts or topics.';

function buildPrompt(p: CoachProfile): string {
  return (
    `Solved: ${p.totalSolved} (Easy ${p.easySolved} / Med ${p.mediumSolved} / Hard ${p.hardSolved}). ` +
    `Acceptance: ${p.acceptanceRate.toFixed(1)}%. ` +
    `Strong: ${p.strongestTopics.slice(0, 4).join(', ') || 'none'}. ` +
    `Weak: ${p.weakestTopics.slice(0, 4).join(', ') || 'none'}. ` +
    `Give personalized coaching JSON.`
  );
}

// ─── JSON extraction (brace-balanced) ─────────────────────────────────────────

const REQUIRED_KEYS: Array<keyof CoachInsights> = [
  'summary', 'strengths', 'focusAreas', 'recommendations', 'coachTip',
];

function extractInsights(raw: string): CoachInsights | null {
  const stripped = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  let start = -1, depth = 0, inStr = false, esc = false;

  for (let i = 0; i < stripped.length; i++) {
    const ch = stripped[i];
    if (esc)  { esc = false; continue; }
    if (ch === '\\' && inStr) { esc = true; continue; }
    if (ch === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (ch === '{') { if (depth === 0) start = i; depth++; }
    else if (ch === '}') {
      depth--;
      if (depth === 0 && start !== -1) {
        try {
          const parsed = JSON.parse(stripped.slice(start, i + 1)) as Record<string, unknown>;
          const missing = REQUIRED_KEYS.filter(k => !(k in parsed));
          if (missing.length) { console.warn('[AI Coach] Missing keys:', missing); return null; }
          return parsed as unknown as CoachInsights;
        } catch { return null; }
      }
    }
  }
  return null;
}

// ─── Friendly error classifier ─────────────────────────────────────────────────

function friendlyError(err: unknown): { message: string; status: number; retryable: boolean } {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes('429') || msg.toLowerCase().includes('quota')) {
    return { message: 'Daily AI quota reached. Please try again tomorrow.', status: 429, retryable: false };
  }
  if (msg.includes('503') || msg.toLowerCase().includes('unavailable') || msg.toLowerCase().includes('overload')) {
    return { message: 'AI service is temporarily busy. Please try again later.', status: 503, retryable: true };
  }
  if (msg.toLowerCase().includes('network') || msg.toLowerCase().includes('fetch')) {
    return { message: 'Unable to contact AI service.', status: 502, retryable: false };
  }
  return { message: 'AI service returned an error.', status: 502, retryable: false };
}

// ─── Gemini call with one retry on 503 ────────────────────────────────────────

async function callGemini(apiKey: string, prompt: string): Promise<CoachInsights> {
  const ai = new GoogleGenAI({ apiKey });

  async function attempt(): Promise<string> {
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.35,
        maxOutputTokens: 600,
        responseMimeType: 'application/json',
      },
    });
    return result.text ?? '';
  }

  let rawText: string;
  try {
    rawText = await attempt();
  } catch (err) {
    const classified = friendlyError(err);
    if (classified.retryable) {
      console.warn('[AI Coach] 503 on first attempt, retrying once after 1.5 s…');
      await new Promise(r => setTimeout(r, 1500));
      rawText = await attempt();   // let the second failure propagate naturally
    } else {
      throw err;
    }
  }

  console.log('[AI Coach] Raw model output:', rawText);
  const insights = extractInsights(rawText);
  if (!insights) throw new Error('parse_failed');
  return insights;
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;

  let body: CoachProfile & { forceRefresh?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_body', message: 'Expected JSON body.' }, { status: 400 });
  }

  const { forceRefresh = false, ...profile } = body;
  const key = cacheKey(profile);

  // ── Serve from cache unless caller explicitly asked for a refresh ────────────
  if (!forceRefresh) {
    const hit = getCached<CoachResponse>(key);
    if (hit) {
      console.log('[AI Coach] Cache HIT for', key);
      return NextResponse.json(hit);
    }
  }

  // ── No API key → deterministic fallback (200, not 503) ──────────────────────
  if (!apiKey) {
    console.warn('[AI Coach] GEMINI_API_KEY not set — returning deterministic fallback.');
    const resp: CoachResponse = {
      data: deterministicFallback(profile),
      cached: false,
      generatedAt: Date.now(),
      fallback: true,
    };
    return NextResponse.json(resp);
  }

  // ── Call Gemini ──────────────────────────────────────────────────────────────
  try {
    const insights = await callGemini(apiKey, buildPrompt(profile));
    const resp: CoachResponse = { data: insights, cached: false, generatedAt: Date.now(), fallback: false };
    setCached(key, resp, TTL.AI_COACH);
    return NextResponse.json(resp);
  } catch (err) {
    console.error('[AI Coach] Gemini call failed:', err);

    // On parse failure, try deterministic fallback from existing cache or fresh
    const errMsg = err instanceof Error ? err.message : '';
    if (errMsg === 'parse_failed') {
      const cached = getCached<CoachResponse>(key);
      const resp: CoachResponse = cached ?? {
        data: deterministicFallback(profile),
        cached: false,
        generatedAt: Date.now(),
        fallback: true,
      };
      return NextResponse.json(resp);
    }

    const { message, status } = friendlyError(err);
    return NextResponse.json({ error: 'upstream_error', message }, { status });
  }
}
