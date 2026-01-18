
import React, { useState, useRef, useEffect } from 'react';
import { useCRM } from '../modules/crm/crm.store';
import { useKanban } from '../modules/kanban/kanban.store';
import { useInventory } from '../modules/inventory/inventory.store';
import { getGtmStrategyStream, AIResponse } from '../services/geminiService';
import { 
  Send, RefreshCw, Copy, Check, 
  Lightbulb, Search, Cpu, Sparkles, Globe, X
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
            <div key={index} className="pt-8 pb-2">
              <div className="flex items-center gap-4 mb-3">
                <span className="h-px flex-1 bg-gradient-to-r from-blue-600/30 to-transparent"></span>
                <h3 className="text-blue-600 dark:text-cyan-400 font-black text-[10px] uppercase tracking-[0.4em]">
                  {trimmed.replace('###', '').trim()}
                </h3>
              </div>
            </div>
          );
        }
        
        if (trimmed.startsWith('-')) {
          return (
            <div key={index} className="flex gap-4 pl-2 py-1 group">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-cyan-600 mt-2 flex-shrink-0 group-hover:scale-150 transition-transform"></div>
              <p className="text-slate-800 dark:text-slate-300 text-sm leading-relaxed font-bold">{trimmed.replace('-', '').trim()}</p>
            </div>
          );
        }
        
        return <p key={index} className="text-slate-700 dark:text-slate-400 text-[14px] leading-[1.8] font-medium">{trimmed}</p>;
      })}
    </div>
  );
};

const AIAgent = () => {
  const { companies } = useCRM();
  const { tasks, columns } = useKanban();
  const { inventory } = useInventory();

  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState<AIResponse>({ text: '', sources: [], provider: 'gemini' });
  const [loading, setLoading] = useState(false);
  const [style] = useState('commercial');
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
    setResponse({ text: '', sources: [], provider: 'gemini' });

    const contextData = {
      companiesCount: companies.length,
      tasksCount: tasks.length,
      columnsCount: columns.length,
      inventoryCount: inventory.length,
      criticalInventory: inventory.filter(i => i.quantity < i.minQuantity).length,
      topCompanies: companies.slice(0, 5).map(c => ({ name: c.name, status: c.status }))
    };

    await getGtmStrategyStream(textToSubmit, contextData, (data) => setResponse(data), style);
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-blue-600 dark:bg-gradient-to-br dark:from-cyan-600 dark:to-blue-700 rounded-[22px] flex items-center justify-center shadow-lg border border-white/10 rotate-3 transition-transform hover:rotate-0">
            <Globe size={32} className="text-white animate-pulse" />
          </div>
          <div>
            <h2 className="text-3xl font-black italic tracking-tighter text-slate-950 dark:text-white uppercase leading-none">Analista IA</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_blue]"></span>
              <p className="text-slate-600 dark:text-slate-500 font-black text-[9px] uppercase tracking-[0.3em]">Motor Cognitivo Gemini 3 Pro</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 px-6 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full shadow-sm">
          <Sparkles size={14} className="text-blue-600" />
          <span className="text-[10px] font-black text-slate-700 dark:text-slate-400 uppercase tracking-widest">Consultoria Estratégica Ativa</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900/40 p-8 rounded-[32px] border border-slate-200 dark:border-white/5 shadow-xl space-y-8">
            <h4 className="font-black text-[10px] text-slate-700 dark:text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2"><Lightbulb size={14} className="text-amber-500" /> Sugestões</h4>
            <div className="space-y-3">
              {[
                { label: "Análise de ROI", p: "Gere um plano de ROI para parcerias com IES." },
                { label: "Roteiro de Vendas", p: "Crie um roteiro de vendas focado em fechamento de convênios." }
              ].map((item, i) => (
                <button key={i} onClick={() => handleConsult(item.p)} className="w-full text-left p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 hover:border-blue-600 transition-all group shadow-sm">
                  <span className="text-xs font-black text-slate-800 dark:text-slate-300 group-hover:text-blue-600 block leading-tight">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-slate-950/40 rounded-[40px] border border-slate-200 dark:border-white/5 shadow-2xl flex flex-col h-[700px] overflow-hidden">
            <div className="px-10 py-5 border-b border-slate-200 dark:border-slate-800/60 flex items-center justify-between bg-slate-50 dark:bg-slate-950/40">
              <div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-blue-100 dark:bg-cyan-500/10 text-blue-600 dark:text-cyan-500"><Cpu size={16} /></div><span className="text-[10px] font-black text-slate-800 dark:text-slate-400 uppercase tracking-[0.3em]">Cérebro GTM PRO</span></div>
              {response.text && (
                <button onClick={() => { navigator.clipboard.writeText(response.text); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-500 hover:text-blue-600 transition-all border border-slate-200 dark:border-slate-800 shadow-sm">
                  {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  <span className="text-[9px] font-black uppercase tracking-widest">{copied ? 'Copiado' : 'Copiar'}</span>
                </button>
              )}
            </div>

            <div ref={scrollRef} className="flex-1 p-12 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-950/20">
              {loading && !response.text ? (
                <div className="h-full flex flex-col items-center justify-center space-y-6">
                  <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                  <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] animate-pulse">Sintetizando Dados Estratégicos...</p>
                </div>
              ) : response.text ? (
                <div className="max-w-3xl pb-20"><FormattedAIResponse text={response.text} /></div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                  <Search size={48} className="text-slate-300 mb-6" />
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Aguardando Consulta Estratégica</p>
                </div>
              )}
            </div>

            <div className="p-8 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800/60 backdrop-blur-md">
              <form onSubmit={(e) => { e.preventDefault(); handleConsult(); }} className="flex items-center gap-4 bg-white dark:bg-slate-900/50 p-2 rounded-[24px] border border-slate-200 dark:border-slate-800 focus-within:border-blue-600 transition-all shadow-md">
                <input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Digite sua dúvida estratégica..." className="flex-1 bg-transparent border-none outline-none px-6 py-3 text-slate-900 dark:text-slate-200 placeholder:text-slate-400 text-sm font-bold tracking-tight" />
                <button disabled={loading || !prompt.trim()} type="submit" className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-[18px] transition-all shadow-lg font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                  {loading ? <RefreshCw className="animate-spin" size={16} /> : <><Send size={16} /> Analisar</>}
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
