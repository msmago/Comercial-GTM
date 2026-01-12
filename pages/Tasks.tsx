
import React, { useState } from 'react';
import { useStore } from '../store';
import { TaskStatus, TaskPriority } from '../types';
import { 
  Plus, MoreHorizontal, Trash2, Calendar as CalendarIcon,
  ChevronLeft, ChevronRight, Filter, Edit2, Loader2
} from 'lucide-react';

const Tasks = () => {
  const { tasks, upsertTask, deleteTask } = useStore();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'ALL'>('ALL');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const columns = [
    { id: TaskStatus.BACKLOG, title: 'Backlog', color: 'bg-slate-700' },
    { id: TaskStatus.TODO, title: 'A Fazer', color: 'bg-blue-600' },
    { id: TaskStatus.IN_PROGRESS, title: 'Em Execução', color: 'bg-amber-500' },
    { id: TaskStatus.DONE, title: 'Concluído', color: 'bg-emerald-600' },
  ];

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    const formData = new FormData(e.target as HTMLFormElement);
    
    const result = await upsertTask({
      id: editingTask?.id,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      status: formData.get('status') as TaskStatus,
      priority: formData.get('priority') as TaskPriority,
      date: formData.get('date') as string || undefined,
    });

    setIsSubmitting(false);
    
    if (result.success) {
      setShowTaskModal(false);
      setEditingTask(null);
    } else {
      alert(`ERRO AO SALVAR TAREFA:\n${result.error || 'Erro desconhecido'}`);
    }
  };

  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  return (
    <div className="h-full flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold">Gestão Operacional</h3>
          <p className="text-sm text-slate-500">Fluxo de atividades comerciais e táticas</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800">
            <Filter size={14} className="ml-2 text-slate-500" />
            {(['ALL', TaskPriority.HIGH, TaskPriority.MEDIUM, TaskPriority.LOW] as const).map((f) => (
              <button
                key={f}
                onClick={() => setPriorityFilter(f)}
                className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all ${
                  priorityFilter === f ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {f === 'ALL' ? 'Todos' : f}
              </button>
            ))}
          </div>

          <button 
            onClick={() => { setEditingTask(null); setShowTaskModal(true); }}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg"
          >
            <Plus size={20} /> Adicionar Tarefa
          </button>
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-6">
        {columns.map((col) => (
          <div key={col.id} className="flex-shrink-0 w-80 flex flex-col gap-4">
            <div className="flex items-center gap-3 px-2">
              <span className={`w-2.5 h-2.5 rounded-full ${col.color}`}></span>
              <h4 className="font-bold uppercase tracking-widest text-xs text-slate-400">{col.title}</h4>
            </div>

            <div 
              className="flex-1 min-h-[500px] bg-slate-900/30 rounded-2xl border border-dashed border-slate-800/60 p-3 space-y-3"
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                const id = e.dataTransfer.getData('taskId');
                const t = tasks.find(x => x.id === id);
                if (t) upsertTask({ ...t, status: col.id });
              }}
            >
              {tasks.filter(t => t.status === col.id && (priorityFilter === 'ALL' || t.priority === priorityFilter)).map(task => (
                <div 
                  key={task.id}
                  draggable
                  onDragStart={e => e.dataTransfer.setData('taskId', task.id)}
                  className="glass p-4 rounded-xl border-white/5 cursor-grab hover:border-blue-500/30 transition-all group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{task.priority}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => { setEditingTask(task); setShowTaskModal(true); }} className="p-1 text-slate-500 hover:text-blue-400"><Edit2 size={14} /></button>
                      <button onClick={() => deleteTask(task.id)} className="p-1 text-slate-500 hover:text-rose-500"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <h5 className="font-bold text-slate-200 mb-1">{task.title}</h5>
                  <p className="text-xs text-slate-500 line-clamp-2">{task.description}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm">
          <div key={editingTask?.id || 'new-task'} className="w-full max-w-lg glass p-8 rounded-3xl animate-in zoom-in-95 border-white/5 shadow-2xl">
            <h3 className="text-2xl font-bold mb-6">{editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <input name="title" required defaultValue={editingTask?.title || ''} placeholder="Título" className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl outline-none" />
              <textarea name="description" defaultValue={editingTask?.description || ''} placeholder="Descrição" className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl h-24 resize-none" />
              <div className="grid grid-cols-2 gap-4">
                <select name="priority" defaultValue={editingTask?.priority || TaskPriority.MEDIUM} className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl">
                  <option value={TaskPriority.LOW}>Baixa</option>
                  <option value={TaskPriority.MEDIUM}>Média</option>
                  <option value={TaskPriority.HIGH}>Alta</option>
                </select>
                <select name="status" defaultValue={editingTask?.status || TaskStatus.TODO} className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl">
                  <option value={TaskStatus.BACKLOG}>Backlog</option>
                  <option value={TaskStatus.TODO}>A Fazer</option>
                  <option value={TaskStatus.IN_PROGRESS}>Execução</option>
                  <option value={TaskStatus.DONE}>Concluído</option>
                </select>
              </div>
              <input type="date" name="date" defaultValue={formatDateForInput(editingTask?.date)} className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl" />
              <div className="flex gap-3 mt-8">
                <button type="button" onClick={() => setShowTaskModal(false)} className="flex-1 py-3 text-slate-400 font-bold hover:bg-slate-800 rounded-xl">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center">
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
