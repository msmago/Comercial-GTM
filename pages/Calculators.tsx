
import React, { useState, useMemo } from 'react';
import { Calculator, TrendingUp, Users, DollarSign, Target } from 'lucide-react';

const Calculators = () => {
  // ROI Calc
  const [investment, setInvestment] = useState(10000);
  const [returnVal, setReturnVal] = useState(25000);
  
  // CAC Calc
  const [mktSpend, setMktSpend] = useState(5000);
  const [newCustomers, setNewCustomers] = useState(50);

  const roi = useMemo(() => ((returnVal - investment) / investment * 100).toFixed(2), [investment, returnVal]);
  const cac = useMemo(() => (mktSpend / newCustomers).toFixed(2), [mktSpend, newCustomers]);

  return (
    <div className="space-y-12 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col gap-4">
        <h1 className="text-5xl font-black tracking-tighter italic uppercase text-slate-950 dark:text-white leading-none">Calculadoras <span className="text-blue-600 not-italic">Comerciais</span></h1>
        <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">Ferramentas de análise financeira local</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* ROI Calculator Card */}
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-slate-200 dark:border-slate-800 shadow-2xl space-y-8">
          <div className="flex items-center gap-4 text-blue-600">
            <TrendingUp size={24} />
            <h3 className="text-xl font-black uppercase italic tracking-tighter">Análise de ROI</h3>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Investimento Total (R$)</label>
              <input 
                type="number" 
                value={investment} 
                onChange={(e) => setInvestment(Number(e.target.value))}
                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold text-lg outline-none focus:border-blue-600"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Retorno Bruto (R$)</label>
              <input 
                type="number" 
                value={returnVal} 
                onChange={(e) => setReturnVal(Number(e.target.value))}
                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold text-lg outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Retorno sobre Investimento</span>
            <span className={`text-4xl font-black italic tracking-tighter ${Number(roi) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {roi}%
            </span>
          </div>
        </div>

        {/* CAC Calculator Card */}
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-slate-200 dark:border-slate-800 shadow-2xl space-y-8">
          <div className="flex items-center gap-4 text-blue-600">
            <Users size={24} />
            <h3 className="text-xl font-black uppercase italic tracking-tighter">Custo de Aquisição (CAC)</h3>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Investimento em Marketing (R$)</label>
              <input 
                type="number" 
                value={mktSpend} 
                onChange={(e) => setMktSpend(Number(e.target.value))}
                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold text-lg outline-none focus:border-blue-600"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Novos Parceiros / Alunos</label>
              <input 
                type="number" 
                value={newCustomers} 
                onChange={(e) => setNewCustomers(Number(e.target.value))}
                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold text-lg outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Custo por Unidade</span>
            <span className="text-4xl font-black italic tracking-tighter text-blue-600">
              R$ {cac}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Tips Tooltip style */}
      <div className="bg-slate-950 p-12 rounded-[56px] text-white/50 border border-white/5 shadow-6xl relative overflow-hidden group">
        <Target className="absolute -right-20 -top-20 w-80 h-80 text-blue-600 opacity-5 group-hover:scale-110 transition-transform duration-1000" />
        <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500 mb-4">GTM Insights</h4>
        <p className="max-w-3xl text-sm font-medium leading-relaxed italic">
          "O ROI é o coração da operação. Para IES, considere não apenas o retorno imediato da matrícula, mas o LTV (Lifetime Value) do aluno ao longo de todo o curso. Um CAC saudável é geralmente 3x menor que o LTV."
        </p>
      </div>
    </div>
  );
};

export default Calculators;
