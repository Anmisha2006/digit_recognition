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
            text: "Analyze this image. It contains a single handwritten digit (0-9). Identify the digit. Return a JSON object with the following keys: 'digit' (string), 'explanation' (short string), 'accuracy' (number 0-100 representing your confidence in the identification), 'precision' (number 0-100 representing the clarity/quality of the handwriting), and 'distribution' (array of 10 numbers summing to approx 100, representing the probability percentage for each digit 0-9). Example: {\"digit\": \"5\", \"explanation\": \"Clear structure of a 5\", \"accuracy\": 98, \"precision\": 92, \"distribution\": [0, 0, 1, 0, 0, 98, 1, 0, 0, 0]}. If it is not a digit, return {\"digit\": \"?\", \"explanation\": \"Not recognized as a number\", \"accuracy\": 0, \"precision\": 0, \"distribution\": [0,0,0,0,0,0,0,0,0,0]}.",
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
      // Ensure distribution is an array of 10 numbers
      let distribution = jsonResponse.distribution;
      if (!Array.isArray(distribution) || distribution.length !== 10) {
          // Fallback: create a distribution based on the result
          const recognizedDigit = parseInt(jsonResponse.digit);
          distribution = Array(10).fill(0);
          if (!isNaN(recognizedDigit)) {
              distribution[recognizedDigit] = jsonResponse.accuracy || 90;
          }
      }

      return {
        digit: jsonResponse.digit,
        rawText: jsonResponse.explanation,
        accuracy: typeof jsonResponse.accuracy === 'number' ? jsonResponse.accuracy : 0,
        precision: typeof jsonResponse.precision === 'number' ? jsonResponse.precision : 0,
        distribution: distribution,
      };
    } catch (e) {
      // Fallback if JSON parsing fails (though responseMimeType should prevent this)
      console.warn("Failed to parse JSON, falling back to raw text extraction", e);
      return {
        digit: text.replace(/\D/g, '').charAt(0) || "?",
        rawText: text,
        accuracy: 0,
        precision: 0,
        distribution: Array(10).fill(0),
      };
    }

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};