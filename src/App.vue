<template>
  <main
    ref="appShell"
    class="app-shell is-right-collapsed"
    :class="{ 'is-left-collapsed': !isLeftVisible }"
    aria-label="浮动气泡工作台"
  >
    <AppSidebar :collapsed="!isLeftVisible" @hide="setLeftSidebarVisible(false)" />

    <button
      class="sidebar-reveal"
      type="button"
      aria-label="显示左侧菜单"
      title="显示左侧菜单"
      @click="setLeftSidebarVisible(true)"
    >
      <img :src="chlLogo" alt="" draggable="false" />
    </button>

    <section class="workspace-panel" aria-label="工作区域">
      <router-view @edit-bubble="openBubbleEditor" />
    </section>
  </main>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import AppSidebar from '@/components/layout/AppSidebar.vue';
import { useBubblesStore } from '@/stores/bubbles';
import { useThemeStore } from '@/stores/theme';
import type { BubbleItem } from '@/types/bubble';

const router = useRouter();
const bubblesStore = useBubblesStore();
useThemeStore();
const appShell = ref<HTMLElement | null>(null);
const isLeftVisible = ref(true);
const chlLogo = `${import.meta.env.BASE_URL}images/chl.png`;
const autoCollapseWidth = 900;

function setLeftSidebarVisible(isVisible: boolean) {
  isLeftVisible.value = isVisible;
}

async function openBubbleEditor(item: BubbleItem) {
  bubblesStore.selectBubble(item.id);
  await router.push({ name: 'settings', query: { edit: item.id } });
}

function syncSidebarForViewport() {
  if (window.innerWidth <= autoCollapseWidth) {
    isLeftVisible.value = false;
  }
}

onMounted(() => {
  syncSidebarForViewport();
  window.addEventListener('resize', syncSidebarForViewport);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', syncSidebarForViewport);
});
</script>
