
import React, { useState } from 'react';
import { useStore } from '../store';
import { ShieldCheck, ArrowRight, User as UserIcon, Mail, Lock, Eye, EyeOff, UserPlus, AlertCircle, Loader2 } from 'lucide-react';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, register } = useStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        const result = await login(email, password);
        if (!result.success) setError(result.message);
      } else {
        const result = await register(name, email, password);
        if (!result.success) setError(result.message);
      }
    } catch (err) {
      setError('Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950">
      <div className="w-full max-w-md glass p-10 rounded-[40px] shadow-2xl border-white/5 relative overflow-hidden transition-all duration-500">
        <div className={`absolute -top-24 -right-24 w-48 h-48 ${isLogin ? 'bg-blue-600/10' : 'bg-emerald-600/10'} rounded-full blur-3xl opacity-50 transition-colors duration-700`}></div>
        <div className={`absolute -bottom-24 -left-24 w-48 h-48 ${isLogin ? 'bg-indigo-600/10' : 'bg-teal-600/10'} rounded-full blur-3xl opacity-50 transition-colors duration-700`}></div>

        <div className="flex flex-col items-center mb-8 relative z-10">
          <div className={`w-20 h-20 bg-gradient-to-br ${isLogin ? 'from-blue-600 to-indigo-700' : 'from-emerald-600 to-teal-700'} rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/20 mb-6 border border-white/10 transform -rotate-3 hover:rotate-0 transition-all duration-500`}>
            <span className="text-4xl font-black italic text-white drop-shadow-md">GP</span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter mb-1 uppercase italic transition-all">
            {isLogin ? 'GTM PRO' : 'CRIAR CONTA'}
          </h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">
            {isLogin ? 'Gestão Comercial de Elite' : 'Junte-se ao time de elite'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 text-xs font-bold animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          {!isLogin && (
            <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome Completo</label>
              <div className="relative group">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                <input
                  type="text"
                  required={!isLogin}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-900/40 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all outline-none text-sm font-medium placeholder:text-slate-700"
                  placeholder="Seu nome completo"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">E-mail Corporativo</label>
            <div className="relative group">
              <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors ${isLogin ? 'group-focus-within:text-blue-500' : 'group-focus-within:text-emerald-500'}`} size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-12 pr-4 py-3.5 bg-slate-900/40 border border-slate-800 rounded-2xl focus:ring-2 outline-none text-sm font-medium placeholder:text-slate-700 transition-all ${isLogin ? 'focus:ring-blue-600' : 'focus:ring-emerald-600'}`}
                placeholder="seu@email.com.br"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Senha de Acesso</label>
            <div className="relative group">
              <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors ${isLogin ? 'group-focus-within:text-blue-500' : 'group-focus-within:text-emerald-500'}`} size={18} />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-12 pr-12 py-3.5 bg-slate-900/40 border border-slate-800 rounded-2xl focus:ring-2 outline-none text-sm font-medium placeholder:text-slate-700 transition-all ${isLogin ? 'focus:ring-blue-600' : 'focus:ring-emerald-600'}`}
                placeholder="••••••••"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full text-white font-black text-xs uppercase tracking-[0.2em] py-4 rounded-2xl flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${
                isLogin 
                ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20' 
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
              }`}
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  {isLogin ? 'Acessar Plataforma' : 'Criar minha conta'}
                  {isLogin ? <ArrowRight size={18} /> : <UserPlus size={18} />}
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <button 
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-[10px] font-black text-slate-500 hover:text-blue-400 uppercase tracking-widest transition-colors"
          >
            {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já possui conta? Acesse agora'}
          </button>
        </div>

        <div className="mt-10 pt-8 border-t border-slate-800/60 flex flex-col items-center gap-4 relative z-10">
          <div className="flex items-center gap-2 text-[9px] text-slate-500 font-black uppercase tracking-[0.1em]">
            <ShieldCheck size={12} className="text-emerald-500" />
            SISTEMA PROTEGIDO E MONITORADO
          </div>
          <p className="text-[8px] text-slate-700 uppercase tracking-[0.3em] text-center font-bold">
            © 2026 Vinícius GTM PRO
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
