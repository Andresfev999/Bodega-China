
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyC4KYkpjMVI4AnfhsLm_ddJ9EQDFbdgilU";
const genAI = new GoogleGenerativeAI(API_KEY);

async function listModels() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" });
        // Just try to generate something simple to verify
        const result = await model.generateContent("Hello");
        console.log("Response:", result.response.text());
    } catch (error) {
        console.error("Error:", error.message);
    }
}

listModels();
