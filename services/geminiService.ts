import { GoogleGenAI } from "@google/genai";
import { Lead } from "../types";

export class GeminiService {
  private getAi() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async generateLeadBrief(lead: Lead): Promise<string> {
    const ai = this.getAi();
    const prompt = `Perform a high-level brokerage analysis for this IPv4 asset:
    Org: ${lead.orgName}
    CIDR: ${lead.cidr}
    Block Size: ${lead.size.toLocaleString()} IPs
    Confidence Score: ${lead.score}/100
    ---
    Provide:
    1. LIQUIDITY ANALYSIS: Based on block size and legacy status.
    2. RISK PROFILE: Chain-of-title or utilization flags.
    3. OUTREACH STRATEGY: Should we approach Finance (CFO) or Operations (CTO)?`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          systemInstruction: "You are a senior IPv4 brokerage analyst. Your task is to analyze legacy IP assets, identify supply-side risks, and suggest outreach personas. Be concise, technical, and professional."
        }
      });
      return response.text || "AI Briefing unavailable.";
    } catch (e) {
      console.error("Gemini Analysis Error:", e);
      return "AI analysis failed due to a connection error.";
    }
  }

  async resolveEntity(orgName: string): Promise<string> {
    const ai = this.getAi();
    const prompt = `Research parent company and M&A status for the organization: "${orgName}". Return a one-paragraph corporate summary.`;
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: [{ text: prompt }] }]
      });
      return response.text || "No corporate summary available.";
    } catch (e) {
      return "Entity resolution failed.";
    }
  }
}

export const gemini = new GeminiService();