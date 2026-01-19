
import React, { useState } from 'react';
import { useAdmin } from '../modules/admin/admin.store';
import { 
  Users, Search, ArrowLeft, Mail, Shield, Activity, Calendar, Building2
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminConsultants = () => {
  const { consultants, loading } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = consultants.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div className="flex items-center gap-6">
          <Link to="/admin" className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 hover:text-blue-600 transition-all shadow-sm">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-950 dark:text-white italic leading-none uppercase">Consultores <span className="text-blue-600 not-italic">Ativos</span></h1>
            <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.4em] mt-2">Métricas de Performance Individual</p>
          </div>
        </div>

        <div className="relative w-full max-w-md">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou id..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none text-xs font-bold shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(c => (
          <div key={c.userId} className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-200 dark:border-slate-800/40 card-shadow p-8 flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
               <Shield size={100} />
            </div>

            <div className="flex items-center gap-5 mb-8">
               <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center font-black text-2xl text-blue-600 border border-slate-100 dark:border-slate-700">
                  {c.name.charAt(0)}
               </div>
               <div>
                  <h4 className="text-xl font-black italic uppercase tracking-tighter text-slate-950 dark:text-white leading-none">{c.name}</h4>
                  <div className="flex items-center gap-2 mt-2">
                     <span className={`w-2 h-2 rounded-full ${c.status === 'ACTIVE' ? 'bg-emerald-500 shadow-[0_0_8px_emerald]' : 'bg-slate-400'}`}></span>
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{c.role}</span>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-8">
               <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 text-center">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center justify-center gap-1">
                     <Activity size={10} className="text-blue-600" /> Ações
                  </p>
                  <p className="text-xl font-black italic text-slate-950 dark:text-white">{c.taskCount}</p>
               </div>
               <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 text-center">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center justify-center gap-1">
                     <Building2 size={10} className="text-blue-600" /> CRM
                  </p>
                  <p className="text-xl font-black italic text-slate-950 dark:text-white">{c.companyCount}</p>
               </div>
               <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 text-center">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center justify-center gap-1">
                     <Calendar size={10} className="text-blue-600" /> Última
                  </p>
                  <p className="text-[9px] font-black text-slate-950 dark:text-white uppercase leading-tight">
                    {new Date(c.lastActionAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                  </p>
               </div>
            </div>

            <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
               <div className="flex items-center gap-3 text-slate-500">
                  <Mail size={14} />
                  <span className="text-[10px] font-bold truncate">{c.email}</span>
               </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && !loading && (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[48px] border border-dashed border-slate-200 dark:border-slate-800">
           <Users size={48} className="mx-auto text-slate-300 mb-6" />
           <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">Nenhum consultor encontrado para esta busca.</p>
        </div>
      )}
    </div>
  );
};

export default AdminConsultants;
