
import { Property, Sponsor } from '../types';

/**
 * Função para limpar cache e garantir dados novos da planilha
 */
const getFreshUrl = (url: string) => {
  const connector = url.includes('?') ? '&' : '?';
  return `${url}${connector}t=${new Date().getTime()}`;
};

function parseCSV(csv: string): string[][] {
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
    if (!response.ok) throw new Error('Falha ao buscar config');
    const csvData = await response.text();
    const rows = parseCSV(csvData);
    const config: Record<string, string> = {};
    rows.slice(1).forEach(row => {
      if (row[0] && row[1]) config[row[0]] = row[1];
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
    if (!response.ok) throw new Error('Falha ao buscar imóveis');
    const csvData = await response.text();
    const rows = parseCSV(csvData);
    const dataRows = rows.slice(1);

    return dataRows.map((row, index) => {
      // Mapeamento: 0:Título, 1:Desc, 2:Preço, 3:Bairro, 4:WhatsApp, 5-9:Fotos, 10:Destaque, 11:Tipo (Coluna L)
      const [title, description, price, neighborhood, whatsappLink, p1, p2, p3, p4, p5, isFeatured, type] = row;
      return {
        id: `prop-${index}-${new Date().getTime()}`,
        title: title || 'Sem título',
        description: description || 'Sem descrição',
        price: price || 'Sob consulta',
        neighborhood: neighborhood || 'Centro',
        whatsappLink: whatsappLink || '#',
        photos: [p1, p2, p3, p4, p5].filter(p => !!p && p !== ''),
        isFeatured: isFeatured?.toLowerCase() === 'sim' || isFeatured?.toLowerCase() === 'true',
        type: type || 'Venda',
        createdAt: new Date().toISOString()
      };
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    return [];
  }
}

export async function fetchSponsorsFromSheets(url: string): Promise<Sponsor[]> {
  if (!url) return [];

  try {
    const response = await fetch(getFreshUrl(url));
    if (!response.ok) throw new Error('Falha ao buscar patrocinadores');
    const csvData = await response.text();
    const rows = parseCSV(csvData);
    const dataRows = rows.slice(1);

    return dataRows.map((row, index) => {
      const [name, logoUrl] = row;
      return {
        id: `sponsor-${index}`,
        name: name || 'Patrocinador',
        logoUrl: logoUrl || 'https://via.placeholder.com/150'
      };
    });
  } catch (error) {
    console.error('Error fetching sponsors:', error);
    return [];
  }
}
