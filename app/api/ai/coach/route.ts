import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// ─── Public types (imported by components and the dashboard page) ──────────────

export interface CoachProfile {
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

// ─── Prompt ────────────────────────────────────────────────────────────────────

const SYSTEM_INSTRUCTION = `You are an expert LeetCode coach. You will receive a compact profile of a user's performance.
Return ONLY valid JSON with exactly this shape — no markdown, no explanation, no extra keys:
{
  "summary": "2-3 sentence overview of the user's current performance and trajectory",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "focusAreas": ["focus area 1", "focus area 2", "focus area 3"],
  "recommendations": ["actionable recommendation 1", "actionable recommendation 2", "actionable recommendation 3", "actionable recommendation 4"],
  "coachTip": "One short, motivating coach tip personalized to their profile"
}
Be concise, specific, and actionable. Reference actual topics from the profile.`;

// ─── JSON extraction ───────────────────────────────────────────────────────────

const REQUIRED_KEYS: Array<keyof CoachInsights> = [
  'summary',
  'strengths',
  'focusAreas',
  'recommendations',
  'coachTip',
];

/**
 * Extracts and validates a CoachInsights object from a raw model string.
 *
 * Strategy (applied in order):
 *  1. Strip any ` ```json … ``` ` or ` ``` … ``` ` code fences.
 *  2. Find the first complete `{ … }` block using a brace-depth scan so that
 *     leading/trailing prose or partial text doesn't confuse JSON.parse.
 *  3. Parse and validate all required CoachInsights keys.
 *  4. Return null (→ safe fallback) instead of throwing on any failure.
 */
function extractInsights(raw: string): CoachInsights | null {
  // Step 1 — strip code fences (handles fences anywhere in the string)
  const stripped = raw
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  // Step 2 — brace-balanced scan to find the first complete {...} block
  let start = -1;
  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = 0; i < stripped.length; i++) {
    const ch = stripped[i];

    if (escape) { escape = false; continue; }
    if (ch === '\\' && inString) { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;

    if (ch === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0 && start !== -1) {
        const candidate = stripped.slice(start, i + 1);

        // Step 3 — parse and validate
        try {
          const parsed = JSON.parse(candidate) as Record<string, unknown>;
          const missing = REQUIRED_KEYS.filter((k) => !(k in parsed));
          if (missing.length > 0) {
            console.warn('[AI Coach] Parsed JSON is missing keys:', missing, '| raw candidate:', candidate);
            return null;
          }
          return parsed as unknown as CoachInsights;
        } catch (e) {
          console.error('[AI Coach] JSON.parse failed on extracted candidate:', e, '| candidate:', candidate);
          return null;
        }
      }
    }
  }

  console.error('[AI Coach] No complete JSON object found in model output. raw:', raw);
  return null;
}

/** Safe fallback shown to the user when parsing fails — never a 502. */
function fallbackInsights(): CoachInsights {
  return {
    summary:
      'Your profile has been analyzed. Detailed AI insights are temporarily unavailable — the recommendations below are still fully personalized.',
    strengths: ['Consistent practice', 'Problem-solving persistence', 'Topic breadth'],
    focusAreas: ['Review weak topics', 'Increase medium problem volume', 'Focus on timed practice'],
    recommendations: [
      'Work through your weakest topic with 2–3 easy problems per day.',
      'Aim for at least one medium problem daily to build interview confidence.',
      'After each session, review the editorial even if you solved the problem.',
      'Track time-per-problem to build realistic interview pacing.',
    ],
    coachTip: 'Consistency beats intensity — 30 focused minutes every day outperforms a 4-hour weekend session.',
  };
}

// ─── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[AI Coach] GEMINI_API_KEY is not set in environment variables.');
    return NextResponse.json(
      { error: 'ai_not_configured', message: 'AI coaching is not configured on this server.' },
      { status: 503 }
    );
  }

  let profile: CoachProfile;
  try {
    profile = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_body', message: 'Expected JSON body.' }, { status: 400 });
  }

  const userMessage = `Here is the LeetCode profile to analyze:
- Total Solved: ${profile.totalSolved}
- Easy: ${profile.easySolved} | Medium: ${profile.mediumSolved} | Hard: ${profile.hardSolved}
- Acceptance Rate: ${profile.acceptanceRate.toFixed(1)}%
- Strongest Topics: ${profile.strongestTopics.slice(0, 5).join(', ') || 'None yet'}
- Weakest Topics (needs work): ${profile.weakestTopics.slice(0, 5).join(', ') || 'None identified'}

Generate personalized coaching insights as strict JSON.`;

  try {
    const ai = new GoogleGenAI({ apiKey });

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userMessage,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.4,
        maxOutputTokens: 800,
        responseMimeType: 'application/json',
      },
    });

    const rawText = result.text ?? '';
    console.log('[AI Coach] Raw model output:', rawText);

    const insights = extractInsights(rawText) ?? fallbackInsights();
    return NextResponse.json({ data: insights });
  } catch (err: unknown) {
    // Only genuine network / SDK errors reach here — parse failures use the fallback above
    console.error('[AI Coach] Gemini SDK error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error from AI service.';
    return NextResponse.json({ error: 'upstream_error', message }, { status: 502 });
  }
}
