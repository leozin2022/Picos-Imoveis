
import { Property, Sponsor } from '../types';

const getFreshUrl = (url: string) => {
  const connector = url.includes('?') ? '&' : '?';
  // Adiciona um timestamp para evitar que o navegador use uma versão antiga (cache) da planilha
  return `${url}${connector}t=${new Date().getTime()}`;
};

function isGoogleError(text: string): boolean {
  if (!text || text.length < 20) return false;
  const t = text.trim().toLowerCase();
  return t.includes('<!doctype html') || 
         t.includes('<html') || 
         t.includes('google-signin') || 
         t.includes('accounts.google.com') ||
         t.includes('login');
}

function parseCSV(csv: string): string[][] {
  if (isGoogleError(csv)) {
    throw new Error("PLANILHA_PRIVADA");
  }
  
  const lines = csv.split(/\r?\n/);
  return lines
    .filter(line => line.trim().length > 0)
    .map(line => {
      const result = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') inQuotes = !inQuotes;
        else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    });
}

export async function fetchConfigFromSheets(url: string): Promise<Record<string, string>> {
  try {
    const response = await fetch(getFreshUrl(url));
    const csvData = await response.text();
    const rows = parseCSV(csvData);
    const config: Record<string, string> = {};
    rows.slice(1).forEach(row => {
      if (row && row[0]) config[row[0]] = row[1] || '';
    });
    return config;
  } catch (error) {
    console.warn('Config fetch error:', error);
    return {};
  }
}

export async function fetchPropertiesFromSheets(url: string): Promise<Property[]> {
  try {
    const response = await fetch(getFreshUrl(url));
    const csvData = await response.text();
    const rows = parseCSV(csvData);
    
    if (rows.length <= 1) return [];

    return rows.slice(1)
      .filter(row => row.length >= 1 && row[0] !== '')
      .map((row, index) => ({
        id: `prop-${index}-${new Date().getTime()}`,
        title: row[0] || 'Sem título',
        description: row[1] || 'Sem descrição',
        price: row[2] || 'Sob consulta',
        neighborhood: row[3] || 'Centro',
        whatsappLink: row[4] || '#',
        photos: [row[5], row[6], row[7], row[8], row[9]].filter(p => !!p && p.startsWith('http')),
        isFeatured: String(row[10]).toLowerCase().includes('sim'),
        type: row[11] || 'Venda',
        createdAt: new Date().toISOString()
      }));
  } catch (error: any) {
    console.error("Erro ao buscar imóveis:", error);
    if (error.message === "PLANILHA_PRIVADA") throw new Error("PLANILHA_PRIVADA");
    throw new Error("Falha na conexão com a aba Imóveis.");
  }
}

export async function fetchSponsorsFromSheets(url: string): Promise<Sponsor[]> {
  try {
    const response = await fetch(getFreshUrl(url));
    const csvData = await response.text();
    const rows = parseCSV(csvData);
    
    // Filtra linhas onde a segunda coluna (índice 1) parece ser uma URL de imagem
    return rows.slice(1)
      .filter(row => row[1] && (row[1].startsWith('http') || row[1].startsWith('data:image')))
      .map((row, index) => ({
        id: `sponsor-${index}-${new Date().getTime()}`,
        name: row[0] || 'Parceiro',
        logoUrl: row[1] || ''
      }));
  } catch (err) {
    console.error("Erro ao buscar parceiros:", err);
    return [];
  }
}
