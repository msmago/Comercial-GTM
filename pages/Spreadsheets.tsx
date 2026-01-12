
import React, { useState } from 'react';
import { useStore } from '../store';
import { GoogleSheet } from '../types';
import { 
  FileSpreadsheet, Plus, Search, Trash2, ExternalLink, Eye, Edit2, X, Loader2, AlertCircle
} from 'lucide-react';

const Spreadsheets = () => {
  const { sheets, upsertSheet, deleteSheet } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSheet, setEditingSheet] = useState<GoogleSheet | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<GoogleSheet | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filtered = sheets.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    console.log("DEBUG: Iniciando envio do formulário de Planilha...");
    setIsSubmitting(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    const payload = {
      id: editingSheet?.id || "",
      title: formData.get('title') as string,
      url: formData.get('url') as string,
      category: formData.get('category') as string,
      description: formData.get('description') as string,
    };

    console.log("DEBUG: Dados capturados:", payload);

    const result = await upsertSheet(payload);
    
    setIsSubmitting(false);

    if (result.success) {
      console.log("DEBUG: Operação concluída com sucesso!");
      setShowModal(false);
      setEditingSheet(null);
    } else {
      console.error("DEBUG: Falha na operação:", result.error);
      const errorMsg = result.error?.message || JSON.stringify(result.error);
      alert(`ERRO CRÍTICO NO BANCO:\n\nCódigo: ${result.error?.code || 'Desconhecido'}\nMensagem: ${errorMsg}\n\nVerifique se você tem permissão ou se o banco está configurado.`);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSheet(null);
  };

  if (selectedSheet) {
    return (
      <div className="h-full flex flex-col gap-4 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between glass p-4 rounded-2xl border-white/5">
          <div className="flex items-center gap-4">
            <button onClick={() => setSelectedSheet(null)} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400"><X size={20} /></button>
            <h3 className="font-bold text-white">{selectedSheet.title}</h3>
          </div>
          <button onClick={() => setSelectedSheet(null)} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all">Sair da Visualização</button>
        </div>
        <div className="flex-1 glass rounded-3xl overflow-hidden min-h-[600px] border-white/5 shadow-2xl">
          <iframe src={selectedSheet.url} className="w-full h-full border-none bg-white" title={selectedSheet.title} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold">Central de Planilhas</h3>
          <p className="text-sm text-slate-500">Gestão estratégica de links do Google Sheets</p>
        </div>
        <button 
          onClick={() => { setEditingSheet(null); setShowModal(true); }} 
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all"
        >
          <Plus size={18} /> Nova Planilha
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
        <input
          type="text"
          placeholder="Buscar planilhas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map(sheet => (
          <div key={sheet.id} className="glass p-6 rounded-3xl group relative border-white/5 hover:border-blue-500/30 transition-all shadow-lg">
            <div className="flex justify-between mb-4">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                <FileSpreadsheet size={24} />
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={() => { setEditingSheet(sheet); setShowModal(true); }} className="text-slate-500 hover:text-blue-400 p-1"><Edit2 size={16} /></button>
                <button onClick={() => { if(confirm('Excluir planilha?')) deleteSheet(sheet.id) }} className="text-slate-500 hover:text-rose-500 p-1"><Trash2 size={16} /></button>
              </div>
            </div>
            <h4 className="font-bold text-slate-100 truncate mb-1">{sheet.title}</h4>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black bg-slate-800/50 px-2 py-0.5 rounded border border-slate-700/50">{sheet.category}</span>
            <p className="text-xs text-slate-600 mt-3 line-clamp-2 h-8">{sheet.description || 'Sem descrição.'}</p>
            <div className="mt-6 flex gap-2">
              <button onClick={() => setSelectedSheet(sheet)} className="flex-1 py-2.5 bg-slate-800 hover:bg-blue-600/20 text-slate-300 hover:text-blue-400 text-[10px] font-bold uppercase rounded-xl transition-all border border-slate-700/50">
                Visualizar
              </button>
              <a href={sheet.url} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-500 hover:text-white rounded-xl border border-slate-700/50 transition-all">
                <ExternalLink size={16} />
              </a>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-20 text-center glass rounded-3xl border-dashed border-2 border-slate-800/60 opacity-40">
            <FileSpreadsheet size={48} className="mx-auto text-slate-700 mb-4" />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Nenhuma planilha encontrada</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm">
          <div key={editingSheet?.id || 'new-sheet'} className="w-full max-w-lg glass p-8 rounded-3xl animate-in zoom-in-95 border-white/5 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">{editingSheet ? 'Editar Gerenciamento' : 'Novo Gerenciamento'}</h3>
              <button onClick={handleCloseModal} className="text-slate-500 hover:text-white"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Nome da Planilha</label>
                <input name="title" required placeholder="Ex: Metas 2026..." defaultValue={editingSheet?.title || ''} className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">URL do Google Sheets</label>
                <input name="url" type="url" required placeholder="https://docs.google.com/spreadsheets/d/..." defaultValue={editingSheet?.url || ''} className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Categoria</label>
                  <select name="category" defaultValue={editingSheet?.category || 'Estratégia'} className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm cursor-pointer appearance-none">
                    <option value="Estratégia">Estratégia</option>
                    <option value="Comercial">Comercial</option>
                    <option value="Operacional">Operacional</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Descrição Breve</label>
                  <input name="description" placeholder="Resumo..." defaultValue={editingSheet?.description || ''} className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div className="pt-6 flex gap-3">
                <button type="button" onClick={handleCloseModal} className="flex-1 py-3.5 text-slate-400 font-bold hover:bg-slate-800 rounded-xl transition-all">Cancelar</button>
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (editingSheet ? 'Atualizar Dados' : 'Criar Registro')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Spreadsheets;
