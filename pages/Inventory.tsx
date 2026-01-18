
import React, { useState } from 'react';
import { useInventory } from '../modules/inventory/inventory.store';
import { 
  Package, Plus, Minus, Trash2, Tag, AlertCircle
} from 'lucide-react';
import ConfirmModal from '../shared/components/ConfirmModal';

const Inventory = () => {
  const { inventory, saveItem, removeItem } = useInventory();
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleUpdateStock = (id: string, delta: number) => {
    const item = inventory.find(i => i.id === id);
    if (item) {
      const newQty = Math.max(0, item.quantity + delta);
      saveItem({ ...item, quantity: newQty });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      id: editingItem?.id,
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      quantity: Number(formData.get('quantity')),
      minQuantity: Number(formData.get('minQuantity')),
    };
    saveItem(data);
    setShowModal(false);
    setEditingItem(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div>
          <h3 className="text-3xl font-black italic tracking-tighter text-slate-950 dark:text-white uppercase leading-none">Gestão de Materiais</h3>
          <p className="text-[10px] text-slate-700 dark:text-slate-500 font-bold mt-2 uppercase tracking-[0.3em]">Controle logístico de itens e suporte operacional</p>
        </div>
        <button 
          onClick={() => { setEditingItem(null); setShowModal(true); }}
          className="flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-blue-600/20 active:scale-95"
        >
          <Plus size={20} /> Cadastrar Novo Item
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {inventory.map(item => {
          const isCritical = item.quantity < item.minQuantity;
          return (
            <div key={item.id} className={`bg-white dark:bg-slate-900/40 p-7 rounded-[40px] border transition-all hover:scale-[1.02] active:scale-[0.98] card-shadow relative overflow-hidden group ${isCritical ? 'border-rose-300 ring-4 ring-rose-500/5' : 'border-slate-200 dark:border-white/5'}`}>
              {isCritical && (
                <div className="absolute top-0 right-0 px-5 py-2.5 bg-rose-600 text-white text-[9px] font-black uppercase tracking-widest rounded-bl-3xl shadow-lg flex items-center gap-2">
                  <AlertCircle size={12} /> Ruptura Iminente
                </div>
              )}
              
              <div className="flex items-start gap-5 mb-8">
                <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl text-blue-600 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm group-hover:border-blue-500 transition-colors">
                  <Package size={26} />
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-black text-slate-950 dark:text-white text-lg leading-tight truncate uppercase tracking-tight mb-1">{item.name}</h4>
                  <div className="flex items-center gap-2 text-[9px] text-slate-600 dark:text-slate-500 font-black uppercase tracking-[0.2em]">
                    <Tag size={12} className="text-blue-600" /> {item.category}
                  </div>
                </div>
              </div>

              <div className="flex items-end justify-between bg-slate-50 dark:bg-slate-950/40 p-6 rounded-3xl border border-slate-200 dark:border-white/5">
                <div>
                  <p className="text-[10px] text-slate-600 dark:text-slate-500 font-black uppercase tracking-widest mb-1.5">Estoque Disponível</p>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-5xl font-black tracking-tighter ${isCritical ? 'text-rose-600' : 'text-slate-950 dark:text-white'}`}>{item.quantity}</span>
                    <span className="text-[11px] text-slate-600 dark:text-slate-500 font-black uppercase tracking-widest">Unid.</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleUpdateStock(item.id, -1)} className="p-3.5 rounded-xl bg-white dark:bg-slate-800 text-slate-600 hover:text-rose-600 border border-slate-200 dark:border-transparent shadow-sm active:scale-90 transition-all"><Minus size={20} /></button>
                  <button onClick={() => handleUpdateStock(item.id, 1)} className="p-3.5 rounded-xl bg-white dark:bg-slate-800 text-slate-600 hover:text-emerald-600 border border-slate-200 dark:border-transparent shadow-sm active:scale-90 transition-all"><Plus size={20} /></button>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-500">
                  Limite de Segurança: <span className="text-blue-600 ml-1 font-black">{item.minQuantity}</span>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => { setEditingItem(item); setShowModal(true); }} className="text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-blue-600 transition-colors">Editar</button>
                  <button onClick={() => setDeleteConfirmId(item.id)} className="text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-rose-600 transition-colors">Excluir</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-950 p-10 rounded-[48px] border border-slate-200 dark:border-white/5 shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-3xl font-black italic tracking-tighter text-slate-950 dark:text-white uppercase mb-8 leading-none">
              {editingItem ? 'Atualizar Item' : 'Novo Registro'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-600 dark:text-slate-500 uppercase tracking-widest ml-1">Identificação do Produto</label>
                <input name="name" required defaultValue={editingItem?.name} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 text-slate-950 dark:text-white text-sm font-bold" placeholder="Ex: Kit Vestibular..." />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-600 dark:text-slate-500 uppercase tracking-widest ml-1">Categoria Comercial</label>
                <input name="category" required defaultValue={editingItem?.category} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 text-slate-950 dark:text-white text-sm font-bold" placeholder="Ex: Promocional..." />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-600 dark:text-slate-500 uppercase tracking-widest ml-1">Quantidade Inicial</label>
                  <input type="number" name="quantity" required defaultValue={editingItem?.quantity || 0} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-950 dark:text-white text-sm font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-600 dark:text-slate-500 uppercase tracking-widest ml-1">Estoque Mínimo</label>
                  <input type="number" name="minQuantity" required defaultValue={editingItem?.minQuantity || 0} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-950 dark:text-white text-sm font-bold" />
                </div>
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-100 rounded-2xl transition-all">Cancelar</button>
                <button type="submit" className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all">Confirmar Saldo</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={!!deleteConfirmId}
        title="Remover do Inventário"
        message="Deseja excluir este item do controle logístico?"
        onConfirm={() => { if(deleteConfirmId) removeItem(deleteConfirmId); setDeleteConfirmId(null); }}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
};

export default Inventory;
