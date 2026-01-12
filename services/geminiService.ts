
export interface AIResponse {
  text: string;
  sources: { title: string; uri: string }[];
  provider: 'pollinations';
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
    // Pollinations AI: Totalmente grátis, sem chaves, sem limites.
    const response = await fetch("https://text.pollinations.ai/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          { role: "system", content: SYSTEM_INSTRUCTION },
          { role: "user", content: `Estilo: ${style}. Pergunta: ${prompt}` }
        ],
        model: "openai", // Usa o modelo padrão de alta qualidade deles
        seed: Math.floor(Math.random() * 1000)
      })
    });

    if (!response.ok) throw new Error("Servidor de IA temporariamente ocupado.");

    const text = await response.text();
    
    onUpdate({ 
      text, 
      sources: [], 
      provider: 'pollinations' 
    });
    
    return text;

  } catch (error: any) {
    console.error("AI Service Error:", error);
    onUpdate({ 
      text: `ERRO DE CONEXÃO: O servidor de IA gratuita está instável. Tente novamente em 2 segundos.`, 
      sources: [],
      provider: 'pollinations'
    });
    return null;
  }
};
