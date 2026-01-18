
import React from 'react';
import { useAdmin } from '../modules/admin/admin.store';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';
import { 
  Users, Activity, Package, Building2, TrendingUp, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminStatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800/40 card-shadow transition-all hover:scale-[1.02]">
    <div className="flex items-center justify-between mb-6">
      <div className={`p-4 rounded-2xl ${color} text-white shadow-lg`}>
        <Icon size={24} />
      </div>
    </div>
    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.3em] mb-1">{title}</p>
    <h3 className="text-4xl font-black tracking-tighter text-slate-950 dark:text-white leading-none italic">{value}</h3>
  </div>
);

const AdminDashboard = () => {
  const { stats, consultants, loading } = useAdmin();

  const chartData = consultants
    .sort((a, b) => b.taskCount - a.taskCount)
    .slice(0, 5)
    .map(c => ({ name: c.name.split(' ')[0], total: c.taskCount }));

  if (loading || !stats) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Activity size={48} className="text-blue-600 animate-pulse" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Acessando Inteligência Global...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div>
          <h1 className="text-6xl font-black tracking-tighter text-slate-950 dark:text-white italic leading-none uppercase">Admin <span className="text-blue-600 not-italic">Panel</span></h1>
          <p className="text-slate-500 font-black uppercase text-[11px] tracking-[0.4em] mt-4 flex items-center gap-3">
             <TrendingUp size={14} className="text-emerald-500" /> Monitoramento em Tempo Real do Ecossistema GTM
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatCard title="Total de Ações" value={stats.totalTasks} icon={Activity} color="bg-slate-950" />
        <AdminStatCard title="Consultores" value={stats.activeConsultants} icon={Users} color="bg-blue-600" />
        <AdminStatCard title="Parceiros IES" value={stats.totalCompanies} icon={Building2} color="bg-emerald-600" />
        <AdminStatCard title="Alertas Estoque" value={stats.criticalInventoryItems} icon={Package} color="bg-rose-600" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-slate-200 dark:border-slate-800/40 card-shadow">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-black italic text-slate-950 dark:text-white uppercase tracking-tighter flex items-center gap-4">
              <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
              Performance do Time
            </h3>
            <Link to="/admin/consultants" className="text-[10px] font-black uppercase text-blue-600 hover:underline flex items-center gap-1">
              Ver Detalhes <ChevronRight size={14} />
            </Link>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 900}} />
                <YAxis hide />
                <Tooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                <Bar dataKey="total" fill="#2563eb" radius={[10, 10, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-slate-200 dark:border-slate-800/40 card-shadow">
          <h3 className="text-2xl font-black italic text-slate-950 dark:text-white uppercase tracking-tighter mb-10">Ranking Executivo</h3>
          <div className="space-y-4">
            {consultants.slice(0, 4).map((c, i) => (
              <div key={c.userId} className="flex items-center justify-between p-5 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-black text-xs">
                     {i + 1}
                   </div>
                   <div>
                     <p className="text-[10px] font-black uppercase text-slate-900 dark:text-white">{c.name.split(' ')[0]}</p>
                     <p className="text-[8px] font-bold text-slate-500 uppercase">{c.role}</p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-xl font-black italic text-blue-600">{c.taskCount}</p>
                   <p className="text-[8px] font-black text-slate-400 uppercase">Ações</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
