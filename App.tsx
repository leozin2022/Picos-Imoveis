
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
    } catch (err: any) {
      setError(err.message === "PLANILHA_PRIVADA" ? "PRIVADA" : "CONEXAO");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(), 300000);
    return () => clearInterval(interval);
  }, []);

  const featuredProperties = useMemo(() => 
    properties.filter(p => p.isFeatured), 
  [properties]);

  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
      const matchesNeighborhood = selectedNeighborhood === 'Todos' || p.neighborhood === selectedNeighborhood;
      const matchesType = selectedType === 'Todos' || (p.type && p.type.toLowerCase().includes(selectedType.toLowerCase()));
      const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           p.neighborhood.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesNeighborhood && matchesType && matchesSearch;
    });
  }, [properties, selectedNeighborhood, selectedType, searchTerm]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (error === "PRIVADA") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6 text-center">
        <div className="max-w-lg bg-white p-10 rounded-[40px] shadow-2xl border border-blue-100">
          <div className="text-6xl mb-6">📢</div>
          <h1 className="text-2xl font-black text-slate-900 mb-4 uppercase">Liberação Necessária</h1>
          <p className="text-slate-600 mb-8">A planilha está configurada, mas você precisa clicar no botão azul <b>Publicar</b> dentro da janela "Publicar na Web" do Google Sheets.</p>
          <button onClick={() => window.location.reload()} className="w-full bg-blue-700 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg">Já publiquei, recarregar agora</button>
        </div>
      </div>
    );
  }

  if (loading && properties.length === 0) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-700 rounded-full animate-spin mb-4"></div>
            <p className="font-black text-blue-700 text-[10px] uppercase tracking-[0.3em]">Lendo Google Sheets...</p>
        </div>
    );
  }

  const siteLogo = siteConfig.LogoSite || siteConfig.Logomarca || siteConfig.logo;
  const whatsappGeral = siteConfig.WhatsApp || "5589999999999";

  // Paleta de cores para os cards de parceiros
  const partnerBgs = [
    'from-blue-100 to-indigo-100 border-blue-200 text-blue-900',
    'from-emerald-100 to-teal-100 border-emerald-200 text-emerald-900',
    'from-orange-100 to-amber-100 border-orange-200 text-orange-900',
    'from-purple-100 to-pink-100 border-purple-200 text-purple-900',
    'from-blue-50 to-sky-100 border-sky-200 text-sky-900'
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 pb-20 md:pb-0 font-sans">
      <header className="sticky top-0 z-40 bg-blue-700 border-b border-blue-800 shadow-xl text-white">
        <div className="max-w-7xl mx-auto px-4 h-20 md:h-24 flex items-center justify-between">
          <div onClick={() => window.scrollTo({top:0, behavior:'smooth'})} className="cursor-pointer">
            <LogoUploader externalLogo={siteLogo} />
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <div className="flex gap-8 font-bold text-xs">
              <button onClick={() => scrollToSection('topo')} className="hover:text-emerald-400 uppercase tracking-widest transition-colors text-white/80">Início</button>
              <button onClick={() => scrollToSection('destaques')} className="hover:text-emerald-400 uppercase tracking-widest transition-colors text-white/80">Destaques</button>
              <button onClick={() => scrollToSection('imoveis')} className="hover:text-emerald-400 uppercase tracking-widest transition-colors text-white/80">Imóveis</button>
              <button onClick={() => scrollToSection('parceiros')} className="hover:text-emerald-400 uppercase tracking-widest transition-colors text-white/80">Parceiros</button>
            </div>
            <a href={`https://wa.me/${whatsappGeral}`} target="_blank" className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg transition-all transform hover:scale-105 active:scale-95">Anunciar Imóvel</a>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        <section id="topo" className="bg-gradient-to-br from-blue-50 to-white py-16 md:py-24 px-4 text-center">
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-tight">
              O imóvel dos seus sonhos está em <span className="text-blue-700 underline decoration-emerald-500 underline-offset-8 italic">Picos</span>.
            </h2>
            <p className="text-slate-500 font-medium mb-12 max-w-xl mx-auto text-lg">Conectando compradores e vendedores na Capital do Mel.</p>
            <div className="max-w-4xl mx-auto bg-white p-3 rounded-3xl shadow-2xl flex flex-col md:flex-row gap-2 border border-slate-100">
                <div className="flex-grow flex items-center px-6 bg-slate-50 rounded-2xl">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <input type="text" placeholder="Buscar por bairro ou descrição..." className="w-full py-4 bg-transparent outline-none font-semibold text-slate-700" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <select className="px-6 py-4 bg-blue-50 text-blue-800 rounded-2xl outline-none font-black text-xs uppercase tracking-widest cursor-pointer" value={selectedNeighborhood} onChange={(e) => setSelectedNeighborhood(e.target.value as any)}>
                    <option value="Todos">Todos Bairros</option>
                    {NEIGHBORHOODS.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <button onClick={() => scrollToSection('imoveis')} className="bg-blue-700 hover:bg-blue-800 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95">Buscar Agora</button>
            </div>
        </section>

        {featuredProperties.length > 0 && (
          <section id="destaques" className="py-20 px-4 bg-white scroll-mt-24">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-4 mb-12">
                <div className="h-10 w-2 bg-blue-700 rounded-full"></div>
                <div>
                  <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Destaques</h3>
                  <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em]">Oportunidades selecionadas</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {featuredProperties.map(p => <PropertyCard key={p.id} property={p} onClick={setSelectedProperty} />)}
              </div>
            </div>
          </section>
        )}

        <section id="imoveis" className="py-20 px-4 bg-slate-50 scroll-mt-24 border-b border-slate-200">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
              <div>
                <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Vitrine de Imóveis</h3>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-1">Encontramos {filteredProperties.length} imóveis</p>
              </div>
              <div className="flex gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200">
                <button onClick={() => setSelectedType('Todos')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedType === 'Todos' ? 'bg-blue-700 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>Tudo</button>
                <button onClick={() => setSelectedType('Venda')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedType === 'Venda' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>Venda</button>
                <button onClick={() => setSelectedType('Aluga')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedType === 'Aluga' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>Aluguel</button>
              </div>
            </div>
            
            {filteredProperties.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {filteredProperties.map(p => <PropertyCard key={p.id} property={p} onClick={setSelectedProperty} />)}
              </div>
            ) : (
              <div className="max-w-4xl mx-auto bg-white p-12 md:p-20 rounded-[50px] border-2 border-dashed border-slate-200 text-center shadow-inner">
                <div className="text-5xl mb-6 opacity-30">📂</div>
                <h4 className="text-xl font-black text-slate-800 uppercase mb-4">Nenhum imóvel encontrado</h4>
                <p className="text-slate-500 mb-10 max-w-md mx-auto">Tente ajustar seus filtros ou busca para encontrar o que procura.</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <span className="block font-black text-blue-700 text-xs mb-1 uppercase">Coluna A</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Título</span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <span className="block font-black text-blue-700 text-xs mb-1 uppercase">Coluna B</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Descrição</span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <span className="block font-black text-blue-700 text-xs mb-1 uppercase">Coluna C</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Preço</span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <span className="block font-black text-blue-700 text-xs mb-1 uppercase">Coluna D</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Bairro</span>
                    </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* SEÇÃO PARCEIROS - Com cards coloridos destacados */}
        {sponsors.length > 0 && (
          <section id="parceiros" className="py-24 bg-white overflow-hidden scroll-mt-24 border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-4 mb-16 text-center">
              <h4 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Nossos Parceiros</h4>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-3">Empresas que fazem a diferença em Picos</p>
              <div className="w-24 h-2 bg-blue-700 mx-auto mt-6 rounded-full shadow-lg shadow-blue-100"></div>
            </div>
            
            <div className="relative">
              <div className="flex overflow-hidden">
                <div className="animate-scroll">
                  {[...sponsors, ...sponsors, ...sponsors].map((s, idx) => (
                    <div key={`${s.id}-${idx}`} className="w-[340px] flex-shrink-0 px-6">
                      <div className={`p-8 rounded-[50px] shadow-xl border-2 flex flex-col items-center justify-center h-72 transform hover:-translate-y-5 transition-all duration-500 group cursor-pointer hover:shadow-2xl bg-gradient-to-br ${partnerBgs[idx % partnerBgs.length]}`}>
                        <div className="h-36 w-full flex items-center justify-center mb-6 bg-white/40 backdrop-blur-sm rounded-[35px] p-6 shadow-inner">
                            <img 
                            src={s.logoUrl} 
                            alt={s.name} 
                            className="max-h-full max-w-full object-contain drop-shadow-md transition-all duration-700 transform group-hover:scale-110" 
                            />
                        </div>
                        <h5 className="font-black text-inherit text-sm uppercase tracking-[0.2em] text-center drop-shadow-sm group-hover:tracking-[0.3em] transition-all">
                            {s.name}
                        </h5>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="bg-blue-900 py-20 text-white text-center">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8">
            <span className="text-4xl">🏠</span>
          </div>
          <p className="text-3xl font-black tracking-tighter italic mb-4">Picos Imóveis</p>
          <p className="text-blue-300 text-sm font-bold uppercase tracking-widest max-w-md mx-auto opacity-70 leading-relaxed">
            A maior vitrine imobiliária da região de Picos, Piauí. Conectando você ao seu novo lar.
          </p>
          
          <div className="flex justify-center gap-6 mt-12 mb-16">
             <a href={`https://wa.me/${whatsappGeral}`} target="_blank" className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl transition-colors border border-white/10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.438 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
             </a>
             <button onClick={() => window.scrollTo({top:0, behavior:'smooth'})} className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl transition-colors border border-white/10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7 7 7M5 19l7-7 7 7" /></svg>
             </button>
          </div>

          <div className="pt-10 border-t border-white/5 text-[10px] opacity-40 uppercase tracking-[0.4em] font-black">
            © {new Date().getFullYear()} - Picos Imóveis - Todos os direitos reservados
          </div>
        </div>
      </footer>

      {/* Navegação Mobile Inferior */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] bg-blue-700/90 backdrop-blur-2xl border border-white/20 rounded-[40px] shadow-2xl px-10 py-6 flex items-center justify-between text-white">
        <button onClick={() => scrollToSection('topo')} className="flex flex-col items-center gap-2 opacity-70 hover:opacity-100 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            <span className="text-[10px] font-black uppercase tracking-tighter">Início</span>
        </button>
        <button onClick={() => scrollToSection('imoveis')} className="flex flex-col items-center gap-2 opacity-70 hover:opacity-100 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            <span className="text-[10px] font-black uppercase tracking-tighter">Imóveis</span>
        </button>
        <button onClick={() => scrollToSection('parceiros')} className="flex flex-col items-center gap-2 opacity-70 hover:opacity-100 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            <span className="text-[10px] font-black uppercase tracking-tighter">Parceiros</span>
        </button>
      </div>

      {selectedProperty && (
        <PropertyModal property={selectedProperty} onClose={() => setSelectedProperty(null)} />
      )}
    </div>
  );
};

export default App;
