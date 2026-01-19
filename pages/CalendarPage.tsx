
import React, { useState } from 'react';
import { useCalendar } from '../modules/calendar/calendar.store';
import { CommercialEvent } from '../modules/calendar/calendar.types';
import { 
  ChevronLeft, ChevronRight, Plus, 
  Clock, User, Trash2, Calendar as CalIcon, X, Loader2, MapPin, Edit2,
  Sparkles, Send, Copy, Check, Wand2, BarChart3, AlertCircle, CalendarCheck
} from 'lucide-react';

const CalendarPage = () => {
  const { events, saveEvent, removeEvent, loading } = useCalendar();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CommercialEvent | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Estados para o Resumo Local
  const [showSummary, setShowSummary] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryText, setSummaryText] = useState('');
  const [copied, setCopied] = useState(false);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  const getEventsForDay = (day: number) => {
    return events.filter(e => {
      const eventDate = new Date(e.date);
      return eventDate.getUTCDate() === day && 
             eventDate.getUTCMonth() === currentDate.getMonth() && 
             eventDate.getUTCFullYear() === currentDate.getFullYear();
    });
  };

  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay.getDate()) : [];

  // Motor de Síntese Local (Substituindo a IA)
  const handleGenerateLocalSummary = () => {
    setSummaryLoading(true);
    setShowSummary(true);

    setTimeout(() => {
      const currentMonthEvents = events.filter(e => {
        const d = new Date(e.date);
        return d.getUTCMonth() === currentDate.getMonth() && d.getUTCFullYear() === currentDate.getFullYear();
      });

      const today = new Date();
      const nextWeekEvents = currentMonthEvents.filter(e => {
        const d = new Date(e.date);
        const diff = (d.getTime() - today.getTime()) / (1000 * 3600 * 24);
        return diff >= 0 && diff <= 7;
      });

      const total = currentMonthEvents.length;
      const weekTotal = nextWeekEvents.length;
      
      // Lógica de análise de intensidade
      const busyDays = days.filter(d => getEventsForDay(d).length >= 3);
      const freeDays = days.filter(d => d >= today.getDate() && getEventsForDay(d).length === 0);

      const report = `
### RELATÓRIO DE PERFORMANCE GTM - ${monthNames[currentDate.getMonth()].toUpperCase()}

1. VISÃO GERAL DO MÊS
- Volume Total de Ações: ${total} compromissos agendados.
- Status: ${total > 15 ? '🔥 Alta Intensidade' : total > 5 ? '⚡ Operação Ativa' : '🧊 Baixa Movimentação'}.

2. FOCO SEMANAL (PRÓXIMOS 7 DIAS)
- Você possui ${weekTotal} ações críticas mapeadas para esta semana.
${nextWeekEvents.map(e => `  • [${new Date(e.date).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'})}] ${e.title}`).join('\n')}

3. ANÁLISE DE CAPACIDADE
- Dias de Pico: ${busyDays.length > 0 ? busyDays.join(', ') : 'Distribuído'}.
- Janelas de Prospecção: Existem ${freeDays.length} dias livres para novas abordagens este mês.
- Sugestão: Focar prospecção ativa nos dias ${freeDays.slice(0, 3).join(', ')}.

4. INSIGHT ESTRATÉGICO
- Mantenha o follow-up rigoroso nos compromissos de fim de mês para garantir o fechamento da meta trimestral.
      `;

      setSummaryText(report.trim());
      setSummaryLoading(false);
    }, 800);
  };

  const handleOpenModal = (event?: CommercialEvent) => {
    if (event) {
      setEditingEvent(event);
      setSelectedDay(new Date(event.date));
    } else {
      setEditingEvent(null);
    }
    setShowModal(true);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDay || isSaving) return;
    
    setIsSaving(true);
    const formData = new FormData(e.target as HTMLFormElement);
    
    const eventDate = editingEvent 
      ? new Date(editingEvent.date)
      : new Date(Date.UTC(selectedDay.getFullYear(), selectedDay.getMonth(), selectedDay.getDate(), 12, 0, 0));
    
    const data: Partial<CommercialEvent> = {
      id: editingEvent?.id,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      time: formData.get('time') as string,
      location: formData.get('location') as string,
      date: eventDate.toISOString(),
      type: editingEvent?.type || 'MANUAL',
    };

    const result = await saveEvent(data);
    setIsSaving(false);
    
    if (result.success) {
      setShowModal(false);
      setEditingEvent(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 pb-20 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="lg:col-span-3 space-y-8">
        <div className="flex flex-col sm:flex-row items-center justify-between bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-200 dark:border-white/5 shadow-xl">
          <div className="flex items-center gap-8 mb-4 sm:mb-0">
            <h2 className="text-3xl font-black tracking-tighter text-slate-950 dark:text-white uppercase italic leading-none">
              {monthNames[currentDate.getMonth()]} <span className="text-blue-600 not-italic">{currentDate.getFullYear()}</span>
            </h2>
            <div className="flex items-center gap-2 p-1.5 bg-slate-50 dark:bg-slate-950 rounded-[18px] border border-slate-100 dark:border-slate-800 shadow-inner">
              <button onClick={prevMonth} className="p-2.5 hover:bg-white dark:hover:bg-slate-900 rounded-xl text-slate-600 dark:text-slate-400 transition-all shadow-sm"><ChevronLeft size={20} /></button>
              <button onClick={() => { setCurrentDate(new Date()); setSelectedDay(new Date()); }} className="px-5 py-2 text-[10px] font-black uppercase tracking-widest text-slate-950 dark:text-blue-400 bg-white dark:bg-blue-500/10 rounded-xl hover:shadow-md transition-all">Hoje</button>
              <button onClick={nextMonth} className="p-2.5 hover:bg-white dark:hover:bg-slate-900 rounded-xl text-slate-600 dark:text-slate-400 transition-all shadow-sm"><ChevronRight size={20} /></button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={handleGenerateLocalSummary}
              className="flex items-center gap-3 px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all shadow-xl active:scale-95 group"
            >
              <BarChart3 size={18} />
              Sintetizador
            </button>
            <button 
              onClick={() => handleOpenModal()}
              className="flex items-center gap-3 px-8 py-4 bg-slate-950 dark:bg-blue-600 hover:bg-slate-900 dark:hover:bg-blue-700 text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl active:scale-95"
            >
              <Plus size={20} />
              Agendar
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[48px] p-10 border border-slate-200 dark:border-white/5 shadow-2xl relative">
          {loading && <div className="absolute inset-0 bg-white/50 dark:bg-slate-950/50 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-[48px]"><Loader2 className="animate-spin text-blue-600" size={48} /></div>}
          <div className="grid grid-cols-7 gap-px rounded-[32px] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
              <div key={d} className="bg-slate-50 dark:bg-slate-950/50 p-5 text-center text-[10px] font-black text-slate-950 dark:text-slate-500 uppercase tracking-[0.3em] border-b border-slate-200 dark:border-slate-800">{d}</div>
            ))}
            {blanks.map(b => <div key={`b-${b}`} className="bg-slate-50/50 dark:bg-slate-950/20 min-h-[140px]" />)}
            {days.map(day => {
              const dayEvents = getEventsForDay(day);
              const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();
              const isSelected = selectedDay?.getDate() === day && selectedDay?.getMonth() === currentDate.getMonth() && selectedDay?.getFullYear() === currentDate.getFullYear();

              return (
                <div 
                  key={day} 
                  onClick={() => setSelectedDay(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                  className={`bg-white dark:bg-slate-900/40 min-h-[140px] p-4 border-b border-r border-slate-100 dark:border-slate-800/40 cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-800/60 relative group ${isSelected ? 'ring-4 ring-inset ring-blue-600/10 bg-blue-50/30 dark:bg-blue-900/20' : ''}`}
                >
                  <span className={`text-xs font-black tracking-tight ${isToday ? 'bg-blue-600 text-white w-7 h-7 flex items-center justify-center rounded-xl shadow-lg shadow-blue-500/20' : 'text-slate-400 dark:text-slate-600'}`}>
                    {day}
                  </span>
                  <div className="mt-3 space-y-1.5">
                    {dayEvents.slice(0, 3).map(e => (
                      <div key={e.id} className="text-[8px] font-black p-1.5 rounded-lg border truncate uppercase tracking-tighter bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 hover:scale-105 transition-transform">
                        {e.time ? `[${e.time}] ` : ''}{e.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && <div className="text-[8px] text-slate-500 font-black pl-1 uppercase tracking-widest mt-1">+{dayEvents.length - 3} itens</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="bg-white dark:bg-slate-950 p-10 rounded-[48px] border border-slate-200 dark:border-white/5 h-fit sticky top-32 shadow-2xl overflow-hidden min-h-[400px]">
          <div className="absolute top-0 right-0 p-8 opacity-10"><CalIcon size={120} className="text-slate-950 dark:text-white" /></div>
          <h3 className="text-xl font-black mb-10 flex items-center gap-3 relative z-10">
            <span className="w-1.5 h-7 bg-blue-600 rounded-full"></span>
            <span className="uppercase tracking-tighter italic text-slate-950 dark:text-white">Compromissos</span>
          </h3>
          <div className="space-y-5 relative z-10">
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">
              {selectedDay?.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            {selectedDayEvents.map(event => (
              <div key={event.id} className="p-6 rounded-[32px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 group hover:border-blue-500/40 transition-all shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col gap-1">
                    <h4 className="font-black text-slate-950 dark:text-slate-100 text-base uppercase tracking-tight italic leading-tight">{event.title}</h4>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleOpenModal(event); }} 
                      className="p-2.5 bg-white dark:bg-slate-800 hover:bg-blue-600 hover:text-white rounded-xl text-slate-400 transition-all shadow-sm border border-slate-100 dark:border-slate-700"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeEvent(event.id); }} 
                      className="p-2.5 bg-white dark:bg-slate-800 hover:bg-rose-600 hover:text-white rounded-xl text-slate-400 transition-all shadow-sm border border-slate-100 dark:border-slate-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-400 line-clamp-2 mb-5 leading-relaxed font-medium">{event.description || 'Nenhum detalhe adicional.'}</p>
                
                <div className="grid grid-cols-1 gap-3 mb-5">
                  <div className="flex items-center gap-2 text-[10px] text-slate-600 dark:text-slate-400 font-black uppercase tracking-widest bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                    <Clock size={14} className="text-blue-600" />
                    <span>{event.time || 'Horário não definido'}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2 text-[10px] text-slate-600 dark:text-slate-400 font-black uppercase tracking-widest bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                      <MapPin size={14} className="text-blue-600" />
                      <span>{event.location}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-[9px] text-slate-600 dark:text-slate-500 font-black uppercase tracking-widest">
                  <div className="flex items-center gap-1.5"><User size={14} className="text-blue-600" /> {event.createdBy}</div>
                </div>
              </div>
            ))}
            {selectedDayEvents.length === 0 && (
              <div className="text-center py-20 px-6 opacity-40">
                <div className="w-16 h-16 rounded-[24px] bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-500 mx-auto mb-6 border border-slate-200 dark:border-slate-800 shadow-inner">
                  <Clock size={32} />
                </div>
                <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em]">Agenda Livre para a Data</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Resumo do Sintetizador (Local) */}
      {showSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-950 rounded-[56px] border border-slate-200 dark:border-white/5 shadow-6xl overflow-hidden relative flex flex-col max-h-[90vh]">
            <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                  <BarChart3 size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black italic tracking-tighter uppercase text-slate-950 dark:text-white leading-none">Sintetizador GTM</h3>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Análise de Performance Operacional</p>
                </div>
              </div>
              <button onClick={() => setShowSummary(false)} className="p-4 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 rounded-3xl text-slate-600 transition-all"><X size={24} /></button>
            </div>

            <div className="flex-1 p-12 overflow-y-auto custom-scrollbar">
              {summaryLoading ? (
                <div className="h-full flex flex-col items-center justify-center space-y-8 py-20">
                  <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                  <div className="text-center">
                    <p className="text-[11px] font-black text-slate-950 dark:text-white uppercase tracking-[0.4em] animate-pulse">Cruzando Dados Locais...</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-2">Extraindo métricas do banco de dados</p>
                  </div>
                </div>
              ) : (
                <div className="prose dark:prose-invert max-w-none">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">Sumário Estratégico</span>
                    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
                  </div>
                  
                  <div className="space-y-6 text-slate-700 dark:text-slate-300 text-sm leading-relaxed font-bold whitespace-pre-wrap font-mono bg-slate-50 dark:bg-slate-900/50 p-8 rounded-3xl border border-slate-100 dark:border-slate-800">
                    {summaryText}
                  </div>
                  
                  <div className="mt-8 flex items-center gap-4 p-5 bg-blue-50 dark:bg-blue-500/5 rounded-2xl border border-blue-100 dark:border-blue-500/10">
                    <AlertCircle className="text-blue-600" size={20} />
                    <p className="text-[10px] font-black uppercase tracking-tight text-blue-600">Este relatório foi gerado localmente com base na sua agenda atual.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-10 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <CalendarCheck className="text-emerald-500" size={20} />
                 <p className="text-[10px] font-black uppercase text-slate-500">Pronto para Exportação</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => { navigator.clipboard.writeText(summaryText); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  className="flex items-center gap-3 px-8 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-sm hover:border-blue-500 transition-all"
                >
                  {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                  {copied ? 'Copiado' : 'Copiar Texto'}
                </button>
                <button 
                  onClick={() => setShowSummary(false)}
                  className="px-8 py-4 bg-slate-950 dark:bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl transition-all active:scale-95"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Evento */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-950 p-10 rounded-[48px] animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-white/5 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-black italic tracking-tighter text-slate-950 dark:text-white uppercase leading-none">
                {editingEvent ? 'Editar Evento' : 'Novo Evento'}
              </h3>
              <button 
                onClick={() => { setShowModal(false); setEditingEvent(null); }} 
                className="p-3 bg-slate-100 dark:bg-slate-900 rounded-2xl text-slate-500 hover:text-slate-950 transition-all"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateEvent} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-700 dark:text-slate-500 uppercase tracking-widest ml-1">Assunto do Compromisso</label>
                <input 
                  name="title" 
                  required 
                  defaultValue={editingEvent?.title}
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none text-slate-950 dark:text-white text-sm font-bold shadow-sm" 
                  placeholder="Ex: Palestra Magna PUC..." 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-700 dark:text-slate-500 uppercase tracking-widest ml-1">Horário</label>
                  <input 
                    name="time" 
                    type="time" 
                    defaultValue={editingEvent?.time}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none text-slate-950 dark:text-white text-sm font-bold shadow-sm" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-700 dark:text-slate-500 uppercase tracking-widest ml-1">Data Fixada</label>
                  <input 
                    disabled 
                    value={selectedDay?.toLocaleDateString('pt-BR')} 
                    className="w-full px-6 py-4 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-500 font-black text-sm uppercase tracking-widest shadow-inner" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-700 dark:text-slate-500 uppercase tracking-widest ml-1">Localização / IES</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    name="location" 
                    defaultValue={editingEvent?.location}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none text-slate-950 dark:text-white text-sm font-bold shadow-sm" 
                    placeholder="Ex: Campus Central / Auditório..." 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-700 dark:text-slate-500 uppercase tracking-widest ml-1">Contextualização</label>
                <textarea 
                  name="description" 
                  defaultValue={editingEvent?.description}
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none h-24 resize-none text-slate-950 dark:text-white text-sm font-medium shadow-sm leading-relaxed" 
                  placeholder="Pontos principais da pauta..." 
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => { setShowModal(false); setEditingEvent(null); }} 
                  className="flex-1 py-4 text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-100 rounded-2xl transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving} 
                  className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={18} /> : (editingEvent ? 'Salvar Alterações' : 'Finalizar Agendamento')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
