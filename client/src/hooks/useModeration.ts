import { useState, useCallback } from "react";
import { getSuggestions, analyzeContent } from "@/lib/ai";

export function useModeration() {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [riskAnalysis, setRiskAnalysis] = useState<{
    isRisky: boolean;
    riskLevel: number;
    riskReason?: string;
  } | null>(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  /**
   * Get response suggestions for a thread
   */
  const getSuggestionsForThread = useCallback(async (threadId: number, language: string = "ru") => {
    try {
      setIsLoadingSuggestions(true);
      
      // Fetch thread details to get context
      const response = await fetch(`/api/threads/${threadId}`);
      const data = await response.json();
      
      if (data.thread) {
        // Get AI suggestions based on thread content
        const aiSuggestions = await getSuggestions(data.thread.content, language);
        setSuggestions(aiSuggestions);
      } else {
        // If thread not found, use some generic suggestions based on context
        const genericSuggestions = [
          "Я понимаю тебя, это непросто.",
          "Спасибо, что поделился своими чувствами.",
          "Ты справишься, мы верим в тебя."
        ];
        setSuggestions(genericSuggestions);
      }
    } catch (error) {
      console.error("Error getting suggestions:", error);
      // Fallback suggestions
      setSuggestions([
        "Я слышу тебя и понимаю твои чувства.",
        "Спасибо за твою открытость, это важно.",
        "Ты не один в этой ситуации."
      ]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, []);

  /**
   * Analyze content for risk factors
   */
  const analyze = useCallback(async (content: string, language: string = "ru") => {
    try {
      setIsAnalyzing(true);
      const analysis = await analyzeContent(content, language);
      setRiskAnalysis(analysis);
      return analysis;
    } catch (error) {
      console.error("Error analyzing content:", error);
      const defaultAnalysis = { isRisky: false, riskLevel: 0 };
      setRiskAnalysis(defaultAnalysis);
      return defaultAnalysis;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setSuggestions([]);
    setRiskAnalysis(null);
  }, []);

  return {
    suggestions,
    riskAnalysis,
    isLoadingSuggestions,
    isAnalyzing,
    getSuggestions: getSuggestionsForThread,
    analyze,
    reset
  };
}
