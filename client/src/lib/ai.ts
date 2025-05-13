import { apiRequest } from "./queryClient";

/**
 * Generate AI response suggestions for a given context
 */
export async function getSuggestions(content: string, language: string = "ru"): Promise<string[]> {
  try {
    const response = await apiRequest("POST", "/api/ai/suggest-responses", {
      content,
      language
    });
    
    const data = await response.json();
    return data.suggestions || [];
  } catch (error) {
    console.error("Error getting AI suggestions:", error);
    return [];
  }
}

/**
 * Analyze content for risk factors
 */
export async function analyzeContent(content: string, language: string = "ru"): Promise<{
  isRisky: boolean;
  riskLevel: number;
  riskReason?: string;
}> {
  try {
    const response = await apiRequest("POST", "/api/ai/analyze-content", {
      content,
      language
    });
    
    return await response.json();
  } catch (error) {
    console.error("Error analyzing content:", error);
    return {
      isRisky: false,
      riskLevel: 0
    };
  }
}

/**
 * Get context-based suggestions for comments based on thread category
 */
export async function getContextSuggestions(context: string, language: string = "ru"): Promise<string[]> {
  try {
    const response = await fetch(`/api/ai-suggestions?context=${context}&language=${language}`);
    const data = await response.json();
    
    // Check if data is an array of suggestions
    if (Array.isArray(data)) {
      return data;
    }
    
    // Check if data has suggestions property
    if (data.suggestions && Array.isArray(data.suggestions)) {
      return data.suggestions;
    }
    
    return [];
  } catch (error) {
    console.error("Error getting context suggestions:", error);
    return [];
  }
}
