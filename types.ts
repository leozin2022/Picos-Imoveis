
export interface Property {
  id: string;
  title: string;
  description: string;
  price: string;
  neighborhood: string;
  whatsappLink: string;
  photos: string[];
  isFeatured: boolean;
  type: 'Venda' | 'Aluga' | string;
  createdAt: string;
}

export interface Sponsor {
  id: string;
  name: string;
  logoUrl: string;
}

export type Neighborhood = 
  | 'Aerolândia' | 'Altamira' | 'Bela Vista' | 'Boa Vista' | 'Bomba' 
  | 'Canto da Várzea' | 'Catavento' | 'Centro' | 'Conduru' | 'DNER' 
  | 'Ipueiras' | 'Itavó' | 'Jardim das Oliveiras' | 'Junco' | 'Luzia' 
  | 'Malva' | 'Morada do Sol' | 'Morada Nova' | 'Morro da Macambira' | 'Morro da Onça' 
  | 'Pantanal' | 'Paraibinha' | 'Parque de Exposição' | 'Passagem das Pedras' 
  | 'Pedrinhas' | 'Piaui' | 'Salgadão' | 'Sambaíba' | 'São José' 
  | 'São Vicente' | 'Tia Joana' | 'Turuçu' | 'Umari' | 'Valparaíso';
