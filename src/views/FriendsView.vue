<template>
  <section class="view-panel is-active module-view" aria-label="好友">
    <header class="module-toolbar">
      <div class="module-tabs" role="tablist" aria-label="好友分类">
        <button
          v-for="tab in friendTabs"
          :key="tab.id"
          type="button"
          :class="{ 'is-active': activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>
      <label class="module-search">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="7"></circle>
          <path d="m16.5 16.5 4 4"></path>
        </svg>
        <input v-model.trim="query" type="search" placeholder="搜索好友" />
      </label>
      <button class="module-add-button" type="button" aria-label="新加好友" title="新加好友" @click="addFriend">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 5v14M5 12h14"></path>
        </svg>
      </button>
    </header>

    <div class="friend-card-grid" aria-label="好友列表">
      <button v-for="friend in filteredFriends" :key="friend.id" class="friend-card" type="button" @click="openFriend(friend)">
        <div class="module-avatar">
          <img :src="imageFor(friend.title, friend.color, friend.pale, friend.image)" :alt="friend.title" draggable="false" />
        </div>
        <strong>{{ friend.title }}</strong>
        <span>{{ friend.subtitle || categoryLabel(friend) }}</span>
      </button>
    </div>

    <BubbleContentModal :item="activeFriend" initial-panel="detail" @close="activeFriend = null" @edit="editBubble" />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import BubbleContentModal from '@/components/workspace/BubbleContentModal.vue';
import { imageFor } from '@/core/artwork';
import { getBubbleTypeDefinition } from '@/data/bubbleTypes';
import { useBubblesStore } from '@/stores/bubbles';
import type { BubbleItem } from '@/types/bubble';

const router = useRouter();
const bubblesStore = useBubblesStore();
const { items } = storeToRefs(bubblesStore);
const activeTab = ref('all');
const query = ref('');
const activeFriend = ref<BubbleItem | null>(null);

const friendTabs = [
  { id: 'all', label: '全部' },
  { id: 'online', label: '在线' },
  { id: 'recent', label: '最近' }
];

const friends = computed(() => items.value.filter((item) => item.category === 'friend'));
const filteredFriends = computed(() => {
  const value = query.value.toLocaleLowerCase();
  return friends.value.filter((item) => {
    if (activeTab.value === 'online' && item.meta?.online !== true) return false;
    if (activeTab.value === 'recent' && Number(item.meta?.unreadCount || 0) <= 0) return false;
    if (!value) return true;
    return [item.title, item.subtitle, ...(item.tags || [])].filter(Boolean).join(' ').toLocaleLowerCase().includes(value);
  });
});

function categoryLabel(item: BubbleItem) {
  return getBubbleTypeDefinition(item.category).label;
}

function openFriend(item: BubbleItem) {
  activeFriend.value = item;
}

function addFriend() {
  const index = friends.value.length + 1;
  const item = bubblesStore.addBubble({
    title: `新好友 ${index}`,
    subtitle: '新的好友',
    category: 'friend',
    tags: ['好友'],
    color: '#22c55e',
    pale: '#dcfce7',
    type: 'note',
    action: { kind: 'open-panel', panel: 'chat' },
    meta: { online: false, unreadCount: 0 }
  });
  activeFriend.value = item;
}

async function editBubble(item: BubbleItem) {
  activeFriend.value = null;
  bubblesStore.selectBubble(item.id);
  await router.push({ name: 'customize', query: { edit: item.id } });
}
</script>
