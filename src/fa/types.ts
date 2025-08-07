export interface FAIcon {
  name: string;
  style: string;
  label?: string;
  search?: {
    terms: string[];
  };
  unicode?: string;
  svg?: string;
}

export interface IconMetadata {
  [key: string]: {
    label?: string;
    search?: {
      terms: string[];
    };
    unicode?: string;
    styles: string[];
  };
}

export type FAStyle = 'solid' | 'regular' | 'light' | 'thin' | 'duotone' | 'brands';