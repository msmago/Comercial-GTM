
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { InventoryState, InventoryItem } from './inventory.types';
import { InventoryService } from './inventory.service';
import { useAuth } from '../auth/auth.store';

interface InventoryContextType extends InventoryState {
  refresh: () => Promise<void>;
  saveItem: (i: Partial<InventoryItem>) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [state, setState] = useState<InventoryState>({ inventory: [], loading: false });

  const refresh = useCallback(async () => {
    if (!user) return;
    setState(s => ({ ...s, loading: true }));
    const inventory = await InventoryService.getInventory();
    setState({ inventory, loading: false });
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const saveItem = async (i: Partial<InventoryItem>) => {
    await InventoryService.upsertItem(i);
    await refresh();
  };

  const removeItem = async (id: string) => {
    await InventoryService.deleteItem(id);
    await refresh();
  };

  return (
    <InventoryContext.Provider value={{ ...state, refresh, saveItem, removeItem }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) throw new Error('useInventory must be used within InventoryProvider');
  return context;
};
