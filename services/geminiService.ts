
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

    const fullPrompt = `Estilo: ${style}. Contexto GTM: ${JSON.stringify(contextSummary)}. Pergunta: ${prompt}`;

    // Trocamos para gemini-2.5-flash que é extremamente estável para ferramentas de busca (Grounding)
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ parts: [{ text: fullPrompt }] }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
        temperature: 0.4, // Reduzido para maior precisão e estrutura
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

  } catch (error: any) {
    console.error("Erro no Gemini:", error);
    
    // Fornecemos um feedback mais específico baseado no erro real
    let errorMessage = "ERRO DE CONEXÃO COM A INTELIGÊNCIA.";
    if (error.message?.includes("429")) errorMessage = "LIMITE DE COTAS EXCEDIDO. AGUARDE UM MOMENTO.";
    if (error.message?.includes("403")) errorMessage = "CHAVE DE API SEM PERMISSÃO PARA BUSCA NO GOOGLE.";
    if (error.message?.includes("404")) errorMessage = "MODELO NÃO ENCONTRADO OU INDISPONÍVEL.";
    
    onUpdate({ 
      text: `${errorMessage}\n\nDetalhe técnico: ${error.message || 'Erro desconhecido'}`, 
      sources: [] 
    });
    return null;
  }
};
