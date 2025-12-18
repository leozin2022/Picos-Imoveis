
import { Property, Sponsor } from '../types';

/**
 * Função para limpar cache e garantir dados novos da planilha
 */
const getFreshUrl = (url: string) => {
  const connector = url.includes('?') ? '&' : '?';
  return `${url}${connector}t=${new Date().getTime()}`;
};

/**
 * Verifica se o conteúdo parece ser HTML (erro de permissão do Google) 
 * em vez de um CSV válido.
 */
function isHtml(text: string): boolean {
  return text.trim().toLowerCase().startsWith('<!doctype html') || 
         text.trim().toLowerCase().startsWith('<html');
}

function parseCSV(csv: string): string[][] {
  if (!csv || isHtml(csv)) return [];
  
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
  if (!url) return {};
  try {
    const response = await fetch(getFreshUrl(url));
    if (!response.ok) return {};
    const csvData = await response.text();
    const rows = parseCSV(csvData);
    const config: Record<string, string> = {};
    rows.slice(1).forEach(row => {
      if (row && row[0] && row[1]) config[row[0]] = row[1];
    });
    return config;
  } catch (error) {
    console.error('Error fetching config:', error);
    return {};
  }
}

export async function fetchPropertiesFromSheets(url: string): Promise<Property[]> {
  if (!url) return [];

  try {
    const response = await fetch(getFreshUrl(url));
    if (!response.ok) throw new Error('Falha na resposta do servidor');
    const csvData = await response.text();
    const rows = parseCSV(csvData);
    
    if (rows.length <= 1) return []; // Apenas cabeçalho ou vazio

    return rows.slice(1).map((row, index) => {
      // Garantir que a linha tenha colunas suficientes para não quebrar
      const title = row[0] || '';
      const description = row[1] || '';
      const price = row[2] || 'Sob consulta';
      const neighborhood = row[3] || 'Centro';
      const whatsappLink = row[4] || '#';
      const p1 = row[5] || '';
      const p2 = row[6] || '';
      const p3 = row[7] || '';
      const p4 = row[8] || '';
      const p5 = row[9] || '';
      const isFeatured = row[10] || 'não';
      const type = row[11] || 'Venda';

      return {
        id: `prop-${index}-${new Date().getTime()}`,
        title: title || 'Sem título',
        description: description || 'Sem descrição',
        price: price,
        neighborhood: neighborhood,
        whatsappLink: whatsappLink,
        photos: [p1, p2, p3, p4, p5].filter(p => !!p && p !== ''),
        isFeatured: isFeatured.toLowerCase() === 'sim' || isFeatured.toLowerCase() === 'true',
        type: type,
        createdAt: new Date().toISOString()
      };
    }).filter(p => p.title !== 'Sem título'); // Remove linhas fantasmas vazias
  } catch (error) {
    console.error('Error fetching properties:', error);
    return [];
  }
}

export async function fetchSponsorsFromSheets(url: string): Promise<Sponsor[]> {
  if (!url) return [];

  try {
    const response = await fetch(getFreshUrl(url));
    if (!response.ok) return [];
    const csvData = await response.text();
    const rows = parseCSV(csvData);
    
    return rows.slice(1).map((row, index) => {
      const name = row[0] || 'Patrocinador';
      const logoUrl = row[1] || '';
      return {
        id: `sponsor-${index}`,
        name,
        logoUrl
      };
    }).filter(s => s.logoUrl !== '');
  } catch (error) {
    console.error('Error fetching sponsors:', error);
    return [];
  }
}
