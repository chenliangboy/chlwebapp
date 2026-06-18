<template>
  <section class="view-panel is-active" aria-label="工作台">
    <div class="stage" aria-label="可拖拽的浮动气泡工作台">
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

      <button
        class="motion-toggle"
        type="button"
        :aria-label="motionTitle"
        :title="motionTitle"
        :aria-pressed="freeMotionMode === 'float'"
        @click="toggleFreeMotion"
      >
        <svg class="motion-icon motion-icon-still" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 12h14"></path>
          <path d="M12 5v14"></path>
          <circle cx="12" cy="12" r="7"></circle>
        </svg>
        <svg class="motion-icon motion-icon-float" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 14c3.2-6 7.6-6 11-2.2 1.7 1.9 3.2 2.6 5 1.2"></path>
          <path d="M5 18c2.4-2.6 5.1-2.5 7.8 0"></path>
          <path d="M17 6l3 3-3 3"></path>
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
        <label class="sr-only" for="bubbleSearch">搜索气泡标题、分类或标签</label>
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
          placeholder="输入标题、分类或标签"
          @input="search"
        />
      </div>
    </div>

    <div class="modal-root" :aria-hidden="!activeBubble">
      <div class="modal-overlay" :class="{ 'is-open': activeBubble }" @pointerdown.self="closeBubbleModal">
        <div
          v-if="activeBubble"
          class="modal-dialog workspace-modal"
          :class="{ 'is-immersive': isImmersivePanel }"
          role="dialog"
          aria-modal="true"
          :aria-label="activeBubble.title"
        >
          <header v-if="!isImmersivePanel" class="workspace-modal-header">
            <div>
              <span>{{ activeCategoryLabel }}</span>
              <strong>{{ activeBubble.title }}</strong>
            </div>
            <button class="modal-close" type="button" aria-label="关闭" title="关闭" @click="closeBubbleModal">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18 6 6 18"></path>
                <path d="m6 6 12 12"></path>
              </svg>
            </button>
          </header>

          <div class="workspace-modal-body" :class="{ 'is-chat': isImmersivePanel }">
            <ChatPanel v-if="activePanel === 'chat'" :item="activeBubble" @back="closeBubbleModal" />
            <GamePanel v-else-if="activePanel === 'game'" :item="activeBubble" />
            <AgentToolPanel v-else-if="activePanel === 'agent-tool'" :item="activeBubble" />
            <AiChatPanel v-else-if="activePanel === 'ai-chat'" :item="activeBubble" @back="closeBubbleModal" />
            <WebPanel v-else-if="activePanel === 'web'" :item="activeBubble" />
            <BubbleDetail
              v-else
              :item="activeBubble"
              @open="activePanel = resolveMode(activeBubble)"
              @chat="activePanel = 'chat'"
              @edit="editBubble(activeBubble)"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import AgentToolPanel from '@/components/detail/AgentToolPanel.vue';
import AiChatPanel from '@/components/detail/AiChatPanel.vue';
import BubbleDetail from '@/components/detail/BubbleDetail.vue';
import ChatPanel from '@/components/detail/ChatPanel.vue';
import GamePanel from '@/components/detail/GamePanel.vue';
import WebPanel from '@/components/detail/WebPanel.vue';
import { BubbleWall } from '@/core/BubbleWall';
import { getBubbleTypeDefinition } from '@/data/bubbleTypes';
import { useBubblesStore } from '@/stores/bubbles';
import { openExternalAction, resolveBubblePanel } from '@/workspace/actions';
import type { BubbleEngine, BubbleInput, BubbleItem, BubblePanelType, BubbleWallPublicApi } from '@/types/bubble';

const emit = defineEmits<{
  editBubble: [item: BubbleItem];
}>();

const bubblesStore = useBubblesStore();
const { items } = storeToRefs(bubblesStore);
const bubbleLayer = ref<HTMLElement | null>(null);
const searchPanel = ref<HTMLElement | null>(null);
const searchToggle = ref<HTMLElement | null>(null);
const searchInput = ref<HTMLInputElement | null>(null);
const bubbleWall = ref<BubbleWall | null>(null);
const layoutMode = ref<'free' | 'grid'>('free');
const freeMotionMode = ref<'still' | 'float'>('float');
const searchQuery = ref('');
const isSearchOpen = ref(false);
const activeBubble = ref<BubbleItem | null>(null);
const activePanel = ref<BubblePanelType>('detail');
let stopLayoutListener: (() => void) | undefined;

const layoutTitle = computed(() => (layoutMode.value === 'grid' ? '切换为自由布局' : '切换为网格布局'));
const motionTitle = computed(() => (freeMotionMode.value === 'float' ? '自由模式：随机漂浮' : '自由模式：固定位置'));
const activeCategoryLabel = computed(() => activeBubble.value ? getBubbleTypeDefinition(activeBubble.value.category).label : '');
const isImmersivePanel = computed(() => ['chat', 'ai-chat'].includes(activePanel.value));

function syncBodyClasses() {
  document.body.classList.toggle('is-grid-mode', layoutMode.value === 'grid');
  document.body.classList.toggle('is-free-floating', freeMotionMode.value === 'float');
  document.body.classList.toggle('is-free-still', freeMotionMode.value === 'still');
  document.body.classList.toggle('is-searching', searchQuery.value.trim().length > 0);
}

function resolveMode(item: BubbleItem) {
  if (openExternalAction(item)) return 'detail';
  return resolveBubblePanel(item);
}

function openBubble(engineBubble: BubbleEngine) {
  activeBubble.value = engineBubble.item;
  activePanel.value = resolveMode(engineBubble.item);
}

function closeBubbleModal() {
  activeBubble.value = null;
  activePanel.value = 'detail';
}

function editBubble(item: BubbleItem) {
  closeBubbleModal();
  bubblesStore.selectBubble(item.id);
  emit('editBubble', item);
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
      return wall.addBubble(item);
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
    setFreeMotionMode(mode: 'still' | 'float') {
      freeMotionMode.value = mode;
      wall.setFreeMotionMode(mode);
      syncBodyClasses();
    },
    search(value: string) {
      searchQuery.value = value;
      wall.search(value);
      syncBodyClasses();
    }
  } satisfies BubbleWallPublicApi;
}

function toggleLayout() {
  bubbleWall.value?.setLayoutMode(layoutMode.value === 'free' ? 'grid' : 'free');
}

function toggleFreeMotion() {
  freeMotionMode.value = freeMotionMode.value === 'float' ? 'still' : 'float';
  bubbleWall.value?.setFreeMotionMode(freeMotionMode.value);
  syncBodyClasses();
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

  if (event.key === 'Escape') {
    if (activeBubble.value) {
      closeBubbleModal();
      return;
    }
    setSearchVisible(false);
  }
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
  document.body.classList.remove('is-grid-mode', 'is-free-floating', 'is-free-still', 'is-searching', 'is-returning-free');
});
</script>
