import { type GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';

// Ensure your API key is added to your .env file
const buildKey = () => {
  return [
    import.meta.env.VITE__GEMINI_A,
    import.meta.env.VITE__GEMINI_P,
    import.meta.env.VITE__GEMINI_I,
  ].join('');
};
const genAI = new GoogleGenerativeAI(buildKey());

/**
 * The default model instance.
 * Using 'gemini-2.5-flash' for faster response times in game scenarios.
 */
export const googleModel: GenerativeModel = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash', // or "gemini-3-flash-preview"
  generationConfig: {
    responseMimeType: 'application/json',
  },
});

/**
 * Generic function to interact with the AI.
 * @param prompt - The string prompt to send to the model.
 * @returns - The parsed content or raw text from the response.
 */
export const fetchGenerativeContent = async (prompt: string) => {
  try {
    const result = await googleModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Google AI Service Error:', error);
    throw error;
  }
};
