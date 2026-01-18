
import React, { useState } from 'react';
import { useSheets } from '../modules/sheets/sheets.store';
import { GoogleSheet } from '../modules/sheets/sheets.types';
import { 
  FileSpreadsheet, Plus, Search, Trash2, ExternalLink, Edit2, X, Loader2
} from 'lucide-react';

const Spreadsheets = () => {
  const { sheets, saveSheet, removeSheet } = useSheets();
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

    setIsSubmitting(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const payload = {
      id: editingSheet?.id || "",
      title: formData.get('title') as string,
      url: formData.get('url') as string,
      category: formData.get('category') as string,
      description: formData.get('description') as string,
    };

    const result = await saveSheet(payload);
    setIsSubmitting(false);

    if (result.success) {
      setShowModal(false);
      setEditingSheet(null);
    }
  };

  if (selectedSheet) {
    return (
      <div className="h-full flex flex-col gap-8 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-2xl">
          <div className="flex items-center gap-6">
            <button onClick={() => setSelectedSheet(null)} className="p-4 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl text-slate-500 transition-all border border-slate-100 dark:border-slate-800"><X size={20} /></button>
            <div>
              <h3 className="font-black text-slate-950 dark:text-white uppercase tracking-tighter italic text-xl">{selectedSheet.title}</h3>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1">Google Sheets Connected Hub</p>
            </div>
          </div>
          <button onClick={() => setSelectedSheet(null)} className="px-10 py-4 bg-slate-950 dark:bg-blue-600 text-white font-black text-[11px] uppercase tracking-widest rounded-2xl shadow-xl transition-all active:scale-95">Fechar Visualização</button>
        </div>
        <div className="flex-1 bg-white rounded-[56px] overflow-hidden min-h-[700px] border border-slate-200 shadow-2xl relative">
          <iframe src={selectedSheet.url} className="w-full h-full border-none bg-white" title={selectedSheet.title} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20 px-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
        <div>
          <h3 className="text-5xl font-black italic tracking-tighter text-slate-950 dark:text-white uppercase leading-none">Central de Planilhas</h3>
          <p className="text-[11px] text-slate-500 font-black mt-4 uppercase tracking-[0.4em]">Gestão Estratégica de Dados Externos</p>
        </div>
        <button 
          onClick={() => { setEditingSheet(null); setShowModal(true); }} 
          className="flex items-center gap-3 px-10 py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] uppercase tracking-widest rounded-3xl shadow-2xl shadow-emerald-500/20 transition-all active:scale-95"
        >
          <Plus size={24} /> Vincular Nova
        </button>
      </div>

      <div className="relative max-w-2xl">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
        <input
          type="text"
          placeholder="Buscar bases de dados, metas ou relatórios..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-16 pr-8 py-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] focus:ring-4 focus:ring-blue-600/5 outline-none transition-all text-sm font-bold shadow-xl placeholder:text-slate-400"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {filtered.map(sheet => (
          <div key={sheet.id} className="bg-white dark:bg-slate-900 p-10 rounded-[48px] group border border-slate-200 dark:border-slate-800/60 transition-all shadow-xl hover:translate-y-[-6px]">
            <div className="flex justify-between items-start mb-10">
              <div className="p-5 bg-emerald-50 dark:bg-emerald-500/10 rounded-3xl text-emerald-600 shadow-inner">
                <FileSpreadsheet size={32} />
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={() => { setEditingSheet(sheet); setShowModal(true); }} className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-500 hover:text-blue-600 transition-all"><Edit2 size={16} /></button>
                <button onClick={() => { if(confirm('Excluir vínculo?')) removeSheet(sheet.id) }} className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-500 hover:text-rose-600 transition-all"><Trash2 size={16} /></button>
              </div>
            </div>
            <h4 className="font-black text-slate-950 dark:text-white truncate mb-2 uppercase tracking-tighter italic text-xl leading-none">{sheet.title}</h4>
            <span className="text-[9px] text-slate-500 font-black uppercase tracking-[0.3em] bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">{sheet.category}</span>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-6 line-clamp-2 leading-relaxed font-medium">{sheet.description || 'Nenhuma descrição técnica disponível.'}</p>
            <div className="mt-10 flex gap-4">
              <button onClick={() => setSelectedSheet(sheet)} className="flex-1 py-4 bg-slate-950 dark:bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl hover:shadow-slate-950/20 active:scale-95">
                Abrir Hub
              </button>
              <a href={sheet.url} target="_blank" rel="noopener noreferrer" className="p-4 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-blue-600 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all">
                <ExternalLink size={20} />
              </a>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-slate-950/90 backdrop-blur-md">
          <div className="w-full max-w-xl bg-white dark:bg-slate-950 p-12 rounded-[56px] border border-slate-200 dark:border-slate-800 shadow-6xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-4xl font-black italic tracking-tighter text-slate-950 dark:text-white uppercase leading-none">{editingSheet ? 'Editar Vínculo' : 'Novo Registro'}</h3>
              <button onClick={() => setShowModal(false)} className="p-4 bg-slate-100 dark:bg-slate-900 rounded-[20px] text-slate-500 hover:text-slate-950 transition-all"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Título do Relatório</label>
                <input name="title" required defaultValue={editingSheet?.title || ''} className="w-full px-8 py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-slate-950 dark:text-white text-sm font-bold shadow-sm" placeholder="Ex: Metas de Expansão..." />
              </div>
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Endpoint URL (Sheets)</label>
                <input name="url" type="url" required defaultValue={editingSheet?.url || ''} className="w-full px-8 py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-slate-950 dark:text-white text-sm font-bold shadow-sm" placeholder="https://docs.google.com/..." />
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Categoria</label>
                  <select name="category" defaultValue={editingSheet?.category || 'Estratégia'} className="w-full px-8 py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-slate-950 dark:text-white text-sm font-bold appearance-none cursor-pointer">
                    <option value="Estratégia">Estratégia</option>
                    <option value="Comercial">Comercial</option>
                    <option value="Operacional">Operacional</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Resumo Operativo</label>
                  <input name="description" defaultValue={editingSheet?.description || ''} className="w-full px-8 py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-slate-950 dark:text-white text-sm font-bold shadow-sm" placeholder="Apenas leitura..." />
                </div>
              </div>
              <div className="pt-10 flex gap-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-5 text-slate-500 font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 rounded-3xl transition-all">Cancelar</button>
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="flex-1 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black text-[11px] uppercase tracking-widest rounded-3xl shadow-2xl shadow-blue-600/20 transition-all flex items-center justify-center gap-3"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (editingSheet ? 'Atualizar Hub' : 'Confirmar Vínculo')}
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
