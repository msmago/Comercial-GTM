
export enum PipelineStatus {
  PROSPECT = 'PROSPECT',
  CONTACTED = 'CONTACTED',
  NEGOTIATION = 'NEGOTIATION',
  PARTNER = 'PARTNER',
  CHURN = 'CHURN'
}

export enum TaskStatus {
  BACKLOG = 'BACKLOG',
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE'
}

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

export interface Contact {
  id: string;
  name: string;
  role: string;
  whatsapp: string;
  email: string;
}

export interface Company {
  id: string;
  userId: string;
  name: string;
  status: PipelineStatus;
  targetIES: string;
  contacts: Contact[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: string;
  priority: TaskPriority;
  date?: string;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  lastUpdate: string;
}

export interface GoogleSheet {
  id: string;
  userId: string;
  title: string;
  url: string;
  category: string;
  description?: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'USER';
}
