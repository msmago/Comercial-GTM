
import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { getGtmStrategyStream, AIResponse } from '../services/geminiService';
import { 
  BrainCircuit, 
  Send, 
  Sparkles, 
  RefreshCw,
  Copy,
  Check,
  Zap,
  Lightbulb,
  Globe,
  ExternalLink,
  Search,
  MessageSquareText,
  Layout,
  AlertCircle
} from 'lucide-react';

// Componente para renderizar o texto da IA de forma estilizada e limpa
const FormattedAIResponse = ({ text }: { text: string }) => {
  if (!text) return null;

  // Limpeza agressiva de asteriscos e formatações indesejadas
  const cleanText = text
    .replace(/\*\*\*/g, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/__/g, '');

  const lines = cleanText.split('\n');
  
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
      {lines.map((line, index) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return <div key={index} className="h-2" />;

        // Títulos Principais (### ou CAIXA ALTA CURTA)
        if (line.startsWith('###') || (trimmedLine.length < 50 && trimmedLine === trimmedLine.toUpperCase() && trimmedLine.length > 3)) {
          return (
            <div key={index} className="pt-6 pb-2">
              <h3 className="text-blue-400 font-black text-[11px] uppercase tracking-[0.25em] flex items-center gap-3">
                <span className="w-6 h-[2px] bg-blue-600/50 rounded-full"></span>
                {trimmedLine.replace('###', '').trim()}
              </h3>
            </div>
          );
        }
        
        // Listas com Marcadores Estilizados
        if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•')) {
          return (
            <div key={index} className="flex gap-4 pl-4 group py-0.5">
              <span className="text-blue-600 font-black mt-1 group-hover:scale-150 transition-transform">•</span>
              <p className="text-slate-300 text-sm leading-relaxed font-medium">
                {trimmedLine.replace(/^[-•]/, '').trim()}
              </p>
            </div>
          );
        }

        // Parágrafos de Conteúdo
        return (
          <p key={index} className="text-slate-400 text-sm leading-relaxed font-medium pl-1">
            {trimmedLine}
          </p>
        );
      })}
    </div>
  );
};

const AIAgent = () => {
  const store = useStore();
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState<AIResponse>({ text: '', sources: [] });
  const [loading, setLoading] = useState(false);
  const [style, setStyle] = useState<'formal' | 'commercial' | 'persuasive' | 'simple'>('commercial');
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const SUGGESTIONS = [
    { label: "Oportunidades GTM", icon: Layout, prompt: "Analise meu pipeline atual e sugira 3 abordagens para acelerar fechamentos." },
    { label: "Pesquisa de Mercado", icon: Globe, prompt: "Quais as IES que mais investiram em marketing digital nos últimos 6 meses?" },
    { label: "Argumentação de Vendas", icon: Zap, prompt: "Crie 3 argumentos imbatíveis para convencer um reitor sobre parcerias corporativas." },
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [response]);

  const handleConsult = async (customPrompt?: string) => {
    const textToSubmit = customPrompt || prompt;
    if (!textToSubmit.trim() || loading) return;
    
    setPrompt('');
    setLoading(true);
    setResponse({ text: '', sources: [] });
    
    await getGtmStrategyStream(
      textToSubmit, 
      store, 
      (data) => setResponse(data),
      style
    );
    
    setLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(response.text.replace(/[*_]/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[22px] flex items-center justify-center shadow-2xl shadow-blue-500/20 border border-white/10 rotate-3">
            <BrainCircuit size={32} className="text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase">GTM AI Agent</h2>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'} `}></span>
              <p className="text-slate-500 font-black text-[9px] uppercase tracking-[0.2em]">
                {loading ? 'Consultando Google Search...' : 'Cérebro Comercial Online'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-1.5 bg-slate-900/80 rounded-2xl border border-slate-800 shadow-inner">
          {['formal', 'commercial', 'persuasive'].map((s) => (
            <button
              key={s}
              onClick={() => setStyle(s as any)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${style === s ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}
            >
              {s === 'commercial' ? 'Comercial' : s === 'formal' ? 'Executivo' : 'Persuasivo'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass p-8 rounded-[32px] border-white/5 shadow-2xl space-y-8 bg-slate-900/40">
            <div>
              <h4 className="font-black text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <Lightbulb size={14} className="text-yellow-500" /> Gatilhos Inteligentes
              </h4>
              <div className="space-y-3">
                {SUGGESTIONS.map((s, idx) => (
                  <button 
                    key={idx}
                    onClick={() => handleConsult(s.prompt)}
                    className="w-full text-left p-4 rounded-2xl bg-slate-950/40 border border-slate-800/50 hover:border-blue-500/50 hover:bg-slate-900 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-900 rounded-lg group-hover:bg-blue-600/10 transition-colors">
                        <s.icon size={16} className="text-slate-500 group-hover:text-blue-400" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-400 group-hover:text-slate-200 leading-tight">{s.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-8 border-t border-slate-800/60">
              <div className="p-5 bg-emerald-600/5 rounded-2xl border border-emerald-500/10 space-y-3 text-center">
                <Globe size={24} className="text-emerald-500 mx-auto opacity-50" />
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                  Busca em Tempo Real Ativada. Dados validados pelo Google.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="glass rounded-[40px] border-white/5 shadow-2xl flex flex-col h-[650px] relative overflow-hidden bg-slate-950/40">
            <div className="px-10 py-5 border-b border-slate-800/60 flex items-center justify-between bg-slate-950/20">
              <div className="flex items-center gap-3">
                <MessageSquareText size={18} className="text-blue-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Dashboard de Insights</span>
              </div>
              {response.text && (
                <div className="flex items-center gap-3">
                  <button onClick={copyToClipboard} className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-blue-400 transition-all border border-transparent hover:border-slate-700">
                    {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    <span className="text-[10px] font-black uppercase tracking-widest">{copied ? 'Copiado' : 'Copiar'}</span>
                  </button>
                  <button onClick={() => setResponse({ text: '', sources: [] })} className="p-2 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-rose-400 transition-all">
                    <RefreshCw size={16} />
                  </button>
                </div>
              )}
            </div>

            <div ref={scrollRef} className="flex-1 p-10 overflow-y-auto custom-scrollbar scroll-smooth bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.05),transparent)]">
              {loading && !response.text ? (
                <div className="h-full flex flex-col items-center justify-center space-y-6">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin"></div>
                    <Search size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500 animate-pulse" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">Sincronizando Mercado</p>
                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Consultando bases do Google em tempo real...</p>
                  </div>
                </div>
              ) : response.text ? (
                <div className="max-w-3xl">
                  {response.text.includes("ERRO") ? (
                    <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-3xl flex items-start gap-4 animate-in slide-in-from-top-4">
                      <AlertCircle className="text-rose-500 flex-shrink-0" size={24} />
                      <div className="space-y-2">
                        <h4 className="font-black text-rose-500 text-xs uppercase tracking-widest">Falha na Inteligência</h4>
                        <p className="text-slate-400 text-sm font-medium">{response.text}</p>
                        <p className="text-[10px] text-slate-600 font-bold uppercase pt-2 border-t border-rose-500/10">Dica: Verifique se sua chave de API possui saldo ou se o projeto no AI Studio tem o "Google Search" habilitado.</p>
                      </div>
                    </div>
                  ) : (
                    <FormattedAIResponse text={response.text} />
                  )}

                  {response.sources.length > 0 && (
                    <div className="mt-12 pt-8 border-t border-slate-800/60">
                      <h5 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-5 flex items-center gap-2">
                        <Globe size={12} /> Referências Externas Encontradas
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {response.sources.map((source, i) => (
                          <a 
                            key={i}
                            href={source.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-4 bg-slate-900/40 border border-slate-800 hover:border-blue-500/40 rounded-2xl transition-all group"
                          >
                            <span className="text-[10px] font-bold text-slate-500 group-hover:text-slate-300 truncate pr-4">{source.title}</span>
                            <ExternalLink size={12} className="text-slate-700 group-hover:text-blue-500 flex-shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-24 h-24 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-8 shadow-inner group hover:border-blue-500/50 transition-all duration-500">
                    <Search size={40} className="text-slate-700 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-3 italic tracking-tight uppercase">Pronto para Diagnosticar</h3>
                  <p className="text-[10px] text-slate-600 max-w-[280px] uppercase tracking-[0.2em] font-black leading-relaxed">
                    Pesquise sobre sua base ou peça tendências externas do Google.
                  </p>
                </div>
              )}
            </div>

            <div className="p-8 bg-slate-950/60 border-t border-slate-800/60 backdrop-blur-md">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleConsult(); }} 
                className="flex items-center gap-4 bg-slate-900/80 p-2.5 rounded-[24px] border border-slate-800 focus-within:border-blue-500/50 focus-within:ring-4 focus-within:ring-blue-500/5 transition-all"
              >
                <div className="p-3 bg-slate-800 rounded-2xl text-slate-500">
                  <Search size={18} />
                </div>
                <input 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Pesquise notícias, IES ou dados de mercado..."
                  className="flex-1 bg-transparent border-none outline-none px-2 py-2 text-slate-200 placeholder:text-slate-600 text-sm font-bold tracking-tight"
                />
                <button 
                  disabled={loading || !prompt.trim()}
                  type="submit"
                  className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-20 text-white rounded-[18px] transition-all shadow-xl shadow-blue-600/20 font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
                >
                  {loading ? <RefreshCw className="animate-spin" size={16} /> : <><Send size={16} /> Consultar</>}
                </button>
              </form>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-8">
            <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all opacity-40 hover:opacity-100 cursor-default">
              <div className="w-4 h-4 rounded bg-white flex items-center justify-center text-[8px] font-black text-black">G</div>
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">Gemini 2.5 Flash Grounding</span>
            </div>
            <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all opacity-40 hover:opacity-100 cursor-default">
              <Globe size={14} className="text-emerald-500" />
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">Search Tool Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAgent;
