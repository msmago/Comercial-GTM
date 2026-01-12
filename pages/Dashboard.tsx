
import React from 'react';
import { useStore } from '../store';
import { PipelineStatus, TaskStatus } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { 
  TrendingUp, 
  Building2, 
  CalendarClock, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Trophy,
  User as UserIcon,
  Medal,
  BarChart3
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, trend, trendValue }: any) => (
  <div className="glass p-6 rounded-2xl relative overflow-hidden group border-white/5 shadow-lg">
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${color} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-slate-400 text-[10px] font-bold mb-1 uppercase tracking-[0.1em]">{title}</p>
        <h3 className="text-3xl font-black tracking-tight">{value}</h3>
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            {trend === 'up' ? <ArrowUpRight size={14} className="text-emerald-400" /> : <ArrowDownRight size={14} className="text-rose-400" />}
            <span className={`text-xs font-bold ${trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>{trendValue}</span>
            <span className="text-[10px] text-slate-500 font-medium ml-1">vs mês anterior</span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-xl ${color.replace('bg-', 'text-').replace(' opacity-5', '')} bg-slate-800/50 border border-slate-700/50 shadow-inner`}>
        <Icon size={24} />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { companies, inventory, events, tasks } = useStore();

  // --- CÁLCULO DE PERFORMANCE GTM REAL ---
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === TaskStatus.DONE).length;
  const taskEfficiency = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const totalCompanies = companies.length;
  const partners = companies.filter(c => c.status === PipelineStatus.PARTNER).length;
  const conversionRate = totalCompanies > 0 ? (partners / totalCompanies) * 100 : 0;

  const performanceGTM = totalTasks + totalCompanies > 0 
    ? ((taskEfficiency + conversionRate) / 2).toFixed(1) 
    : "0.0";

  // --- DADOS DO PIPELINE (SUBSTITUI ALMOXARIFADO NO GRÁFICO) ---
  const pipelineStats = [
    { name: 'Prospecção', count: companies.filter(c => c.status === PipelineStatus.PROSPECT).length, color: '#64748b' },
    { name: 'Contatado', count: companies.filter(c => c.status === PipelineStatus.CONTACTED).length, color: '#3b82f6' },
    { name: 'Negociação', count: companies.filter(c => c.status === PipelineStatus.NEGOTIATION).length, color: '#a855f7' },
    { name: 'Parceiro', count: companies.filter(c => c.status === PipelineStatus.PARTNER).length, color: '#10b981' },
    { name: 'Churn', count: companies.filter(c => c.status === PipelineStatus.CHURN).length, color: '#f43f5e' },
  ];

  const lowStock = inventory.filter(i => i.quantity < i.minQuantity);
  const totalEvents = events.length;

  // Cálculo do Ranking GTM
  const userStats = events.reduce((acc: any, event) => {
    const user = event.createdBy || 'Sistema';
    acc[user] = (acc[user] || 0) + 1;
    return acc;
  }, {});

  const rankingData = Object.entries(userStats)
    .map(([name, count]) => ({ name, count: count as number }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const getRankIcon = (index: number) => {
    switch(index) {
      case 0: return <Medal className="text-yellow-400 filter drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]" size={24} />;
      case 1: return <Medal className="text-slate-300 filter drop-shadow-[0_0_8px_rgba(203,213,225,0.4)]" size={24} />;
      case 2: return <Medal className="text-amber-600 filter drop-shadow-[0_0_8px_rgba(180,83,9,0.4)]" size={24} />;
      default: return <span className="text-slate-500 font-black text-sm w-6 text-center">{index + 1}º</span>;
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Empresas no Funil" value={totalCompanies} icon={Building2} color="bg-blue-600" trend="up" trendValue="+12%" />
        <StatCard title="Eventos Agendados" value={totalEvents} icon={CalendarClock} color="bg-indigo-600" trend="up" trendValue="+5%" />
        <StatCard title="Performance GTM" value={`${performanceGTM}%`} icon={TrendingUp} color="bg-emerald-600" trend={Number(performanceGTM) > 20 ? 'up' : 'down'} trendValue={Number(performanceGTM) > 20 ? '+4.2%' : '-1.5%'} />
        <StatCard title="Risco Logístico" value={lowStock.length} icon={AlertTriangle} color="bg-rose-600" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* GRÁFICO ÚTIL: DISTRIBUIÇÃO DO PIPELINE */}
        <div className="xl:col-span-2 glass p-8 rounded-[32px] border-white/5 shadow-2xl">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-bold flex items-center gap-3">
              <span className="w-2 h-6 bg-blue-500 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.5)]"></span>
              Distribuição do Pipeline (CRM)
            </h3>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 rounded-full border border-slate-800">
              <BarChart3 size={14} className="text-blue-400" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saúde Comercial</span>
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineStats} layout="vertical" margin={{ left: 20, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 800}}
                  width={100}
                />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}
                  itemStyle={{ color: '#f8fafc', fontWeight: 700 }}
                  labelStyle={{ color: '#94a3b8', marginBottom: '8px', fontWeight: 800, textTransform: 'uppercase', fontSize: '10px' }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={40}>
                  {pipelineStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RANKING GTM */}
        <div className="glass p-8 rounded-[32px] border-white/5 shadow-2xl flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold flex items-center gap-3">
              <span className="w-2 h-6 bg-yellow-500 rounded-full shadow-[0_0_12px_rgba(234,179,8,0.5)]"></span>
              Ranking GTM
            </h3>
            <Trophy className="text-yellow-500 animate-bounce-slow" size={28} />
          </div>
          
          <p className="text-[11px] text-slate-500 mb-8 font-bold leading-relaxed uppercase tracking-wider">
            Consolidado de prospecção e eventos executados por consultor.
          </p>

          <div className="flex-1 space-y-4">
            {rankingData.length > 0 ? rankingData.map((user, index) => (
              <div key={user.name} className="flex items-center justify-between p-5 rounded-[20px] bg-slate-900/40 border border-slate-800/60 hover:border-blue-500/30 transition-all group shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 flex items-center justify-center">
                    {getRankIcon(index)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-200 group-hover:text-white transition-colors uppercase">{user.name}</span>
                    <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Performance GTM</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xl font-black text-blue-400 tracking-tight">{user.count}</span>
                  <span className="text-[8px] text-slate-700 font-black uppercase">KPIs</span>
                </div>
              </div>
            )) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 opacity-20">
                <UserIcon size={48} className="mb-4" />
                <p className="text-xs font-black uppercase tracking-widest">Sem registros este mês</p>
              </div>
            )}
          </div>
          
          <button className="mt-8 w-full py-4 bg-slate-800/30 hover:bg-blue-600/10 text-slate-500 hover:text-blue-400 text-[10px] font-black rounded-2xl border border-slate-800/50 hover:border-blue-500/30 transition-all uppercase tracking-[0.2em]">
            Exportar Ranking
          </button>
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="bg-rose-500/5 border border-rose-500/20 p-8 rounded-[32px] flex items-center gap-8 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 flex items-center justify-center text-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)]">
            <AlertTriangle size={32} />
          </div>
          <div className="flex-1">
            <h4 className="font-black text-rose-500 uppercase tracking-[0.1em] text-sm mb-2">Alerta de Ruptura de Estoque</h4>
            <p className="text-sm text-slate-400 font-medium leading-relaxed">
              Existem materiais essenciais abaixo da quantidade mínima. Isso pode comprometer campanhas ativas em IES parceiras.
            </p>
          </div>
          <button className="px-8 py-4 bg-rose-500 hover:bg-rose-600 text-white font-black text-xs rounded-2xl transition-all shadow-lg shadow-rose-500/20 uppercase tracking-widest">
            Ajustar Estoque
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
