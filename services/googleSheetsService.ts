
import { Property, Sponsor } from '../types';

const getFreshUrl = (url: string) => {
  const connector = url.includes('?') ? '&' : '?';
  return `${url}${connector}t=${new Date().getTime()}`;
};

/**
 * Detecta se o conteúdo retornado é uma página de erro ou login do Google
 */
function isGoogleError(text: string): boolean {
  if (!text) return true;
  const t = text.trim().toLowerCase();
  return t.includes('<!doctype html') || 
         t.includes('<html') || 
         t.includes('google-signin') || 
         t.includes('login') ||
         t.includes('service_login') ||
         t.includes('accounts.google.com');
}

function parseCSV(csv: string): string[][] {
  if (!csv || isGoogleError(csv)) {
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
      if (row && row[0] && row[1]) config[row[0]] = row[1];
    });
    return config;
  } catch (error) {
    console.warn('Config fetch failed, using defaults');
    return {};
  }
}

export async function fetchPropertiesFromSheets(url: string): Promise<Property[]> {
  try {
    const response = await fetch(getFreshUrl(url));
    if (!response.ok) throw new Error("HTTP_ERROR_" + response.status);
    
    const csvData = await response.text();
    const rows = parseCSV(csvData);
    
    return rows.slice(1).map((row, index) => ({
      id: `prop-${index}-${new Date().getTime()}`,
      title: row[0] || 'Sem título',
      description: row[1] || 'Sem descrição',
      price: row[2] || 'Sob consulta',
      neighborhood: row[3] || 'Centro',
      whatsappLink: row[4] || '#',
      photos: [row[5], row[6], row[7], row[8], row[9]].filter(p => !!p && p !== ''),
      isFeatured: String(row[10]).toLowerCase() === 'sim',
      type: row[11] || 'Venda',
      createdAt: new Date().toISOString()
    })).filter(p => p.title !== 'Sem título');
  } catch (error: any) {
    console.error("Fetch Properties Error:", error);
    if (error.message === "PLANILHA_PRIVADA") {
      throw new Error("A planilha não está pública. No Google Sheets, vá em: Arquivo > Compartilhar > Publicar na Web. Escolha 'Valores separados por vírgula (.csv)' e clique em Publicar.");
    }
    throw new Error("Não foi possível carregar os dados. Verifique sua conexão ou se os links da planilha em constants.ts estão corretos.");
  }
}

export async function fetchSponsorsFromSheets(url: string): Promise<Sponsor[]> {
  try {
    const response = await fetch(getFreshUrl(url));
    const csvData = await response.text();
    const rows = parseCSV(csvData);
    return rows.slice(1).map((row, index) => ({
      id: `sponsor-${index}`,
      name: row[0] || 'Parceiro',
      logoUrl: row[1] || ''
    })).filter(s => !!s.logoUrl);
  } catch {
    return [];
  }
}
