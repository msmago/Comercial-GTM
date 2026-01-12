
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Inicialização segura do cliente
const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY não configurada no ambiente.");
  return new GoogleGenAI({ apiKey });
};

const SYSTEM_INSTRUCTION = `Você é o Analista GTM PRO, um especialista em inteligência comercial para instituições de ensino superior (IES).
Seu objetivo é analisar dados de CRM e também utilizar o Google Search para trazer informações atualizadas do mercado educacional.
- Se o usuário perguntar sobre notícias, tendências ou dados de outras IES, use o Google Search.
- Sempre que usar dados externos, cite que a informação foi verificada via busca em tempo real.
- Seja conciso e use formatação Markdown.
- Foque em resultados comerciais de elite.`;

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
      estoqueCritico: contextData.inventory?.filter((i: any) => i.quantity < i.minQuantity).map((i: any) => i.name)
    };

    const fullPrompt = `Estilo: ${style}. Contexto GTM: ${JSON.stringify(contextSummary)}. Pergunta: ${prompt}`;

    // Nota: O Google Search Grounding funciona melhor em chamadas non-streaming para extrair metadados completos em algumas versões, 
    // mas o SDK permite capturar no stream. Para garantir a exibição das URLs, tratamos o resultado.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: fullPrompt }] }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }], // ATIVAÇÃO DO GOOGLE SEARCH
        temperature: 0.7,
      },
    });

    const text = response.text || "";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    // Extraímos os links das fontes encontradas pelo Google Search
    const sources = groundingChunks
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({
        title: chunk.web.title,
        uri: chunk.web.uri
      }));

    onUpdate({ text, sources });
    return text;

  } catch (error) {
    console.error("Erro no Gemini com Google Search:", error);
    onUpdate({ 
      text: "Erro ao acessar a inteligência de busca. Verifique sua cota ou chave de API.", 
      sources: [] 
    });
    return null;
  }
};
