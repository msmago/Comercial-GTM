
import React, { useState } from 'react';
import { useStore } from '../store';
import { 
  Package, 
  Plus, 
  Minus, 
  History,
  Trash2,
  Tag
} from 'lucide-react';

const Inventory = () => {
  const { inventory, logs, upsertInventory, deleteInventory } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const inventoryLogs = logs.filter(l => l.entity === 'Inventory' || l.entity === 'InventoryItem');

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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold">Gestão de Materiais</h3>
            <p className="text-sm text-slate-500">Controle logístico de itens promocionais e de suporte</p>
          </div>
          <button 
            onClick={() => { setEditingItem(null); setShowModal(true); }}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20"
          >
            <Plus size={20} />
            Cadastrar Item
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {inventory.map(item => (
            <div key={item.id} className={`glass p-6 rounded-3xl border-white/5 relative overflow-hidden group shadow-xl ${item.quantity < item.minQuantity ? 'ring-2 ring-inset ring-rose-500/40' : ''}`}>
              {item.quantity < item.minQuantity && (
                <div className="absolute top-0 right-0 p-3 bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest rounded-bl-2xl shadow-lg">
                  Estoque Baixo
                </div>
              )}
              
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-slate-800 rounded-xl text-blue-400 border border-slate-700 shadow-inner">
                  <Package size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-100 text-lg leading-tight">{item.name}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1 font-bold uppercase tracking-widest">
                    <Tag size={12} className="text-slate-600" />
                    {item.category}
                  </div>
                </div>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Qtd. Disponível</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white">{item.quantity}</span>
                    <span className="text-xs text-slate-500 font-bold">unid.</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleUpdateStock(item.id, -1)}
                    title="Remover uma unidade"
                    className="p-2 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-all border border-slate-700 shadow-sm"
                  >
                    <Minus size={20} />
                  </button>
                  <button 
                    onClick={() => handleUpdateStock(item.id, 1)}
                    title="Adicionar uma unidade"
                    className="p-2 rounded-lg bg-slate-800 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 transition-all border border-slate-700 shadow-sm"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                <div className="text-slate-500">Mínimo Ideal: <span className="text-slate-200">{item.minQuantity}</span></div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => { setEditingItem(item); setShowModal(true); }} className="text-blue-400 hover:text-blue-300">Editar</button>
                  <button onClick={() => deleteInventory(item.id)} className="text-rose-500 hover:text-rose-400">Excluir</button>
                </div>
              </div>
            </div>
          ))}
          {inventory.length === 0 && (
            <div className="col-span-full py-24 text-center glass rounded-[40px] border-dashed border-2 border-slate-800/60 opacity-40">
              <Package size={48} className="mx-auto text-slate-700 mb-4" />
              <p className="text-slate-500 font-black uppercase tracking-widest">Nenhum Material em Estoque</p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="glass p-8 rounded-[32px] border-white/5 h-fit shadow-2xl">
          <h3 className="text-lg font-bold mb-8 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
            Histórico de Movimentação
          </h3>
          <div className="space-y-6">
            {inventoryLogs.slice(0, 8).map(log => (
              <div key={log.id} className="relative pl-6 border-l border-slate-800 py-1">
                <div className={`absolute -left-[4px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${log.action === 'CREATE' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : log.action === 'DELETE' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'}`}></div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    {log.action === 'CREATE' ? 'Criação' : log.action === 'UPDATE' ? 'Atualização' : 'Remoção'}
                  </span>
                  <span className="text-[9px] text-slate-600 font-bold uppercase">{new Date(log.timestamp).toLocaleTimeString('pt-BR')}</span>
                </div>
                <p className="text-xs font-medium text-slate-400 leading-snug">{log.details}</p>
              </div>
            ))}
            {inventoryLogs.length === 0 && (
              <div className="text-center py-6 opacity-30">
                <p className="text-xs font-bold uppercase tracking-widest">Sem movimentações recentes</p>
              </div>
            )}
          </div>
          <button className="w-full mt-10 py-3 bg-slate-800/40 hover:bg-slate-800 text-slate-500 hover:text-white text-[10px] font-bold rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest border border-slate-700/50">
            <History size={14} />
            Relatório de Auditoria
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg glass p-8 rounded-3xl animate-in zoom-in-95 duration-200 border-white/5 shadow-2xl">
            <h3 className="text-2xl font-bold mb-6">{editingItem ? 'Editar Material' : 'Novo Registro Logístico'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Identificação do Produto</label>
                <input name="name" required defaultValue={editingItem?.name} className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-white text-sm transition-all" placeholder="Ex: Kit Brinde Vestibular..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Categoria de Uso</label>
                <input name="category" required defaultValue={editingItem?.category} className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-white text-sm transition-all" placeholder="Ex: Eventos Internos..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Quantidade Inicial</label>
                  <input type="number" name="quantity" required defaultValue={editingItem?.quantity || 0} className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-white text-sm transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Gatilho de Alerta (Min.)</label>
                  <input type="number" name="minQuantity" required defaultValue={editingItem?.minQuantity || 0} className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-white text-sm transition-all" />
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 text-slate-400 font-bold hover:bg-slate-800 rounded-xl transition-all">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20">Salvar Registro</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
