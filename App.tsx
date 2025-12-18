
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
      console.log("Tentando buscar dados das planilhas...");
      const [propsData, sponsorsData, configData] = await Promise.all([
        fetchPropertiesFromSheets(GOOGLE_SHEETS_PROPERTIES_URL),
        fetchSponsorsFromSheets(GOOGLE_SHEETS_SPONSORS_URL),
        fetchConfigFromSheets(GOOGLE_SHEETS_CONFIG_URL)
      ]);
      
      setProperties(propsData || []);
      setSponsors(sponsorsData || []);
      setSiteConfig(configData || {});
    } catch (err: any) {
      console.error("Falha fatal no carregamento:", err);
      setError(err.message);
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 text-center font-sans">
        <div className="max-w-lg bg-white p-8 md:p-12 rounded-[40px] shadow-2xl border border-red-100">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">🔒</div>
          <h1 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">Acesso Negado à Planilha</h1>
          <div className="text-slate-600 text-sm space-y-4 mb-8 text-left bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <p className="font-bold text-slate-800">Siga estes passos no seu Google Sheets:</p>
            <ol className="list-decimal ml-4 space-y-2">
              <li>Clique em <b>Arquivo</b> > <b>Compartilhar</b> > <b>Publicar na Web</b>.</li>
              <li>Mude de "Página da Web" para <b>Valores separados por vírgula (.csv)</b>.</li>
              <li>Clique no botão azul <b>Publicar</b>.</li>
              <li>Recarregue esta página.</li>
            </ol>
          </div>
          <p className="text-[10px] text-slate-400 uppercase font-black mb-6 tracking-widest">Erro Técnico: {error}</p>
          <button onClick={loadData} className="w-full bg-blue-700 hover:bg-blue-800 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-lg active:scale-95">Tentar Novamente</button>
        </div>
      </div>
    );
  }

  if (loading && properties.length === 0) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-700 rounded-full animate-spin mb-4"></div>
            <p className="font-black text-blue-700 text-[10px] uppercase tracking-[0.3em]">Carregando Imóveis...</p>
        </div>
    );
  }

  const siteLogo = siteConfig.LogoSite || siteConfig.Logomarca || siteConfig.logo;
  const whatsappGeral = siteConfig.WhatsApp || "5589999999999";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 pb-20 md:pb-0">
      <header className="sticky top-0 z-40 bg-blue-700 border-b border-blue-800 shadow-xl text-white">
        <div className="max-w-7xl mx-auto px-4 h-20 md:h-24 flex items-center justify-between">
          <div onClick={() => window.scrollTo({top:0, behavior:'smooth'})} className="cursor-pointer">
            <LogoUploader externalLogo={siteLogo} />
          </div>
          <nav className="hidden md:flex items-center gap-10">
            <div className="flex gap-8 font-bold text-sm">
              <button onClick={() => scrollToSection('topo')} className="hover:text-emerald-400 transition-colors uppercase tracking-widest">Início</button>
              <button onClick={() => scrollToSection('destaques')} className="hover:text-emerald-400 transition-colors uppercase tracking-widest">Destaques</button>
              <button onClick={() => scrollToSection('imoveis')} className="hover:text-emerald-400 transition-colors uppercase tracking-widest">Imóveis</button>
            </div>
            <a href={`https://wa.me/${whatsappGeral}`} target="_blank" className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg transition-all">Anunciar</a>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        <section id="topo" className="bg-gradient-to-br from-blue-50 to-white py-16 md:py-24 px-4 text-center">
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-tight">
              Seu novo lar em <span className="text-blue-700 underline decoration-emerald-500 underline-offset-8">Picos</span>.
            </h2>
            <p className="text-slate-500 font-medium mb-12 max-w-xl mx-auto text-lg">A maior vitrine de venda e aluguel da capital do mel.</p>
            <div className="max-w-4xl mx-auto bg-white p-3 rounded-3xl shadow-2xl flex flex-col md:flex-row gap-2 border border-slate-100">
                <div className="flex-grow flex items-center px-6 bg-slate-50 rounded-2xl">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <input type="text" placeholder="Buscar por nome ou bairro..." className="w-full py-4 bg-transparent outline-none font-semibold text-slate-700" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <select className="px-6 py-4 bg-blue-50 text-blue-800 rounded-2xl outline-none font-black text-xs uppercase tracking-widest cursor-pointer" value={selectedNeighborhood} onChange={(e) => setSelectedNeighborhood(e.target.value as any)}>
                    <option value="Todos">Todos Bairros</option>
                    {NEIGHBORHOODS.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <button onClick={() => scrollToSection('imoveis')} className="bg-blue-700 hover:bg-blue-800 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95">Buscar</button>
            </div>
        </section>

        {featuredProperties.length > 0 && (
          <section id="destaques" className="py-20 px-4 bg-white scroll-mt-24">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-4 mb-12">
                <div className="h-10 w-2 bg-blue-700 rounded-full"></div>
                <div>
                  <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Imóveis em Destaque</h3>
                  <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em]">As melhores oportunidades da semana</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {featuredProperties.map(p => <PropertyCard key={p.id} property={p} onClick={setSelectedProperty} />)}
              </div>
            </div>
          </section>
        )}

        <section id="imoveis" className="py-20 px-4 bg-slate-50 scroll-mt-24">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
              <div>
                <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Nossa Vitrine</h3>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-1">Exibindo {filteredProperties.length} imóveis</p>
              </div>
              <div className="flex gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 overflow-x-auto no-scrollbar">
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
              <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-bold">Nenhum imóvel encontrado.</p>
              </div>
            )}
          </div>
        </section>

        {sponsors.length > 0 && (
          <section className="py-24 bg-gradient-to-b from-slate-50 to-slate-200 border-t border-slate-200 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 mb-14 text-center">
              <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.4em] block mb-3">Rede de Confiança</span>
              <h4 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Parceiros Oficiais</h4>
              <div className="w-16 h-1 bg-emerald-500 mx-auto mt-4 rounded-full"></div>
            </div>
            <div className="relative">
              <div className="flex overflow-x-auto no-scrollbar py-4 px-4 md:px-0">
                <div className="flex animate-scroll">
                  {[...sponsors, ...sponsors, ...sponsors].map((s, idx) => (
                    <div key={`${s.id}-${idx}`} className="w-[280px] flex-shrink-0 px-4">
                      <div className="bg-white p-8 rounded-[30px] shadow-xl border border-white flex items-center justify-center h-40">
                        <img src={s.logoUrl} alt={s.name} className="max-h-20 w-auto object-contain" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="hidden md:block bg-blue-900 py-20 text-white text-center">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-3xl font-black tracking-tighter mb-2 italic">Picos Imóveis</p>
          <div className="mt-12 pt-10 border-t border-white/10 text-[11px] opacity-40 uppercase tracking-widest font-bold">
            © {new Date().getFullYear()} - Todos os direitos reservados
          </div>
        </div>
      </footer>

      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-sm bg-blue-700/90 backdrop-blur-xl border border-white/20 rounded-[35px] shadow-2xl px-8 py-5 flex items-center justify-between text-white">
        <button onClick={() => scrollToSection('topo')} className="flex flex-col items-center gap-1.5"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg><span className="text-[9px] font-black uppercase">Início</span></button>
        <button onClick={() => scrollToSection('destaques')} className="flex flex-col items-center gap-1.5"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.783.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg><span className="text-[9px] font-black uppercase">Destaques</span></button>
        <button onClick={() => scrollToSection('imoveis')} className="flex flex-col items-center gap-1.5"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg><span className="text-[9px] font-black uppercase">Vitrine</span></button>
        <a href={`https://wa.me/${whatsappGeral}`} target="_blank" className="flex flex-col items-center gap-1.5 text-emerald-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg><span className="text-[9px] font-black uppercase">Whats</span></a>
      </div>

      {selectedProperty && (
        <PropertyModal property={selectedProperty} onClose={() => setSelectedProperty(null)} />
      )}
    </div>
  );
};

export default App;
