import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI = null;
if (API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
}

export const improveDescription = async (productName, currentDescription) => {
    if (!genAI) {
        throw new Error("Gemini API Key no configurada");
    }

    // Lista de modelos a probar en orden de prioridad
    const modelsToTry = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"];
    let lastError = null;

    for (const modelName of modelsToTry) {
        try {
            console.log(`Intentando con modelo: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });

            const prompt = `
            Actúa como un experto en copywriting para e-commerce.
            Mejora la siguiente descripción de producto para que sea más atractiva, persuasiva y optimizada para ventas.
            Usa un tono profesional pero entusiasta. Utiliza emojis si es apropiado.
            
            Producto: ${productName}
            Descripción actual: ${currentDescription}
            
            Genera solo la nueva descripción, sin explicaciones adicionales.
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();

        } catch (error) {
            console.warn(`Fallo con ${modelName}:`, error.message);
            lastError = error;
            // Continuar al siguiente modelo...
        }
    }

    // Si llegamos aquí, todos fallaron
    if (lastError) {
        if (lastError.message.includes("429")) {
            throw new Error("Cuota excedida (429). Tu cuenta gratuita ha alcanzado el límite.");
        } else if (lastError.message.includes("404")) {
            throw new Error("Modelos no disponibles (404). Verifica tu API Key.");
        }
        throw lastError;
    }
    throw new Error("Error desconocido al contactar IA.");
};
