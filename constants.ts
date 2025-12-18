
import { Neighborhood } from './types';

export const NEIGHBORHOODS: Neighborhood[] = [
  'Aerolândia', 'Altamira', 'Bela Vista', 'Boa Vista', 'Bomba',
  'Canto da Várzea', 'Catavento', 'Centro', 'Conduru', 'DNER',
  'Ipueiras', 'Itavó', 'Jardim das Oliveiras', 'Junco', 'Luzia',
  'Malva', 'Morada do Sol', 'Morada Nova', 'Morro da Macambira', 'Morro da Onça',
  'Pantanal', 'Paraibinha', 'Parque de Exposição', 'Passagem das Pedras',
  'Pedrinhas', 'Piaui', 'Salgadão', 'Sambaíba', 'São José',
  'São Vicente', 'Tia Joana', 'Turuçu', 'Umari', 'Valparaíso'
];

/**
 * CONFIGURAÇÃO DO GOOGLE SHEETS
 */

// Link da aba "Imoveis" (gid=0)
export const GOOGLE_SHEETS_PROPERTIES_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRgEUgMmfOesihAmasrySyIVfm4-nB04ayKyKHwNoSBEMC779DmVoEOaby0wCFnfWDve-n0eAzg0m_4/pub?gid=0&single=true&output=csv'; 

// Link da aba "Patrocinadores" (gid=1764848062)
export const GOOGLE_SHEETS_SPONSORS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRgEUgMmfOesihAmasrySyIVfm4-nB04ayKyKHwNoSBEMC779DmVoEOaby0wCFnfWDve-n0eAzg0m_4/pub?gid=1764848062&single=true&output=csv';

// Link da aba "Configuracao" (gid=1983973278)
export const GOOGLE_SHEETS_CONFIG_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRgEUgMmfOesihAmasrySyIVfm4-nB04ayKyKHwNoSBEMC779DmVoEOaby0wCFnfWDve-n0eAzg0m_4/pub?gid=1983973278&single=true&output=csv';
