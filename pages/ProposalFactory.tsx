
import React, { useState, useRef } from 'react';
import { useCRM } from '../modules/crm/crm.store';
import { 
  FileText, Sparkles, Download, ChevronRight, 
  FileCode, Wand2, Loader2, Upload, FileUp, 
  Trash2, History, CheckCircle
} from 'lucide-react';
import { getGtmStrategyStream } from '../services/geminiService';

const ProposalFactory = () => {
  const { companies } = useCRM();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [generating, setGenerating] = useState(false);
  const [contractContent, setContractContent] = useState('');
  const [templateText, setTemplateText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setTemplateText(text); // Simulando extração de texto do arquivo
      };
      reader.readAsText(file);
    }
  };

  const handleFillContract = async () => {
    if (!selectedCompanyId || (!templateText && !contractContent)) return;
    
    setGenerating(true);
    setContractContent('');
    
    const company = companies.find(c => c.id === selectedCompanyId);
    const prompt = `Utilize o modelo de contrato abaixo e preencha todos os campos variáveis com os dados desta empresa: ${JSON.stringify(company)}. 
    Mantenha toda a estrutura jurídica original. Modelo: ${templateText || contractContent}`;

    await getGtmStrategyStream(prompt, { company }, (data) => setContractContent(data.text));
    setGenerating(false);
  };

  const downloadContract = () => {
    const blob = new Blob([contractContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Contrato_${fileName || 'Gerado'}.txt`;
    a.click();
  };

  return (
    <div className="space-y-12 pb-20 animate-in slide-in-from-right-10 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-blue-700 rounded-[24px] flex items-center justify-center text-white shadow-2xl">
            <FileText size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter text-slate-950 dark:text-white uppercase leading-none text-glow">Hub de Contratos</h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-2 italic">Automação de Minutas e Convênios</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
        <div className="xl:col-span-1 space-y-6">
          {/* Painel de Configuração */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-2xl space-y-8">
            <h3 className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-widest flex items-center gap-3">
              <Wand2 size={16} className="text-blue-600" />
              Preenchimento Inteligente
            </h3>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">1. Carregar Modelo (.txt/.doc)</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-[24px] p-6 text-center cursor-pointer transition-all ${fileName ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-200 dark:border-slate-800 hover:border-blue-600'}`}
                >
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".txt,.doc,.docx" />
                  {fileName ? (
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle size={24} className="text-emerald-500" />
                      <span className="text-[10px] font-black text-emerald-600 uppercase truncate w-full">{fileName}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload size={24} className="text-slate-400" />
                      <span className="text-[9px] font-black text-slate-500 uppercase">Arraste ou Clique</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">2. Selecionar Parceiro CRM</label>
                <select 
                  value={selectedCompanyId} 
                  onChange={(e) => setSelectedCompanyId(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-[11px] font-black uppercase italic outline-none focus:border-blue-600"
                >
                   <option value="">Aguardando seleção...</option>
                   {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <button 
                onClick={handleFillContract}
                disabled={!selectedCompanyId || generating || !templateText}
                className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all disabled:opacity-30 active:scale-95 flex items-center justify-center gap-3"
              >
                 {generating ? <Loader2 className="animate-spin" size={18} /> : <><Sparkles size={18} /> Mesclar Dados IA</>}
              </button>
            </div>
          </div>

          <div className="bg-slate-950 p-8 rounded-[40px] text-white/40 border border-white/5 shadow-2xl">
             <h4 className="text-[10px] font-black uppercase tracking-widest mb-6 flex items-center gap-2 text-white/80">
                <History size={14} /> Histórico de Gerações
             </h4>
             <div className="space-y-4 opacity-50">
                <p className="text-[9px] font-medium italic">Nenhum contrato gerado nesta sessão.</p>
             </div>
          </div>
        </div>

        <div className="xl:col-span-3">
          <div className="bg-white dark:bg-slate-950 rounded-[56px] border border-slate-200 dark:border-slate-800 shadow-6xl min-h-[750px] flex flex-col overflow-hidden">
            <div className="px-10 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg"><FileText size={18} /></div>
                  <div>
                     <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-950 dark:text-white">Editor de Minuta GTM</h3>
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Sincronização Ativa via IA</p>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <button 
                    disabled={!contractContent}
                    onClick={() => setContractContent('')}
                    className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 hover:text-rose-600 transition-all shadow-sm"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button 
                    disabled={!contractContent}
                    onClick={downloadContract}
                    className="flex items-center gap-3 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-30"
                  >
                    <Download size={16} /> Exportar Final
                  </button>
               </div>
            </div>

            <div className="flex-1 p-16 overflow-y-auto bg-white/40 dark:bg-slate-950/20 custom-scrollbar relative">
               {generating && !contractContent ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center space-y-6 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm z-10">
                     <div className="w-24 h-24 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                     <div className="text-center">
                        <p className="text-[11px] font-black text-slate-950 dark:text-white uppercase tracking-[0.5em] animate-pulse">Processando Inteligência Documental</p>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-2">Mapeando variáveis do CRM no contrato...</p>
                     </div>
                  </div>
               ) : null}

               {contractContent ? (
                  <div className="max-w-4xl mx-auto">
                    <textarea 
                      value={contractContent}
                      onChange={(e) => setContractContent(e.target.value)}
                      className="w-full h-screen bg-transparent border-none outline-none font-serif text-slate-800 dark:text-slate-200 text-lg leading-[1.8] resize-none overflow-visible"
                    />
                  </div>
               ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                     <FileUp size={80} className="text-slate-300 mb-8" />
                     <h3 className="text-2xl font-black italic text-slate-950 dark:text-white uppercase tracking-tighter mb-2">Workspace Vazio</h3>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">O contrato preenchido aparecerá aqui após o processamento.</p>
                  </div>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalFactory;
