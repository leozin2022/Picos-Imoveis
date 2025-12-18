
import React, { useState, useEffect, useMemo } from 'react';
import LogoUploader from './components/LogoUploader';
import PropertyCard from './components/PropertyCard';
import PropertyModal from './components/PropertyModal';
import { Property, Neighborhood, Sponsor } from './types';
import { NEIGHBORHOODS, GOOGLE_SHEETS_PROPERTIES_URL, GOOGLE_SHEETS_SPONSORS_URL, GOOGLE_SHEETS_CONFIG_URL } from './constants';
import { fetchPropertiesFromSheets, fetchSponsorsFromSheets, fetchConfigFromSheets } from './services/googleSheetsService';

const App: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [siteConfig, setSiteConfig] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<Neighborhood | 'Todos'>('Todos');
  const [selectedType, setSelectedType] = useState<'Todos' | 'Venda' | 'Aluga'>('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [propsData, sponsorsData, configData] = await Promise.all([
        fetchPropertiesFromSheets(GOOGLE_SHEETS_PROPERTIES_URL),
        fetchSponsorsFromSheets(GOOGLE_SHEETS_SPONSORS_URL),
        fetchConfigFromSheets(GOOGLE_SHEETS_CONFIG_URL)
      ]);
      
      setProperties(propsData || []);
      setSponsors(sponsorsData || []);
      setSiteConfig(configData || {});
      
      if (!propsData || propsData.length === 0) {
        console.warn("Nenhum imóvel carregado da planilha.");
      }
    } catch (err) {
      console.error("Erro fatal ao sincronizar dados:", err);
      setError("Não foi possível carregar os dados. Verifique se a planilha está publicada como CSV.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const featuredProperties = useMemo(() => 
    properties.filter(p => p.isFeatured), 
  [properties]);

  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
      const matchesNeighborhood = selectedNeighborhood === 'Todos' || p.neighborhood === selectedNeighborhood;
      const matchesType = selectedType === 'Todos' || 
                         (p.type && p.type.toLowerCase().includes(selectedType.toLowerCase()));
      const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           p.neighborhood.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           p.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesNeighborhood && matchesType && matchesSearch;
    });
  }, [properties, selectedNeighborhood, selectedType, searchTerm]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else if (id === 'topo') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    scrollToSection('imoveis');
  };

  const siteLogo = siteConfig.LogoSite || siteConfig.Logomarca || siteConfig.logo;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="sticky top-0 z-40 bg-blue-700 border-b border-blue-800 shadow-xl text-white">
        <div className="max-w-7xl mx-auto px-4 h-20 md:h-24 flex items-center justify-between">
          <div onClick={() => scrollToSection('topo')} className="cursor-pointer">
            <LogoUploader externalLogo={siteLogo} />
          </div>
          
          <nav className="hidden md:flex items-center gap-10">
            <div className="flex gap-8 font-bold text-sm">
              <button onClick={() => scrollToSection('topo')} className="hover:text-emerald-400 transition-colors uppercase tracking-widest outline-none">Início</button>
              <button onClick={() => scrollToSection('destaques')} className="hover:text-emerald-400 transition-colors uppercase tracking-widest outline-none">Destaques</button>
              <button onClick={() => scrollToSection('imoveis')} className="hover:text-emerald-400 transition-colors uppercase tracking-widest outline-none">Imóveis</button>
            </div>
            <a 
              href="https://wa.me/5589999999999" 
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg transition-all transform hover:scale-105 active:scale-95"
            >
              Anunciar Imóvel
            </a>
          </nav>

          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 bg-blue-800 rounded-lg outline-none"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
            </svg>
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-blue-800 p-4 absolute top-20 left-0 w-full shadow-2xl animate-in slide-in-from-top duration-300">
            <div className="flex flex-col gap-4 font-bold text-sm">
              <button onClick={() => scrollToSection('topo')} className="py-2 text-left hover:text-emerald-400 border-b border-white/10 uppercase tracking-widest">Início</button>
              <button onClick={() => scrollToSection('destaques')} className="py-2 text-left hover:text-emerald-400 border-b border-white/10 uppercase tracking-widest">Destaques</button>
              <button onClick={() => scrollToSection('imoveis')} className="py-2 text-left hover:text-emerald-400 border-b border-white/10 uppercase tracking-widest">Imóveis</button>
              <a 
                href="https://wa.me/5589999999999"
                className="bg-emerald-500 text-center py-3 rounded-xl font-black uppercase tracking-widest"
              >
                Anunciar Agora
              </a>
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow">
        <section id="topo" className="bg-gradient-to-br from-blue-50 to-white py-16 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-tight">
              O imóvel dos seus sonhos está em <span className="text-blue-700 underline decoration-emerald-500 underline-offset-8">Picos</span>.
            </h2>
            <p className="text-slate-500 font-medium mb-12 max-w-xl mx-auto text-lg">Venda e Aluguel nos melhores bairros da capital do mel.</p>
            
            <form 
              onSubmit={handleSearchSubmit}
              className="flex flex-col lg:flex-row gap-3 bg-white p-3 rounded-3xl shadow-2xl border border-slate-100 max-w-5xl mx-auto overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/10 transition-all"
            >
              <div className="flex-grow flex items-center px-4 bg-slate-50 rounded-2xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input 
                  type="text" 
                  placeholder="O que você procura? (ex: Casa 3 quartos)"
                  className="w-full py-4 outline-none text-slate-700 font-semibold bg-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <select 
                  className="px-6 py-4 bg-blue-50 rounded-2xl outline-none font-black text-blue-700 cursor-pointer text-xs uppercase tracking-widest"
                  value={selectedNeighborhood}
                  onChange={(e) => setSelectedNeighborhood(e.target.value as Neighborhood | 'Todos')}
                >
                  <option value="Todos">Todos Bairros</option>
                  {NEIGHBORHOODS.map(n => <option key={n} value={n}>{n}</option>)}
                </select>

                <select 
                  className="px-6 py-4 bg-emerald-50 rounded-2xl outline-none font-black text-emerald-700 cursor-pointer text-xs uppercase tracking-widest"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as any)}
                >
                  <option value="Todos">Venda ou Aluguel</option>
                  <option value="Venda">Só Venda</option>
                  <option value="Aluga">Só Aluguel</option>
                </select>

                <button 
                  type="submit"
                  className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-4 rounded-2xl transition-all shadow-lg active:scale-95 font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                >
                  <span>Buscar</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </section>

        {featuredProperties.length > 0 && (
          <section id="destaques" className="py-20 px-4 bg-white scroll-mt-24">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-4 mb-10">
                <div className="h-10 w-2 bg-blue-700 rounded-full"></div>
                <h3 className="text-3xl font-black text-slate-900">Imóveis em Destaque</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {featuredProperties.map(p => (
                  <PropertyCard key={p.id} property={p} onClick={setSelectedProperty} />
                ))}
              </div>
            </div>
          </section>
        )}

        <section id="imoveis" className="py-20 px-4 bg-slate-50 scroll-mt-24 border-t border-slate-100">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
              <div>
                <h3 className="text-3xl font-black text-slate-900">Vitrine de Imóveis</h3>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">
                  {loading ? 'Sincronizando...' : `Exibindo ${filteredProperties.length} imóveis encontrados`}
                </p>
              </div>
              
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                <button onClick={() => setSelectedType('Todos')} className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex-shrink-0 ${selectedType === 'Todos' ? 'bg-blue-700 text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-200'}`}>Tudo</button>
                <button onClick={() => setSelectedType('Venda')} className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex-shrink-0 ${selectedType === 'Venda' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-200'}`}>Venda</button>
                <button onClick={() => setSelectedType('Aluga')} className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex-shrink-0 ${selectedType === 'Aluga' ? 'bg-orange-500 text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-200'}`}>Aluguel</button>
              </div>
            </div>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-700"></div>
                <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Sincronizando com a Planilha...</p>
              </div>
            ) : error ? (
              <div className="text-center py-20 bg-red-50 rounded-[40px] border border-red-100 p-8">
                <p className="text-red-600 font-bold mb-4">{error}</p>
                <button onClick={loadData} className="bg-red-600 text-white px-6 py-2 rounded-xl font-bold uppercase text-xs">Tentar novamente</button>
              </div>
            ) : filteredProperties.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {filteredProperties.map(p => (
                  <PropertyCard key={p.id} property={p} onClick={setSelectedProperty} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-[40px] shadow-sm border border-dashed border-slate-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-200 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-slate-400 font-bold">Nenhum imóvel combina com esses filtros.</p>
                <button 
                  onClick={() => {setSearchTerm(''); setSelectedNeighborhood('Todos'); setSelectedType('Todos');}} 
                  className="mt-6 bg-slate-100 hover:bg-slate-200 text-slate-600 px-6 py-3 rounded-xl font-black text-[10px] uppercase transition-all"
                >
                  Limpar Todos os Filtros
                </button>
              </div>
            )}
          </div>
        </section>

        {sponsors.length > 0 && (
          <section className="py-24 bg-slate-100/80 border-y border-slate-200 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 mb-16 text-center">
              <h4 className="text-xs font-black text-blue-900 uppercase tracking-[0.5em] opacity-50 mb-3">Nossos Parceiros Oficiais</h4>
              <div className="h-1 w-16 bg-emerald-500 mx-auto rounded-full"></div>
            </div>
            <div className="flex relative items-center">
              <div className="animate-scroll whitespace-nowrap py-4">
                {[...sponsors, ...sponsors, ...sponsors].map((s, idx) => (
                  <div key={`${s.id}-${idx}`} className="w-[300px] inline-flex items-center justify-center px-12 transition-transform hover:scale-110">
                    <img 
                      src={s.logoUrl} 
                      alt={s.name} 
                      className="max-h-20 w-auto object-contain drop-shadow-md brightness-105" 
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="bg-blue-900 py-20 text-blue-100 text-center px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center mb-10">
            <div className="w-20 h-1.5 w bg-emerald-500 rounded-full"></div>
          </div>
          <p className="text-2xl font-black mb-2 tracking-tighter">Picos Imóveis</p>
          <p className="text-[10px] opacity-50 uppercase tracking-[0.4em] font-black">A vitrine digital oficial de Picos, Piauí</p>
          <div className="mt-16 pt-10 border-t border-white/5 text-[10px] opacity-30 flex flex-col md:flex-row justify-center gap-4">
            <span>© {new Date().getFullYear()} Todos os direitos reservados.</span>
            <span className="hidden md:inline">•</span>
            <span>Desenvolvido para o mercado de Picos</span>
          </div>
        </div>
      </footer>

      {selectedProperty && (
        <PropertyModal property={selectedProperty} onClose={() => setSelectedProperty(null)} />
      )}
    </div>
  );
};

export default App;
