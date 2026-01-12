
import React, { useMemo } from 'react';
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
  BarChart3,
  Activity,
  Zap,
  Target,
  ChevronRight
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, trend, trendValue, subtitle }: any) => (
  <div className="glass p-7 rounded-[32px] relative overflow-hidden group border-white/5 shadow-2xl transition-all hover:translate-y-[-4px]">
    <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full ${color} opacity-[0.03] group-hover:opacity-[0.08] blur-2xl transition-all duration-500`}></div>
    
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-6">
        <div className={`p-3.5 rounded-2xl ${color.replace('bg-', 'text-')} bg-slate-900/80 border border-white/5 shadow-inner`}>
          <Icon size={22} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
            {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {trendValue}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-4xl font-black tracking-tighter text-white mb-1">{value}</h3>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{title}</p>
        <p className="text-slate-600 text-[9px] mt-2 font-medium">{subtitle}</p>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { companies, inventory, events, tasks, user: currentUser } = useStore();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

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

  // --- DADOS DO PIPELINE ---
  const pipelineStats = [
    { name: 'PROSPECÇÃO', count: companies.filter(c => c.status === PipelineStatus.PROSPECT).length, color: '#475569' },
    { name: 'CONTATADO', count: companies.filter(c => c.status === PipelineStatus.CONTACTED).length, color: '#3b82f6' },
    { name: 'NEGOCIAÇÃO', count: companies.filter(c => c.status === PipelineStatus.NEGOTIATION).length, color: '#8b5cf6' },
    { name: 'PARCEIRO', count: companies.filter(c => c.status === PipelineStatus.PARTNER).length, color: '#10b981' },
    { name: 'CHURN', count: companies.filter(c => c.status === PipelineStatus.CHURN).length, color: '#f43f5e' },
  ];

  const lowStock = inventory.filter(i => i.quantity < i.minQuantity);
  const totalEvents = events.length;

  // --- RANKING GTM REALTIME ---
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
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* GREETING & CONTEXT */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[9px] font-black uppercase tracking-widest border border-blue-500/20">Acesso Premium</span>
            <span className="w-1 h-1 rounded-full bg-slate-700"></span>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-white italic">
            {getGreeting()}, <span className="text-blue-500 not-italic">{currentUser?.name.split(' ')[0]}</span>.
          </h1>
          <p className="text-slate-500 font-medium mt-1">Sua visão geral de performance e logística comercial.</p>
        </div>
        <div className="flex items-center gap-4 bg-slate-900/40 p-2 rounded-2xl border border-white/5">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <Zap size={20} />
          </div>
          <div className="pr-6">
            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Status da Rede</p>
            <p className="text-xs font-bold text-slate-200">Sincronização Ativa</p>
          </div>
        </div>
      </div>

      {/* PRIMARY STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Empresas no Funil" 
          value={totalCompanies} 
          icon={Building2} 
          color="bg-blue-600" 
          trend="up" 
          trendValue="+12.4%" 
          subtitle="Captação ativa de IES"
        />
        <StatCard 
          title="Eventos Agendados" 
          value={totalEvents} 
          icon={CalendarClock} 
          color="bg-indigo-600" 
          trend="up" 
          trendValue="+5.1%" 
          subtitle="Ações comerciais de campo"
        />
        <StatCard 
          title="Performance Global" 
          value={`${performanceGTM}%`} 
          icon={Target} 
          color="bg-emerald-600" 
          trend={Number(performanceGTM) > 20 ? 'up' : 'down'} 
          trendValue={Number(performanceGTM) > 20 ? 'Alta' : 'Baixa'} 
          subtitle="Eficiência de conversão"
        />
        <StatCard 
          title="Risco Logístico" 
          value={lowStock.length} 
          icon={AlertTriangle} 
          color="bg-rose-600" 
          subtitle="Itens abaixo do mínimo"
        />
      </div>

      {/* CHARTS & LEADERBOARD AREA */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* PIPELINE HEALTH CHART */}
        <div className="xl:col-span-2 glass p-10 rounded-[40px] border-white/5 shadow-2xl bg-slate-900/20 relative group">
          <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="flex items-center gap-2 text-[10px] font-black text-blue-400 uppercase tracking-widest">
              Ver CRM Completo <ChevronRight size={14} />
            </button>
          </div>
          
          <div className="mb-12">
            <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter flex items-center gap-3">
              <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
              Saúde do Pipeline
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-widest">Distribuição por estágio comercial</p>
          </div>

          <div className="h-[380px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineStats} layout="vertical" margin={{ left: 30, right: 60, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} opacity={0.3} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#475569', fontSize: 10, fontWeight: 900, letterSpacing: '0.1em'}}
                  width={110}
                />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.03)', radius: 12}}
                  contentStyle={{ 
                    backgroundColor: '#020617', 
                    border: '1px solid rgba(255,255,255,0.08)', 
                    borderRadius: '20px',
                    padding: '12px 16px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                  }}
                  itemStyle={{ color: '#fff', fontWeight: 800, fontSize: '12px' }}
                  labelStyle={{ color: '#64748b', marginBottom: '4px', fontWeight: 900, textTransform: 'uppercase', fontSize: '9px', letterSpacing: '0.1em' }}
                />
                <Bar dataKey="count" radius={[0, 12, 12, 0]} barSize={44}>
                  {pipelineStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RANKING GTM - THE PODIUM */}
        <div className="glass p-10 rounded-[48px] border-white/5 shadow-[0_32px_64px_rgba(0,0,0,0.5)] bg-slate-950/40 relative flex flex-col">
          <div className="mb-10">
            <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter mb-1">Ranking GTM</h3>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Pilar de Prospecção GTM</p>
          </div>
          
          <div className="flex-1 space-y-4">
            {rankingData.length > 0 ? rankingData.map((user, index) => {
              const isMe = currentUser?.name === user.name;
              const progressWidth = (user.count / maxPoints) * 100;
              
              return (
                <div key={user.name} className={`relative p-5 rounded-[28px] border transition-all duration-500 ${isMe ? 'bg-blue-600/10 border-blue-500/30 ring-1 ring-blue-500/20' : 'bg-slate-900/40 border-slate-800/60 hover:bg-slate-900/60'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs ${index === 0 ? 'bg-yellow-500/20 text-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.2)]' : 'bg-slate-800 text-slate-500'}`}>
                        {index === 0 ? <Medal size={20} /> : index + 1}
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-sm font-black uppercase tracking-tight ${isMe ? 'text-blue-400' : 'text-slate-200'}`}>
                          {user.name}
                        </span>
                        <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Consultor Elite</span>
                      </div>
                    </div>
                    <div className="text-right">
                       <span className="text-2xl font-black text-white tracking-tighter">
                         {user.count}
                       </span>
                    </div>
                  </div>

                  <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${index === 0 ? 'bg-gradient-to-r from-yellow-600 to-yellow-400' : isMe ? 'bg-blue-500' : 'bg-slate-700'}`}
                      style={{ width: `${progressWidth}%` }}
                    />
                  </div>
                </div>
              );
            }) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-10 opacity-20">
                <UserIcon size={48} className="mb-4 text-slate-700" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Inicie os agendamentos</p>
              </div>
            )}
          </div>
          
          <div className="mt-8 px-2">
             <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-2xl border border-white/5">
                <Trophy className="text-yellow-500/50" size={18} />
                <p className="text-[9px] text-slate-500 font-bold leading-relaxed uppercase tracking-wide">
                  O ranking é atualizado instantaneamente conforme o time opera o calendário.
                </p>
             </div>
          </div>
        </div>
      </div>

      {/* OPERATIONAL ALERT SECTION */}
      {lowStock.length > 0 && (
        <div className="bg-rose-500/5 border border-rose-500/10 p-10 rounded-[40px] flex flex-col md:flex-row items-center gap-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute -left-20 -top-20 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
          
          <div className="w-20 h-20 rounded-3xl bg-rose-500/10 flex items-center justify-center text-rose-500 shadow-[0_20px_40px_rgba(244,63,94,0.15)] border border-rose-500/20">
            <AlertTriangle size={36} />
          </div>
          
          <div className="flex-1 text-center md:text-left relative z-10">
            <h4 className="font-black text-rose-500 uppercase tracking-[0.2em] text-sm mb-2 italic">Atenção: Incidente de Suprimentos</h4>
            <p className="text-slate-400 font-medium leading-relaxed max-w-2xl">
              Há <span className="text-rose-400 font-bold">{lowStock.length} materiais estratégicos</span> com estoque crítico. A falta de brindes e materiais de apoio impacta diretamente na conversão de novos parceiros e na percepção da marca GTM.
            </p>
          </div>
          
          <button className="px-10 py-5 bg-rose-500 hover:bg-rose-600 text-white font-black text-[10px] rounded-2xl transition-all shadow-xl shadow-rose-500/20 uppercase tracking-[0.2em] active:scale-95">
            Resolver Agora
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
