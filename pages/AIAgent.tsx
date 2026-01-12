
import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { getGtmStrategyStream, AIResponse } from '../services/geminiService';
import { 
  BrainCircuit, 
  Send, 
  Sparkles, 
  Target, 
  FileCheck,
  RefreshCw,
  Copy,
  Check,
  BarChart3,
  Zap,
  Lightbulb,
  AlertCircle,
  Globe,
  ExternalLink,
  Search
} from 'lucide-react';

const AIAgent = () => {
  const store = useStore();
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState<AIResponse>({ text: '', sources: [] });
  const [loading, setLoading] = useState(false);
  const [style, setStyle] = useState<'formal' | 'commercial' | 'persuasive' | 'simple'>('commercial');
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const SUGGESTIONS = [
    { label: "Notícias do Setor", icon: Globe, prompt: "Quais as últimas notícias sobre o mercado de ensino superior privado no Brasil?" },
    { label: "Análise de Concorrência", icon: Search, prompt: "Pesquise como está o ranking das maiores IES em termos de satisfação de alunos este ano." },
    { label: "Tendências GTM", icon: Zap, prompt: "Quais são as tendências de parcerias B2B para educação em 2026?" },
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
    navigator.clipboard.writeText(response.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 border border-white/10">
            <BrainCircuit size={28} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black italic tracking-tight text-white uppercase">GTM AI Agent + Search</h2>
            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Inteligência Comercial com Busca Google Integrada</p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-1 bg-slate-900/50 rounded-2xl border border-slate-800">
          {['formal', 'commercial', 'persuasive'].map((s) => (
            <button
              key={s}
              onClick={() => setStyle(s as any)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${style === s ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {s === 'commercial' ? 'Vendas' : s === 'formal' ? 'Executivo' : 'Pitch'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass p-6 rounded-3xl border-white/5 shadow-xl space-y-6">
            <div>
              <h4 className="font-black text-[10px] text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Globe size={12} className="text-blue-500" /> Inteligência Externa
              </h4>
              <div className="space-y-2">
                {SUGGESTIONS.map((s, idx) => (
                  <button 
                    key={idx}
                    onClick={() => handleConsult(s.prompt)}
                    className="w-full text-left p-3 rounded-2xl bg-slate-800/30 border border-slate-700/50 hover:border-blue-500/50 hover:bg-slate-800/60 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <s.icon size={14} className="text-slate-500 group-hover:text-blue-400" />
                      <span className="text-xs font-bold text-slate-400 group-hover:text-slate-200">{s.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800">
              <h4 className="font-black text-[10px] text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <AlertCircle size={12} className="text-emerald-500" /> Auditoria de Dados
              </h4>
              <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800 text-[10px] text-slate-400 leading-relaxed font-bold uppercase">
                O Agente agora consulta o Google em tempo real para validar tendências de mercado e dados públicos de outras IES.
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="glass rounded-[32px] border-white/5 shadow-2xl flex flex-col h-[600px] relative overflow-hidden">
            <div className="px-8 py-4 border-b border-slate-800/60 flex items-center justify-between bg-slate-900/20">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${loading ? 'bg-blue-500 animate-ping' : 'bg-emerald-500'} `}></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {loading ? 'Pesquisando no Google...' : 'Pronto para Analisar'}
                </span>
              </div>
              {response.text && (
                <div className="flex items-center gap-2">
                  <button onClick={copyToClipboard} className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-blue-400 transition-all">
                    {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                  </button>
                </div>
              )}
            </div>

            <div ref={scrollRef} className="flex-1 p-8 overflow-y-auto custom-scrollbar">
              {response.text ? (
                <div className="space-y-6">
                  <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed whitespace-pre-wrap text-sm font-medium">
                    {response.text}
                  </div>

                  {/* Exibição das Fontes de Pesquisa */}
                  {response.sources.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-slate-800/60 animate-in slide-in-from-bottom-2 duration-700">
                      <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <Globe size={12} /> Fontes Consultadas (Google Search)
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {response.sources.map((source, i) => (
                          <a 
                            key={i}
                            href={source.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 bg-slate-900/80 border border-slate-800 rounded-xl hover:border-blue-500/50 hover:bg-slate-800 transition-all group"
                          >
                            <span className="text-[10px] font-bold text-slate-400 group-hover:text-blue-400 truncate max-w-[200px]">{source.title}</span>
                            <ExternalLink size={10} className="text-slate-600 group-hover:text-blue-400" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                  <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mb-6">
                    <Search size={40} className="text-slate-600" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Potencialize seu GTM</h3>
                  <p className="text-xs text-slate-500 max-w-xs uppercase tracking-widest font-black leading-relaxed">
                    Pergunte sobre dados internos ou peça para eu pesquisar tendências no Google.
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-900/40 border-t border-slate-800/60">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleConsult(); }} 
                className="flex items-center gap-3 bg-slate-950/80 p-2 rounded-2xl border border-slate-800 focus-within:border-blue-500/50 transition-all"
              >
                <input 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ex: Quais as IES que mais cresceram em parcerias no último ano?"
                  className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-slate-200 placeholder:text-slate-600 text-sm font-medium"
                />
                <button 
                  disabled={loading || !prompt.trim()}
                  type="submit"
                  className="p-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white rounded-xl transition-all shadow-lg shadow-blue-600/20"
                >
                  {loading ? <RefreshCw className="animate-spin" size={20} /> : <Send size={20} />}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAgent;
