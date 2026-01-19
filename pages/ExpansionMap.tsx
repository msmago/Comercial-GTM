
import React, { useState } from 'react';
import { useCRM } from '../modules/crm/crm.store';
// Added Star to the imports from lucide-react
import { Map as MapIcon, Navigation, Target, Search, Building2, Layers, Star } from 'lucide-react';

const ExpansionMap = () => {
  const { companies } = useCRM();
  const [analyzing, setAnalyzing] = useState(false);

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-slate-950 dark:bg-blue-600 rounded-[24px] flex items-center justify-center text-white shadow-2xl">
            <MapIcon size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter text-slate-950 dark:text-white uppercase leading-none">Mapa de Expansão</h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-2">Inteligência Geoespacial GTM</p>
          </div>
        </div>
        <button 
          onClick={() => setAnalyzing(true)}
          className="px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black text-[11px] uppercase tracking-widest rounded-3xl shadow-2xl transition-all flex items-center gap-3 active:scale-95"
        >
          <Target size={20} className={analyzing ? 'animate-ping' : ''} />
          {analyzing ? 'Mapeando Oportunidades...' : 'Análise de Território IA'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-3">
          <div className="bg-slate-200 dark:bg-slate-900 rounded-[56px] h-[650px] border border-slate-200 dark:border-slate-800 shadow-6xl overflow-hidden relative group">
             {/* Placeholder para Integração com Google Maps SDK futuramente */}
             <div className="absolute inset-0 flex flex-col items-center justify-center p-20 text-center space-y-8 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-950">
                <div className="w-32 h-32 rounded-full border-4 border-dashed border-blue-600/30 flex items-center justify-center animate-[spin_20s_linear_infinite]">
                   <Layers size={48} className="text-blue-600/20" />
                </div>
                <div className="max-w-md">
                   <h3 className="text-2xl font-black italic text-slate-950 dark:text-white uppercase tracking-tighter mb-4">Camada Analítica Ativa</h3>
                   <p className="text-sm text-slate-500 font-medium leading-relaxed italic">
                      "Utilizando Grounding do Google Maps para identificar instituições de ensino em um raio de 50km dos seus parceiros atuais."
                   </p>
                </div>
                
                {/* Visualização de 'Pins' simulados */}
                <div className="absolute top-1/4 left-1/3 w-4 h-4 bg-blue-600 rounded-full shadow-[0_0_20px_blue] animate-bounce"></div>
                <div className="absolute top-1/2 right-1/4 w-4 h-4 bg-emerald-500 rounded-full shadow-[0_0_20px_emerald] animate-pulse"></div>
                <div className="absolute bottom-1/3 left-1/2 w-4 h-4 bg-rose-500 rounded-full shadow-[0_0_20px_rose]"></div>
             </div>
             
             <div className="absolute bottom-10 left-10 right-10 flex gap-4">
                <div className="flex-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-[32px] border border-white/20 shadow-2xl flex items-center gap-6">
                   <div className="w-12 h-12 rounded-2xl bg-slate-950 text-white flex items-center justify-center shadow-lg"><Navigation size={20} /></div>
                   <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Localização Principal</p>
                      <p className="text-sm font-black text-slate-950 dark:text-white uppercase">Hub São Paulo - SP</p>
                   </div>
                </div>
                <div className="flex-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-[32px] border border-white/20 shadow-2xl flex items-center gap-6">
                   <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg"><Building2 size={20} /></div>
                   <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Market Share Alvo</p>
                      <p className="text-sm font-black text-slate-950 dark:text-white uppercase">24.2% das IES Locais</p>
                   </div>
                </div>
             </div>
          </div>
        </div>

        <div className="space-y-8">
           <div className="bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-slate-200 dark:border-slate-800 shadow-2xl">
              <h3 className="text-xl font-black italic text-slate-950 dark:text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
                 <Search size={18} className="text-blue-600" />
                 Radar GTM
              </h3>
              <div className="space-y-4">
                 {companies.slice(0, 5).map(c => (
                    <div key={c.id} className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-between group cursor-pointer hover:border-blue-600 transition-all">
                       <div>
                          <p className="text-[10px] font-black text-slate-950 dark:text-white uppercase truncate w-32">{c.name}</p>
                          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">{c.targetIES}</p>
                       </div>
                       <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-blue-600 border border-slate-100 dark:border-slate-800 shadow-sm">
                          <Navigation size={14} />
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           <div className="bg-blue-600 p-10 rounded-[48px] text-white shadow-2xl shadow-blue-600/20 overflow-hidden relative">
              <Star className="absolute -top-10 -right-10 w-40 h-40 opacity-10" />
              <h4 className="text-lg font-black uppercase italic tracking-tighter mb-4">Dica do Analista IA</h4>
              <p className="text-xs font-medium leading-relaxed opacity-90">
                 "Identificamos um vácuo de parcerias na região de São Bernardo do Campo. Três IES locais não possuem convênio ativo. Recomendo prospecção imediata."
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ExpansionMap;
