
export enum PipelineStatus {
  PROSPECT = 'PROSPECT',
  CONTACTED = 'CONTACTED',
  NEGOTIATION = 'NEGOTIATION',
  PARTNER = 'PARTNER',
  CHURN = 'CHURN'
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

export interface CRMState {
  companies: Company[];
  loading: boolean;
}
