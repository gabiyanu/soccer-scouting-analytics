import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface ScoutingReport {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  potential: string;
  playerComparison: string;
  tacticalFit: string;
}

export async function generateScoutingReport(playerData: any): Promise<ScoutingReport> {
  const prompt = `Analyze the following player data and provide a professional scouting report.
  Data: ${JSON.stringify(playerData)}
  
  Focus on technical ability, physical traits, and tactical intelligence based on the stats provided.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          potential: { type: Type.STRING },
          playerComparison: { type: Type.STRING },
          tacticalFit: { type: Type.STRING },
        },
        required: ["summary", "strengths", "weaknesses", "potential", "playerComparison", "tacticalFit"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
}
