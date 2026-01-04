import { GoogleGenAI } from "@google/genai";

// Ideally, fetch this from a secure backend proxy in production.
const apiKey = process.env.API_KEY || ''; 

const ai = new GoogleGenAI({ apiKey });

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  sources?: { uri: string; title: string }[];
}

export interface ResumeAnalysisResult {
  name: string;
  skills: string[];
  score: number;
  summary: string;
  strengths: string[];
  areasForImprovement: string[];
  redFlags: string[];
  anonymizedId: string;
}

export const sendMessageToAgent = async (
  message: string,
  history: ChatMessage[],
  systemInstruction: string = "You are OperOS, an intelligent workforce assistant."
): Promise<ChatMessage> => {
  if (!apiKey) {
    return {
      role: 'model',
      text: "API Key is missing. Please configure process.env.API_KEY."
    };
  }

  try {
    const model = 'gemini-3-flash-preview';
    const response = await ai.models.generateContent({
      model: model,
      contents: message,
      config: {
        systemInstruction: systemInstruction,
        tools: [{ googleSearch: {} }], 
      }
    });

    const text = response.text || "I couldn't generate a response.";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources = groundingChunks?.map((chunk: any) => chunk.web).filter((web: any) => web) || [];

    return {
      role: 'model',
      text,
      sources: sources.length > 0 ? sources : undefined
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      role: 'model',
      text: "Sorry, I encountered an error while processing your request."
    };
  }
};

/**
 * AI Agent specifically for Resume Analysis against a JD
 */
export const analyzeResume = async (resumeText: string, jobDescription: string): Promise<ResumeAnalysisResult> => {
  if (!apiKey) {
    // Fallback for demo if no key
    return {
      name: "Mock Candidate",
      skills: ['React (Mock)', 'Node.js (Mock)', 'TypeScript'],
      score: 88,
      summary: "API Key missing. Mock analysis based on provided context.",
      strengths: ["Strong Framework Knowledge", "Good Communication"],
      areasForImprovement: ["Lack of Cloud Experience", "Short tenure at previous role"],
      redFlags: [],
      anonymizedId: "CAND-MOCK-01"
    };
  }

  const prompt = `
    You are an expert HR AI Agent.
    
    JOB DESCRIPTION:
    "${jobDescription.substring(0, 2000)}"

    RESUME TEXT:
    "${resumeText.substring(0, 5000)}"
    
    Task: Compare the Resume against the Job Description.
    
    Requirements:
    1. EXTRACT the Candidate Name from the resume header. If not clearly found, use "Unknown Candidate".
    2. Extract key skills present in the resume that match the JD.
    3. Calculate a compatibility score (0-100) based strictly on how well the candidate matches the specific JD requirements.
    4. Generate a brief professional summary focusing on fit for this specific role.
    5. List specific STRENGTHS (where the candidate matches or exceeds the JD).
    6. List specific AREAS FOR IMPROVEMENT (missing skills, experience gaps, or weak areas relative to the JD).
    7. Identify red flags (gaps, job hopping, missing critical skills required by JD).
    8. Create a fake Anonymized ID (e.g., CAND-8X92).
    
    Output Format: Return ONLY raw JSON. No markdown formatting.
    Structure:
    {
      "name": "string",
      "skills": ["string"],
      "score": number,
      "summary": "string",
      "strengths": ["string"],
      "areasForImprovement": ["string"],
      "redFlags": ["string"],
      "anonymizedId": "string"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    const text = response.text || "{}";
    // Clean up potential markdown code blocks if the model adds them
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr) as ResumeAnalysisResult;

  } catch (error) {
    console.error("Resume Parsing Error:", error);
    return {
      name: "Error Candidate",
      skills: ['Analysis Failed'],
      score: 0,
      summary: "Could not analyze resume due to an API error.",
      strengths: [],
      areasForImprovement: [],
      redFlags: [],
      anonymizedId: "ERR-001"
    };
  }
};