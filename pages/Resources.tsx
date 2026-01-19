
import React, { useState } from 'react';
import { 
  Globe, Cpu, ExternalLink, HardDrive, 
  Search, MessageCircle, Database, 
  Zap, Sparkles, MapPin, Navigation, Filter,
  LayoutGrid, Info
} from 'lucide-react';

interface ResourceItem {
  id: string;
  category: 'ai' | 'operational' | 'strategic';
  title: string;
  description: string;
  url: string;
  icon: any;
  color: string;
}

const RESOURCES: ResourceItem[] = [
  // Inteligência Artificial
  {
    id: '1',
    category: 'ai',
    title: 'ChatGPT',
    description: 'Análise de textos e geração de insights rápidos.',
    url: 'https://chat.openai.com',
    icon: Cpu,
    color: 'bg-emerald-600'
  },
  {
    id: '2',
    category: 'ai',
    title: 'Claude (Anthropic)',
    description: 'Processamento de documentos extensos e lógica avançada.',
    url: 'https://claude.ai',
    icon: Sparkles,
    color: 'bg-orange-600'
  },
  {
    id: '3',
    category: 'ai',
    title: 'Perplexity AI',
    description: 'Pesquisa em tempo real com fontes citadas.',
    url: 'https://perplexity.ai',
    icon: Search,
    color: 'bg-cyan-600'
  },
  {
    id: '4',
    category: 'ai',
    title: 'DeepSeek',
    description: 'Motor de raciocínio profundo para problemas complexos.',
    url: 'https://deepseek.com',
    icon: Zap,
    color: 'bg-blue-800'
  },
  // Operacional
  {
    id: '5',
    category: 'operational',
    title: 'Google Drive',
    description: 'Repositório de materiais comerciais e apresentações.',
    url: 'https://drive.google.com',
    icon: HardDrive,
    color: 'bg-amber-500'
  },
  {
    id: '6',
    category: 'operational',
    title: 'WhatsApp Business',
    description: 'Gestão de comunicação direta com decisores.',
    url: 'https://web.whatsapp.com',
    icon: MessageCircle,
    color: 'bg-green-600'
  },
  // Estratégico
  {
    id: '7',
    category: 'strategic',
    title: 'EducaSystem FUNEP',
    description: 'Portal administrativo e gestão acadêmica FUNEP.',
    url: 'https://funepi.educasystem.com.br/adm/',
    icon: Database,
    color: 'bg-indigo-600'
  }
];

const MAJOR_CITIES_PB = [
  { name: 'João Pessoa', slug: 'joao-pessoa' },
  { name: 'Campina Grande', slug: 'campina-grande' },
  { name: 'Santa Rita', slug: 'santa-rita' },
  { name: 'Patos', slug: 'patos' },
  { name: 'Cabedelo', slug: 'cabedelo' },
  { name: 'Sousa', slug: 'sousa' },
];

const Resources = () => {
  const [citySearch, setCitySearch] = useState('');
  const [searchMode, setSearchMode] = useState<'visual' | 'data'>('visual');

  const handleRegionalSearch = (e: React.FormEvent, forcedSlug?: string) => {
    e?.preventDefault();
    const query = forcedSlug || citySearch;
    if (!query.trim()) return;

    const slug = query.toLowerCase().trim().replace(/\s+/g, '-');
    
    if (searchMode === 'visual') {
      // Busca otimizada no Google Maps para empresas da região
      window.open(`https://www.google.com/maps/search/Empresas+em+${query}+PB`, '_blank');
    } else {
      // Busca de dados fiscais estável no CNPJ.biz
      window.open(`https://cnpj.biz/procura/pb/${slug}`, '_blank');
    }
  };

  const renderGrid = (category: ResourceItem['category'], label: string) => {
    const items = RESOURCES.filter(r => r.category === category);
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4 px-2">
          <div className="h-px flex-1 bg-gradient-to-r from-slate-200 dark:from-slate-800 to-transparent"></div>
          <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">{label}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          {items.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-xl hover:shadow-2xl hover:translate-y-[-6px] transition-all group overflow-hidden relative"
            >
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className={`p-4 rounded-2xl ${item.color} text-white shadow-lg`}>
                  <item.icon size={24} />
                </div>
                <ExternalLink size={18} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
              </div>
              
              <div className="relative z-10">
                <h3 className="text-xl font-black italic tracking-tighter uppercase text-slate-950 dark:text-white mb-2">{item.title}</h3>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{item.description}</p>
              </div>

              <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none group-hover:scale-125 transition-transform duration-1000">
                <item.icon size={120} />
              </div>
            </a>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-16 pb-32 animate-in fade-in duration-700">
      <div className="flex flex-col gap-4 px-2">
        <h1 className="text-6xl font-black tracking-tighter italic uppercase text-slate-950 dark:text-white leading-none">
          Central de <span className="text-blue-600 not-italic">Atalhos</span>
        </h1>
        <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">Motores de Produtividade e Hub Operacional</p>
      </div>

      {/* Radar de Prospecção Paraíba Otimizado */}
      <div className="space-y-10">
        <div className="flex items-center gap-4 px-2">
          <div className="h-px flex-1 bg-gradient-to-r from-slate-200 dark:from-slate-800 to-transparent"></div>
          <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-blue-600">Radar GTM Paraíba v2.0</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Buscador de Cidade */}
          <div className="lg:col-span-2 bg-slate-950 p-10 rounded-[48px] border border-white/5 shadow-6xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
              <MapPin size={180} className="text-white" />
            </div>
            
            <div className="relative z-10 space-y-10">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-3xl font-black italic tracking-tighter uppercase text-white mb-2 leading-none">Radar Territorial</h3>
                  <p className="text-xs text-slate-400 font-medium tracking-tight">Especifique a região para extrair leads e dados cadastrais.</p>
                </div>
                <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
                  <button 
                    onClick={() => setSearchMode('visual')}
                    className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${searchMode === 'visual' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'}`}
                  >
                    Visual (Maps)
                  </button>
                  <button 
                    onClick={() => setSearchMode('data')}
                    className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${searchMode === 'data' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'}`}
                  >
                    Dados (CNPJ)
                  </button>
                </div>
              </div>

              <form onSubmit={(e) => handleRegionalSearch(e)} className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                  <input 
                    type="text" 
                    placeholder="Nome da Cidade (ex: Campina Grande)"
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    className="w-full pl-16 pr-8 py-5 bg-white/5 border border-white/10 rounded-[24px] outline-none text-white font-bold text-sm focus:border-blue-600 transition-all placeholder:text-slate-600 shadow-inner"
                  />
                </div>
                <button 
                  type="submit"
                  className="px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black text-[11px] uppercase tracking-widest rounded-[24px] transition-all flex items-center justify-center gap-3 active:scale-95 shadow-2xl shadow-blue-600/20"
                >
                  <Navigation size={18} /> Iniciar Radar
                </button>
              </form>

              <div className="flex items-center gap-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                <Info size={12} className="text-blue-600" />
                Dica: O modo "Visual" abre empresas no Google Maps. O modo "Dados" busca no CNPJ.biz.
              </div>
            </div>
          </div>

          {/* Atalhos Rápidos Cidades PB */}
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8 flex items-center gap-2">
                <Filter size={14} className="text-blue-600" /> Mesorregiões Ativas
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {MAJOR_CITIES_PB.map((city) => (
                  <button 
                    key={city.slug}
                    onClick={() => handleRegionalSearch(null as any, city.name)}
                    className="px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase text-slate-700 dark:text-slate-300 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all text-center tracking-tighter shadow-sm"
                  >
                    {city.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
              <Navigation size={120} />
            </div>
          </div>
        </div>
      </div>

      {renderGrid('ai', 'Cognição e Inteligência Artifical')}
      {renderGrid('operational', 'Fluxo de Trabalho e Materiais')}
      {renderGrid('strategic', 'Inteligência de Mercado e Gestão')}
    </div>
  );
};

export default Resources;
