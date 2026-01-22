import { GoogleGenAI, Type } from "@google/genai";
import { GenerationResult } from "../types";

const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("API_KEY is missing from environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export const generateDictionary = async (inputTerms: string): Promise<GenerationResult> => {
  if (!inputTerms.trim()) return { validTerms: [], rejectedTerms: [] };

  const modelId = "gemini-3-flash-preview";
  
  const systemInstruction = `
    Sen uzman bir yazılım mühendisi ve terminoloji sözlüğüsün.
    Görevin: Kullanıcının verdiği kelimeleri analiz etmek.
    
    KURALLAR:
    1. **FİLTRELEME:** Sadece Bilgisayar Bilimleri, Yazılım Mühendisliği, Donanım ve Teknoloji ile doğrudan ilgili terimleri kabul et. (Örn: "Elma" meyve ise reddet. "Masa" reddet, "Table" veritabanı ise kabul et).
    2. **FORMAT:** Kabul edilen 'term' değerini mutlaka **PascalCase/CamelCase** formatına dönüştür (Örn: "load balancer" -> "Load Balancer", "api gateway" -> "ApiGateway") ama MemoryManagement gibi birleşik terimlerde boşluk bırak.
    3. **REDDETME:** Eğer kelime yazılım ile alakasızsa, hiçbir kategoriye koyma ve 'rejectedTerms' listesine ekle.
    4. **İÇERİK:** 
       - Full Form: Varsa açılımı (SaaS -> Software as a Service).
       - Category: (Frontend, Backend, DevOps, Security, AI, Network, vs.).
       - Definition: Türkçe, teknik ve net 1 satırlık açıklama.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Analiz edilecek kelimeler: \n${inputTerms}`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            validTerms: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING, description: "CamelCase formatında terim (örn: ServiceWorker)." },
                  fullForm: { type: Type.STRING },
                  category: { type: Type.STRING },
                  definition: { type: Type.STRING },
                },
                required: ["term", "fullForm", "category", "definition"],
              },
            },
            rejectedTerms: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Yazılım ile ilgisi olmadığı için reddedilen kelimelerin listesi."
            }
          },
          required: ["validTerms", "rejectedTerms"]
        },
      },
    });

    const text = response.text;
    if (!text) {
        throw new Error("Boş cevap döndü.");
    }
    
    return JSON.parse(text) as GenerationResult;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Analiz sırasında bir hata oluştu.");
  }
};
