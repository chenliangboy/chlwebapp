<template>
  <section class="view-panel is-active" aria-label="工作台">
    <div class="stage" aria-label="可拖拽的浮动图片气泡墙">
      <button
        class="layout-toggle"
        type="button"
        :aria-label="layoutTitle"
        :title="layoutTitle"
        :aria-pressed="layoutMode === 'grid'"
        @click="toggleLayout"
      >
        <svg class="layout-icon layout-icon-grid" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="4" y="4" width="6" height="6" rx="1.5"></rect>
          <rect x="14" y="4" width="6" height="6" rx="1.5"></rect>
          <rect x="4" y="14" width="6" height="6" rx="1.5"></rect>
          <rect x="14" y="14" width="6" height="6" rx="1.5"></rect>
        </svg>
        <svg class="layout-icon layout-icon-free" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="7" cy="7" r="3"></circle>
          <circle cx="17" cy="9" r="2.5"></circle>
          <circle cx="11" cy="17" r="3.5"></circle>
        </svg>
      </button>

      <div ref="bubbleLayer" class="bubble-layer"></div>

      <button
        ref="searchToggle"
        class="search-toggle"
        :class="{ 'is-active': isSearchOpen }"
        type="button"
        aria-label="搜索气泡"
        title="搜索气泡 Ctrl+F"
        :aria-expanded="isSearchOpen"
        aria-controls="searchPanel"
        @click="setSearchVisible(!isSearchOpen)"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="7"></circle>
          <path d="m16.5 16.5 4 4"></path>
        </svg>
      </button>

      <div
        id="searchPanel"
        ref="searchPanel"
        class="search-panel"
        :class="{ 'is-open': isSearchOpen }"
        :aria-hidden="!isSearchOpen"
      >
        <label class="sr-only" for="bubbleSearch">搜索气泡标题</label>
        <svg class="search-panel-icon" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="7"></circle>
          <path d="m16.5 16.5 4 4"></path>
        </svg>
        <input
          id="bubbleSearch"
          ref="searchInput"
          v-model="searchQuery"
          type="search"
          autocomplete="off"
          placeholder="输入标题实时搜索"
          @input="search"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { BubbleWall } from '@/core/BubbleWall';
import { useBubblesStore } from '@/stores/bubbles';
import type { BubbleEngine, BubbleInput, BubbleItem, BubbleWallPublicApi } from '@/types/bubble';

const bubblesStore = useBubblesStore();
const { items } = storeToRefs(bubblesStore);
const bubbleLayer = ref<HTMLElement | null>(null);
const searchPanel = ref<HTMLElement | null>(null);
const searchToggle = ref<HTMLElement | null>(null);
const searchInput = ref<HTMLInputElement | null>(null);
const bubbleWall = ref<BubbleWall | null>(null);
const layoutMode = ref<'free' | 'grid'>('free');
const searchQuery = ref('');
const isSearchOpen = ref(false);
let stopLayoutListener: (() => void) | undefined;

const layoutTitle = computed(() => (layoutMode.value === 'grid' ? '切换为自由布局' : '切换为网格布局'));

function syncBodyClasses() {
  document.body.classList.toggle('is-grid-mode', layoutMode.value === 'grid');
  document.body.classList.toggle('is-searching', searchQuery.value.trim().length > 0);
}

function openBubble(engineBubble: BubbleEngine) {
  bubblesStore.selectBubble(engineBubble.item.id);
}

function mountBubbleWall() {
  if (!bubbleLayer.value) return;
  bubbleWall.value = new BubbleWall({
    layer: bubbleLayer.value,
    items: items.value,
    onBubbleOpen: openBubble
  });

  stopLayoutListener = bubbleWall.value.onLayoutModeChange((mode: 'free' | 'grid') => {
    layoutMode.value = mode;
    syncBodyClasses();
  });

  exposeLegacyApi();
}

function exposeLegacyApi() {
  if (!bubbleWall.value) return;
  const wall = bubbleWall.value;
  window.bubbleWall = {
    addBubble(data: BubbleInput) {
      const item = bubblesStore.addBubble(data);
      const bubble = wall.addBubble(item);
      return bubble;
    },
    updateBubble(id: string, data: BubbleInput) {
      const item = bubblesStore.updateBubble(id, data);
      if (!item) return null;
      return wall.updateBubble(id, item);
    },
    removeBubble(id: string) {
      const removed = wall.removeBubble(id);
      bubblesStore.removeBubble(id);
      return removed;
    },
    getBubbles() {
      return wall.getBubbles();
    },
    setLayoutMode(mode: 'free' | 'grid') {
      wall.setLayoutMode(mode);
    },
    search(value: string) {
      searchQuery.value = value;
      wall.search(value);
      syncBodyClasses();
    }
  } satisfies BubbleWallPublicApi;
}

function toggleLayout() {
  if (!bubbleWall.value) return;
  bubbleWall.value.setLayoutMode(layoutMode.value === 'free' ? 'grid' : 'free');
}

function setSearchVisible(isVisible: boolean) {
  isSearchOpen.value = isVisible;

  if (isVisible) {
    nextTick(() => {
      searchInput.value?.focus();
      searchInput.value?.select();
    });
    return;
  }

  searchQuery.value = '';
  search();
}

function search() {
  bubbleWall.value?.search(searchQuery.value);
  syncBodyClasses();
}

function isSearchEventTarget(target: EventTarget | null) {
  if (!(target instanceof Node)) return false;
  return Boolean(searchPanel.value?.contains(target) || searchToggle.value?.contains(target));
}

function handleDocumentPointerDown(event: PointerEvent) {
  if (!isSearchOpen.value) return;
  if (isSearchEventTarget(event.target)) return;
  setSearchVisible(false);
}

function handleKeydown(event: KeyboardEvent) {
  const isFindShortcut = event.key.toLocaleLowerCase() === 'f' && (event.ctrlKey || event.metaKey);
  if (isFindShortcut) {
    event.preventDefault();
    setSearchVisible(true);
    return;
  }

  if (event.key === 'Escape') setSearchVisible(false);
}

function savePositions() {
  bubbleWall.value?.savePositions(true);
}

watch(
  items,
  (nextItems, previousItems) => {
    if (!bubbleWall.value || !previousItems) return;
    const engineItems = bubbleWall.value.getBubbles() as BubbleEngine[];
    const engineIds = new Set(engineItems.map((item) => item.id));
    const nextIds = new Set(nextItems.map((item) => item.id));

    for (const engineItem of engineItems) {
      if (!nextIds.has(engineItem.id)) bubbleWall.value.removeBubble(engineItem.id);
    }

    for (const item of nextItems) {
      if (engineIds.has(item.id)) {
        bubbleWall.value.updateBubble(item.id, item);
      } else {
        bubbleWall.value.addBubble(item);
      }
    }
  },
  { deep: true }
);

onMounted(() => {
  mountBubbleWall();
  document.addEventListener('pointerdown', handleDocumentPointerDown);
  window.addEventListener('keydown', handleKeydown);
  window.addEventListener('beforeunload', savePositions);
  syncBodyClasses();
});

onBeforeUnmount(() => {
  stopLayoutListener?.();
  savePositions();
  bubbleWall.value?.destroy();
  if (window.bubbleWall) delete window.bubbleWall;
  document.removeEventListener('pointerdown', handleDocumentPointerDown);
  window.removeEventListener('keydown', handleKeydown);
  window.removeEventListener('beforeunload', savePositions);
  document.body.classList.remove('is-grid-mode', 'is-searching', 'is-returning-free');
});
</script>
