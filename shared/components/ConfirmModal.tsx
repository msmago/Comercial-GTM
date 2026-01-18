
import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'danger'
}) => {
  if (!isOpen) return null;

  const colors = {
    danger: 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/20',
    warning: 'bg-amber-500 hover:bg-amber-400 shadow-amber-500/20',
    info: 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20'
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-950 p-10 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-6xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-8">
          <div className={`p-4 rounded-2xl ${type === 'danger' ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10' : 'bg-blue-50 text-blue-600 dark:bg-blue-500/10'}`}>
            <AlertCircle size={28} />
          </div>
          <button onClick={onCancel} className="p-3 text-slate-400 hover:text-slate-600 transition-all">
            <X size={24} />
          </button>
        </div>
        
        <h3 className="text-2xl font-black italic tracking-tighter text-slate-950 dark:text-white uppercase mb-4 leading-tight">
          {title}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-10">
          {message}
        </p>

        <div className="flex gap-4">
          <button 
            onClick={onCancel}
            className="flex-1 py-4 text-slate-500 dark:text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-900 rounded-2xl transition-all"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            className={`flex-1 py-4 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all shadow-xl active:scale-95 ${colors[type]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
