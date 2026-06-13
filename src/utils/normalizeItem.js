export function normalizeItem(data) {
  if (Array.isArray(data)) {
    const [label, color, pale, type, image] = data;
    return { id: label, label, color, pale, type, image };
  }

  return {
    id: data.id || data.key || data.slug || data.label || data.title || data.name || '',
    label: data.label || data.title || data.name || '',
    color: data.color || '#64748b',
    pale: data.pale || data.lightColor || data.backgroundColor || '#e2e8f0',
    type: data.type || 'spark',
    image: data.image || data.imageUrl || data.img || data.src || ''
  };
}
