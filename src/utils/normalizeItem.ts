import type { BubbleInput, BubbleItem } from '@/types/bubble';

export interface NormalizedBubbleItem {
  id: string;
  label: string;
  color: string;
  pale: string;
  type: string;
  image: string;
}

export function resolvePublicImagePath(image: string) {
  if (!image.startsWith('/images/')) return image;
  return `${import.meta.env.BASE_URL}${image.replace(/^\//, '')}`;
}

export function normalizeItem(data: BubbleInput): NormalizedBubbleItem {
  if (Array.isArray(data)) {
    const [label, color = '#64748b', pale = '#e2e8f0', type = 'spark', image = ''] = data;
    return { id: label, label, color, pale, type, image: resolvePublicImagePath(image) };
  }

  const item = data as Partial<BubbleItem> & {
    key?: string;
    slug?: string;
  };

  return {
    id: item.id || item.key || item.slug || item.label || item.title || item.name || '',
    label: item.label || item.title || item.name || '',
    color: item.color || '#64748b',
    pale: item.pale || item.lightColor || item.backgroundColor || '#e2e8f0',
    type: item.type || 'spark',
    image: resolvePublicImagePath(item.image || item.imageUrl || item.img || item.src || '')
  };
}
