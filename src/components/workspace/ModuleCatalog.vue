<template>
  <div class="module-catalog">
    <header class="module-toolbar">
      <div class="module-tabs" role="tablist" :aria-label="title">
        <button
          type="button"
          :class="{ 'is-active': activeSource === 'mine' }"
          @click="activeSource = 'mine'"
        >
          {{ mineLabel }}
        </button>
        <button
          type="button"
          :class="{ 'is-active': activeSource === 'market' }"
          @click="activeSource = 'market'"
        >
          {{ marketLabel }}
        </button>
      </div>
      <label class="module-search">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="7"></circle>
          <path d="m16.5 16.5 4 4"></path>
        </svg>
        <input v-model.trim="query" type="search" :placeholder="searchPlaceholder" />
      </label>
    </header>

    <div class="module-filter-row" aria-label="分类标签">
      <button
        v-for="tag in visibleTags"
        :key="tag"
        type="button"
        :class="{ 'is-active': activeTag === tag }"
        @click="activeTag = tag"
      >
        {{ tag }}
      </button>
    </div>

    <div class="module-card-grid" :aria-label="title">
      <button v-for="item in filteredItems" :key="item.id" class="module-card" type="button" @click="$emit('open', item)">
        <div class="module-card-art" :style="{ '--item-color': item.color, '--item-pale': item.pale }">
          <img v-if="item.image" :src="item.image" :alt="item.title" draggable="false" />
          <span v-else>{{ initials(item.title) }}</span>
        </div>
        <div class="module-card-content">
          <strong>{{ item.title }}</strong>
          <p>{{ item.subtitle || categoryLabel(item) }}</p>
          <div class="module-card-tags">
            <span v-for="tag in item.tags?.slice(0, 3)" :key="tag">{{ tag }}</span>
          </div>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { getBubbleTypeDefinition } from '@/data/bubbleTypes';
import type { BubbleItem } from '@/types/bubble';

const props = defineProps<{
  title: string;
  items: BubbleItem[];
  marketItems: BubbleItem[];
  mineLabel: string;
  marketLabel: string;
  searchPlaceholder: string;
}>();

defineEmits<{
  open: [item: BubbleItem];
}>();

const activeSource = ref<'mine' | 'market'>('mine');
const activeTag = ref('全部');
const query = ref('');

const sourceItems = computed(() => activeSource.value === 'mine' ? props.items : props.marketItems);
const visibleTags = computed(() => {
  const tags = new Set<string>(['全部']);
  for (const item of sourceItems.value) {
    for (const tag of item.tags || []) tags.add(tag);
  }
  return [...tags];
});
const filteredItems = computed(() => {
  const value = query.value.toLocaleLowerCase();
  return sourceItems.value.filter((item) => {
    if (activeTag.value !== '全部' && !(item.tags || []).includes(activeTag.value)) return false;
    if (!value) return true;
    return [item.title, item.subtitle, ...(item.tags || [])].filter(Boolean).join(' ').toLocaleLowerCase().includes(value);
  });
});

function categoryLabel(item: BubbleItem) {
  return getBubbleTypeDefinition(item.category).label;
}

function initials(value: string) {
  return value.trim().slice(0, 2).toUpperCase();
}
</script>
