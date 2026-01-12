
import { GoogleGenAI } from "@google/genai";

export const getGtmStrategy = async (prompt: string, contextData: any, style: 'formal' | 'commercial' | 'persuasive' | 'simple' = 'commercial') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-flash-preview';
  
  // Prepara um resumo do contexto focado apenas em atividades e calendário
  const summaryContext = {
    totalParceiros: contextData.companies.length,
    tarefasConcluidas: contextData.tasks.filter((t: any) => t.status === 'DONE').length,
    tarefasPendentes: contextData.tasks.filter((t: any) => t.status !== 'DONE').length,
    eventosAgendados: contextData.events.length,
    // Envia os títulos das últimas atividades do calendário para a IA poder resumir
    ultimasTarefas: contextData.tasks.slice(0, 15).map((t: any) => `${t.title} (${t.status})`),
    ultimosEventos: contextData.events.slice(0, 15).map((e: any) => `${e.title} em ${new Date(e.date).toLocaleDateString('pt-BR')}`)
  };

  const systemInstruction = `Você é o GTM PRO AI Agent, um analista de performance comercial de elite para IES. 
  Seu estilo de escrita deve ser ${style}. 
  
  CONTEXTO ATUAL DO SISTEMA (FOCO EM AGENDA):
  ${JSON.stringify(summaryContext, null, 2)}
  
  OBJETIVO:
  Sua principal função é analisar as atividades do calendário e tarefas para gerar RESUMOS DE ATIVIDADES (Semanais ou Mensais).
  NÃO inclua dados de estoque ou logística neste relatório, foque apenas em produtividade, eventos realizados e próximos compromissos da agenda.
  Quando o usuário pedir um resumo, analise o que foi concluído e o que está agendado.
  Sempre use Português (PT-BR). Seja executivo e direto.`;

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
    return "Desculpe, tive um problema ao processar seu resumo de atividades. Tente novamente.";
  }
};

export const generateActivityReport = async (period: 'semanal' | 'mensal', contextData: any, style: string) => {
  const prompt = `Gere um relatório de atividades ${period} baseado estritamente na minha agenda e nas tarefas que concluí. Destaque os eventos mais importantes do calendário.`;
  return await getGtmStrategy(prompt, contextData, style as any);
};
