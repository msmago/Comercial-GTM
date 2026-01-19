
import { GoogleGenAI } from "@google/genai";

export interface AIResponse {
  text: string;
  sources: { title: string; uri: string }[];
  provider: 'gemini';
}

const SYSTEM_INSTRUCTION = `Você é o ANALISTA GTM PRO da Lovart AI. 
Gere relatórios estratégicos e preencha contratos para Instituições de Ensino Superior (IES).
Regras para Contratos:
1. Mantenha a formatação jurídica estrita.
2. Substitua placeholders ou lacunas pelos dados fornecidos da empresa.
3. Se um dado estiver faltando, use [INSERIR DADO] em destaque.
4. Retorne o texto completo e revisado.`;

export const getGtmStrategyStream = async (
  prompt: string, 
  contextData: any, 
  onUpdate: (data: AIResponse) => void,
  style: string = 'commercial'
) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContentStream({
      model: 'gemini-3-pro-preview',
      contents: `Contexto: ${JSON.stringify(contextData)}. Prompt: ${prompt}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    let fullText = '';
    for await (const chunk of response) {
      const chunkText = chunk.text;
      if (chunkText) {
        fullText += chunkText;
        onUpdate({ text: fullText, sources: [], provider: 'gemini' });
      }
    }
    return fullText;
  } catch (error: any) {
    console.error("AI Service Error:", error);
    onUpdate({ 
      text: `ERRO DE CONEXÃO: Falha ao processar inteligência documental.`, 
      sources: [],
      provider: 'gemini'
    });
    return null;
  }
};
