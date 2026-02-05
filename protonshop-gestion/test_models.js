
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyC4KYkpjMVI4AnfhsLm_ddJ9EQDFbdgilU";
const genAI = new GoogleGenerativeAI(API_KEY);

async function main() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        // Not calling listModels directly as it might be on the client
        // Actually the SDK doesn't expose listModels easily on the client instance, 
        // it's usually a separate manager or via the REST API directly.
        // Let's assume we can just try a few known ones.

        console.log("Testing gemini-1.5-flash...");
        try {
            const result = await model.generateContent("Hi");
            console.log("Success with gemini-1.5-flash");
        } catch (e) { console.log("Failed gemini-1.5-flash: " + e.message); }

        const model2 = genAI.getGenerativeModel({ model: "gemini-pro" });
        try {
            const result = await model2.generateContent("Hi");
            console.log("Success with gemini-pro");
        } catch (e) { console.log("Failed gemini-pro: " + e.message); }

    } catch (error) {
        console.error("Fatal:", error);
    }
}

main();
