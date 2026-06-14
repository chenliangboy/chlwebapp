import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { initialItems } from '@/data/initialItems';
import { resolvePublicImagePath } from '@/utils/normalizeItem';
import type { BubbleInput, BubbleItem } from '@/types/bubble';

function normalizeBubbleInput(data: BubbleInput): BubbleItem {
  if (Array.isArray(data)) {
    const [label, color = '#64748b', pale = '#e2e8f0', type = 'spark', image = ''] = data;
    return {
      id: label,
      title: label,
      color,
      pale,
      type,
      image: resolvePublicImagePath(image)
    };
  }

  const title = data.title || data.label || data.name || '';

  return {
    ...data,
    id: data.id || data.title || data.label || data.name || `bubble-${Date.now()}`,
    title,
    label: data.label,
    name: data.name,
    image: resolvePublicImagePath(data.image || data.imageUrl || data.img || data.src || ''),
    color: data.color || '#64748b',
    pale: data.pale || data.lightColor || data.backgroundColor || '#e2e8f0',
    type: data.type || 'spark',
    subtitle: data.subtitle,
    category: data.category || 'note',
    tags: data.tags || [],
    pinned: data.pinned,
    enabled: data.enabled,
    action: data.action,
    meta: data.meta
  };
}

export const useBubblesStore = defineStore('bubbles', () => {
  const items = ref<BubbleItem[]>(initialItems.map((item) => ({ ...item })));
  const selectedBubbleId = ref('');

  const selectedBubble = computed(() => items.value.find((item) => item.id === selectedBubbleId.value) || null);

  function createId(title: string) {
    const slug = title
      .trim()
      .toLocaleLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-|-$/g, '');
    const base = slug || `bubble-${Date.now()}`;
    const used = new Set(items.value.map((item) => item.id));
    if (!used.has(base)) return base;
    let index = 2;
    while (used.has(`${base}-${index}`)) index += 1;
    return `${base}-${index}`;
  }

  function selectBubble(id: string) {
    selectedBubbleId.value = id;
  }

  function clearSelection() {
    selectedBubbleId.value = '';
  }

  function addBubble(data: BubbleInput) {
    const item = normalizeBubbleInput(data);
    if (!item.id) item.id = createId(item.title);
    items.value.push(item);
    return item;
  }

  function updateBubble(id: string, data: BubbleInput) {
    const index = items.value.findIndex((item) => item.id === id);
    if (index === -1) return null;
    const next = normalizeBubbleInput({ ...items.value[index], ...(Array.isArray(data) ? {} : data) });
    next.id = id;
    items.value[index] = next;
    return next;
  }

  function removeBubble(id: string) {
    const index = items.value.findIndex((item) => item.id === id);
    if (index === -1) return false;
    items.value.splice(index, 1);
    if (selectedBubbleId.value === id) clearSelection();
    return true;
  }

  return {
    items,
    selectedBubbleId,
    selectedBubble,
    createId,
    selectBubble,
    clearSelection,
    addBubble,
    updateBubble,
    removeBubble
  };
});
