import { Lead } from "../types";

export class GeminiService {
  private readonly API_KEY = process.env.API_KEY;
  private readonly OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
  private readonly MODEL = "google/gemini-3.0-flash"; 

  private async callOpenRouter(prompt: string): Promise<string> {
    if (!this.API_KEY) {
      console.warn("API_KEY missing. Ensure OpenRouter key is set in Environment Variables.");
      return "AI Briefing unavailable: No API Key detected. Please set your OpenRouter key in the system environment variables.";
    }

    try {
      const response = await fetch(this.OPENROUTER_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.API_KEY}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "IPv4 Deal Sourcing OS",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": this.MODEL,
          "messages": [
            { 
              "role": "system", 
              "content": "You are a senior IPv4 brokerage analyst. Your task is to analyze legacy IP assets, identify supply-side risks, and suggest outreach personas (CFO, CTO, or Legal). Be concise, technical, and professional." 
            },
            { "role": "user", "content": prompt }
          ],
          "temperature": 0.3,
          "top_p": 0.9
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenRouter API Error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || "AI returned an empty analysis.";
    } catch (e) {
      console.error("Gemini 3.0 Flash Service Error:", e);
      return `AI analysis failed. Error: ${e instanceof Error ? e.message : 'Unknown connection error'}.`;
    }
  }

  async generateLeadBrief(lead: Lead): Promise<string> {
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

    return this.callOpenRouter(prompt);
  }

  async resolveEntity(orgName: string): Promise<string> {
    const prompt = `Research parent company and M&A status for the organization: "${orgName}". Return a one-paragraph corporate summary.`;
    return this.callOpenRouter(prompt);
  }
}

export const gemini = new GeminiService();