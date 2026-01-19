
import React, { useState } from 'react';
import { BookOpen, Copy, Check, MessageSquare, ShieldAlert, Zap, Search } from 'lucide-react';

interface Script {
  id: string;
  category: 'prospect' | 'objection' | 'followup';
  title: string;
  content: string;
}

const DEFAULT_SCRIPTS: Script[] = [
  {
    id: '1',
    category: 'prospect',
    title: 'Abordagem Fria (Diretoria)',
    content: 'Olá, [Nome]! Sou o [Seu Nome] da GTM PRO. Notei que a [IES] tem um potencial incrível de expansão no polo [Região]. Gostaria de compartilhar como estamos ajudando outras instituições a otimizarem a captação através de parcerias estratégicas. Teria 5 minutos na terça?'
  },
  {
    id: '2',
    category: 'objection',
    title: 'Objeção: "Sem Verba"',
    content: 'Entendo perfeitamente que o orçamento está fechado. Justamente por isso nosso foco é performance: nossa solução atua na recuperação de leads que vocês já possuem, sem custo adicional de mídia. Podemos analisar esse cenário?'
  },
  {
    id: '3',
    category: 'followup',
    title: 'Follow-up de Proposta',
    content: 'Oi, [Nome]! Passando para manter nosso radar ligado. Conseguiu avaliar os pontos de convênio que discutimos na última reunião? Se precisar, posso ajustar os termos para facilitar a aprovação interna.'
  }
];

const Playbooks = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Script['category'] | 'all'>('all');

  const handleCopy = (script: Script) => {
    navigator.clipboard.writeText(script.content);
    setCopiedId(script.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredScripts = DEFAULT_SCRIPTS.filter(s => 
    (activeTab === 'all' || s.category === activeTab) &&
    (s.title.toLowerCase().includes(searchTerm.toLowerCase()) || s.content.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getCategoryStyle = (cat: Script['category']) => {
    switch(cat) {
      case 'prospect': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
      case 'objection': return 'text-rose-600 bg-rose-50 dark:bg-rose-900/20';
      case 'followup': return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20';
    }
  };

  return (
    <div className="space-y-12 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div>
          <h1 className="text-5xl font-black tracking-tighter italic uppercase text-slate-950 dark:text-white leading-none">Playbooks <span className="text-blue-600 not-italic">de Elite</span></h1>
          <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mt-4">Roteiros e Quebra de Objeções Prontos para Uso</p>
        </div>
        <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-2 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-xl">
          {['all', 'prospect', 'objection', 'followup'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-slate-950 dark:bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              {tab === 'all' ? 'Todos' : tab === 'prospect' ? 'Abordagem' : tab === 'objection' ? 'Objeções' : 'Follow-up'}
            </button>
          ))}
        </div>
      </div>

      <div className="relative max-w-2xl px-2">
        <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Pesquisar por gatilho, objeção ou roteiro..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-16 pr-8 py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[28px] outline-none font-bold text-sm shadow-2xl focus:ring-4 focus:ring-blue-600/5 transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredScripts.map((script) => (
          <div key={script.id} className="bg-white dark:bg-slate-900 p-8 rounded-[48px] border border-slate-200 dark:border-slate-800 shadow-6xl flex flex-col group hover:translate-y-[-4px] transition-all">
            <div className="flex items-center justify-between mb-8">
              <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${getCategoryStyle(script.category)}`}>
                {script.category === 'prospect' ? 'Prospecção' : script.category === 'objection' ? 'Objeção' : 'Follow-up'}
              </span>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl text-slate-400">
                {script.category === 'prospect' ? <Zap size={18} /> : script.category === 'objection' ? <ShieldAlert size={18} /> : <MessageSquare size={18} />}
              </div>
            </div>

            <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-950 dark:text-white mb-6 leading-tight">{script.title}</h3>
            
            <div className="flex-1 bg-slate-50 dark:bg-slate-950/50 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 relative mb-8">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed italic line-clamp-6">
                "{script.content}"
              </p>
            </div>

            <button 
              onClick={() => handleCopy(script)}
              className={`w-full py-5 rounded-[22px] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${copiedId === script.id ? 'bg-emerald-600 text-white' : 'bg-slate-950 dark:bg-blue-600 text-white hover:bg-slate-800 dark:hover:bg-blue-500 shadow-xl'}`}
            >
              {copiedId === script.id ? (
                <><Check size={16} /> Conteúdo Copiado</>
              ) : (
                <><Copy size={16} /> Copiar Roteiro</>
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="bg-slate-50 dark:bg-slate-900/40 p-12 rounded-[56px] border border-slate-200 dark:border-slate-800 text-center">
        <BookOpen className="mx-auto text-blue-600 mb-6" size={40} />
        <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-2">Manual de Boas Práticas</h4>
        <p className="max-w-2xl mx-auto text-xs text-slate-500 font-medium leading-relaxed">
          Sempre personalize os placeholders como [Nome] e [IES] antes de enviar. O sucesso do GTM está na conexão humana, não apenas no texto. Estes roteiros são bases sólidas para acelerar sua digitação.
        </p>
      </div>
    </div>
  );
};

export default Playbooks;
