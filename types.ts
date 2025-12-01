export type FontType = 'Roboto' | 'Dancing Script' | 'Playfair Display' | 'Montserrat';

export type LayerType = 'text' | 'image';

export interface BaseLayer {
  id: string;
  x: number;
  y: number;
  type: LayerType;
  isDragging?: boolean;
}

export interface TextLayer extends BaseLayer {
  type: 'text';
  text: string;
  fontSize: number;
  color: string;
  fontFamily: FontType;
  fontWeight: 'normal' | 'bold';
  textAlign: 'left' | 'center' | 'right';
}

export interface ImageLayer extends BaseLayer {
  type: 'image';
  src: string;
  width: number; // px
  opacity: number; // 0-1
}

export type Layer = TextLayer | ImageLayer;

export interface BackgroundTemplate {
  id: string;
  url: string;
  name: string;
  category: 'birthday' | 'achievement' | 'simple' | 'custom';
}

export interface SavedTemplate {
  id: string;
  name: string;
  backgroundUrl: string; // Can be a URL or Base64 string
  layers: Layer[];
  createdAt: number;
}

export type CardType = 'birthday' | 'achievement';

export interface AISuggestionRequest {
  type: CardType;
  recipientName: string;
  context?: string; // e.g., "30th birthday" or "Best Salesman"
}