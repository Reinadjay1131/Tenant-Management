import { GoogleGenAI } from "@google/genai";
import { Tenant, Payment, MaintenanceRequest } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY is not set. Please set the environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const getAIInsight = async (
    prompt: string, 
    contextData: { tenants: Tenant[], payments: Payment[], requests: MaintenanceRequest[] },
    year?: string
): Promise<string> => {
  if (!API_KEY) {
    return "Error: Gemini API key is not configured. Please contact the administrator.";
  }

  const model = "gemini-2.5-flash";

  let yearFilterInstructions = '';
  if (year && /^\d{4}$/.test(year)) {
      yearFilterInstructions = `
      **IMPORTANT:** The user has specified the year **${year}**. All analysis and data summaries MUST be filtered to only include data from this year.
      - Filter payments based on their 'dueDate'.
      - Filter maintenance requests based on their 'submittedDate'.

      **Output Format:**
      When asked for a summary, provide the response in a markdown table. The table should include metrics like Total Rent Due, Total Rent Collected, and New Maintenance Requests for the year ${year}.
      `;
  }

  const fullPrompt = `
    You are an expert AI assistant for a property manager. Based on the following data and the user's request, provide a helpful, concise, and accurate response. When referencing specific payments or maintenance requests, you MUST mention the tenant's name and apartment number.

    ${yearFilterInstructions}

    **User Request:** "${prompt}"

    **Context Data (raw):**
    - **Tenants:** ${JSON.stringify(contextData.tenants, null, 2)}
    - **Payments:** ${JSON.stringify(contextData.payments, null, 2)}
    - **Maintenance Requests:** ${JSON.stringify(contextData.requests, null, 2)}

    Please provide a direct answer to the user's request.
    If asked to draft a message, write it professionally and clearly.
    If asked for a summary, provide key bullet points or a markdown table as instructed.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: fullPrompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Sorry, I encountered an error while processing your request. Please try again later.";
  }
};