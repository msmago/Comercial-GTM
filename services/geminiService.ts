
export interface AIResponse {
  text: string;
  sources: { title: string; uri: string }[];
  provider: 'openai';
}

const SYSTEM_INSTRUCTION = `Você é o ANALISTA GTM PRO da Lovart AI. 
Gere relatórios executivos de alto nível seguindo estritamente:
1. PROIBIDO: NUNCA use asteriscos (* ou **).
2. ENFASE: Use CAIXA ALTA para termos extremamente importantes.
3. ESTRUTURA: Use '### ' para títulos de seção.
4. LISTAS: Use '-' para tópicos.
5. ESTILO: Tom direto, focado em ROI comercial e expansão de mercado para Instituições de Ensino Superior (IES).`;

const callChatGPT = async (prompt: string, style: string): Promise<string> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || !apiKey.startsWith('sk-')) {
    throw new Error("CHAVE OPENAI INVÁLIDA OU AUSENTE. Certifique-se de que a API_KEY configurada no ambiente começa com 'sk-'.");
  }

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
      temperature: 0.6,
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "Erro de comunicação com a OpenAI.");
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

export const getGtmStrategyStream = async (
  prompt: string, 
  contextData: any, 
  onUpdate: (data: AIResponse) => void,
  style: 'formal' | 'commercial' | 'persuasive' | 'simple' = 'commercial'
) => {
  try {
    const text = await callChatGPT(prompt, style);
    
    // Como a API padrão da OpenAI não fornece grounding de busca como o Gemini, 
    // retornamos fontes vazias para manter a compatibilidade da interface.
    onUpdate({ 
      text, 
      sources: [], 
      provider: 'openai' 
    });
    
    return text;

  } catch (error: any) {
    console.error("OpenAI Service Error:", error);
    
    onUpdate({ 
      text: `FALHA ESTRATÉGICA: ${error.message}`, 
      sources: [],
      provider: 'openai'
    });
    return null;
  }
};
