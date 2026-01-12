
import React, { useState } from 'react';
import { useStore } from '../store';
import { TaskStatus, TaskPriority } from '../types';
import { 
  Plus, MoreHorizontal, Trash2, Calendar as CalendarIcon,
  ChevronLeft, ChevronRight, Filter, Edit2
} from 'lucide-react';

const Tasks = () => {
  const { tasks, upsertTask, deleteTask } = useStore();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'ALL'>('ALL');

  const columns = [
    { id: TaskStatus.BACKLOG, title: 'Backlog', color: 'bg-slate-700' },
    { id: TaskStatus.TODO, title: 'A Fazer', color: 'bg-blue-600' },
    { id: TaskStatus.IN_PROGRESS, title: 'Em Execução', color: 'bg-amber-500' },
    { id: TaskStatus.DONE, title: 'Concluído', color: 'bg-emerald-600' },
  ];

  const handleOpenNewTask = () => {
    setEditingTask(null);
    setShowTaskModal(true);
  };

  const handleOpenEditTask = (task: any) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const data = {
      // Se estamos editando, passamos o ID. Se é novo, deixamos undefined para o store gerar.
      id: editingTask?.id || undefined,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      status: formData.get('status') as TaskStatus,
      priority: formData.get('priority') as TaskPriority,
      date: formData.get('date') as string || undefined,
    };

    upsertTask(data);
    setShowTaskModal(false);
    setEditingTask(null);
  };

  const moveTask = (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) upsertTask({ ...task, status: newStatus });
  };

  const getPriorityColor = (p: TaskPriority) => {
    switch(p) {
      case TaskPriority.HIGH: return 'text-rose-500 bg-rose-500/10';
      case TaskPriority.MEDIUM: return 'text-amber-500 bg-amber-500/10';
      case TaskPriority.LOW: return 'text-emerald-500 bg-emerald-500/10';
    }
  };

  const getPriorityLabel = (p: TaskPriority) => {
    switch(p) {
      case TaskPriority.HIGH: return 'Alta';
      case TaskPriority.MEDIUM: return 'Média';
      case TaskPriority.LOW: return 'Baixa';
    }
  };

  return (
    <div className="h-full flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold">Gestão Operacional</h3>
          <p className="text-sm text-slate-500">Fluxo de atividades comerciais e táticas</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Filtros de Prioridade */}
          <div className="flex items-center gap-2 bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800">
            <div className="px-2 text-slate-500">
              <Filter size={14} />
            </div>
            {[
              { id: 'ALL', label: 'Todos' },
              { id: TaskPriority.HIGH, label: 'Alta' },
              { id: TaskPriority.MEDIUM, label: 'Média' },
              { id: TaskPriority.LOW, label: 'Baixa' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setPriorityFilter(f.id as any)}
                className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                  priorityFilter === f.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button 
            onClick={handleOpenNewTask}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20"
          >
            <Plus size={20} />
            Adicionar Tarefa
          </button>
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-6 -mx-6 px-6 lg:mx-0 lg:px-0">
        {columns.map((col, colIndex) => {
          const colTasks = tasks.filter(t => 
            t.status === col.id && 
            (priorityFilter === 'ALL' || t.priority === priorityFilter)
          );

          return (
            <div key={col.id} className="flex-shrink-0 w-80 flex flex-col gap-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full ${col.color}`}></span>
                  <h4 className="font-bold uppercase tracking-widest text-xs text-slate-400">{col.title}</h4>
                  <span className="bg-slate-800 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {colTasks.length}
                  </span>
                </div>
                <button className="text-slate-600 hover:text-slate-400"><MoreHorizontal size={18} /></button>
              </div>

              <div 
                className="flex-1 min-h-[500px] bg-slate-900/30 rounded-2xl border border-dashed border-slate-800/60 p-3 space-y-3"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const taskId = e.dataTransfer.getData('taskId');
                  moveTask(taskId, col.id);
                }}
              >
                {colTasks.map(task => (
                  <div 
                    key={task.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('taskId', task.id)}
                    className="glass p-4 rounded-xl border-white/5 cursor-grab active:cursor-grabbing hover:border-white/10 transition-all group shadow-md"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                        Prioridade {getPriorityLabel(task.priority)}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => handleOpenEditTask(task)}
                          className="text-slate-500 hover:text-blue-400 p-1"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => deleteTask(task.id)}
                          className="text-slate-500 hover:text-rose-500 p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <h5 className="font-bold text-slate-200 mb-1 leading-tight">{task.title}</h5>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-3">{task.description}</p>
                    
                    <div className="flex items-center justify-between">
                      {(task.date) ? (
                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-blue-400 bg-blue-500/10 px-2 py-1 rounded-lg w-fit">
                          <CalendarIcon size={12} />
                          Prazo: {new Date(task.date).toLocaleDateString('pt-BR')}
                        </div>
                      ) : <div />}

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        {colIndex > 0 && (
                          <button 
                            onClick={() => moveTask(task.id, columns[colIndex - 1].id)}
                            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-blue-400 transition-colors border border-slate-700/50"
                            title={`Mover para ${columns[colIndex - 1].title}`}
                          >
                            <ChevronLeft size={14} />
                          </button>
                        )}
                        {colIndex < columns.length - 1 && (
                          <button 
                            onClick={() => moveTask(task.id, columns[colIndex + 1].id)}
                            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-blue-400 transition-colors border border-slate-700/50"
                            title={`Mover para ${columns[colIndex + 1].title}`}
                          >
                            <ChevronRight size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {colTasks.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center opacity-20">
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                      {priorityFilter === 'ALL' ? 'Coluna Sem Registros' : 'Nenhuma tarefa com esta prioridade'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg glass p-8 rounded-3xl animate-in zoom-in-95 duration-200 border-white/5 shadow-2xl">
            <h3 className="text-2xl font-bold mb-6">
              {editingTask ? 'Editar Atividade' : 'Nova Atividade'}
            </h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Título da Atividade</label>
                <input
                  name="title"
                  required
                  defaultValue={editingTask?.title || ''}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Ex: Reunião estratégica de expansão..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Detalhamento (Opcional)</label>
                <textarea
                  name="description"
                  defaultValue={editingTask?.description || ''}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none transition-all"
                  placeholder="Descreva os objetivos desta tarefa..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Nível de Urgência</label>
                  <select
                    name="priority"
                    defaultValue={editingTask?.priority || TaskPriority.MEDIUM}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                  >
                    <option value={TaskPriority.LOW}>Baixa</option>
                    <option value={TaskPriority.MEDIUM}>Média</option>
                    <option value={TaskPriority.HIGH}>Alta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Estágio Inicial</label>
                  <select
                    name="status"
                    defaultValue={editingTask?.status || TaskStatus.TODO}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                  >
                    <option value={TaskStatus.BACKLOG}>Backlog</option>
                    <option value={TaskStatus.TODO}>A Fazer</option>
                    <option value={TaskStatus.IN_PROGRESS}>Em Execução</option>
                    <option value={TaskStatus.DONE}>Concluído</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Data de Vencimento</label>
                <input
                  type="date"
                  name="date"
                  defaultValue={editingTask?.date || ''}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
                <p className="text-[10px] text-blue-400 mt-2 font-bold uppercase tracking-tighter">* Definir data gera automaticamente um evento no calendário comercial.</p>
              </div>
              <div className="flex gap-3 mt-8">
                <button 
                  type="button" 
                  onClick={() => setShowTaskModal(false)}
                  className="flex-1 py-3 text-slate-400 font-bold hover:bg-slate-800 rounded-xl transition-all"
                >
                  Descartar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20"
                >
                  Salvar Atividade
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
