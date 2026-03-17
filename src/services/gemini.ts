export interface ScoutingReport {
  summary: string;
  strengths: string[];
  weaknesses: string[];

  // Potential Ceiling
  potentialRating: string;
  potentialTimeline: string;
  potentialDescription: string;

  // Tactical Fit
  bestFormations: string[];
  idealRole: string;
  tacticalDescription: string;

  // Comparison
  playerComparison: string;
  comparisonVerdict: string;
  keyDifference: string;
}

export interface PlayerInput {
  name: string;
  data: Record<string, number | string>;
}

export async function generateScoutingReport(
  primary: PlayerInput,
  compare?: PlayerInput
): Promise<ScoutingReport> {
  const res = await fetch('/api/scouting-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ primary, compare }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Server returned ${res.status}`);
  }

  return res.json();
}
