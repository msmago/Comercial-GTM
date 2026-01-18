
import React, { useMemo } from 'react';
import { useAuth } from '../modules/auth/auth.store';
import { useKanban } from '../modules/kanban/kanban.store';
import { useCRM } from '../modules/crm/crm.store';
import { useInventory } from '../modules/inventory/inventory.store';
import { useCalendar } from '../modules/calendar/calendar.store';
import { PipelineStatus } from '../modules/crm/crm.types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { 
  Building2, 
  CalendarClock, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Medal,
  Zap,
  Target
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, trend, trendValue }: any) => (
  <div className="bg-white dark:bg-slate-900 p-10 rounded-[40px] border border-slate-200 dark:border-slate-800/40 card-shadow group transition-all hover:translate-y-[-4px]">
    <div className="flex items-center justify-between mb-10">
      <div className={`p-5 rounded-3xl ${color} text-white shadow-2xl`}>
        <Icon size={28} />
      </div>
      {trend && (
        <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${trend === 'up' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10'}`}>
          {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          {trendValue}
        </div>
      )}
    </div>
    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.3em] mb-2">{title}</p>
    <h3 className="text-5xl font-black tracking-tighter text-slate-950 dark:text-white leading-none italic">{value}</h3>
  </div>
);

const Dashboard = () => {
  const { user: currentUser } = useAuth();
  const { tasks } = useKanban();
  const { companies } = useCRM();
  const { inventory } = useInventory();
  const { events } = useCalendar();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status.toLowerCase().includes('concluido') || t.status.toLowerCase().includes('done')).length;
  const taskEfficiency = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const totalCompanies = companies.length;
  const partners = companies.filter(c => c.status === PipelineStatus.PARTNER).length;
  const conversionRate = totalCompanies > 0 ? (partners / totalCompanies) * 100 : 0;

  const performanceGTM = totalTasks + totalCompanies > 0 
    ? ((taskEfficiency + conversionRate) / 2).toFixed(1) 
    : "0.0";

  const pipelineStats = [
    { name: 'PROSPECÇÃO', count: companies.filter(c => c.status === PipelineStatus.PROSPECT).length, color: '#64748b' },
    { name: 'CONTATADO', count: companies.filter(c => c.status === PipelineStatus.CONTACTED).length, color: '#3b82f6' },
    { name: 'NEGOCIAÇÃO', count: companies.filter(c => c.status === PipelineStatus.NEGOTIATION).length, color: '#8b5cf6' },
    { name: 'PARCEIRO', count: companies.filter(c => c.status === PipelineStatus.PARTNER).length, color: '#10b981' },
    { name: 'CANCELADO', count: companies.filter(c => c.status === PipelineStatus.CHURN).length, color: '#f43f5e' },
  ];

  const rankingData = useMemo(() => {
    const stats = events.reduce((acc: any, event) => {
      const creator = event.createdBy || 'Sistema';
      acc[creator] = (acc[creator] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(stats)
      .map(([name, count]) => ({ name, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [events]);

  const maxPoints = rankingData[0]?.count || 1;

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 px-2">
        <div>
          <h1 className="text-7xl font-black tracking-tighter text-slate-950 dark:text-white italic leading-none uppercase">
            {getGreeting()}, <span className="text-blue-600 not-italic">{currentUser?.name.split(' ')[0]}</span>.
          </h1>
          <div className="flex items-center gap-4 mt-8">
             <span className="w-12 h-px bg-slate-300 dark:bg-slate-800"></span>
             <p className="text-slate-500 font-black uppercase text-[12px] tracking-[0.4em]">Painel de Controle Operacional</p>
          </div>
        </div>
        <div className="flex items-center gap-6 bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-xl">
           <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-xl animate-pulse">
              <Zap size={24} />
           </div>
           <div className="pr-8">
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mb-1">Conexão</p>
              <p className="text-sm font-black text-slate-950 dark:text-white uppercase">Dados Sincronizados</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard title="Funil Ativo" value={totalCompanies} icon={Building2} color="bg-slate-950" trend="up" trendValue="+12.4%" />
        <StatCard title="Agenda Mensal" value={events.length} icon={CalendarClock} color="bg-blue-600" trend="up" trendValue="+5.1%" />
        <StatCard title="Pontuação GTM" value={`${performanceGTM}%`} icon={Target} color="bg-indigo-600" trend="up" trendValue="Alta" />
        <StatCard title="Itens Críticos" value={inventory.filter(i => i.quantity < i.minQuantity).length} icon={AlertTriangle} color="bg-rose-600" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <div className="xl:col-span-2 bg-white dark:bg-slate-900 p-12 rounded-[56px] border border-slate-200 dark:border-slate-800/40 card-shadow">
          <h3 className="text-3xl font-black italic text-slate-950 dark:text-white uppercase tracking-tighter mb-12 flex items-center gap-5">
            <span className="w-2.5 h-10 bg-blue-600 rounded-full"></span>
            Fluxo de Conversão (Funil)
          </h3>
          <div className="w-full h-[400px] min-h-[400px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={pipelineStats} 
                layout="vertical" 
                margin={{ left: 20, right: 60, top: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} strokeOpacity={0.1} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 11, fontWeight: 900}} 
                  width={120} 
                />
                <Tooltip 
                  cursor={{fill: 'rgba(0,0,0,0.02)'}} 
                  contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'}} 
                />
                <Bar dataKey="count" radius={[0, 20, 20, 0]} barSize={40}>
                  {pipelineStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 p-12 rounded-[56px] border border-slate-200 dark:border-slate-800/40 card-shadow">
          <h3 className="text-3xl font-black italic text-slate-950 dark:text-white uppercase tracking-tighter mb-10 leading-none">Ranking Operacional</h3>
          <div className="space-y-6">
            {rankingData.map((user, index) => (
              <div key={user.name} className="p-6 rounded-[32px] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:border-blue-500/30 transition-all">
                <div className="flex items-center gap-5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg border ${index === 0 ? 'bg-yellow-500 text-white shadow-xl' : 'bg-white dark:bg-slate-800 text-slate-400'}`}>
                    {index === 0 ? <Medal size={24} /> : index + 1}
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase text-slate-950 dark:text-white truncate max-w-[120px]">{user.name}</p>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Consultor Especialista</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black italic tracking-tighter text-slate-950 dark:text-white">{user.count}</span>
                  <div className="h-1.5 w-20 bg-slate-200 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{width: `${(user.count / maxPoints) * 100}%`}} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
