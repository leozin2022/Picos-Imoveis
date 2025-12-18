
import React from 'react';
import { Property } from '../types';

interface PropertyCardProps {
  property: Property;
  onClick: (property: Property) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onClick }) => {
  const isRent = property.type?.toLowerCase().includes('aluga') || property.type?.toLowerCase().includes('aluguel');

  return (
    <div 
      onClick={() => onClick(property)}
      className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer group flex flex-col h-full border border-slate-100"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={property.photos[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800'} 
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        
        {/* Badges do Topo */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <span className="bg-white/95 backdrop-blur-sm text-blue-700 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
            {property.neighborhood}
          </span>
          {property.isFeatured && (
            <span className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-lg">
              Destaque
            </span>
          )}
        </div>

        {/* Badge de Tipo (Venda/Aluga) - Super Destacada */}
        <div className="absolute top-3 right-3">
          <span className={`${isRent ? 'bg-orange-500 shadow-orange-200' : 'bg-emerald-500 shadow-emerald-200'} text-white text-[11px] font-black px-4 py-1.5 rounded-xl uppercase tracking-[0.1em] shadow-xl border border-white/30 transform transition-transform group-hover:scale-110`}>
            {property.type || 'Venda'}
          </span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
          <p className="text-white font-black text-2xl drop-shadow-lg">{property.price}</p>
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-blue-700 transition-colors text-slate-800">
          {property.title}
        </h3>
        <p className="text-slate-500 text-sm line-clamp-2 mb-6 flex-grow leading-relaxed">
          {property.description}
        </p>
        
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
             <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
             <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Disponível</span>
          </div>
          <div className="flex items-center gap-1 text-blue-600 font-black text-xs uppercase tracking-tighter">
            Ver Detalhes
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
