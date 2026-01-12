
import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { getGtmStrategyStream, AIResponse } from '../services/geminiService';
import { 
  BrainCircuit, Send, RefreshCw, Copy, Check, Zap, 
  Lightbulb, Globe, ExternalLink, Search, MessageSquareText, 
  ShieldAlert, Clock, Cpu, AlertCircle, Key
} from 'lucide-react';

const FormattedAIResponse = ({ text }: { text: string }) => {
  if (!text) return null;
  const cleanText = text.replace(/[*_`]/g, '');
  const lines = cleanText.split('\n');
  
  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {lines.map((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={index} className="h-2" />;
        if (line.startsWith('###') || (trimmed.length < 60 && trimmed === trimmed.toUpperCase() && trimmed.length > 4)) {
          return (
            <div key={index} className="pt-6 pb-2">
              <div className="flex items-center gap-4 mb-2">
                <span className="h-px flex-1 bg-gradient-to-r from-blue-600/50 to-transparent"></span>
                <h3 className="text-blue-400 font-black text-[10px] uppercase tracking-[0.4em]">{trimmed.replace('###', '').trim()}</h3>
              </div>
            </div>
          );
        }
        if (trimmed.startsWith('-')) {
          return (
            <div key={index} className="flex gap-4 pl-2 py-1 group">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0 group-hover:scale-150 transition-transform"></div>
              <p className="text-slate-300 text-sm leading-relaxed font-medium">{trimmed.replace('-', '').trim()}</p>
            </div>
          );
        }
        return <p key={index} className="text-slate-400 text-[13px] leading-[1.8] font-medium">{trimmed}</p>;
      })}
    </div>
  );
};

const AIAgent = () => {
  const store = useStore();
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState<AIResponse>({ text: '', sources: [], provider: 'gemini' });
  const [loading, setLoading] = useState(false);
  const [style, setStyle] = useState<'formal' | 'commercial' | 'persuasive' | 'simple'>('commercial');
  const [provider, setProvider] = useState<'gemini' | 'openai' | undefined>(undefined);
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [response]);

  const handleConsult = async (customPrompt?: string) => {
    const textToSubmit = customPrompt || prompt;
    if (!textToSubmit.trim() || loading) return;
    setPrompt('');
    setLoading(true);
    setResponse(prev => ({ ...prev, text: '', sources: [] }));
    await getGtmStrategyStream(textToSubmit, store, (data) => setResponse(data), style, provider);
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[22px] flex items-center justify-center shadow-2xl border border-white/10 rotate-3 transition-transform hover:rotate-0">
            <BrainCircuit size={32} className="text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase leading-none">GTM AI Agent</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
              <p className="text-slate-500 font-black text-[9px] uppercase tracking-[0.2em]">
                Status: {loading ? 'Processando Inteligência' : 'Sistema Pronto'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1 p-1.5 bg-slate-900 rounded-2xl border border-slate-800 shadow-inner">
            <button 
              onClick={() => setProvider('gemini')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${provider === 'gemini' || (!provider && response.provider === 'gemini') ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Globe size={12} /> Gemini
            </button>
            <button 
              onClick={() => setProvider('openai')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${provider === 'openai' || (!provider && response.provider === 'openai') ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Cpu size={12} /> ChatGPT
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass p-8 rounded-[32px] border-white/5 shadow-2xl space-y-8 bg-slate-900/40">
            <div>
              <h4 className="font-black text-[10px] text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                <Lightbulb size={14} className="text-amber-500" /> Sugestões GTM
              </h4>
              <div className="space-y-3">
                {[
                  { label: "Análise de Pipeline", p: "Analise minhas empresas atuais e sugira uma estratégia de follow-up." },
                  { label: "Tendências de Mercado", p: "Quais as notícias mais recentes sobre parcerias IES no Brasil?" }
                ].map((item, i) => (
                  <button key={i} onClick={() => handleConsult(item.p)} className="w-full text-left p-4 rounded-2xl bg-slate-950/40 border border-slate-800/50 hover:border-blue-500/50 hover:bg-slate-900 transition-all group">
                    <span className="text-[11px] font-bold text-slate-400 group-hover:text-slate-200 block">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="glass rounded-[40px] border-white/5 shadow-2xl flex flex-col h-[700px] relative overflow-hidden bg-slate-950/40">
            <div className="px-10 py-5 border-b border-slate-800/60 flex items-center justify-between bg-slate-950/40">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${response.provider === 'openai' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                   {response.provider === 'openai' ? <Cpu size={16} /> : <Globe size={16} />}
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                  Motor: {response.provider === 'openai' ? 'OpenAI GPT-4o' : 'Google Gemini 2.5'}
                </span>
              </div>
              {response.text && !response.isInvalidKeyError && (
                <button 
                  onClick={() => { navigator.clipboard.writeText(response.text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-blue-400 transition-all border border-slate-800"
                >
                  {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  <span className="text-[9px] font-black uppercase tracking-widest">{copied ? 'Copiado' : 'Copiar'}</span>
                </button>
              )}
            </div>

            <div ref={scrollRef} className="flex-1 p-12 overflow-y-auto custom-scrollbar">
              {loading && !response.text ? (
                <div className="h-full flex flex-col items-center justify-center space-y-6">
                  <div className="w-20 h-20 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin"></div>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">Sincronizando Dados...</p>
                </div>
              ) : response.isInvalidKeyError ? (
                <div className="h-full flex flex-col items-center justify-center max-w-md mx-auto text-center space-y-8 animate-in slide-in-from-bottom-4">
                  <div className="w-20 h-20 rounded-[28px] bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shadow-2xl">
                    <Key size={40} />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tight">Falha na Autenticação</h3>
                    <p className="text-slate-400 text-[13px] leading-relaxed font-medium">
                      {response.text}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 text-left">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Como Corrigir:</p>
                    <ul className="text-[11px] text-slate-400 space-y-2">
                      <li className="flex gap-2">
                        <span className="text-blue-500 font-bold">1.</span> 
                        Se sua chave começa com <code className="text-emerald-400 font-bold">sk-...</code>, mude o motor para <b>ChatGPT</b> acima.
                      </li>
                      <li className="flex gap-2">
                        <span className="text-blue-500 font-bold">2.</span> 
                        Verifique se você copiou a chave completa sem espaços.
                      </li>
                    </ul>
                  </div>
                </div>
              ) : response.isQuotaError ? (
                <div className="h-full flex flex-col items-center justify-center max-w-md mx-auto text-center space-y-6">
                  <ShieldAlert size={48} className="text-amber-500" />
                  <h3 className="text-xl font-black text-white italic uppercase tracking-tight">Limite de Cota (429)</h3>
                  <p className="text-slate-400 text-xs leading-relaxed font-medium">{response.text}</p>
                  <button onClick={() => setProvider('openai')} className="px-8 py-3 bg-emerald-600 text-white text-[10px] font-black uppercase rounded-xl shadow-lg shadow-emerald-600/20">Usar ChatGPT (OpenAI)</button>
                </div>
              ) : response.text ? (
                <div className="max-w-3xl pb-20">
                  <FormattedAIResponse text={response.text} />
                  {response.sources.length > 0 && (
                    <div className="mt-16 pt-10 border-t border-slate-800/60">
                      <h5 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-6 flex items-center gap-3"><Globe size={14} /> Inteligência de Busca Ativa</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {response.sources.map((src, i) => (
                          <a key={i} href={src.uri} target="_blank" rel="noopener noreferrer" className="p-4 bg-slate-900/40 border border-slate-800 hover:border-blue-500/40 rounded-2xl transition-all group flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 group-hover:text-slate-200 truncate pr-4">{src.title}</span>
                            <ExternalLink size={12} className="text-slate-700 group-hover:text-blue-500" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                  <Search size={48} className="text-slate-700 mb-6" />
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Aguardando Comando Estratégico</p>
                </div>
              )}
            </div>

            <div className="p-8 bg-slate-950/80 border-t border-slate-800/60 backdrop-blur-md">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleConsult(); }}
                className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-[24px] border border-slate-800 focus-within:border-blue-500/50 transition-all shadow-inner"
              >
                <input 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Solicite uma análise ou pesquisa de mercado..."
                  className="flex-1 bg-transparent border-none outline-none px-6 py-3 text-slate-200 placeholder:text-slate-700 text-sm font-bold tracking-tight"
                />
                <button 
                  disabled={loading || !prompt.trim()}
                  type="submit"
                  className={`px-8 py-4 ${response.provider === 'openai' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-blue-600 hover:bg-blue-500'} text-white rounded-[18px] transition-all shadow-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2`}
                >
                  {loading ? <RefreshCw className="animate-spin" size={16} /> : <><Send size={16} /> Consultar</>}
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
