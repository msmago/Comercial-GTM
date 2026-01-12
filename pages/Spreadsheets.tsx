
import React, { useState } from 'react';
import { useStore } from '../store';
import { GoogleSheet } from '../types';
import { 
  FileSpreadsheet, Plus, Search, Trash2, ExternalLink, Eye, Edit2, X
} from 'lucide-react';

const Spreadsheets = () => {
  const { sheets, upsertSheet, deleteSheet } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSheet, setEditingSheet] = useState<GoogleSheet | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<GoogleSheet | null>(null);

  const filtered = sheets.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    upsertSheet({
      id: editingSheet?.id,
      title: formData.get('title') as string,
      url: formData.get('url') as string,
      category: formData.get('category') as string,
      description: formData.get('description') as string,
    });
    setShowModal(false);
  };

  if (selectedSheet) {
    return (
      <div className="h-full flex flex-col gap-4 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between glass p-4 rounded-2xl">
          <button onClick={() => setSelectedSheet(null)} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400"><X size={20} /></button>
          <h3 className="font-bold text-white">{selectedSheet.title}</h3>
          <button onClick={() => setSelectedSheet(null)} className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl">Sair</button>
        </div>
        <div className="flex-1 glass rounded-3xl overflow-hidden min-h-[600px]">
          <iframe src={selectedSheet.url} className="w-full h-full border-none bg-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold">Planilhas</h3>
          <p className="text-sm text-slate-500">Google Sheets Gerenciados</p>
        </div>
        <button onClick={() => { setEditingSheet(null); setShowModal(true); }} className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl shadow-lg">
          <Plus size={18} /> Nova Planilha
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map(sheet => (
          <div key={sheet.id} className="glass p-6 rounded-3xl group relative">
            <div className="flex justify-between mb-4">
              <FileSpreadsheet size={24} className="text-emerald-500" />
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={() => { setEditingSheet(sheet); setShowModal(true); }} className="text-slate-500 hover:text-blue-400"><Edit2 size={16} /></button>
                <button onClick={() => deleteSheet(sheet.id)} className="text-slate-500 hover:text-rose-500"><Trash2 size={16} /></button>
              </div>
            </div>
            <h4 className="font-bold text-slate-100 truncate">{sheet.title}</h4>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest">{sheet.category}</span>
            <div className="mt-6 flex gap-2">
              <button onClick={() => setSelectedSheet(sheet)} className="flex-1 py-2 bg-slate-800 hover:bg-blue-600/20 text-slate-300 text-[10px] font-bold uppercase rounded-xl">Visualizar</button>
              <a href={sheet.url} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 text-slate-500 rounded-xl"><ExternalLink size={14} /></a>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm">
          <div key={editingSheet?.id || 'new-sheet'} className="w-full max-w-lg glass p-8 rounded-3xl animate-in zoom-in-95">
            <h3 className="text-2xl font-bold mb-6">{editingSheet ? 'Editar Planilha' : 'Nova Planilha'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input name="title" required placeholder="Título" defaultValue={editingSheet?.title || ''} className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl" />
              <input name="url" required placeholder="URL do Google Sheets" defaultValue={editingSheet?.url || ''} className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl" />
              <select name="category" defaultValue={editingSheet?.category || 'Estratégia'} className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl">
                <option value="Estratégia">Estratégia</option>
                <option value="Comercial">Comercial</option>
                <option value="Operacional">Operacional</option>
              </select>
              <textarea name="description" placeholder="Descrição" defaultValue={editingSheet?.description || ''} className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl h-24 resize-none" />
              <div className="flex gap-3 mt-8">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 text-slate-400 font-bold hover:bg-slate-800 rounded-xl">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Spreadsheets;
