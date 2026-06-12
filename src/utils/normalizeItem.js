export function normalizeItem(data) {
  if (Array.isArray(data)) {
    const [label, color, pale, type, image] = data;
    return { label, color, pale, type, image };
  }

  return {
    label: data.label || data.title || data.name || '',
    color: data.color || '#64748b',
    pale: data.pale || data.lightColor || data.backgroundColor || '#e2e8f0',
    type: data.type || 'spark',
    image: data.image || data.imageUrl || data.img || data.src || ''
  };
}
