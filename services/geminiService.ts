import { GoogleGenAI } from "@google/genai";
import { RecognitionResult } from "../types";

const apiKey = process.env.API_KEY;

// Helper to strip the data:image/png;base64, prefix
const cleanBase64 = (dataUrl: string) => {
  return dataUrl.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
};

export const recognizeDigit = async (imageDataUrl: string): Promise<RecognitionResult> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please set process.env.API_KEY.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const base64Data = cleanBase64(imageDataUrl);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: base64Data,
            },
          },
          {
            text: "Analyze this image. It contains a single handwritten digit (0-9). Identify the digit. Return a JSON object with the key 'digit' (string) and 'explanation' (short string). Example: {\"digit\": \"5\", \"explanation\": \"Clear structure of a 5\"}. If it is not a digit, return {\"digit\": \"?\", \"explanation\": \"Not recognized as a number\"}.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        temperature: 0.1, // Low temperature for deterministic classification
      },
    });

    const text = response.text;
    
    if (!text) {
      throw new Error("No response from AI");
    }

    try {
      const jsonResponse = JSON.parse(text);
      return {
        digit: jsonResponse.digit,
        rawText: jsonResponse.explanation,
      };
    } catch (e) {
      // Fallback if JSON parsing fails (though responseMimeType should prevent this)
      console.warn("Failed to parse JSON, falling back to raw text extraction", e);
      return {
        digit: text.replace(/\D/g, '').charAt(0) || "?",
        rawText: text,
      };
    }

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
