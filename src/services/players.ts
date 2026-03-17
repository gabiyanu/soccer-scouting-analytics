// Shared Player type used by both the frontend and the Express server response.
export interface Player {
  id: string;
  name: string;
  age: number;
  position: string;
  team: string;
  clubLogo?: string | null;
  nationality?: string | null;
  flag?: string | null;
  image: string;
  percentiles: Record<string, number>;
  trends: { date: string; rating: number }[];
  advanced: Record<string, number | string>;
}

export interface FetchPlayersOptions {
  limit?: number;
  search?: string;
  position?: string;
}

/**
 * Fetch players from the Express + BigQuery backend.
 * During dev, Vite proxies /api → http://localhost:3001.
 * In production the same Express server handles both static files and /api.
 */
export async function fetchPlayers(opts: FetchPlayersOptions = {}): Promise<Player[]> {
  const params = new URLSearchParams();
  if (opts.limit) params.set('limit', String(opts.limit));
  if (opts.search) params.set('search', opts.search);
  if (opts.position) params.set('position', opts.position);

  const url = `/api/players${params.toString() ? `?${params}` : ''}`;
  const res = await fetch(url);

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      body.details || body.error || `Server returned ${res.status}`
    );
  }

  const data = await res.json();
  return data.players as Player[];
}
