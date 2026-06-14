<template>
  <section class="view-panel is-active module-view" aria-label="AI 智能体">
    <ModuleCatalog
      title="AI 智能体"
      :items="agents"
      :market-items="marketAgents"
      mine-label="我的智能体"
      market-label="智能体市场"
      search-placeholder="搜索智能体"
      @open="activeItem = $event"
    />
    <BubbleContentModal :item="activeItem" @close="activeItem = null" @edit="editBubble" />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import BubbleContentModal from '@/components/workspace/BubbleContentModal.vue';
import ModuleCatalog from '@/components/workspace/ModuleCatalog.vue';
import { useBubblesStore } from '@/stores/bubbles';
import type { BubbleItem } from '@/types/bubble';

const router = useRouter();
const bubblesStore = useBubblesStore();
const { items } = storeToRefs(bubblesStore);
const activeItem = ref<BubbleItem | null>(null);

const agents = computed(() => items.value.filter((item) => item.category === 'agent' || item.category === 'ai-chat'));
const marketAgents: BubbleItem[] = [
  {
    id: 'market-translate-agent',
    title: '翻译智能体',
    subtitle: '多语言文本转换',
    category: 'agent',
    tags: ['智能体', '翻译', '文本'],
    color: '#8b5cf6',
    pale: '#ede9fe',
    type: 'book',
    action: {
      kind: 'open-panel',
      panel: 'agent-tool',
      payload: {
        endpoint: '/api/agents/translate',
        method: 'POST',
        fields: [
          { name: 'text', label: '文本', type: 'textarea', placeholder: '输入需要翻译的内容' },
          { name: 'language', label: '目标语言', type: 'select', options: ['中文', '英文', '日文'] }
        ]
      }
    }
  },
  {
    id: 'market-coding-agent',
    title: '代码助手',
    subtitle: '解释、重构和检查代码',
    category: 'ai-chat',
    tags: ['AI', '代码', '聊天'],
    color: '#06b6d4',
    pale: '#cffafe',
    type: 'note',
    action: { kind: 'open-panel', panel: 'ai-chat', payload: { provider: 'Workspace AI', model: 'code-agent' } }
  }
];

async function editBubble(item: BubbleItem) {
  activeItem.value = null;
  bubblesStore.selectBubble(item.id);
  await router.push({ name: 'settings', query: { edit: item.id } });
}
</script>
