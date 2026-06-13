<template>
  <aside class="side-panel" :class="{ 'is-chat-mode': mode === 'chat' }" aria-label="功能区域">
    <div
      class="side-panel-resize"
      role="separator"
      aria-label="调整功能区域宽度"
      aria-orientation="vertical"
      tabindex="0"
      @pointerdown="emit('startResize', $event)"
    ></div>
    <header class="side-panel-header">
      <div>
        <span>功能区域</span>
        <strong>详情</strong>
      </div>
      <button class="icon-button" type="button" aria-label="隐藏功能区域" title="隐藏功能区域" @click="emit('hide')">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m15 18-6-6 6-6"></path>
        </svg>
      </button>
    </header>

    <div class="detail-panel" :class="{ 'is-chat': mode === 'chat' }">
      <ChatPanel v-if="selectedBubble && mode === 'chat'" :item="selectedBubble" @back="mode = 'detail'" />
      <BubbleDetail
        v-else-if="selectedBubble"
        :item="selectedBubble"
        @chat="mode = 'chat'"
        @edit="emit('editBubble', selectedBubble)"
      />
      <EmptyDetail v-else />
    </div>
  </aside>

  <button class="right-reveal" type="button" aria-label="显示功能区域" title="显示功能区域" @click="emit('show')">
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m9 18 6-6-6-6"></path>
    </svg>
  </button>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import BubbleDetail from './BubbleDetail.vue';
import ChatPanel from './ChatPanel.vue';
import EmptyDetail from './EmptyDetail.vue';
import { useBubblesStore } from '@/stores/bubbles';
import type { BubbleItem } from '@/types/bubble';

defineProps<{
  visible: boolean;
  isResizing: boolean;
}>();

const emit = defineEmits<{
  hide: [];
  show: [];
  startResize: [event: PointerEvent];
  editBubble: [item: BubbleItem];
}>();

const bubblesStore = useBubblesStore();
const { selectedBubble } = storeToRefs(bubblesStore);
const mode = ref<'detail' | 'chat'>('detail');

watch(selectedBubble, () => {
  mode.value = 'detail';
});
</script>
