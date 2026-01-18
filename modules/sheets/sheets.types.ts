
export interface GoogleSheet {
  id: string;
  userId: string;
  title: string;
  url: string;
  category: string;
  description?: string;
  createdAt: string;
}

export interface SheetsState {
  sheets: GoogleSheet[];
  loading: boolean;
}
