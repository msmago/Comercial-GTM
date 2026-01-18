
import React, { useState } from 'react';
import { useKanban } from '../modules/kanban/kanban.store';
import { TaskPriority, Task } from '../modules/kanban/kanban.types';
import { 
  Plus, Trash2, Calendar as CalendarIcon, 
  Edit2, Loader2, Eye, X, Settings, GripVertical, 
  LayoutGrid, Sparkles, CheckCircle2, Clock, AlertCircle, ArrowRight
} from 'lucide-react';
import ConfirmModal from '../shared/components/ConfirmModal';

const Tasks = () => {
  const { tasks, columns, loading, saveTask, removeTask, moveTask } = useKanban();
  
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void } | null>(null);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const result = await saveTask({
      id: editingTask?.id,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      status: formData.get('status') as string,
      priority: formData.get('priority') as TaskPriority,
      date: formData.get('date') as string || undefined,
    });
    setIsSubmitting(false);
    if (result.success) { 
      setShowTaskModal(false); 
      setEditingTask(null); 
    }
  };

  const getPriorityColor = (p: TaskPriority) => {
    switch(p) {
      case TaskPriority.HIGH: return 'text-rose-600 bg-rose-50 dark:bg-rose-500/10 border-rose-200';
      case TaskPriority.MEDIUM: return 'text-amber-600 bg-amber-50 dark:bg-amber-500/10 border-amber-200';
      case TaskPriority.LOW: return 'text-blue-600 bg-blue-50 dark:bg-blue-500/10 border-blue-200';
      default: return 'text-slate-600';
    }
  };

  const onDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const onDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) moveTask(taskId, columnId);
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center animate-pulse">
        <Loader2 size={48} className="text-blue-600 animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Acessando Fluxo GTM PRO...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-10 pb-20 select-none animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div>
          <h3 className="text-5xl font-black italic tracking-tighter text-slate-950 dark:text-white uppercase leading-none">Board GTM</h3>
          <p className="text-[11px] text-slate-500 font-black mt-4 uppercase tracking-[0.4em]">Gestão Operacional de Fluxo</p>
        </div>
        
        <button 
          onClick={() => { setEditingTask(null); setShowTaskModal(true); }}
          className="flex items-center gap-3 px-8 py-4 bg-slate-950 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white font-black text-[11px] uppercase tracking-widest rounded-2xl shadow-xl transition-all active:scale-95"
        >
          <Plus size={20} /> Abrir Novo Ticket
        </button>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-10 scrollbar-hide px-2 items-start h-full">
        {columns.map((col) => {
          const columnTasks = tasks.filter(t => t.status === col.id);

          return (
            <div 
              key={col.id} 
              className="flex-shrink-0 w-85 lg:w-96"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => onDrop(e, col.id)}
            >
              <div className="flex items-center justify-between mb-5 px-5">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${col.color} shadow-lg shadow-black/10`}></div>
                  <h4 className="font-black uppercase tracking-[0.2em] text-[11px] text-slate-950 dark:text-slate-200 italic">{col.title}</h4>
                </div>
                <span className="text-[10px] font-black bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1 rounded-xl text-slate-500">{columnTasks.length}</span>
              </div>

              <div className="bg-slate-100/40 dark:bg-slate-900/40 rounded-[40px] p-4 space-y-4 min-h-[550px] border border-transparent hover:border-blue-500/10 transition-all">
                {columnTasks.map(task => (
                  <div 
                    key={task.id} 
                    draggable
                    onDragStart={(e) => onDragStart(e, task.id)}
                    onClick={() => setViewingTask(task)}
                    className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all cursor-grab active:cursor-grabbing group relative"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <GripVertical size={14} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                    </div>
                    
                    <h5 className="font-black text-slate-950 dark:text-white text-base uppercase italic tracking-tighter mb-2 leading-tight">{task.title}</h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-6 font-medium">{task.description || 'Nenhum detalhe cadastrado.'}</p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                       <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          <Clock size={12} className="text-blue-600" /> {task.date ? new Date(task.date).toLocaleDateString('pt-BR') : 'Sem data'}
                       </div>
                       <div className="px-4 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800 text-[9px] font-black text-slate-400 group-hover:bg-slate-950 dark:group-hover:bg-blue-600 group-hover:text-white transition-all uppercase tracking-widest">
                          Ver Gerenciador
                       </div>
                    </div>
                  </div>
                ))}

                <button 
                  onClick={() => { setEditingTask({ status: col.id }); setShowTaskModal(true); }}
                  className="w-full py-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[32px] text-slate-400 hover:text-blue-600 hover:border-blue-500/40 transition-all flex flex-col items-center justify-center gap-3 group"
                >
                   <Plus size={24} className="group-hover:scale-125 transition-transform" />
                   <span className="text-[10px] font-black uppercase tracking-[0.3em]">Adicionar à Coluna</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Gerenciador de Ticket (Side View / Modal Centered) */}
      {viewingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-950 rounded-[56px] border border-slate-200 dark:border-white/5 shadow-6xl overflow-hidden relative">
             <button onClick={() => setViewingTask(null)} className="absolute top-10 right-10 p-5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 rounded-3xl text-slate-600 transition-all z-20"><X size={24} /></button>
             
             <div className="grid grid-cols-1 md:grid-cols-5 h-full">
                {/* Lateral Esquerda - Info & Ações Rápidas */}
                <div className="md:col-span-2 bg-slate-50 dark:bg-slate-900/50 p-12 flex flex-col border-r border-slate-100 dark:border-slate-800">
                   <div className="mb-10">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Mudar Status</p>
                      <div className="space-y-3">
                         {columns.map(c => (
                            <button 
                              key={c.id}
                              onClick={() => { moveTask(viewingTask.id, c.id); setViewingTask(null); }}
                              className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl border transition-all ${viewingTask.status === c.id ? 'bg-white dark:bg-slate-800 border-blue-500 text-blue-600 shadow-lg' : 'bg-transparent border-slate-200 dark:border-slate-800 text-slate-500 hover:border-blue-500/40'}`}
                            >
                               <span className="text-[10px] font-black uppercase tracking-widest">{c.title}</span>
                               {viewingTask.status === c.id && <CheckCircle2 size={16} />}
                            </button>
                         ))}
                      </div>
                   </div>

                   <div className="mt-auto space-y-4">
                      <button 
                        onClick={() => { setEditingTask(viewingTask); setViewingTask(null); setShowTaskModal(true); }}
                        className="w-full py-5 bg-slate-950 dark:bg-blue-600 text-white font-black text-[11px] uppercase tracking-widest rounded-2xl shadow-xl flex items-center justify-center gap-3"
                      >
                         <Edit2 size={16} /> Editar Dados
                      </button>
                      <button 
                        onClick={() => {
                          setConfirmConfig({
                            isOpen: true,
                            title: 'Excluir Operação',
                            message: 'Você está prestes a remover este ticket do sistema GTM PRO definitivamente.',
                            onConfirm: () => { removeTask(viewingTask.id); setViewingTask(null); setConfirmConfig(null); }
                          });
                        }}
                        className="w-full py-5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 font-black text-[11px] uppercase tracking-widest rounded-2xl transition-all"
                      >
                         Arquivar Operação
                      </button>
                   </div>
                </div>

                {/* Área Principal - Conteúdo */}
                <div className="md:col-span-3 p-16">
                   <div className="flex items-center gap-4 mb-8">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getPriorityColor(viewingTask.priority)}`}>
                         {viewingTask.priority}
                      </span>
                      {viewingTask.date && (
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <CalendarIcon size={14} className="text-blue-600" /> {new Date(viewingTask.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                         </span>
                      )}
                   </div>

                   <h2 className="text-5xl font-black tracking-tighter text-slate-950 dark:text-white mb-10 italic uppercase leading-tight">{viewingTask.title}</h2>
                   
                   <div className="space-y-6">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Contexto Operacional</h4>
                      <p className="text-slate-800 dark:text-slate-300 text-lg leading-relaxed font-medium">"{viewingTask.description || 'Nenhuma instrução adicional foi fornecida para este ticket.'}"</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Modal de Criação / Edição */}
      {showTaskModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md">
          <div className="w-full max-w-xl bg-white dark:bg-slate-950 p-12 rounded-[56px] border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-12">
              <h3 className="text-3xl font-black italic tracking-tighter text-slate-950 dark:text-white uppercase leading-none">
                {editingTask?.id ? 'Atualizar Dados' : 'Abrir Operação'}
              </h3>
              <button onClick={() => setShowTaskModal(false)} className="p-4 bg-slate-100 dark:bg-slate-900 rounded-[20px] text-slate-500 transition-all"><X size={24} /></button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-8">
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Título do Ticket</label>
                <input name="title" required defaultValue={editingTask?.title} className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-slate-950 dark:text-white text-sm font-bold shadow-sm outline-none" placeholder="Ex: Campanha Vestibular..." />
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Descrição / Instruções</label>
                <textarea name="description" defaultValue={editingTask?.description} className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-slate-950 dark:text-white text-sm h-32 resize-none font-medium leading-relaxed outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Urgência</label>
                  <select name="priority" defaultValue={editingTask?.priority || TaskPriority.MEDIUM} className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-slate-950 dark:text-white text-sm font-bold appearance-none cursor-pointer outline-none shadow-sm">
                    <option value={TaskPriority.LOW}>Baixa</option>
                    <option value={TaskPriority.MEDIUM}>Média</option>
                    <option value={TaskPriority.HIGH}>Alta</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Prazo Final</label>
                  <input name="date" type="date" defaultValue={editingTask?.date} className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-slate-950 dark:text-white text-sm font-bold outline-none shadow-sm" />
                </div>
              </div>
              <input type="hidden" name="status" defaultValue={editingTask?.status || 'backlog'} />

              <div className="flex gap-6 pt-10">
                <button type="button" onClick={() => setShowTaskModal(false)} className="flex-1 py-5 text-slate-500 font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 rounded-3xl transition-all">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black text-[11px] uppercase tracking-widest rounded-3xl shadow-2xl transition-all flex items-center justify-center gap-3">
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (editingTask?.id ? 'Atualizar Operação' : 'Confirmar Abertura')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={confirmConfig?.isOpen || false}
        title={confirmConfig?.title || ''}
        message={confirmConfig?.message || ''}
        onConfirm={confirmConfig?.onConfirm || (() => {})}
        onCancel={() => setConfirmConfig(null)}
      />
    </div>
  );
};

export default Tasks;
