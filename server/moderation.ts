import OpenAI from "openai";

// Initialize OpenAI with API key from environment variables
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "demo_key" });

interface ContentModerationResult {
  isRisky: boolean;
  riskLevel: number; // 0-10 scale, 0 being safe, 10 being highest risk
  riskReason?: string;
  suggestedResponses?: string[];
}

interface SuicideRiskAssessment {
  riskLevel: number; // 0-10 scale
  reasonForAssessment: string;
  suggestedAction: string;
  needsImmediate: boolean;
}

/**
 * Analyzes content for potential risk factors related to mental health and suicide
 */
export async function moderateContent(content: string, language: string = "ru"): Promise<ContentModerationResult> {
  try {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a specialized content moderation AI for a teen mental health support platform. 
          Your job is to assess text for signs of severe distress, suicidal ideation, self-harm intentions, 
          or other concerning mental health signals. Analyze in ${language} language context.
          
          Provide your analysis as a JSON object with the following structure:
          {
            "isRisky": boolean,
            "riskLevel": number (0-10 scale, 0 is safe, 10 is extreme risk),
            "riskReason": string explaining why this content is flagged (if applicable),
            "suggestedResponses": array of 3 supportive, compassionate responses appropriate for the content
          }`
        },
        {
          role: "user",
          content: content
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return {
      isRisky: result.isRisky,
      riskLevel: result.riskLevel,
      riskReason: result.riskReason,
      suggestedResponses: result.suggestedResponses
    };
  } catch (error) {
    console.error("Error in content moderation:", error);
    // Return a default safe result in case of API failure
    return {
      isRisky: false,
      riskLevel: 0,
      suggestedResponses: []
    };
  }
}

/**
 * Performs a detailed suicide risk assessment for high-risk content
 */
export async function assessSuicideRisk(content: string, language: string = "ru"): Promise<SuicideRiskAssessment> {
  try {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a mental health professional specializing in suicide risk assessment.
          Analyze the following text for suicide risk factors, using clinical expertise.
          Assess the content in ${language} language context.
          
          Provide your assessment as a JSON object with the following structure:
          {
            "riskLevel": number (0-10 scale),
            "reasonForAssessment": string with clinical reasoning,
            "suggestedAction": string describing recommended next steps,
            "needsImmediate": boolean indicating if immediate intervention is needed
          }`
        },
        {
          role: "user",
          content: content
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error in suicide risk assessment:", error);
    // Return a conservative assessment in case of API failure
    return {
      riskLevel: 5, // Medium risk as a precaution
      reasonForAssessment: "Unable to complete assessment due to technical error",
      suggestedAction: "Manual review recommended due to assessment failure",
      needsImmediate: false
    };
  }
}

/**
 * Generates empathetic response suggestions for a given post or comment
 */
export async function generateResponseSuggestions(content: string, language: string = "ru"): Promise<string[]> {
  try {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an empathetic support specialist who helps teens respond to their peers who are struggling.
          Generate 3 supportive, empathetic responses that a teenager could use to reply to the following message.
          The responses should be in ${language} language, about 1-2 sentences each, warm and supportive but not solving the problem for them.
          Focus on validating feelings, showing understanding, and encouraging them to share more.
          
          Provide your suggestions as a JSON array of strings: ["suggestion1", "suggestion2", "suggestion3"]`
        },
        {
          role: "user",
          content: content
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error generating response suggestions:", error);
    return [
      "Я тебя понимаю, это непростая ситуация.",
      "Спасибо, что поделился своими чувствами с нами.",
      "Мы здесь, чтобы поддержать тебя."
    ];
  }
}
