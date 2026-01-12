
import { GoogleGenAI } from "@google/genai";

export const getGtmStrategy = async (prompt: string, contextData: any, style: 'formal' | 'commercial' | 'persuasive' | 'simple' = 'commercial') => {
  // A variável process.env.API_KEY agora é injetada pelo vite.config.ts
  if (!process.env.API_KEY) {
    console.error("GTM PRO AI: API_KEY não encontrada no ambiente.");
    return "Erro: A Chave de API da IA não foi configurada corretamente no painel da Vercel.";
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-flash-preview';
  
  const summaryContext = {
    totalParceiros: contextData.companies?.length || 0,
    tarefasConcluidas: contextData.tasks?.filter((t: any) => t.status === 'DONE').length || 0,
    tarefasPendentes: contextData.tasks?.filter((t: any) => t.status !== 'DONE').length || 0,
    eventosAgendados: contextData.events?.length || 0,
    ultimasTarefas: contextData.tasks?.slice(0, 10).map((t: any) => `${t.title} (${t.status})`) || [],
    ultimosEventos: contextData.events?.slice(0, 10).map((e: any) => `${e.title} em ${new Date(e.date).toLocaleDateString('pt-BR')}`) || []
  };

  const systemInstruction = `Você é o GTM PRO AI Agent, um analista de performance comercial de elite para IES. 
  Seu estilo de escrita deve ser ${style}. 
  
  CONTEXTO ATUAL DO SISTEMA:
  ${JSON.stringify(summaryContext, null, 2)}
  
  OBJETIVO:
  Analise as atividades do calendário e tarefas para gerar RESUMOS DE ATIVIDADES.
  Foque em produtividade, eventos e próximos compromissos.
  Sempre use Português (PT-BR). Seja executivo, direto e motivador.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Desculpe, tive um problema ao processar seu resumo. Verifique se sua API Key no painel da Vercel está correta.";
  }
};

export const generateActivityReport = async (period: 'semanal' | 'mensal', contextData: any, style: string) => {
  const prompt = `Gere um relatório de atividades ${period} baseado na minha agenda e tarefas concluídas. Destaque os marcos mais importantes.`;
  return await getGtmStrategy(prompt, contextData, style as any);
};
