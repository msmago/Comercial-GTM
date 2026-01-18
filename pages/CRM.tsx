
import React, { useState } from 'react';
import { useCRM } from '../modules/crm/crm.store';
import { PipelineStatus, Contact } from '../modules/crm/crm.types';
import { 
  Plus, Search, Filter, MessageSquare, Mail, Building, 
  Trash2, Edit2, User, X
} from 'lucide-react';
import ConfirmModal from '../shared/components/ConfirmModal';

const CRM = () => {
  const { companies, saveCompany, removeCompany } = useCRM();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.targetIES.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpsert = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const primaryContact: Contact = {
      id: editingCompany?.contacts?.[0]?.id || Math.random().toString(36).substr(2, 9),
      name: formData.get('contactName') as string,
      role: formData.get('contactRole') as string || 'Responsável',
      whatsapp: formData.get('whatsapp') as string,
      email: formData.get('email') as string,
    };
    saveCompany({
      id: editingCompany?.id,
      name: formData.get('name') as string,
      targetIES: formData.get('targetIES') as string,
      status: formData.get('status') as PipelineStatus,
      contacts: [primaryContact],
    });
    setShowModal(false); setEditingCompany(null);
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
      case PipelineStatus.PROSPECT: return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-400';
      case PipelineStatus.CONTACTED: return 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400';
      case PipelineStatus.NEGOTIATION: return 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400';
      case PipelineStatus.PARTNER: return 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400';
      case PipelineStatus.CHURN: return 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 px-2">
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
          <input
            type="text"
            placeholder="Pesquisar por holder, holding ou IES alvo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-16 pr-8 py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[24px] focus:ring-4 focus:ring-blue-600/5 outline-none transition-all text-sm font-bold shadow-xl placeholder:text-slate-400"
          />
        </div>
        <div className="flex gap-4">
          <button className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-slate-700 hover:text-blue-600 shadow-xl transition-all"><Filter size={24} /></button>
          <button onClick={() => { setEditingCompany(null); setShowModal(true); }} className="flex items-center gap-4 px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black text-[12px] uppercase tracking-[0.2em] rounded-3xl transition-all shadow-2xl shadow-blue-600/20 active:scale-95"><Plus size={24} /> Adicionar Parceiro</button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-950 rounded-[48px] overflow-hidden border border-slate-200 dark:border-white/5 shadow-6xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
              <th className="px-10 py-8 text-[11px] font-black text-slate-950 dark:text-slate-400 uppercase tracking-[0.4em]">Corporação / Holder</th>
              <th className="px-10 py-8 text-[11px] font-black text-slate-950 dark:text-slate-400 uppercase tracking-[0.4em]">Market Target</th>
              <th className="px-10 py-8 text-[11px] font-black text-slate-950 dark:text-slate-400 uppercase tracking-[0.4em]">Status Pipeline</th>
              <th className="px-10 py-8 text-[11px] font-black text-slate-950 dark:text-slate-400 uppercase tracking-[0.4em]">Communication</th>
              <th className="px-10 py-8 text-[11px] font-black text-slate-950 dark:text-slate-400 uppercase tracking-[0.4em] text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {filteredCompanies.map((company) => {
              const primaryContact = company.contacts?.[0];
              return (
                <tr key={company.id} className="group hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-all duration-300">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-[22px] bg-white dark:bg-slate-900 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-800 shadow-xl group-hover:scale-110 transition-transform">
                        <Building size={24} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-slate-950 dark:text-slate-100 tracking-tighter text-lg uppercase italic leading-none">{company.name}</span>
                        {primaryContact && <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2 mt-2"><User size={12} className="text-blue-600" /> {primaryContact.name}</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-xs text-slate-950 dark:text-slate-400 font-black uppercase tracking-tight">{company.targetIES}</td>
                  <td className="px-10 py-8">
                    <span className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${getStatusColor(company.status)}`}>
                      {getStatusLabel(company.status)}
                    </span>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <button onClick={() => window.open(`https://wa.me/${primaryContact?.whatsapp.replace(/\D/g, '')}`, '_blank')} className="p-4 rounded-2xl bg-white dark:bg-slate-900 text-emerald-600 hover:bg-emerald-600 hover:text-white border border-slate-200 dark:border-slate-800 transition-all shadow-xl group/btn"><MessageSquare size={20} className="group-hover/btn:scale-110 transition-transform" /></button>
                      <button onClick={() => window.location.href = `mailto:${primaryContact?.email}`} className="p-4 rounded-2xl bg-white dark:bg-slate-900 text-blue-600 hover:bg-blue-600 hover:text-white border border-slate-200 dark:border-slate-800 transition-all shadow-xl group/btn"><Mail size={20} className="group-hover/btn:scale-110 transition-transform" /></button>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingCompany(company); setShowModal(true); }} className="p-3 text-slate-400 hover:text-blue-600 transition-colors bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800"><Edit2 size={20} /></button>
                      <button onClick={() => setDeleteConfirmId(company.id)} className="p-3 text-slate-400 hover:text-rose-600 transition-colors bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800"><Trash2 size={20} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-slate-950/90 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-950 p-12 rounded-[56px] border border-slate-200 dark:border-slate-800 shadow-6xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-12">
              <h3 className="text-4xl font-black italic tracking-tighter text-slate-950 dark:text-white uppercase leading-none">
                {editingCompany?.id ? 'Atualizar Parceiro' : 'Novo Registro'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-4 bg-slate-100 dark:bg-slate-900 rounded-[20px] text-slate-500 transition-all"><X size={24} /></button>
            </div>
            <form onSubmit={handleUpsert} className="space-y-8">
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Nome da Holding / Holder</label>
                <input name="name" required defaultValue={editingCompany?.name} className="w-full px-8 py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-slate-950 dark:text-white text-sm font-bold shadow-sm outline-none" placeholder="Ex: Grupo Kroton..." />
              </div>
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">IES Alvo / Market</label>
                <input name="targetIES" required defaultValue={editingCompany?.targetIES} className="w-full px-8 py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-slate-950 dark:text-white text-sm font-bold shadow-sm outline-none" placeholder="Ex: Sudeste / Medicina..." />
              </div>
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Status Pipeline</label>
                <select name="status" defaultValue={editingCompany?.status || PipelineStatus.PROSPECT} className="w-full px-8 py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-slate-950 dark:text-white text-sm font-bold appearance-none cursor-pointer outline-none shadow-sm">
                  {Object.values(PipelineStatus).map(s => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Responsável</label>
                  <input name="contactName" required defaultValue={editingCompany?.contacts?.[0]?.name} className="w-full px-8 py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-slate-950 dark:text-white text-sm font-bold shadow-sm outline-none" />
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">WhatsApp</label>
                  <input name="whatsapp" required defaultValue={editingCompany?.contacts?.[0]?.whatsapp} className="w-full px-8 py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-slate-950 dark:text-white text-sm font-bold shadow-sm outline-none" />
                </div>
              </div>
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">E-mail Corporativo</label>
                <input name="email" type="email" required defaultValue={editingCompany?.contacts?.[0]?.email} className="w-full px-8 py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-slate-950 dark:text-white text-sm font-bold shadow-sm outline-none" />
              </div>
              <div className="flex gap-6 pt-10">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-5 text-slate-500 font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 rounded-3xl transition-all">Descartar</button>
                <button type="submit" className="flex-1 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black text-[11px] uppercase tracking-widest rounded-3xl shadow-2xl shadow-blue-600/20 transition-all">Confirmar Registro</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={!!deleteConfirmId}
        title="Remover Parceiro"
        message="Esta ação é definitiva e removerá todos os dados do parceiro no CRM. Confirmar exclusão?"
        onConfirm={() => { if(deleteConfirmId) removeCompany(deleteConfirmId); setDeleteConfirmId(null); }}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
};

export default CRM;
