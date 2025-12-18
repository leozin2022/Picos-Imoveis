
import React, { useState } from 'react';
import { Property } from '../types';

interface PropertyModalProps {
  property: Property;
  onClose: () => void;
}

const PropertyModal: React.FC<PropertyModalProps> = ({ property, onClose }) => {
  const [activePhoto, setActivePhoto] = useState(0);
  const isRent = property.type?.toLowerCase().includes('aluga');

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div 
        className="relative w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Galeria */}
          <div className="p-4 sm:p-6 bg-slate-50 flex flex-col gap-4">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-inner bg-slate-200">
              <img 
                src={property.photos[activePhoto] || property.photos[0]} 
                alt={`${property.title}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className={`${isRent ? 'bg-orange-500' : 'bg-emerald-500'} text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-xl border border-white/20 uppercase tracking-widest`}>
                  {property.type}
                </span>
                {property.isFeatured && (
                  <div className="bg-blue-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-xl border border-white/20 uppercase tracking-widest">
                    DESTAQUE
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
              {property.photos.map((photo, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhoto(idx)}
                  className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    activePhoto === idx ? 'border-blue-500 scale-95 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Detalhes */}
          <div className="p-6 sm:p-10 flex flex-col h-full max-h-[85vh] lg:max-h-none overflow-y-auto custom-scrollbar">
            <div className="mb-6">
              <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
                Bairro {property.neighborhood}
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 leading-tight mb-2">
                {property.title}
              </h2>
              <p className={`text-2xl font-bold ${isRent ? 'text-orange-600' : 'text-emerald-600'}`}>
                {property.price}
              </p>
            </div>

            <div className="space-y-6 flex-grow">
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Descrição do Imóvel</h3>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line text-lg">
                  {property.description}
                </p>
              </div>
            </div>

            <div className="pt-10 mt-auto">
              <a 
                href={property.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm uppercase tracking-widest py-5 rounded-2xl transition-all shadow-xl hover:shadow-emerald-200 transform hover:-translate-y-1 active:translate-y-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.438 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                </svg>
                Falar com Proprietário
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyModal;
