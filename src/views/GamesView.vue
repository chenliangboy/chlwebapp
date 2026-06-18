<template>
  <section class="view-panel is-active module-view" aria-label="游戏">
    <ModuleCatalog
      title="游戏"
      :items="games"
      :market-items="marketGames"
      mine-label="我的游戏"
      market-label="游戏市场"
      search-placeholder="搜索游戏"
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

const games = computed(() => items.value.filter((item) => item.category === 'game'));
const marketGames: BubbleItem[] = [
  {
    id: 'market-snake',
    title: 'Snake',
    subtitle: '经典街机',
    category: 'game',
    tags: ['游戏', '街机'],
    color: '#f97316',
    pale: '#ffedd5',
    type: 'star',
    action: { kind: 'open-panel', panel: 'game', url: 'https://playsnake.org/', target: 'workspace' }
  },
  {
    id: 'market-chess',
    title: 'Chess',
    subtitle: '策略对弈',
    category: 'game',
    tags: ['游戏', '策略'],
    color: '#eab308',
    pale: '#fef9c3',
    type: 'book',
    action: { kind: 'open-panel', panel: 'game', url: 'https://lichess.org/', target: 'workspace' }
  }
];

async function editBubble(item: BubbleItem) {
  activeItem.value = null;
  bubblesStore.selectBubble(item.id);
  await router.push({ name: 'customize', query: { edit: item.id } });
}
</script>
