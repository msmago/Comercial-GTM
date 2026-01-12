
import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { getGtmStrategyStream, AIResponse } from '../services/geminiService';
import { 
  BrainCircuit, Send, RefreshCw, Copy, Check, 
  Lightbulb, Search, Cpu, Sparkles, Globe
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
                <span className="h-px flex-1 bg-gradient-to-r from-cyan-600/50 to-transparent"></span>
                <h3 className="text-cyan-400 font-black text-[10px] uppercase tracking-[0.4em]">
                  {trimmed.replace('###', '').trim()}
                </h3>
              </div>
            </div>
          );
        }
        
        if (trimmed.startsWith('-')) {
          return (
            <div key={index} className="flex gap-4 pl-2 py-1 group">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-600 mt-2 flex-shrink-0 group-hover:scale-150 transition-transform"></div>
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
  const [response, setResponse] = useState<AIResponse>({ text: '', sources: [], provider: 'pollinations' });
  const [loading, setLoading] = useState(false);
  const [style, setStyle] = useState('commercial');
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
    setResponse({ text: '', sources: [], provider: 'pollinations' });
    
    await getGtmStrategyStream(
      textToSubmit, 
      store, 
      (data) => setResponse(data), 
      style
    );
    
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-[22px] flex items-center justify-center shadow-2xl border border-white/10 rotate-3 transition-transform hover:rotate-0">
            <Globe size={32} className="text-white animate-pulse" />
          </div>
          <div>
            <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase leading-none">GTM AI Agent</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_cyan]"></span>
              <p className="text-slate-500 font-black text-[9px] uppercase tracking-[0.2em]">
                {loading ? 'Processando...' : 'Motor Open AI Gratuito Online'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-6 py-2 bg-slate-900/50 rounded-full border border-slate-800">
          <Sparkles size={14} className="text-cyan-400" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Acesso Ilimitado & Grátis</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass p-8 rounded-[32px] border-white/5 shadow-2xl space-y-8 bg-slate-900/40">
            <div>
              <h4 className="font-black text-[10px] text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                <Lightbulb size={14} className="text-amber-500" /> Sugestões
              </h4>
              <div className="space-y-3">
                {[
                  { label: "Plano de ROI", p: "Gere um plano de ROI para parcerias com IES." },
                  { label: "Script de Vendas", p: "Crie um script persuasivo para vender tecnologia para educação." }
                ].map((item, i) => (
                  <button key={i} onClick={() => handleConsult(item.p)} className="w-full text-left p-4 rounded-2xl bg-slate-950/40 border border-slate-800/50 hover:border-cyan-500/50 hover:bg-slate-900 transition-all group">
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
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-500">
                   <Cpu size={16} />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                  Inteligência Infinity AI
                </span>
              </div>
              {response.text && (
                <button 
                  onClick={() => { navigator.clipboard.writeText(response.text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-cyan-400 transition-all border border-slate-800"
                >
                  {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  <span className="text-[9px] font-black uppercase tracking-widest">{copied ? 'Copiado' : 'Copiar'}</span>
                </button>
              )}
            </div>

            <div ref={scrollRef} className="flex-1 p-12 overflow-y-auto custom-scrollbar">
              {loading && !response.text ? (
                <div className="h-full flex flex-col items-center justify-center space-y-6">
                  <div className="w-20 h-20 border-4 border-cyan-500/10 border-t-cyan-500 rounded-full animate-spin shadow-[0_0_20px_rgba(6,182,212,0.2)]"></div>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">Conectando ao Fluxo de Dados...</p>
                </div>
              ) : response.text ? (
                <div className="max-w-3xl pb-20">
                  <FormattedAIResponse text={response.text} />
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                  <Search size={48} className="text-slate-700 mb-6" />
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">IA Pronta e sem limites</p>
                </div>
              )}
            </div>

            <div className="p-8 bg-slate-950/80 border-t border-slate-800/60 backdrop-blur-md">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleConsult(); }}
                className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-[24px] border border-slate-800 focus-within:border-cyan-500/50 transition-all shadow-inner"
              >
                <input 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Pergunte qualquer coisa sobre estratégia de GTM..."
                  className="flex-1 bg-transparent border-none outline-none px-6 py-3 text-slate-200 placeholder:text-slate-700 text-sm font-bold tracking-tight"
                />
                <button 
                  disabled={loading || !prompt.trim()}
                  type="submit"
                  className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-[18px] transition-all shadow-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
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
