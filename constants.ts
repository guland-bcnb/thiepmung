import { BackgroundTemplate, FontType } from "./types";

export const FONTS: { label: string; value: FontType }[] = [
  { label: 'Cơ bản (Roboto)', value: 'Roboto' },
  { label: 'Viết tay (Dancing Script)', value: 'Dancing Script' },
  { label: 'Sang trọng (Playfair Display)', value: 'Playfair Display' },
  { label: 'Hiện đại (Montserrat)', value: 'Montserrat' },
];

export const COLORS = [
  '#000000', '#FFFFFF', '#1F2937', '#DC2626', '#EA580C', 
  '#D97706', '#65A30D', '#059669', '#0891B2', '#2563EB', 
  '#7C3AED', '#DB2777'
];

export const BACKGROUND_TEMPLATES: BackgroundTemplate[] = [
  {
    id: 'bg-1',
    url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1000&auto=format&fit=crop',
    name: 'Sinh nhật vui vẻ',
    category: 'birthday'
  },
  {
    id: 'bg-2',
    url: 'https://images.unsplash.com/photo-1530103862676-de3c9da59af7?q=80&w=1000&auto=format&fit=crop',
    name: 'Bóng bay',
    category: 'birthday'
  },
  {
    id: 'bg-3',
    url: 'https://images.unsplash.com/photo-1496115965489-21be7e6e59a0?q=80&w=1000&auto=format&fit=crop',
    name: 'Sang trọng tối',
    category: 'achievement'
  },
  {
    id: 'bg-4',
    url: 'https://images.unsplash.com/photo-1634128221889-82ed6efebfc3?q=80&w=1000&auto=format&fit=crop',
    name: 'Trừu tượng vàng',
    category: 'achievement'
  },
  {
    id: 'bg-5',
    url: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1000&auto=format&fit=crop',
    name: 'Gradient tím',
    category: 'simple'
  },
  {
    id: 'bg-6',
    url: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=1000&auto=format&fit=crop',
    name: 'Giấy trắng',
    category: 'simple'
  }
];

export const DEFAULT_TEXT_LAYER = {
  fontSize: 24,
  color: '#000000',
  fontFamily: 'Roboto' as FontType,
  fontWeight: 'normal' as const,
  textAlign: 'center' as const,
};