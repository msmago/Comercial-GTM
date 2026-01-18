
# GTM PRO - Commercial Intelligence

GTM PRO é um SaaS B2B de elite focado na gestão estratégica de parcerias para Instituições de Ensino Superior (IES).

## 🧱 Arquitetura de Domínios

O sistema foi refatorado para seguir uma arquitetura modular por domínio:

- **src/modules/**: Contém a lógica de negócio isolada (Auth, Kanban, CRM, etc).
  - `*.service.ts`: Comunicação pura com Supabase (sem estado).
  - `*.store.tsx`: Gerenciamento de estado (Context/Hooks) que consome os serviços.
  - `*.types.ts`: Tipagem forte do domínio.
- **src/shared/**: Componentes de UI, bibliotecas (Supabase client), hooks e utilitários globais.
- **src/pages/**: Orquestração de layout e consumo de stores.

## 🛡️ Segurança e RLS (Row Level Security)

A segurança é garantida no nível de banco de dados:

- **Dados Privados**: Tabelas como `tasks`, `companies` e `google_sheets` possuem políticas RLS onde `user_id = auth.uid()`.
- **Dados Compartilhados**: Tabelas como `commercial_events` e `inventory` possuem políticas de leitura pública mas escrita restrita a roles específicas.

## 🚀 Setup Local

1. Clone o repositório.
2. Configure as variáveis de ambiente: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `API_KEY` (Gemini).
3. Instale dependências: `npm install`.
4. Inicie o desenvolvimento: `npm run dev`.

## 🛠️ Tech Stack

- **React 19**: UI e Gerenciamento de Estado.
- **Tailwind CSS**: Estilização premium e dark mode.
- **Supabase**: Backend-as-a-Service (Auth, DB, RLS).
- **Gemini API**: Inteligência Artificial para análise estratégica GTM.
