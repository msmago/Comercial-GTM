
import React, { useState } from 'react';
import { useStore } from '../store';
import { GoogleSheet } from '../types';
import { 
  FileSpreadsheet, 
  Plus, 
  Search, 
  Trash2, 
  ExternalLink, 
  Eye,
  Edit2,
  Table as TableIcon,
  X
} from 'lucide-react';

const Spreadsheets = () => {
  const { sheets, upsertSheet, deleteSheet } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSheet, setEditingSheet] = useState<GoogleSheet | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<GoogleSheet | null>(null);

  const filteredSheets = sheets.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingSheet(null);
    setShowModal(true);
  };

  const handleOpenEdit = (sheet: GoogleSheet) => {
    setEditingSheet(sheet);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const data = {
      id: editingSheet?.id, // Mantém o ID se for edição
      title: formData.get('title') as string,
      url: formData.get('url') as string,
      category: formData.get('category') as string,
      description: formData.get('description') as string,
    };

    upsertSheet(data);
    setShowModal(false);
    setEditingSheet(null);
  };

  if (selectedSheet) {
    return (
      <div className="h-full flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between glass p-4 rounded-2xl border-white/5">
          <div className="flex items-center gap-4">
            <button onClick={() => setSelectedSheet(null)} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400">
              <X size={20} />
            </button>
            <div>
              <h3 className="font-bold text-white">{selectedSheet.title}</h3>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{selectedSheet.category}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href={selectedSheet.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700">
              <ExternalLink size={14} /> Abrir Externo
            </a>
            <button onClick={() => setSelectedSheet(null)} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/20">
              Sair da Visualização
            </button>
          </div>
        </div>
        <div className="flex-1 glass rounded-3xl border-white/5 overflow-hidden shadow-2xl min-h-[600px]">
          <iframe src={selectedSheet.url} className="w-full h-full border-none bg-white" allowFullScreen />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-bold">Planilhas Estratégicas</h3>
          <p className="text-sm text-slate-500">Central de dados gerenciados do Google Sheets</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
            />
          </div>
          <button 
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20"
          >
            <Plus size={18} /> Nova Planilha
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredSheets.map(sheet => (
          <div key={sheet.id} className="glass p-6 rounded-3xl border-white/5 group hover:border-blue-500/30 transition-all flex flex-col shadow-xl">
            <div className="flex items-start justify-between mb-6">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <FileSpreadsheet size={24} />
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={() => handleOpenEdit(sheet)} className="p-2 text-slate-500 hover:text-blue-400"><Edit2 size={16} /></button>
                <button onClick={() => deleteSheet(sheet.id)} className="p-2 text-slate-500 hover:text-rose-500"><Trash2 size={16} /></button>
              </div>
            </div>
            <h4 className="font-bold text-slate-100 mb-2 truncate">{sheet.title}</h4>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 bg-slate-800/50 px-2 py-1 rounded-lg border border-slate-700/50">{sheet.category}</span>
            </div>
            <p className="text-xs text-slate-500 font-medium mb-6 line-clamp-2 min-h-[32px]">{sheet.description || 'Sem descrição.'}</p>
            <div className="mt-auto pt-4 border-t border-slate-800/60 flex items-center gap-2">
              <button onClick={() => setSelectedSheet(sheet)} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-blue-600/20 text-slate-300 hover:text-blue-400 text-[10px] font-bold uppercase rounded-xl border border-slate-700/50">
                <Eye size={14} /> Visualizar
              </button>
              <a href={sheet.url} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-slate-800/50 hover:bg-slate-800 text-slate-500 hover:text-white rounded-xl border border-slate-700/50">
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm">
          <div key={editingSheet?.id || 'new-sheet'} className="w-full max-w-lg glass p-8 rounded-3xl animate-in zoom-in-95 duration-200 border-white/5 shadow-2xl">
            <h3 className="text-2xl font-bold mb-6">{editingSheet ? 'Editar Gerenciamento' : 'Novo Gerenciamento'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Nome da Planilha</label>
                <input name="title" required defaultValue={editingSheet?.title || ''} className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Ex: Metas Comerciais..." />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Link (URL) do Google Sheets</label>
                <input name="url" required defaultValue={editingSheet?.url || ''} className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="https://docs.google.com/spreadsheets/d/..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Categoria</label>
                  <select name="category" defaultValue={editingSheet?.category || 'Estratégia'} className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl outline-none text-sm cursor-pointer">
                    <option value="Estratégia">Estratégia</option>
                    <option value="Comercial">Comercial</option>
                    <option value="Operacional">Operacional</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Descrição</label>
                  <input name="description" defaultValue={editingSheet?.description || ''} className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm" />
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 text-slate-400 font-bold hover:bg-slate-800 rounded-xl transition-all">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20">Salvar Registro</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Spreadsheets;
