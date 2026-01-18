
export interface CommercialEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  location?: string;
  type: 'MANUAL' | 'AUTO_TASK';
  taskId?: string;
  createdBy: string;
}

export interface CalendarState {
  events: CommercialEvent[];
  loading: boolean;
}
