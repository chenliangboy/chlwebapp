<template>
  <main
    ref="appShell"
    class="app-shell is-right-collapsed"
    :class="`is-toolbar-${preferencesStore.toolbarPosition}`"
    aria-label="浮动气泡工作台"
  >
    <AppSidebar />

    <section class="workspace-panel" aria-label="工作区域">
      <router-view @edit-bubble="openBubbleEditor" />
    </section>
  </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import AppSidebar from '@/components/layout/AppSidebar.vue';
import { useBubblesStore } from '@/stores/bubbles';
import { usePreferencesStore } from '@/stores/preferences';
import { useThemeStore } from '@/stores/theme';
import type { BubbleItem } from '@/types/bubble';

const router = useRouter();
const bubblesStore = useBubblesStore();
const preferencesStore = usePreferencesStore();
useThemeStore();

async function openBubbleEditor(item: BubbleItem) {
  bubblesStore.selectBubble(item.id);
  await router.push({ name: 'customize', query: { edit: item.id } });
}
</script>
