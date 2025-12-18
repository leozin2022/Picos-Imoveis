
import React, { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'picos_imoveis_v1_logo';

interface LogoUploaderProps {
  externalLogo?: string;
}

const LogoUploader: React.FC<LogoUploaderProps> = ({ externalLogo }) => {
  const [localLogo, setLocalLogo] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  });

  const displayLogo = externalLogo || localLogo;

  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1.5 * 1024 * 1024) {
        alert("A imagem é muito grande. Escolha uma imagem de até 1.5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setLocalLogo(base64String);
        try {
          localStorage.setItem(STORAGE_KEY, base64String);
        } catch (err) {
          console.error("Erro ao salvar logo local", err);
        }
      };
      reader.readAsDataURL(file);
    }
  }, []);

  return (
    <div className="flex items-center gap-4 group/logo">
      <div className="relative group">
        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white border-2 border-white/20 flex items-center justify-center overflow-hidden shadow-sm hover:border-emerald-400 transition-colors cursor-pointer ring-2 ring-transparent group-hover:ring-emerald-400/30">
          {displayLogo ? (
            <img src={displayLogo} alt="Site Logo" className="w-full h-full object-contain p-1" />
          ) : (
            <span className="text-blue-700 font-black text-[10px] text-center px-1 leading-tight uppercase">Sua Logo</span>
          )}
          <input 
            type="file" 
            id="logoInput"
            accept="image/*" 
            onChange={handleLogoUpload}
            className="absolute inset-0 opacity-0 cursor-pointer z-10"
            title="Trocar Logomarca (Local)"
          />
        </div>
        {!externalLogo && (
          <label htmlFor="logoInput" className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1 border-2 border-blue-700 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </label>
        )}
      </div>
      <div className="hidden sm:block select-none">
        <h1 className="text-xl font-black text-white leading-none">Picos Imóveis</h1>
        <p className="text-[10px] text-blue-100 uppercase tracking-widest font-black mt-1 opacity-80">Vitrine Digital</p>
      </div>
    </div>
  );
};

export default LogoUploader;
