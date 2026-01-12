
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const getGeminiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY não configurada.");
  return new GoogleGenAI({ apiKey });
};

const SYSTEM_INSTRUCTION = `Você é o ANALISTA GTM PRO. 
Gere relatórios executivos de alto nível seguindo estritamente:
1. PROIBIDO: NUNCA use asteriscos (* ou **).
2. ENFASE: Use CAIXA ALTA para termos importantes.
3. ESTRUTURA: Use '### ' para títulos.
4. LISTAS: Use '-' para tópicos.
5. ESTILO: Tom direto e focado em ROI comercial para IES.`;

export interface AIResponse {
  text: string;
  sources: { title: string; uri: string }[];
  isQuotaError?: boolean;
  provider: 'gemini' | 'openai';
}

const callChatGPT = async (prompt: string, style: string): Promise<string> => {
  const apiKey = process.env.API_KEY; // Assume que o usuário trocou a key ou a mesma serve para um proxy
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini", // Modelo rápido e econômico
      messages: [
        { role: "system", content: SYSTEM_INSTRUCTION },
        { role: "user", content: `Estilo: ${style}. Pergunta: ${prompt}` }
      ],
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "Erro na API do ChatGPT");
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

export const getGtmStrategyStream = async (
  prompt: string, 
  contextData: any, 
  onUpdate: (data: AIResponse) => void,
  style: 'formal' | 'commercial' | 'persuasive' | 'simple' = 'commercial',
  provider: 'gemini' | 'openai' = 'gemini'
) => {
  try {
    if (provider === 'openai') {
      const text = await callChatGPT(prompt, style);
      onUpdate({ text, sources: [], isQuotaError: false, provider: 'openai' });
      return text;
    }

    // Lógica original Gemini
    const ai = getGeminiClient();
    const contextSummary = { empresas: contextData.companies?.length || 0 };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ parts: [{ text: `Pergunta: ${prompt} Contexto: ${JSON.stringify(contextSummary)}` }] }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
        temperature: 0.3,
      },
    });

    const text = response.text || "";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({ title: chunk.web.title, uri: chunk.web.uri }));

    onUpdate({ text, sources, isQuotaError: false, provider: 'gemini' });
    return text;

  } catch (error: any) {
    console.error("AI Service Error:", error);
    const isQuota = error.message?.includes("429") || error.message?.includes("quota");
    
    onUpdate({ 
      text: isQuota 
        ? "LIMITE DE COTAS NO GEMINI ATINGIDO. Sugestão: Alterne para o motor 'ChatGPT' no topo da tela ou aguarde 60 segundos."
        : `ERRO: ${error.message}`, 
      sources: [],
      isQuotaError: isQuota,
      provider
    });
    return null;
  }
};
