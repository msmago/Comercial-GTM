
export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  lastUpdate: string;
}

export interface InventoryState {
  inventory: InventoryItem[];
  loading: boolean;
}
