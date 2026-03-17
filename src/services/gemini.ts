import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || "" });

export interface ScoutingReport {
  summary: string;
  strengths: string[];
  weaknesses: string[];

  // Potential Ceiling — richer than a single string
  potentialRating: string;      // e.g. "World Class", "Elite", "High Potential"
  potentialTimeline: string;    // e.g. "Peak years: 2026–2030"
  potentialDescription: string; // 2-3 sentence analysis

  // Tactical Fit — richer than a single string
  bestFormations: string[];     // e.g. ["4-3-3", "4-2-3-1"]
  idealRole: string;            // e.g. "Advanced Forward", "Deep-Lying Playmaker"
  tacticalDescription: string;  // 2-3 sentence analysis

  // Comparison — always present, much richer when two players supplied
  playerComparison: string;     // one-line note
  comparisonVerdict: string;    // head-to-head winner with reasoning
  keyDifference: string;        // the single biggest differentiating factor
}

export interface PlayerInput {
  name: string;
  data: Record<string, number | string>;
}

export async function generateScoutingReport(
  primary: PlayerInput,
  compare?: PlayerInput
): Promise<ScoutingReport> {

  const isComparison = !!compare;

  const prompt = isComparison
    ? `You are an elite football scout. Compare these two players and provide a detailed head-to-head scouting report.

       Player 1 — ${primary.name}: ${JSON.stringify(primary.data)}
       Player 2 — ${compare!.name}: ${JSON.stringify(compare!.data)}

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
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
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
          "summary", "strengths", "weaknesses",
          "potentialRating", "potentialTimeline", "potentialDescription",
          "bestFormations", "idealRole", "tacticalDescription",
          "playerComparison", "comparisonVerdict", "keyDifference",
        ],
      },
    },
  });

  if (!response.text) {
    throw new Error('Gemini returned an empty response. Check that your API key is valid and has access to the Gemini API.');
  }
  return JSON.parse(response.text);
}
