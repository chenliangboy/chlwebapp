<template>
  <aside class="side-panel" :class="{ 'is-chat-mode': isImmersiveMode }" aria-label="功能区域">
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
        <span>{{ selectedTypeLabel }}</span>
        <strong>{{ selectedBubble?.title || '详情' }}</strong>
      </div>
      <button class="icon-button" type="button" aria-label="隐藏功能区域" title="隐藏功能区域" @click="emit('hide')">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m15 18-6-6 6-6"></path>
        </svg>
      </button>
    </header>

    <div class="detail-panel" :class="{ 'is-chat': isImmersiveMode }">
      <ChatPanel v-if="selectedBubble && mode === 'chat'" :item="selectedBubble" @back="mode = 'detail'" />
      <GamePanel v-else-if="selectedBubble && mode === 'game'" :item="selectedBubble" />
      <AgentToolPanel v-else-if="selectedBubble && mode === 'agent-tool'" :item="selectedBubble" />
      <AiChatPanel v-else-if="selectedBubble && mode === 'ai-chat'" :item="selectedBubble" @back="mode = 'detail'" />
      <WebPanel v-else-if="selectedBubble && mode === 'web'" :item="selectedBubble" />
      <BubbleDetail
        v-else-if="selectedBubble"
        :item="selectedBubble"
        @open="mode = resolveMode(selectedBubble)"
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
import { computed, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import AgentToolPanel from './AgentToolPanel.vue';
import AiChatPanel from './AiChatPanel.vue';
import BubbleDetail from './BubbleDetail.vue';
import ChatPanel from './ChatPanel.vue';
import EmptyDetail from './EmptyDetail.vue';
import GamePanel from './GamePanel.vue';
import WebPanel from './WebPanel.vue';
import { getBubbleTypeDefinition } from '@/data/bubbleTypes';
import { useBubblesStore } from '@/stores/bubbles';
import { openExternalAction, resolveBubblePanel } from '@/workspace/actions';
import type { BubbleItem, BubblePanelType } from '@/types/bubble';

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
const mode = ref<BubblePanelType>('detail');
const isImmersiveMode = computed(() => ['chat', 'ai-chat'].includes(mode.value));
const selectedTypeLabel = computed(() => selectedBubble.value ? getBubbleTypeDefinition(selectedBubble.value.category).label : '功能区域');

function resolveMode(item: BubbleItem) {
  if (openExternalAction(item)) return 'detail';
  return resolveBubblePanel(item);
}

watch(selectedBubble, () => {
  mode.value = selectedBubble.value ? resolveMode(selectedBubble.value) : 'detail';
});
</script>
