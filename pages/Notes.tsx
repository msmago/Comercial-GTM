
import React, { useState, useEffect } from 'react';
import { StickyNote, Trash2, Save, Sparkles, Clock } from 'lucide-react';

const Notes = () => {
  const [note, setNote] = useState(() => {
    return localStorage.getItem('gtm_pro_scratchpad') || '';
  });
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem('gtm_pro_scratchpad', note);
      setLastSaved(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearTimeout(timeout);
  }, [note]);

  return (
    <div className="h-full flex flex-col space-y-8 pb-20 animate-in fade-in duration-700">
      <div className="flex items-center justify-between px-2">
        <div>
          <h1 className="text-5xl font-black tracking-tighter italic uppercase text-slate-950 dark:text-white leading-none">Rascunhos <span className="text-blue-600 not-italic">Estratégicos</span></h1>
          <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mt-4">Espaço para notas voláteis de reunião</p>
        </div>
        <div className="flex items-center gap-4">
          {lastSaved && (
            <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
              <Clock size={12} className="text-emerald-500" />
              Auto-salvo às {lastSaved}
            </div>
          )}
          <button 
            onClick={() => { if(confirm('Limpar rascunho?')) setNote(''); }}
            className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-rose-600 transition-all shadow-sm"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-[500px] bg-white dark:bg-slate-900 rounded-[56px] border border-slate-200 dark:border-slate-800 shadow-6xl overflow-hidden relative">
        <div className="absolute top-10 left-10 opacity-5 pointer-events-none">
          <StickyNote size={120} className="text-slate-950 dark:text-white" />
        </div>
        
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Comece a digitar seus insights aqui... (Dados persistentes neste navegador)"
          className="w-full h-full p-16 bg-transparent outline-none border-none text-xl font-medium text-slate-800 dark:text-slate-200 leading-[1.8] resize-none relative z-10"
        />
        
        <div className="absolute bottom-10 right-10 p-6 bg-blue-600 text-white rounded-[24px] shadow-2xl flex items-center gap-3 animate-bounce">
          <Sparkles size={18} />
          <span className="text-[9px] font-black uppercase tracking-widest">Foco Operacional</span>
        </div>
      </div>
    </div>
  );
};

export default Notes;
