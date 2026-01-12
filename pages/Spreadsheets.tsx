
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
  Settings2,
  Table as TableIcon
} from 'lucide-react';

const Spreadsheets = () => {
  const { sheets, upsertSheet, deleteSheet } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedSheet, setSelectedSheet] = useState<GoogleSheet | null>(null);

  const filteredSheets = sheets.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    let rawUrl = formData.get('url') as string;
    // Tenta converter links de edição em links de embed se necessário (Google faz isso auto no iframe, mas garantimos aqui)
    if (rawUrl.includes('/edit')) {
      // Opcional: transformar em /preview para visualização limpa
    }

    const data = {
      title: formData.get('title') as string,
      url: rawUrl,
      category: formData.get('category') as string,
      description: formData.get('description') as string,
    };

    upsertSheet(data);
    setShowModal(false);
  };

  // Se uma planilha está selecionada, mostramos o visualizador
  if (selectedSheet) {
    return (
      <div className="h-full flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between glass p-4 rounded-2xl border-white/5">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSelectedSheet(null)}
              className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 transition-all"
            >
              <Trash2 size={20} className="rotate-45" /> {/* Usei Trash rotacionado como 'X' ou use o X de lucide se preferir */}
            </button>
            <div>
              <h3 className="font-bold text-white">{selectedSheet.title}</h3>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{selectedSheet.category}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a 
              href={selectedSheet.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all border border-slate-700"
            >
              <ExternalLink size={14} />
              Abrir no Google Sheets
            </a>
            <button 
              onClick={() => setSelectedSheet(null)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20"
            >
              Fechar Visualização
            </button>
          </div>
        </div>

        <div className="flex-1 glass rounded-3xl border-white/5 overflow-hidden shadow-2xl relative min-h-[600px]">
          <iframe 
            src={selectedSheet.url}
            className="w-full h-full border-none bg-white"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-bold">Central de Planilhas</h3>
          <p className="text-sm text-slate-500">Gerenciador de planilhas estratégicas do Google</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Buscar planilhas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
            />
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20"
          >
            <Plus size={18} />
            Adicionar Planilha
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredSheets.map(sheet => (
          <div key={sheet.id} className="glass p-6 rounded-3xl border-white/5 group hover:border-blue-500/30 transition-all flex flex-col shadow-xl">
            <div className="flex items-start justify-between mb-6">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-inner group-hover:scale-110 transition-transform">
                <FileSpreadsheet size={24} />
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button 
                  onClick={() => deleteSheet(sheet.id)}
                  className="p-2 text-slate-500 hover:text-rose-500 transition-colors"
                  title="Remover Gerenciamento"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <h4 className="font-bold text-slate-100 mb-2 truncate" title={sheet.title}>{sheet.title}</h4>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 bg-slate-800/50 px-2 py-1 rounded-lg border border-slate-700/50">
                {sheet.category}
              </span>
            </div>
            
            <p className="text-xs text-slate-500 font-medium mb-6 line-clamp-2 min-h-[32px]">
              {sheet.description || 'Nenhuma descrição detalhada fornecida para esta planilha estratégica.'}
            </p>

            <div className="mt-auto pt-4 border-t border-slate-800/60 flex items-center gap-2">
              <button 
                onClick={() => setSelectedSheet(sheet)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-blue-600/20 text-slate-300 hover:text-blue-400 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all border border-slate-700/50"
              >
                <Eye size={14} />
                Visualizar
              </button>
              <a 
                href={sheet.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2.5 bg-slate-800/50 hover:bg-slate-800 text-slate-500 hover:text-white rounded-xl transition-all border border-slate-700/50"
              >
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        ))}

        {filteredSheets.length === 0 && (
          <div className="col-span-full py-20 text-center glass rounded-[40px] border-dashed border-2 border-slate-800/60 opacity-30">
            <TableIcon size={48} className="mx-auto text-slate-700 mb-4" />
            <p className="text-slate-500 font-black uppercase tracking-widest">Nenhuma Planilha Gerenciada</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg glass p-8 rounded-3xl animate-in zoom-in-95 duration-200 border-white/5 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-emerald-500/20 text-emerald-500 rounded-xl">
                <FileSpreadsheet size={24} />
              </div>
              <h3 className="text-2xl font-bold">Gerenciar Nova Planilha</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-widest">Nome Identificador</label>
                <input 
                  name="title" 
                  required 
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white text-sm" 
                  placeholder="Ex: Metas Comerciais 2025..." 
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-widest">URL do Google Sheets</label>
                <input 
                  name="url" 
                  type="url" 
                  required 
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white text-sm" 
                  placeholder="https://docs.google.com/spreadsheets/d/..." 
                />
                <p className="text-[10px] text-amber-500 mt-2 font-bold uppercase">* Certifique-se de que a planilha possui permissão de leitura para "Qualquer pessoa com o link".</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-widest">Categoria</label>
                  <select 
                    name="category"
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white text-sm cursor-pointer"
                  >
                    <option value="Estratégia">Estratégia</option>
                    <option value="Comercial">Comercial</option>
                    <option value="Financeiro">Financeiro</option>
                    <option value="Operacional">Operacional</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-widest">Descrição Breve</label>
                  <input 
                    name="description" 
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white text-sm" 
                    placeholder="Para que serve?" 
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="flex-1 py-3 text-slate-400 font-bold hover:bg-slate-800 rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20"
                >
                  Adicionar ao Painel
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
