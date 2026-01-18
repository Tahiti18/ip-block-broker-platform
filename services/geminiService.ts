import { GoogleGenAI } from "@google/genai";
import { Lead } from "../types";

export class GeminiService {
  /**
   * Initializes the Google GenAI client using the API key from environment variables.
   */
  private getAi() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  /**
   * Generates a high-fidelity brokerage briefing with real-time market grounding.
   */
  async generateLeadBrief(lead: Lead): Promise<{ text: string; sources: any[] }> {
    const ai = this.getAi();
    const prompt = `Perform a senior-level brokerage analysis for this IPv4 asset:
    Org: ${lead.orgName}
    CIDR: ${lead.cidr}
    Block Size: ${lead.size.toLocaleString()} IPs
    
    Current Task:
    1. LIQUIDITY & PRICING: Search for the current market spot price for a /${lead.cidr.split('/')[1]} block.
    2. RISK PROFILE: Check for recent RIR policy changes or litigation involving ${lead.orgName}.
    3. OUTREACH PERSONA: Identify the likely decision-maker (CFO, CTO, or IT Director).
    
    Use Google Search to find real-time pricing data from verified IPv4 brokers (e.g., Hilco, IPv4.Global).`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          systemInstruction: "You are a senior IPv4 brokerage analyst. Your task is to provide high-stakes intelligence on legacy IP assets. Be technical, objective, and reference real-time market data where available.",
          tools: [{ googleSearch: {} }]
        }
      });

      const text = response.text || "AI Briefing unavailable.";
      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      
      return { text, sources };
    } catch (e) {
      console.error("Gemini Analysis Error:", e);
      return { text: "AI analysis failed due to a connection error.", sources: [] };
    }
  }

  /**
   * Researches entity details for M&A signals.
   */
  async resolveEntity(orgName: string): Promise<string> {
    const ai = this.getAi();
    const prompt = `Search for recent M&A activity, bankruptcy filings, or corporate restructuring for "${orgName}". 
    Evaluate if this organization is a "motivated seller" of its legacy IP assets.`;
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });
      return response.text || "No corporate intelligence available.";
    } catch (e) {
      return "Entity resolution failed.";
    }
  }
}

export const gemini = new GeminiService();
