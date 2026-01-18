
import { supabase } from '../../shared/lib/supabase';
import { InventoryItem } from './inventory.types';

export const InventoryService = {
  async getInventory(): Promise<InventoryItem[]> {
    const { data } = await supabase
      .from('inventory')
      .select('*')
      .order('name', { ascending: true });
    
    return (data || []).map(i => ({
      id: i.id,
      name: i.name,
      category: i.category,
      quantity: i.quantity,
      minQuantity: i.min_quantity,
      lastUpdate: i.last_update
    }));
  },

  async upsertItem(item: Partial<InventoryItem>) {
    const payload = {
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      min_quantity: item.minQuantity,
      last_update: new Date().toISOString()
    };
    if (item.id) return supabase.from('inventory').update(payload).eq('id', item.id);
    return supabase.from('inventory').insert([payload]);
  },

  async deleteItem(id: string) {
    return supabase.from('inventory').delete().eq('id', id);
  }
};
