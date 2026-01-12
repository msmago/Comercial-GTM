
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY não configurada no ambiente.");
  return new GoogleGenAI({ apiKey });
};

const SYSTEM_INSTRUCTION = `Você é o Analista GTM PRO de Elite. 
Sua entrega de texto deve seguir um padrão EXECUTIVO e LIMPO.

REGRAS CRÍTICAS DE FORMATAÇÃO:
1. NUNCA use asteriscos duplos (**) ou simples (*) para negrito ou itálico.
2. Para dar ênfase a termos importantes, use CAIXA ALTA.
3. Use títulos com '### ' para separar seções (ex: ### ANÁLISE DE MERCADO).
4. Use listas com hífen '-' para tópicos.
5. Deixe uma linha em branco entre cada parágrafo ou título.
6. Foque em ser direto, tático e profissional.
7. Se usar o Google Search, cite as fontes no final de forma organizada.`;

export interface AIResponse {
  text: string;
  sources: { title: string; uri: string }[];
}

export const getGtmStrategyStream = async (
  prompt: string, 
  contextData: any, 
  onUpdate: (data: AIResponse) => void,
  style: 'formal' | 'commercial' | 'persuasive' | 'simple' = 'commercial'
) => {
  try {
    const ai = getAIClient();
    
    const contextSummary = {
      totalEmpresas: contextData.companies?.length || 0,
      tarefasPendentes: contextData.tasks?.filter((t: any) => t.status !== 'DONE').length || 0,
    };

    const fullPrompt = `Estilo: ${style}. Contexto: ${JSON.stringify(contextSummary)}. Pergunta: ${prompt}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: fullPrompt }] }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
        temperature: 0.5, // Menor temperatura para respostas mais estruturadas
      },
    });

    const text = response.text || "";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const sources = groundingChunks
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({
        title: chunk.web.title,
        uri: chunk.web.uri
      }));

    onUpdate({ text, sources });
    return text;

  } catch (error) {
    console.error("Erro no Gemini:", error);
    onUpdate({ 
      text: "ERRO CRÍTICO NA CONEXÃO COM A INTELIGÊNCIA. VERIFIQUE OS LOGS.", 
      sources: [] 
    });
    return null;
  }
};
