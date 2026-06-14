<template>
  <div class="modal-root" :aria-hidden="!item">
    <div class="modal-overlay" :class="{ 'is-open': item }" @pointerdown.self="close">
      <div
        v-if="item"
        class="modal-dialog workspace-modal"
        :class="{ 'is-immersive': isImmersivePanel }"
        role="dialog"
        aria-modal="true"
        :aria-label="item.title"
      >
        <header v-if="!isImmersivePanel" class="workspace-modal-header">
          <div>
            <span>{{ categoryLabel }}</span>
            <strong>{{ item.title }}</strong>
          </div>
          <button class="modal-close" type="button" aria-label="关闭" title="关闭" @click="close">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </button>
        </header>

        <div class="workspace-modal-body" :class="{ 'is-chat': isImmersivePanel }">
          <ChatPanel v-if="activePanel === 'chat'" :item="item" @back="close" />
          <GamePanel v-else-if="activePanel === 'game'" :item="item" />
          <AgentToolPanel v-else-if="activePanel === 'agent-tool'" :item="item" />
          <AiChatPanel v-else-if="activePanel === 'ai-chat'" :item="item" @back="close" />
          <WebPanel v-else-if="activePanel === 'web'" :item="item" />
          <BubbleDetail
            v-else
            :item="item"
            @open="activePanel = resolveMode(item)"
            @chat="activePanel = 'chat'"
            @edit="edit"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import AgentToolPanel from '@/components/detail/AgentToolPanel.vue';
import AiChatPanel from '@/components/detail/AiChatPanel.vue';
import BubbleDetail from '@/components/detail/BubbleDetail.vue';
import ChatPanel from '@/components/detail/ChatPanel.vue';
import GamePanel from '@/components/detail/GamePanel.vue';
import WebPanel from '@/components/detail/WebPanel.vue';
import { getBubbleTypeDefinition } from '@/data/bubbleTypes';
import { openExternalAction, resolveBubblePanel } from '@/workspace/actions';
import type { BubbleItem, BubblePanelType } from '@/types/bubble';

const props = withDefaults(defineProps<{
  item: BubbleItem | null;
  initialPanel?: BubblePanelType;
}>(), {
  initialPanel: ''
});

const emit = defineEmits<{
  close: [];
  edit: [item: BubbleItem];
}>();

const activePanel = ref<BubblePanelType>('detail');
const categoryLabel = computed(() => props.item ? getBubbleTypeDefinition(props.item.category).label : '');
const isImmersivePanel = computed(() => ['chat', 'ai-chat'].includes(activePanel.value));

function resolveMode(item: BubbleItem) {
  if (openExternalAction(item)) return 'detail';
  return resolveBubblePanel(item);
}

function close() {
  emit('close');
}

function edit() {
  if (props.item) emit('edit', props.item);
}

watch(
  () => props.item,
  (item) => {
    if (!item) {
      activePanel.value = 'detail';
      return;
    }

    activePanel.value = props.initialPanel || resolveMode(item);
  },
  { immediate: true }
);
</script>
