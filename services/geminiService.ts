
// Refactored to use official @google/genai SDK
import { GoogleGenAI } from "@google/genai";

export interface AIResponse {
  text: string;
  sources: { title: string; uri: string }[];
  provider: 'gemini';
}

const SYSTEM_INSTRUCTION = `Você é o ANALISTA GTM PRO da Lovart AI. 
Gere relatórios estratégicos para Instituições de Ensino Superior (IES).
Regras:
1. SEM ASTERISCOS (* ou **).
2. Use ### para títulos.
3. Termos importantes em CAIXA ALTA.
4. Tom executivo e focado em lucro e expansão.`;

export const getGtmStrategyStream = async (
  prompt: string, 
  contextData: any, 
  onUpdate: (data: AIResponse) => void,
  style: string = 'commercial'
) => {
  try {
    // Initializing the GenAI client with API key from environment
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Using gemini-3-pro-preview for complex strategic reasoning tasks
    const response = await ai.models.generateContentStream({
      model: 'gemini-3-pro-preview',
      contents: `Estilo: ${style}. Pergunta: ${prompt}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    let fullText = '';
    // Iterating through the stream of content
    for await (const chunk of response) {
      const chunkText = chunk.text;
      if (chunkText) {
        fullText += chunkText;
        onUpdate({ 
          text: fullText, 
          sources: [], 
          provider: 'gemini' 
        });
      }
    }
    
    return fullText;

  } catch (error: any) {
    console.error("AI Service Error:", error);
    onUpdate({ 
      text: `ERRO DE CONEXÃO: Ocorreu uma falha ao acessar o serviço de Inteligência Artificial. Verifique sua chave de API GTM.`, 
      sources: [],
      provider: 'gemini'
    });
    return null;
  }
};
