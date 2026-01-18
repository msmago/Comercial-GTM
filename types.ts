
/**
 * Arquivo de tipos globais.
 * Definições movidas para módulos específicos em /modules para evitar conflitos.
 */

export type UserRole = 'ADMIN' | 'MANAGER' | 'USER';

export interface AppConfig {
  apiUrl: string;
  version: string;
}
