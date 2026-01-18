
export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export interface KanbanColumn {
  id: string;
  userId: string;
  title: string;
  color: string;
  order: number;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: string; // ID da Coluna
  priority: TaskPriority;
  date?: string;
  createdAt: string;
}

export interface KanbanState {
  columns: KanbanColumn[];
  tasks: Task[];
  loading: boolean;
}
