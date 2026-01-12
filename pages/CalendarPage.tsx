
import React, { useState } from 'react';
import { useStore } from '../store';
import { 
  ChevronLeft, ChevronRight, Plus, 
  Clock, User, Trash2 
} from 'lucide-react';

const CalendarPage = () => {
  const { events, upsertEvent, deleteEvent } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());
  const [showModal, setShowModal] = useState(false);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  const getEventsForDay = (day: number) => {
    return events.filter(e => {
      const d = new Date(e.date);
      return d.getDate() === day && d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
    });
  };

  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay.getDate()) : [];

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDay) return;
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      date: new Date(selectedDay.getFullYear(), selectedDay.getMonth(), selectedDay.getDate(), 12).toISOString(),
      type: 'MANUAL' as const,
    };
    upsertEvent(data);
    setShowModal(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-3 space-y-6">
        <div className="flex items-center justify-between glass p-6 rounded-2xl border-white/5 shadow-xl">
          <div className="flex items-center gap-6">
            <h2 className="text-2xl font-black tracking-tight text-white italic">
              {monthNames[currentDate.getMonth()]} <span className="text-slate-500 font-normal not-italic">{currentDate.getFullYear()}</span>
            </h2>
            <div className="flex items-center gap-2">
              <button onClick={prevMonth} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"><ChevronLeft size={20} /></button>
              <button onClick={() => setCurrentDate(new Date())} className="px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 transition-all">Hoje</button>
              <button onClick={nextMonth} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"><ChevronRight size={20} /></button>
            </div>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20"
          >
            <Plus size={20} />
            Agendar Evento
          </button>
        </div>

        <div className="glass rounded-3xl p-6 border-white/5 shadow-inner">
          <div className="grid grid-cols-7 gap-px bg-slate-800/40 rounded-xl overflow-hidden border border-slate-800/60">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
              <div key={d} className="bg-slate-900/50 p-4 text-center text-xs font-bold text-slate-500 uppercase tracking-widest">{d}</div>
            ))}
            {blanks.map(b => <div key={`b-${b}`} className="bg-slate-900/20 min-h-[120px]" />)}
            {days.map(day => {
              const dayEvents = getEventsForDay(day);
              const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();
              const isSelected = selectedDay?.getDate() === day;

              return (
                <div 
                  key={day} 
                  onClick={() => setSelectedDay(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                  className={`bg-slate-900/40 min-h-[120px] p-3 border-t border-l border-slate-800/40 cursor-pointer transition-all hover:bg-slate-800/40 ${isSelected ? 'ring-2 ring-inset ring-blue-500/50 bg-blue-500/5 shadow-inner' : ''}`}
                >
                  <span className={`text-sm font-bold ${isToday ? 'bg-blue-600 text-white w-6 h-6 flex items-center justify-center rounded-full shadow-lg shadow-blue-500/20' : 'text-slate-400'}`}>
                    {day}
                  </span>
                  <div className="mt-2 space-y-1">
                    {dayEvents.slice(0, 2).map(e => (
                      <div key={e.id} className={`text-[10px] font-bold p-1 rounded border truncate ${e.type === 'AUTO_TASK' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                        {e.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && <div className="text-[10px] text-slate-500 font-bold pl-1">+{dayEvents.length - 2} mais</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="glass p-6 rounded-3xl border-white/5 h-fit sticky top-28 shadow-2xl">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
            Agenda: {selectedDay?.toLocaleDateString('pt-BR')}
          </h3>
          <div className="space-y-4">
            {selectedDayEvents.map(event => (
              <div key={event.id} className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 group hover:border-blue-500/30 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest ${event.type === 'AUTO_TASK' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {event.type === 'AUTO_TASK' ? 'Sincronizado' : 'Manual'}
                  </span>
                  <button onClick={() => deleteEvent(event.id)} className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-rose-500 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
                <h4 className="font-bold text-slate-200 text-sm mb-1">{event.title}</h4>
                <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">{event.description}</p>
                <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium">
                  <div className="flex items-center gap-1"><Clock size={12} /> 12:00</div>
                  <div className="flex items-center gap-1 uppercase tracking-tighter"><User size={12} /> {event.createdBy}</div>
                </div>
              </div>
            ))}
            {selectedDayEvents.length === 0 && (
              <div className="text-center py-12 px-4 opacity-40">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-600 mx-auto mb-4 border border-slate-700">
                  <Clock size={24} />
                </div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Nenhum evento registrado</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg glass p-8 rounded-3xl animate-in zoom-in-95 duration-200 border-white/5 shadow-2xl">
            <h3 className="text-2xl font-bold mb-6">Agendamento Manual</h3>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Título do Compromisso</label>
                <input name="title" required className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-white text-sm" placeholder="Ex: Palestra Magna PUC..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Descrição / Observações</label>
                <textarea name="description" className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none text-white text-sm" placeholder="Detalhes importantes..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Data do Evento</label>
                <input disabled value={selectedDay?.toLocaleDateString('pt-BR')} className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-500 font-bold text-sm" />
              </div>
              <div className="flex gap-3 mt-8">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 text-slate-400 font-bold hover:bg-slate-800 rounded-xl transition-all">Descartar</button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20">Salvar na Agenda</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
