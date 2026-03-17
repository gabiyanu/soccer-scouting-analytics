import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import express from 'express';
import { BigQuery } from '@google-cloud/bigquery';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || process.env.API_PORT || 3001;

// BigQuery client — uses GOOGLE_APPLICATION_CREDENTIALS env var locally,
// or Application Default Credentials automatically on Cloud Run / GCP.
const bigquery = new BigQuery({
  projectId: process.env.BIGQUERY_PROJECT_ID || 'player-profiles-analyzer',
});

const PROJECT = process.env.BIGQUERY_PROJECT_ID || 'player-profiles-analyzer';
const DATASET = process.env.BIGQUERY_DATASET || 'Player_Analyzer';
const TABLE = process.env.BIGQUERY_TABLE || 'Player_profiles';

// Map FIFA abbreviated positions to readable labels
function mapPosition(pos: string): string {
  if (!pos) return 'Unknown';
  const p = pos.trim().toUpperCase();
  if (p === 'GK') return 'Goalkeeper';
  if (['LB', 'LCB', 'CB', 'RCB', 'RB'].includes(p)) return 'Defender';
  if (
    ['LDM', 'CDM', 'RDM', 'LCM', 'CM', 'RCM', 'LM', 'RM', 'LWB', 'RWB'].includes(p)
  )
    return 'Midfielder';
  return 'Forward';
}

// Generate plausible form trends from a player's overall rating
// (Used when no time-series data is available in the table)
function generateTrends(overall: number) {
  const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
  const base = (overall / 100) * 10;
  // Seed variation deterministically off overall so the same player
  // always returns the same trend shape within a session.
  return months.map((date, i) => ({
    date,
    rating: Math.round((base + Math.sin(overall + i) * 0.4) * 10) / 10,
  }));
}

// ── GET /api/players ─────────────────────────────────────────────────────────
app.get('/api/players', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const position = req.query.position as string | undefined;
    const search = req.query.search as string | undefined;

    let whereClause = 'WHERE `Name` IS NOT NULL AND `Position` IS NOT NULL';
    if (position) {
      whereClause += ' AND `Position` = @position';
    }
    if (search) {
      whereClause += ' AND (LOWER(`Name`) LIKE @search OR LOWER(`Club`) LIKE @search)';
    }

    const query = `
      SELECT
        CAST(\`ID\` AS STRING)      AS id,
        \`Name\`                     AS name,
        \`Age\`                      AS age,
        \`Position\`                 AS position,
        \`Club\`                     AS team,
        \`Club Logo\`                AS clubLogo,
        \`Nationality\`              AS nationality,
        \`Flag\`                     AS flag,
        \`Photo\`                    AS image,
        \`Overall\`,
        \`Potential\`,
        \`Dribbling\`,
        \`Finishing\`,
        \`ShortPassing\`,
        \`SprintSpeed\`,
        \`HeadingAccuracy\`,
        \`LongPassing\`,
        \`BallControl\`,
        \`Reactions\`,
        \`Stamina\`,
        \`Strength\`,
        \`Acceleration\`,
        \`Agility\`,
        \`Vision\`,
        \`Composure\`,
        \`ShotPower\`,
        \`Crossing\`,
        \`Interceptions\`,
        \`StandingTackle\`
      FROM \`${PROJECT}.${DATASET}.${TABLE}\`
      ${whereClause}
      ORDER BY \`Overall\` DESC
      LIMIT @limit
    `;

    const params: Record<string, unknown> = { limit };
    if (position) params.position = position;
    if (search) params.search = `%${search.toLowerCase()}%`;

    const [rows] = await bigquery.query({ query, params });

    const players = (rows as any[]).map((row) => {
      const overall = Number(row.Overall) || 75;
      return {
        id: row.id || String(Math.random()),
        name: row.name || 'Unknown Player',
        age: Number(row.age) || 0,
        position: mapPosition(String(row.position || '')),
        team: row.team || 'Unknown Club',
        clubLogo: row.clubLogo || null,
        nationality: row.nationality || null,
        flag: row.flag || null,
        // Prefer the sofifa photo; fall back to a deterministic placeholder
        image:
          row.image ||
          `https://picsum.photos/seed/${encodeURIComponent(row.name)}/400/400`,
        percentiles: {
          Dribbling: Number(row.Dribbling) || 0,
          Finishing: Number(row.Finishing) || 0,
          'Short Passing': Number(row.ShortPassing) || 0,
          'Sprint Speed': Number(row.SprintSpeed) || 0,
          'Ball Control': Number(row.BallControl) || 0,
          Crossing: Number(row.Crossing) || 0,
        },
        trends: generateTrends(overall),
        advanced: {
          'Overall Rating': overall,
          Potential: Number(row.Potential) || 0,
          'Long Passing': Number(row.LongPassing) || 0,
          Vision: Number(row.Vision) || 0,
          Reactions: Number(row.Reactions) || 0,
          Composure: Number(row.Composure) || 0,
        },
      };
    });

    res.json({ players, total: players.length });
  } catch (error: any) {
    console.error('BigQuery error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch player data from BigQuery',
      details: error.message,
    });
  }
});

// ── POST /api/scouting-report ─────────────────────────────────────────────────
app.use(express.json());
app.post('/api/scouting-report', async (req, res) => {
  try {
    const { primary, compare } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
      return;
    }

    const ai = new GoogleGenAI({ apiKey });
    const isComparison = !!compare;

    const prompt = isComparison
      ? `You are an elite football scout. Compare these two players and provide a detailed head-to-head scouting report.
         Player 1 — ${primary.name}: ${JSON.stringify(primary.data)}
         Player 2 — ${compare.name}: ${JSON.stringify(compare.data)}
         Analyse both players on technical ability, physical traits, and tactical intelligence.
         For potentialRating and potentialTimeline, assess ${primary.name}.
         For bestFormations and idealRole, consider which systems suit ${primary.name} best.
         For comparisonVerdict, clearly state who wins the head-to-head and why.
         For keyDifference, name the single metric or quality that most separates them.`
      : `You are an elite football scout. Provide a detailed scouting report for this player.
         Player — ${primary.name}: ${JSON.stringify(primary.data)}
         Analyse technical ability, physical traits, and tactical intelligence.
         For comparisonVerdict, describe their standing among players of their position globally.
         For keyDifference, name their single most outstanding attribute.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary:              { type: Type.STRING },
            strengths:            { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses:           { type: Type.ARRAY, items: { type: Type.STRING } },
            potentialRating:      { type: Type.STRING },
            potentialTimeline:    { type: Type.STRING },
            potentialDescription: { type: Type.STRING },
            bestFormations:       { type: Type.ARRAY, items: { type: Type.STRING } },
            idealRole:            { type: Type.STRING },
            tacticalDescription:  { type: Type.STRING },
            playerComparison:     { type: Type.STRING },
            comparisonVerdict:    { type: Type.STRING },
            keyDifference:        { type: Type.STRING },
          },
          required: [
            'summary', 'strengths', 'weaknesses',
            'potentialRating', 'potentialTimeline', 'potentialDescription',
            'bestFormations', 'idealRole', 'tacticalDescription',
            'playerComparison', 'comparisonVerdict', 'keyDifference',
          ],
        },
      },
    });

    if (!response.text) throw new Error('Gemini returned an empty response.');
    res.json(JSON.parse(response.text));
  } catch (error: any) {
    console.error('Gemini error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ── GET /api/health ───────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    bigquery: { project: PROJECT, dataset: DATASET, table: TABLE },
  });
});

// ── Serve built frontend ──────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅  BigQuery API server → http://localhost:${PORT}`);
  console.log(`   Project : ${PROJECT}`);
  console.log(`   Table   : ${DATASET}.${TABLE}`);
});
