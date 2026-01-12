
import { GoogleGenAI } from "@google/genai";

export interface AIResponse {
  text: string;
  sources: { title: string; uri: string }[];
  isQuotaError?: boolean;
  isInvalidKeyError?: boolean;
  provider: 'gemini' | 'openai';
}

const SYSTEM_INSTRUCTION = `Você é o ANALISTA GTM PRO. 
Gere relatórios executivos de alto nível seguindo estritamente:
1. PROIBIDO: NUNCA use asteriscos (* ou **).
2. ENFASE: Use CAIXA ALTA para termos importantes.
3. ESTRUTURA: Use '### ' para títulos de seção.
4. LISTAS: Use '-' para tópicos.
5. ESTILO: Tom direto e focado em ROI comercial para IES.`;

// Detecta o provedor baseado no formato da chave
const detectProvider = (): 'gemini' | 'openai' => {
  const key = process.env.API_KEY || '';
  if (key.startsWith('sk-')) return 'openai';
  return 'gemini';
};

const callChatGPT = async (prompt: string, style: string): Promise<string> => {
  const apiKey = process.env.API_KEY;
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_INSTRUCTION },
        { role: "user", content: `Estilo: ${style}. Pergunta: ${prompt}` }
      ],
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "Erro na API da OpenAI");
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

export const getGtmStrategyStream = async (
  prompt: string, 
  contextData: any, 
  onUpdate: (data: AIResponse) => void,
  style: 'formal' | 'commercial' | 'persuasive' | 'simple' = 'commercial',
  requestedProvider?: 'gemini' | 'openai'
) => {
  const apiKey = process.env.API_KEY;
  const autoProvider = detectProvider();
  const provider = requestedProvider || autoProvider;

  try {
    if (!apiKey) throw new Error("API_KEY não encontrada no ambiente.");

    if (provider === 'openai') {
      const text = await callChatGPT(prompt, style);
      onUpdate({ text, sources: [], provider: 'openai' });
      return text;
    }

    // Fluxo Gemini
    const ai = new GoogleGenAI({ apiKey });
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

    onUpdate({ text, sources, provider: 'gemini' });
    return text;

  } catch (error: any) {
    console.error("AI Service Error:", error);
    
    const isQuota = error.message?.includes("429") || error.message?.includes("quota");
    const isInvalid = error.message?.includes("400") || error.message?.includes("key not valid") || error.message?.includes("invalid");

    let errorMessage = `ERRO: ${error.message}`;
    if (isInvalid) {
      errorMessage = `CHAVE INVÁLIDA DETECTADA. A chave configurada não parece ser compatível com o motor ${provider.toUpperCase()}. Se você estiver usando uma chave da OpenAI (sk-...), selecione 'ChatGPT' no topo.`;
    } else if (isQuota) {
      errorMessage = "LIMITE DE COTAS EXCEDIDO. O motor Gemini atingiu o limite de requisições. Tente novamente em 60 segundos ou alterne para o motor ChatGPT.";
    }

    onUpdate({ 
      text: errorMessage, 
      sources: [],
      isQuotaError: isQuota,
      isInvalidKeyError: isInvalid,
      provider
    });
    return null;
  }
};
