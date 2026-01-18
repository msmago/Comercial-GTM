
import React, { useState } from 'react';
import { useAuth } from '../modules/auth/auth.store';
import { ShieldCheck, ArrowRight, User as UserIcon, Mail, Lock, Eye, EyeOff, UserPlus, AlertCircle, Loader2, Star } from 'lucide-react';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let success = false;
      if (isLogin) {
        success = await login(email, password);
        if (!success) setError('E-mail ou senha incorretos.');
      } else {
        success = await register(name, email, password);
        if (!success) setError('Erro ao criar conta. Tente outro e-mail.');
      }
    } catch (err) {
      setError('Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
      <div className="w-full max-w-md glass p-10 rounded-[48px] shadow-2xl border-white/5 relative overflow-hidden transition-all duration-700 group">
        <div className={`absolute -top-32 -right-32 w-64 h-64 ${isLogin ? 'bg-blue-600/10' : 'bg-emerald-600/10'} rounded-full blur-[100px] opacity-60 transition-colors duration-700`}></div>
        <div className={`absolute -bottom-32 -left-32 w-64 h-64 ${isLogin ? 'bg-indigo-600/10' : 'bg-teal-600/10'} rounded-full blur-[100px] opacity-60 transition-colors duration-700`}></div>

        <div className="flex flex-col items-center mb-10 relative z-10">
          <div className="w-28 h-28 bg-gradient-to-br from-blue-600 to-blue-800 rounded-[32px] flex items-center justify-center shadow-2xl shadow-blue-500/30 mb-8 border border-white/10 transform -rotate-3 hover:rotate-0 transition-all duration-700 group-hover:scale-105">
            <Star size={48} className="text-white fill-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
          </div>
          <h1 className="text-5xl font-black tracking-tighter mb-1 italic flex items-center gap-1">
            <span className="text-slate-950">GTM</span> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 not-italic">PRO</span>
          </h1>
          {/* Tagline removida conforme solicitação */}
        </div>

        {error && (
          <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 text-xs font-bold animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="p-1 bg-rose-500/20 rounded-lg">
              <AlertCircle size={16} />
            </div>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {!isLogin && (
            <div className="space-y-2 animate-in slide-in-from-top-4 duration-500">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Operador / Consultor</label>
              <div className="relative group">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors" size={18} />
                <input
                  type="text"
                  required={!isLogin}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-900/60 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-emerald-500/50 outline-none text-sm font-medium transition-all"
                  placeholder="Nome do Operador"
                />
              </div>
            </div>
          )}
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">ID de Acesso (E-mail)</label>
            <div className="relative group">
              <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 transition-colors ${isLogin ? 'group-focus-within:text-blue-500' : 'group-focus-within:text-emerald-500'}`} size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-12 pr-4 py-4 bg-slate-900/60 border border-slate-800 rounded-2xl focus:ring-2 outline-none text-sm font-medium transition-all ${isLogin ? 'focus:ring-blue-500/50' : 'focus:ring-emerald-500/50'}`}
                placeholder="operador@gtmpro.com"
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-0.5">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Chave de Segurança</label>
            </div>
            <div className="relative group">
              <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 transition-colors ${isLogin ? 'group-focus-within:text-blue-500' : 'group-focus-within:text-emerald-500'}`} size={18} />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-12 pr-12 py-4 bg-slate-900/60 border border-slate-800 rounded-2xl focus:ring-2 outline-none text-sm font-medium transition-all ${isLogin ? 'focus:ring-blue-500/50' : 'focus:ring-emerald-500/50'}`}
                placeholder="••••••••"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className="pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full text-white font-black text-[11px] uppercase tracking-[0.3em] py-5 rounded-[22px] flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-2xl disabled:opacity-50 ${
                isLogin 
                ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20 hover:shadow-blue-500/40' 
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20 hover:shadow-emerald-500/40'
              }`}
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  {isLogin ? 'Autenticar Sistema' : 'Finalizar Registro'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </form>
        <div className="mt-8 text-center">
          <button 
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-all hover:tracking-[0.2em]"
          >
            {isLogin ? 'Solicitar Novo Acesso Operacional' : 'Voltar para Login Seguro'}
          </button>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col items-center gap-4 relative z-10">
          <div className="flex items-center gap-2 text-[8px] text-slate-600 font-black uppercase tracking-[0.3em]">
            <ShieldCheck size={12} className="text-blue-500" />
            Encryption Active • Bio-Auth Ready
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
