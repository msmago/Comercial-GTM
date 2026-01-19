
export interface ContractTemplate {
  id: string;
  name: string;
  content: string; // Conteúdo extraído/texto base
  fileUrl?: string;
  createdAt: string;
}

export interface GeneratedContract {
  id: string;
  templateId: string;
  companyId: string;
  finalText: string;
  status: 'DRAFT' | 'SIGNED' | 'EXPIRED';
  createdAt: string;
}

export interface ContractsState {
  templates: ContractTemplate[];
  generated: GeneratedContract[];
  loading: boolean;
}
