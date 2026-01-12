
import React, { useState } from 'react';
import { useStore } from '../store';
import { 
  Package, 
  Plus, 
  Minus, 
  Trash2,
  Tag
} from 'lucide-react';

const Inventory = () => {
  const { inventory, upsertInventory, deleteInventory } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const handleUpdateStock = (id: string, delta: number) => {
    const item = inventory.find(i => i.id === id);
    if (item) {
      const newQty = Math.max(0, item.quantity + delta);
      upsertInventory({ ...item, quantity: newQty });
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
    upsertInventory(data);
    setShowModal(false);
    setEditingItem(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-3xl font-black italic tracking-tighter text-white uppercase leading-none">Gestão de Materiais</h3>
          <p className="text-sm text-slate-500 font-medium mt-2">Controle logístico de itens promocionais e de suporte operacional</p>
        </div>
        <button 
          onClick={() => { setEditingItem(null); setShowModal(true); }}
          className="flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-blue-600/20"
        >
          <Plus size={20} />
          Cadastrar Novo Item
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {inventory.map(item => (
          <div key={item.id} className={`glass p-6 rounded-[32px] border-white/5 relative overflow-hidden group shadow-2xl transition-all hover:translate-y-[-4px] ${item.quantity < item.minQuantity ? 'ring-2 ring-inset ring-rose-500/40 bg-rose-500/5' : 'bg-slate-900/40'}`}>
            {item.quantity < item.minQuantity && (
              <div className="absolute top-0 right-0 px-4 py-2 bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest rounded-bl-2xl shadow-lg animate-pulse">
                Ruptura de Estoque
              </div>
            )}
            
            <div className="flex items-start gap-5 mb-8">
              <div className="w-12 h-12 bg-slate-800 rounded-2xl text-blue-400 flex items-center justify-center border border-slate-700 shadow-inner group-hover:border-blue-500/50 transition-colors">
                <Package size={24} />
              </div>
              <div className="overflow-hidden">
                <h4 className="font-black text-slate-100 text-lg leading-tight truncate uppercase tracking-tight">{item.name}</h4>
                <div className="flex items-center gap-2 text-[9px] text-slate-500 mt-1 font-black uppercase tracking-[0.2em]">
                  <Tag size={12} className="text-blue-500" />
                  {item.category}
                </div>
              </div>
            </div>

            <div className="flex items-end justify-between bg-slate-950/40 p-5 rounded-2xl border border-white/5 shadow-inner">
              <div>
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Disponível</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-white tracking-tighter">{item.quantity}</span>
                  <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Unid.</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleUpdateStock(item.id, -1)}
                  className="p-3 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-all border border-slate-700 shadow-lg active:scale-95"
                >
                  <Minus size={20} />
                </button>
                <button 
                  onClick={() => handleUpdateStock(item.id, 1)}
                  className="p-3 rounded-xl bg-slate-800 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 transition-all border border-slate-700 shadow-lg active:scale-95"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800/60 flex items-center justify-between">
              <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
                Gatilho de Alerta: <span className="text-blue-400 ml-1">{item.minQuantity}</span>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => { setEditingItem(item); setShowModal(true); }} 
                  className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-400 transition-colors"
                >
                  Editar
                </button>
                <button 
                  onClick={() => { if(confirm('Excluir item do inventário?')) deleteInventory(item.id) }} 
                  className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-rose-500 transition-colors"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        ))}
        {inventory.length === 0 && (
          <div className="col-span-full py-32 text-center glass rounded-[40px] border-dashed border-2 border-slate-800/60 opacity-30">
            <Package size={64} className="mx-auto text-slate-700 mb-6" />
            <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-500">Nenhum Material em Estoque</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md">
          <div className="w-full max-w-lg glass p-10 rounded-[40px] animate-in zoom-in-95 duration-300 border-white/5 shadow-2xl bg-slate-950">
            <h3 className="text-3xl font-black italic tracking-tighter text-white uppercase mb-8">
              {editingItem ? 'Editar Material' : 'Novo Registro'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Identificação do Produto</label>
                <input 
                  name="name" 
                  required 
                  defaultValue={editingItem?.name} 
                  className="w-full px-6 py-4 bg-slate-900/50 border border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 text-white text-sm transition-all font-medium" 
                  placeholder="Ex: Kit Brinde Vestibular 2026..." 
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Categoria de Uso</label>
                <input 
                  name="category" 
                  required 
                  defaultValue={editingItem?.category} 
                  className="w-full px-6 py-4 bg-slate-900/50 border border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 text-white text-sm transition-all font-medium" 
                  placeholder="Ex: Comercial / Marketing / Eventos..." 
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Qtd. Inicial</label>
                  <input 
                    type="number" 
                    name="quantity" 
                    required 
                    defaultValue={editingItem?.quantity || 0} 
                    className="w-full px-6 py-4 bg-slate-900/50 border border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 text-white text-sm transition-all font-medium" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Mínimo (Alerta)</label>
                  <input 
                    type="number" 
                    name="minQuantity" 
                    required 
                    defaultValue={editingItem?.minQuantity || 0} 
                    className="w-full px-6 py-4 bg-slate-900/50 border border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 text-white text-sm transition-all font-medium" 
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-12">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="flex-1 py-4 text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-900 rounded-2xl transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-blue-600/20"
                >
                  Salvar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
