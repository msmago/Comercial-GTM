
import { UserRole } from '../../types';

export interface AdminStats {
  totalTasks: number;
  activeConsultants: number;
  totalCompanies: number;
  criticalInventoryItems: number;
}

export interface ConsultantPerformance {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  taskCount: number;
  companyCount: number;
  lastActionAt: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface InventoryMovement {
  id: string;
  itemName: string;
  type: 'IN' | 'OUT';
  quantity: number;
  responsible: string;
  reason: string;
  createdAt: string;
}
