
import React, { useState } from 'react';
import { useStore } from '../store';
import { getGtmStrategy, generateActivityReport } from '../services/geminiService';
import { 
  BrainCircuit, 
  Send, 
  Sparkles, 
  Target, 
  FileCheck,
  RefreshCw,
  Copy,
  Check,
  BarChart3
} from 'lucide-react';

const AIAgent = () => {
  const store = useStore();
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [style, setStyle] = useState<'formal' | 'commercial' | 'persuasive' | 'simple'>('commercial');
  const [copied, setCopied] = useState(false);

  const handleConsult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;
    
    const userPrompt = prompt;
    setPrompt(''); // Limpa a caixa de mensagem imediatamente após o envio
    setLoading(true);
    
    const result = await getGtmStrategy(userPrompt, store, style);
    setResponse(result || '');
    setLoading(false);
  };

  const quickAction = async (type: string) => {
    setLoading(true);
    let result = '';
    if (type === 'report_week') {
      result = await generateActivityReport('semanal', store, style);
    } else if (type === 'report_month') {
      result = await generateActivityReport('mensal', store, style);
    } else if (type === 'strategy') {
      result = await getGtmStrategy("Baseado na minha agenda atual, quais são os 3 compromissos mais críticos que exigem minha atenção imediata?", store, style);
    }
    setResponse(result || '');
    setLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <div className="flex flex-col items-center text-center gap-4 mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20 border border-white/10">
          <BrainCircuit size={36} className="text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-black italic tracking-tight text-white uppercase">GTM AI Analyst</h2>
          <p className="text-slate-500 font-medium text-xs uppercase tracking-widest">Resumos de Agenda e Inteligência de Performance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass p-6 rounded-3xl border-white/5 shadow-xl">
            <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest mb-6">Relatórios de Atividade</h4>
            <div className="space-y-3">
              <button 
                onClick={() => quickAction('report_week')}
                className="w-full flex items-center gap-3 p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-2xl transition-all group"
              >
                <div className="p-2 rounded-lg bg-emerald-600/20 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-all"><FileCheck size={18} /></div>
                <div className="text-left">
                  <span className="block text-sm font-bold">Resumo Semanal</span>
                  <span className="text-[10px] text-slate-500">Análise de eventos e agenda</span>
                </div>
              </button>
              <button 
                onClick={() => quickAction('report_month')}
                className="w-full flex items-center gap-3 p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-2xl transition-all group"
              >
                <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all"><BarChart3 size={18} /></div>
                <div className="text-left">
                  <span className="block text-sm font-bold">Balanço Mensal</span>
                  <span className="text-[10px] text-slate-500">Performance da agenda</span>
                </div>
              </button>
              <button 
                onClick={() => quickAction('strategy')}
                className="w-full flex items-center gap-3 p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-2xl transition-all group"
              >
                <div className="p-2 rounded-lg bg-purple-600/20 text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-all"><Target size={18} /></div>
                <div className="text-left">
                  <span className="block text-sm font-bold">Prioridade do Dia</span>
                  <span className="text-[10px] text-slate-500">Foco nos eventos críticos</span>
                </div>
              </button>
            </div>

            <div className="mt-8">
              <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest mb-4">Estilo do Relatório</h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'formal', label: 'Executivo' },
                  { id: 'commercial', label: 'Vendas' },
                  { id: 'persuasive', label: 'Persuasivo' },
                  { id: 'simple', label: 'Simplificado' }
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStyle(s.id as any)}
                    className={`py-2 px-3 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${style === s.id ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500'}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="glass p-2 rounded-[32px] border-white/5 shadow-2xl min-h-[550px] flex flex-col">
            <div className="p-8 flex-1 flex flex-col">
              {response ? (
                <div className="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-800/60">
                    <div className="flex items-center gap-3 text-blue-400">
                      <Sparkles size={20} />
                      <span className="text-xs font-black uppercase tracking-[0.2em]">Análise Gerada pela IA</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={copyToClipboard}
                        className="p-2.5 bg-slate-800/50 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-blue-400 transition-all border border-slate-700/50"
                      >
                        {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                      </button>
                      <button 
                        onClick={() => quickAction('report_week')} // Atalho para regerar resumo semanal se clicado aqui
                        className="p-2.5 bg-slate-800/50 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-indigo-400 transition-all border border-slate-700/50"
                      >
                        <RefreshCw size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed whitespace-pre-wrap text-sm font-medium">
                    {response}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
                  <div className="w-20 h-20 rounded-3xl bg-slate-900 flex items-center justify-center text-slate-700 mb-8 border border-slate-800/50 shadow-inner">
                    <BrainCircuit size={40} />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-white">Precisa de um resumo da sua agenda?</h3>
                  <p className="text-slate-500 max-w-sm text-sm leading-relaxed">
                    Clique nas ações rápidas para gerar um relatório semanal/mensal ou pergunte sobre compromissos específicos registrados no seu calendário.
                  </p>
                </div>
              )}

              <form onSubmit={handleConsult} className="mt-auto pt-8 border-t border-slate-800/60 flex items-end gap-3">
                <div className="flex-1 bg-slate-950/50 p-4 rounded-2xl border border-slate-800 focus-within:border-blue-500/50 transition-all shadow-inner">
                  <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ex: Resuma o que eu tenho agendado para esta semana..."
                    className="w-full bg-transparent border-none outline-none resize-none text-slate-200 placeholder:text-slate-600 h-16 text-sm font-medium"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleConsult(e as any);
                      }
                    }}
                  />
                </div>
                <button 
                  disabled={loading || !prompt.trim()}
                  type="submit"
                  className="p-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:bg-slate-800 text-white rounded-2xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center min-w-[60px]"
                >
                  {loading ? <RefreshCw className="animate-spin" size={24} /> : <Send size={24} />}
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
