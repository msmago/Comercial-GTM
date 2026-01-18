
/**
 * Arquivo de tipos globais.
 * As definições específicas de domínio foram movidas para seus respectivos módulos em /modules.
 * Este arquivo permanece apenas para compatibilidade ou tipos compartilhados de baixo nível.
 */

export type Role = 'ADMIN' | 'MANAGER' | 'USER';

export interface GlobalConfig {
  version: string;
  env: string;
}
