import { GoogleGenerativeAI } from "@google/generative-ai";
import apiKey from "@/utils/geminiKey";

export const genAI = new GoogleGenerativeAI(apiKey);
export const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const initializeChat = async () => {
  return model.startChat({
    history: [],
    generationConfig: {
      maxOutputTokens: 2000,
    },
  });
};
