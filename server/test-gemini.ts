import dotenv from 'dotenv';
dotenv.config();
import { GoogleGenerativeAI } from "@google/generative-ai";

async function listModels() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
        // Note: The SDK might not have a direct listModels, but we can try to initialize 
        // and see if a simple prompt works with gemini-pro which is the most stable.
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("test");
        console.log("SUCCESS: gemini-pro is working.");

        // Try gemini-1.5-flash specifically
        const model2 = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result2 = await model2.generateContent("test");
        console.log("SUCCESS: gemini-1.5-flash is working.");
    } catch (error: any) {
        console.error("DEBUG ERROR:", error.message);
    }
}

listModels();
