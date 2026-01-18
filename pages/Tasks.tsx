
import React, { useState } from 'react';
import { useKanban } from '../modules/kanban/kanban.store';
import { TaskPriority } from '../modules/kanban/kanban.types';
import { 
  Plus, Trash2, Calendar as CalendarIcon, 
  Edit2, Loader2, Eye, X, Settings, GripVertical, 
  AlertCircle
} from 'lucide-react';
import ConfirmModal from '../shared/components/ConfirmModal';

const COLOR_OPTIONS = [
  { name: 'Pure Dark', value: 'bg-slate-950' },
  { name: 'Azul Comercial', value: 'bg-blue-600' },
  { name: 'Roxo Estratégico', value: 'bg-purple-600' },
  { name: 'Verde Parceiro', value: 'bg-emerald-600' },
  { name: 'Âmbar Atenção', value: 'bg-amber-500' },
  { name: 'Rose Crítico', value: 'bg-rose-600' },
];

const Tasks = () => {
  const { tasks, columns, loading, saveTask, removeTask, moveTask, saveColumn, removeColumn } = useKanban();
  
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [editingColumn, setEditingColumn] = useState<any>(null);
  const [viewingTask, setViewingTask] = useState<any>(null);
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'ALL'>('ALL');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  // Estados para o Modal de Confirmação
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

  const handleCreateColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const result = await saveColumn({
      id: editingColumn?.id,
      title: formData.get('title') as string,
      color: formData.get('color') as string,
      order: editingColumn?.order || columns.length,
    });
    if (result.success) { 
      setShowColumnModal(false); 
      setEditingColumn(null); 
    }
  };

  const openDeleteTaskConfirm = (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Excluir Ticket',
      message: 'Esta operação removerá o ticket definitivamente do Supabase. Deseja continuar?',
      onConfirm: async () => {
        await removeTask(id);
        setConfirmConfig(null);
        setViewingTask(null);
        setEditingTask(null);
        setShowTaskModal(false);
      }
    });
  };

  const openDeleteColumnConfirm = (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Excluir Coluna',
      message: 'Isso removerá a coluna operacional do board. Os tickets nela contidos poderão ficar órfãos. Confirmar?',
      onConfirm: async () => {
        await removeColumn(id);
        setConfirmConfig(null);
        setShowColumnModal(false);
      }
    });
  };

  const getPriorityColor = (p: TaskPriority) => {
    switch(p) {
      case TaskPriority.HIGH: return 'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-500/10';
      case TaskPriority.MEDIUM: return 'text-amber-800 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-500/10';
      case TaskPriority.LOW: return 'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-500/10';
      default: return 'text-slate-700 bg-slate-50 border-slate-200 dark:text-slate-400 dark:bg-slate-500/10';
    }
  };

  const onDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragEnd = () => setDraggedTaskId(null);
  const onDragOver = (e: React.DragEvent) => e.preventDefault();

  const onDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) moveTask(taskId, columnId);
  };

  if (loading && columns.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-20 text-center space-y-8 animate-in fade-in duration-500">
        <Loader2 size={64} className="text-blue-600 animate-spin" />
        <h3 className="text-2xl font-black uppercase tracking-[0.4em] text-slate-400 italic">Sincronizando Board Comercial...</h3>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-10 pb-20 select-none">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div>
          <h3 className="text-5xl font-black italic tracking-tighter text-slate-950 dark:text-white uppercase leading-none">Fluxo Operacional</h3>
          <p className="text-[11px] text-slate-500 font-black mt-4 uppercase tracking-[0.4em]">Gestão de Tickets e Produtividade GTM</p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded-3xl shadow-xl">
            {(['ALL', TaskPriority.HIGH, TaskPriority.MEDIUM, TaskPriority.LOW] as const).map((f) => (
              <button
                key={f}
                onClick={() => setPriorityFilter(f)}
                className={`px-6 py-2.5 rounded-[18px] text-[10px] font-black uppercase transition-all ${
                  priorityFilter === f ? 'bg-slate-950 dark:bg-blue-600 text-white shadow-lg' : 'text-slate-500 dark:text-slate-400 hover:text-slate-950'
                }`}
              >
                {f === 'ALL' ? 'Todos' : f}
              </button>
            ))}
          </div>

          <button 
            onClick={() => { setEditingTask(null); setShowTaskModal(true); }}
            className="flex items-center gap-3 px-8 py-4.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-[11px] uppercase tracking-widest rounded-3xl shadow-2xl shadow-blue-600/20 transition-all active:scale-95"
          >
            <Plus size={20} /> Nova Atividade
          </button>
        </div>
      </div>

      <div className="flex gap-8 overflow-x-auto pb-12 scrollbar-hide px-2 items-start h-full min-h-[600px]">
        {columns.map((col) => {
          const columnTasks = tasks.filter(t => 
            t.status === col.id && 
            (priorityFilter === 'ALL' || t.priority === priorityFilter)
          );

          return (
            <div 
              key={col.id} 
              className="flex-shrink-0 w-80 lg:w-96 flex flex-col gap-6"
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, col.id)}
            >
              <div className="flex items-center justify-between px-6">
                <div className="flex items-center gap-4">
                  <span className={`w-3.5 h-3.5 rounded-full ${col.color} shadow-lg shadow-black/10`}></span>
                  <h4 className="font-black uppercase tracking-[0.3em] text-[12px] text-slate-950 dark:text-slate-200">{col.title}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setEditingColumn(col); setShowColumnModal(true); }} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Settings size={16} /></button>
                  <span className="text-[10px] font-black text-slate-950 dark:text-white bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">{columnTasks.length}</span>
                </div>
              </div>

              <div className={`min-h-[500px] flex-grow bg-white/40 dark:bg-slate-900/40 rounded-[48px] border border-slate-200 dark:border-slate-800/60 p-5 space-y-5 transition-all duration-300 ${draggedTaskId ? 'ring-2 ring-blue-500/20 ring-dashed border-blue-500/30' : ''}`}>
                {columnTasks.map(task => (
                  <div 
                    key={task.id} 
                    draggable
                    onDragStart={(e) => onDragStart(e, task.id)}
                    onDragEnd={onDragEnd}
                    onClick={() => setViewingTask(task)}
                    className={`bg-white dark:bg-slate-900 p-7 rounded-[36px] border border-slate-200 dark:border-white/5 group relative card-shadow hover:translate-y-[-4px] transition-all cursor-grab active:cursor-grabbing ${draggedTaskId === task.id ? 'scale-95 shadow-none ring-2 ring-blue-500' : ''}`}
                  >
                    <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-all flex gap-1.5 z-10">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setEditingTask(task); setShowTaskModal(true); }} 
                        className="p-2.5 bg-white dark:bg-slate-800 shadow-xl rounded-2xl text-slate-500 hover:text-blue-600 border border-slate-100 dark:border-slate-700"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); openDeleteTaskConfirm(task.id); }} 
                        className="p-2.5 bg-white dark:bg-slate-800 shadow-xl rounded-2xl text-slate-500 hover:text-rose-600 border border-slate-100 dark:border-slate-700"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-3 mb-6">
                      <GripVertical size={14} className="text-slate-300 dark:text-slate-700 -ml-2 group-hover:text-blue-500 transition-colors" />
                      <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                      {task.date && <span className="text-[10px] text-slate-500 font-black flex items-center gap-2 uppercase tracking-widest"><CalendarIcon size={12} className="text-blue-600" /> {new Date(task.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>}
                    </div>
                    
                    <h5 className="font-black text-slate-950 dark:text-white text-base mb-3 leading-tight uppercase tracking-tighter italic">{task.title}</h5>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-6 font-medium">{task.description}</p>
                    
                    <div className="w-full py-4 bg-slate-50 dark:bg-blue-600/10 hover:bg-slate-950 dark:hover:bg-blue-600 text-slate-950 dark:text-blue-400 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all border border-slate-200 dark:border-blue-500/20 flex items-center justify-center gap-3 shadow-sm">
                      <Eye size={16} /> Ver Detalhes
                    </div>
                  </div>
                ))}
                
                <button 
                  onClick={() => { setEditingTask({ status: col.id }); setShowTaskModal(true); }}
                  className="w-full py-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[36px] text-slate-400 hover:text-blue-600 hover:border-blue-500/40 transition-all group flex flex-col items-center justify-center gap-3 bg-white/20 dark:bg-transparent"
                >
                   <Plus size={20} className="group-hover:scale-125 transition-transform" />
                   <span className="text-[10px] font-black uppercase tracking-[0.3em]">Lançar Ticket</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modais de Edição/Criação já existentes... */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-slate-950/90 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-950 p-12 rounded-[56px] border border-slate-200 dark:border-slate-800 shadow-6xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-12">
              <h3 className="text-4xl font-black italic tracking-tighter text-slate-950 dark:text-white uppercase leading-none">
                {editingTask?.id ? 'Atualizar Ticket' : 'Nova Atividade'}
              </h3>
              <button onClick={() => setShowTaskModal(false)} className="p-4 bg-slate-100 dark:bg-slate-900 rounded-[20px] text-slate-500 hover:text-slate-950 transition-all"><X size={24} /></button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-8">
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Título da Operação</label>
                <input name="title" required defaultValue={editingTask?.title} className="w-full px-8 py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-slate-950 dark:text-white text-sm font-bold shadow-sm outline-none" placeholder="Ex: Contato comercial IES..." />
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Contextualização Estratégica</label>
                <textarea name="description" defaultValue={editingTask?.description} className="w-full px-8 py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-slate-950 dark:text-white text-sm h-40 resize-none font-medium leading-relaxed shadow-sm outline-none" placeholder="Objetivos e informações críticas..." />
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Status do Board</label>
                  <select name="status" defaultValue={editingTask?.status || (columns.length > 0 ? columns[0].id : '')} className="w-full px-8 py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-slate-950 dark:text-white text-sm font-bold appearance-none cursor-pointer shadow-sm outline-none">
                    {columns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Nível de Urgência</label>
                  <select name="priority" defaultValue={editingTask?.priority || TaskPriority.MEDIUM} className="w-full px-8 py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-slate-950 dark:text-white text-sm font-bold appearance-none cursor-pointer shadow-sm outline-none">
                    <option value={TaskPriority.LOW}>Baixa</option>
                    <option value={TaskPriority.MEDIUM}>Média</option>
                    <option value={TaskPriority.HIGH}>Alta</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Deadline</label>
                <input type="date" name="date" defaultValue={editingTask?.date ? new Date(editingTask.date).toISOString().split('T')[0] : ''} className="w-full px-8 py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-slate-950 dark:text-white text-sm font-bold shadow-sm outline-none" />
              </div>

              <div className="flex gap-6 pt-10">
                {editingTask?.id && (
                  <button type="button" onClick={() => openDeleteTaskConfirm(editingTask.id)} className="px-8 py-5 border-2 border-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white rounded-3xl transition-all font-black text-[11px] uppercase tracking-widest shadow-sm"><Trash2 size={24} /></button>
                )}
                <button type="button" onClick={() => setShowTaskModal(false)} className="flex-1 py-5 text-slate-500 font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 rounded-3xl transition-all">Descartar</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black text-[11px] uppercase tracking-widest rounded-3xl shadow-2xl shadow-blue-600/20 transition-all flex items-center justify-center gap-3">
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : editingTask?.id ? 'Salvar Alterações' : 'Criar Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showColumnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-slate-950/90 backdrop-blur-md">
          <div className="w-full max-w-lg bg-white dark:bg-slate-950 p-12 rounded-[56px] border border-slate-200 dark:border-slate-800 shadow-6xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-3xl font-black italic tracking-tighter text-slate-950 dark:text-white uppercase leading-none">Gestão de Status</h3>
              <button onClick={() => setShowColumnModal(false)} className="p-4 text-slate-400 hover:text-slate-950 transition-all"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleCreateColumn} className="space-y-8">
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Título da Lista</label>
                <input name="title" required defaultValue={editingColumn?.title} className="w-full px-8 py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-slate-950 dark:text-white text-sm font-bold shadow-sm outline-none" placeholder="Ex: Em Negociação..." />
              </div>
              <div className="space-y-4">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Cor Identificadora</label>
                <div className="grid grid-cols-3 gap-4">
                  {COLOR_OPTIONS.map(opt => (
                    <label key={opt.value} className={`cursor-pointer group flex flex-col items-center gap-3 p-4 rounded-3xl border transition-all ${editingColumn?.color === opt.value ? 'bg-slate-50 dark:bg-slate-900 border-blue-600 ring-4 ring-blue-600/5' : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-sm'}`}>
                      <input type="radio" name="color" value={opt.value} defaultChecked={editingColumn?.color === opt.value} className="hidden" />
                      <div className={`w-10 h-10 rounded-2xl ${opt.value} shadow-lg`}></div>
                      <span className="text-[9px] font-black uppercase text-center text-slate-700 dark:text-slate-400 leading-tight">{opt.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-4 pt-8">
                {editingColumn?.id && (
                  <button type="button" onClick={() => openDeleteColumnConfirm(editingColumn.id)} className="p-5 bg-rose-500/10 text-rose-600 hover:bg-rose-600 hover:text-white rounded-3xl border border-rose-100 transition-all shadow-sm"><Trash2 size={24} /></button>
                )}
                <button type="button" onClick={() => setShowColumnModal(false)} className="flex-1 py-5 text-slate-600 font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 rounded-3xl transition-all">Cancelar</button>
                <button type="submit" className="flex-1 py-5 bg-slate-950 dark:bg-blue-600 hover:bg-slate-800 text-white font-black text-[11px] uppercase tracking-widest rounded-3xl shadow-xl transition-all">Salvar Lista</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Visualizador de Ticket atualizado com Modal de Confirmação */}
      {viewingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-slate-950/95 backdrop-blur-xl">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-950 p-16 rounded-[64px] border border-slate-200 dark:border-white/5 shadow-6xl relative animate-in fade-in zoom-in-95 duration-300">
             <button onClick={() => setViewingTask(null)} className="absolute top-12 right-12 p-5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 rounded-[24px] text-slate-600 transition-all"><X size={24} /></button>
             
             <div className="flex items-center justify-between mb-12">
               <div className="flex items-center gap-5">
                 <span className={`px-5 py-2 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] border ${getPriorityColor(viewingTask.priority)} shadow-sm`}>{viewingTask.priority}</span>
                 {viewingTask.date && <span className="text-xs text-slate-500 font-black flex items-center gap-3 uppercase tracking-[0.2em]"><CalendarIcon size={18} className="text-blue-600" /> {new Date(viewingTask.date).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</span>}
               </div>
               <button 
                 onClick={() => openDeleteTaskConfirm(viewingTask.id)}
                 className="p-4 bg-rose-500/10 text-rose-600 hover:bg-rose-600 hover:text-white rounded-2xl transition-all border border-rose-100"
               >
                 <Trash2 size={20} />
               </button>
             </div>

             <h2 className="text-6xl font-black tracking-tighter text-slate-950 dark:text-white mb-10 leading-tight uppercase italic">{viewingTask.title}</h2>
             
             <div className="p-12 bg-slate-50 dark:bg-slate-900/60 rounded-[48px] border border-slate-200 dark:border-white/5 mb-12 shadow-inner">
               <p className="text-slate-900 dark:text-slate-200 text-xl leading-relaxed font-semibold italic">"{viewingTask.description || 'Sem descrição detalhada disponível.'}"</p>
             </div>

             <div className="flex items-center justify-between bg-slate-100/50 dark:bg-slate-900/40 p-8 rounded-[40px] border border-slate-200 dark:border-white/5">
                <div className="flex items-center gap-6">
                   <div className={`w-16 h-16 rounded-[24px] ${columns.find(c => c.id === viewingTask.status)?.color || 'bg-slate-950'} flex items-center justify-center text-white font-black text-2xl shadow-2xl uppercase`}>
                      {columns.find(c => c.id === viewingTask.status)?.title.charAt(0)}
                   </div>
                   <div>
                     <p className="text-[11px] text-slate-500 font-black uppercase tracking-[0.4em] mb-1.5">Status da Operação</p>
                     <p className="text-lg font-black text-slate-950 dark:text-white uppercase tracking-tight italic">{columns.find(c => c.id === viewingTask.status)?.title || 'Status Indefinido'}</p>
                   </div>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => openDeleteTaskConfirm(viewingTask.id)}
                    className="px-6 py-6 border-2 border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-white font-black text-[12px] uppercase tracking-widest rounded-3xl transition-all"
                  >
                    Excluir
                  </button>
                  <button 
                    onClick={() => { setEditingTask(viewingTask); setViewingTask(null); setShowTaskModal(true); }}
                    className="px-12 py-6 bg-blue-600 hover:bg-blue-500 text-white font-black text-[12px] uppercase tracking-[0.3em] rounded-3xl transition-all shadow-2xl active:scale-95 border border-white/10"
                  >
                    Editar Ticket
                  </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação Unificado */}
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
