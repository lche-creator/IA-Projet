import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisType, ProsConsData, TableData, SWOTData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const PROS_CONS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    pros: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of advantages" },
    cons: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of disadvantages" },
    conclusion: { type: Type.STRING, description: "Short overall conclusion" }
  },
  required: ["pros", "cons", "conclusion"]
};

const TABLE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    headers: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Column headers (e.g., Option A, Option B, Criteria)" },
    rows: { 
      type: Type.ARRAY, 
      items: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING } 
      },
      description: "Data rows for the comparison table"
    },
    recommendation: { type: Type.STRING, description: "Final recommendation based on the table" }
  },
  required: ["headers", "rows", "recommendation"]
};

const SWOT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
    weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
    opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
    threats: { type: Type.ARRAY, items: { type: Type.STRING } },
    strategicAdvice: { type: Type.STRING }
  },
  required: ["strengths", "weaknesses", "opportunities", "threats", "strategicAdvice"]
};

export async function performAnalysis(situation: string, type: AnalysisType): Promise<any> {
  const schemaMap: Record<AnalysisType, any> = {
    'pros-cons': PROS_CONS_SCHEMA,
    'table': TABLE_SCHEMA,
    'swot': SWOT_SCHEMA
  };

  const systemInstruction = `You are a high-level decision analyst. Your goal is to provide a clear, objective analysis of the situation provided by the user. 
  Respond in French. 
  Style should be professional yet accessible. 
  For 'pros-cons', list at least 4 items for each.
  For 'table', create a structured comparison.
  For 'swot', provide a deep strategic analysis.`;

  const prompt = `Analyse cette situation : "${situation}".
  Fournis une analyse de type "${type}".`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: schemaMap[type]
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
}
