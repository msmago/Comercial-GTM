
import React, { useState } from 'react';
import { useStore } from '../store';
import { PipelineStatus, Contact } from '../types';
import { 
  Plus, Search, Filter, MessageSquare, Mail, Building, 
  Trash2, Edit2, User
} from 'lucide-react';

const CRM = () => {
  const { companies, upsertCompany, deleteCompany } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.targetIES.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpsert = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    // Pegamos os dados do contato principal
    const primaryContact: Contact = {
      id: editingCompany?.contacts?.[0]?.id || Math.random().toString(36).substr(2, 9),
      name: formData.get('contactName') as string,
      role: formData.get('contactRole') as string || 'Responsável',
      whatsapp: formData.get('whatsapp') as string,
      email: formData.get('email') as string,
    };

    const data = {
      id: editingCompany?.id,
      name: formData.get('name') as string,
      targetIES: formData.get('targetIES') as string,
      status: formData.get('status') as PipelineStatus,
      contacts: [primaryContact], // Armazenamos como o primeiro contato da lista
    };

    upsertCompany(data);
    setShowModal(false);
    setEditingCompany(null);
  };

  const getStatusLabel = (status: PipelineStatus) => {
    switch (status) {
      case PipelineStatus.PROSPECT: return 'Prospecção';
      case PipelineStatus.CONTACTED: return 'Contatado';
      case PipelineStatus.NEGOTIATION: return 'Negociação';
      case PipelineStatus.PARTNER: return 'Parceiro';
      case PipelineStatus.CHURN: return 'Churn';
      default: return status;
    }
  };

  const getStatusColor = (status: PipelineStatus) => {
    switch (status) {
      case PipelineStatus.PROSPECT: return 'bg-slate-800 text-slate-400';
      case PipelineStatus.CONTACTED: return 'bg-blue-500/20 text-blue-400';
      case PipelineStatus.NEGOTIATION: return 'bg-purple-500/20 text-purple-400';
      case PipelineStatus.PARTNER: return 'bg-emerald-500/20 text-emerald-400';
      case PipelineStatus.CHURN: return 'bg-rose-500/20 text-rose-400';
      default: return 'bg-slate-800 text-slate-400';
    }
  };

  const handleWhatsApp = (whatsapp?: string) => {
    if (!whatsapp) return alert('Número de WhatsApp não cadastrado.');
    const cleanNumber = whatsapp.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanNumber}`, '_blank');
  };

  const handleEmail = (email?: string) => {
    if (!email) return alert('E-mail não cadastrado.');
    window.location.href = `mailto:${email}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Buscar empresa ou IES parceira..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
        <div className="flex gap-3">
          <button className="p-2.5 glass rounded-xl text-slate-400 hover:text-slate-200">
            <Filter size={20} />
          </button>
          <button 
            onClick={() => { setEditingCompany(null); setShowModal(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20"
          >
            <Plus size={20} />
            Novo Parceiro
          </button>
        </div>
      </div>

      <div className="glass rounded-3xl overflow-hidden border-white/5 shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800/50 border-b border-slate-700/50">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Empresa / Responsável</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">IES Destino</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status no Funil</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Ações Rápidas</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Controles</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredCompanies.map((company) => {
              const primaryContact = company.contacts?.[0];
              return (
                <tr key={company.id} className="group hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-blue-400 border border-slate-700 group-hover:border-blue-500/50 transition-colors">
                        <Building size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-200">{company.name}</span>
                        {primaryContact && (
                          <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                            <User size={10} /> {primaryContact.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-400 font-medium">{company.targetIES}</td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(company.status)}`}>
                      {getStatusLabel(company.status)}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleWhatsApp(primaryContact?.whatsapp)}
                        title="Abrir WhatsApp" 
                        className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-sm shadow-emerald-500/10"
                      >
                        <MessageSquare size={16} />
                      </button>
                      <button 
                        onClick={() => handleEmail(primaryContact?.email)}
                        title="Enviar E-mail" 
                        className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all shadow-sm shadow-blue-500/10"
                      >
                        <Mail size={16} />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => { setEditingCompany(company); setShowModal(true); }}
                        className="p-2 text-slate-500 hover:text-blue-400 transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => deleteCompany(company.id)}
                        className="p-2 text-slate-500 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredCompanies.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-600">
                      <Building size={32} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-400">Nenhum parceiro encontrado</h4>
                      <p className="text-sm text-slate-600">Comece registrando sua primeira oportunidade de parceria.</p>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-xl glass p-8 rounded-3xl animate-in zoom-in-95 duration-200 border-white/5 shadow-2xl">
            <h3 className="text-2xl font-bold mb-6">{editingCompany ? 'Editar Parceiro' : 'Novo Registro de Parceiro'}</h3>
            <form onSubmit={handleUpsert} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">Dados da Instituição</h4>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase">Nome da Empresa</label>
                    <input
                      name="name"
                      required
                      defaultValue={editingCompany?.name}
                      className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                      placeholder="Ex: Grupo Educacional XYZ..."
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase">IES de Destino</label>
                    <input
                      name="targetIES"
                      required
                      defaultValue={editingCompany?.targetIES}
                      className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                      placeholder="Ex: Campus São Paulo..."
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase">Etapa do Pipeline</label>
                    <select
                      name="status"
                      defaultValue={editingCompany?.status || PipelineStatus.PROSPECT}
                      className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer text-sm"
                    >
                      {Object.values(PipelineStatus).map(s => (
                        <option key={s} value={s}>{getStatusLabel(s)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">Contato Principal</h4>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase">Nome do Responsável</label>
                    <input
                      name="contactName"
                      required
                      defaultValue={editingCompany?.contacts?.[0]?.name}
                      className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                      placeholder="Nome completo..."
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase">WhatsApp</label>
                    <input
                      name="whatsapp"
                      required
                      defaultValue={editingCompany?.contacts?.[0]?.whatsapp}
                      className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                      placeholder="DDD + Número..."
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase">E-mail Corporativo</label>
                    <input
                      type="email"
                      name="email"
                      required
                      defaultValue={editingCompany?.contacts?.[0]?.email}
                      className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                      placeholder="email@empresa.com.br"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8 pt-4 border-t border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 text-slate-400 font-bold hover:bg-slate-800 rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20"
                >
                  {editingCompany ? 'Salvar Alterações' : 'Confirmar Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRM;
