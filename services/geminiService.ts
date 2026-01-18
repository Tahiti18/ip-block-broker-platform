
import { GoogleGenAI } from "@google/genai";
import { Lead } from "../types";

export class GeminiService {
  /**
   * Initializes the Google GenAI client using the API key from environment variables.
   */
  private getAi() {
    // API key must be accessed from process.env.API_KEY and passed as a named parameter.
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  /**
   * Generates a technical briefing for an IPv4 asset using the Gemini 3 Pro model.
   */
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
      // Use 'gemini-3-pro-preview' for complex technical reasoning tasks.
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          systemInstruction: "You are a senior IPv4 brokerage analyst. Your task is to analyze legacy IP assets, identify supply-side risks, and suggest outreach personas. Be concise, technical, and professional."
        }
      });
      // The text output is accessed via the .text property (not a method).
      return response.text || "AI Briefing unavailable.";
    } catch (e) {
      console.error("Gemini Analysis Error:", e);
      return "AI analysis failed due to a connection error.";
    }
  }

  /**
   * Researches entity details using the Gemini 3 Flash model.
   */
  async resolveEntity(orgName: string): Promise<string> {
    const ai = this.getAi();
    const prompt = `Research parent company and M&A status for the organization: "${orgName}". Return a one-paragraph corporate summary.`;
    
    try {
      // Use 'gemini-3-flash-preview' for basic text tasks.
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      // Access the .text property directly.
      return response.text || "No corporate summary available.";
    } catch (e) {
      return "Entity resolution failed.";
    }
  }
}

export const gemini = new GeminiService();
