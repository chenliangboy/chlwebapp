<template>
  <main
    ref="appShell"
    class="app-shell"
    :class="{
      'is-left-collapsed': !isLeftVisible,
      'is-right-collapsed': !isRightVisible,
      'is-resizing-right-panel': isResizingRightPanel
    }"
    aria-label="浮动图片气泡墙"
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

    <DetailPanel
      :visible="isRightVisible"
      :is-resizing="isResizingRightPanel"
      @hide="setRightPanelVisible(false)"
      @show="setRightPanelVisible(true)"
      @edit-bubble="openBubbleEditor"
      @start-resize="startRightPanelResize"
    />
  </main>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import AppSidebar from '@/components/layout/AppSidebar.vue';
import DetailPanel from '@/components/detail/DetailPanel.vue';
import { useBubblesStore } from '@/stores/bubbles';
import type { BubbleItem } from '@/types/bubble';

const router = useRouter();
const bubblesStore = useBubblesStore();
const appShell = ref<HTMLElement | null>(null);
const isLeftVisible = ref(true);
const isRightVisible = ref(false);
const rightPanelWidth = ref(340);
const isResizingRightPanel = ref(false);
const resizingPointerId = ref<number | null>(null);
const chlLogo = `${import.meta.env.BASE_URL}images/chl.png`;

const rightPanelWidthLimits = computed(() => {
  const parentWidth = appShell.value?.getBoundingClientRect().width || window.innerWidth;
  return {
    min: Math.min(300, parentWidth * 0.5),
    max: Math.max(300, parentWidth * 0.5)
  };
});

function clampValue(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function setRightPanelWidth(width: number) {
  const { min, max } = rightPanelWidthLimits.value;
  rightPanelWidth.value = clampValue(width, min, max);
  appShell.value?.style.setProperty('--right-width', `${Math.round(rightPanelWidth.value)}px`);
}

function resizeRightPanelFromClientX(clientX: number) {
  const rect = appShell.value?.getBoundingClientRect();
  if (!rect) return;
  setRightPanelWidth(rect.right - clientX);
}

function setLeftSidebarVisible(isVisible: boolean) {
  isLeftVisible.value = isVisible;
}

function setRightPanelVisible(isVisible: boolean) {
  isRightVisible.value = isVisible;
  if (isVisible) setRightPanelWidth(rightPanelWidth.value);
}

function startRightPanelResize(event: PointerEvent) {
  if (!isRightVisible.value) return;
  isResizingRightPanel.value = true;
  resizingPointerId.value = event.pointerId;
  resizeRightPanelFromClientX(event.clientX);
}

function moveRightPanelResize(event: PointerEvent) {
  if (!isResizingRightPanel.value || event.pointerId !== resizingPointerId.value) return;
  resizeRightPanelFromClientX(event.clientX);
}

function stopRightPanelResize(event: PointerEvent) {
  if (!isResizingRightPanel.value || event.pointerId !== resizingPointerId.value) return;
  isResizingRightPanel.value = false;
  resizingPointerId.value = null;
}

function resizeWithKeyboard(event: KeyboardEvent) {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  event.preventDefault();
  const step = event.shiftKey ? 40 : 16;
  setRightPanelWidth(rightPanelWidth.value + (event.key === 'ArrowLeft' ? step : -step));
}

async function openBubbleEditor(item: BubbleItem) {
  bubblesStore.selectBubble(item.id);
  await router.push({ name: 'settings', query: { edit: item.id } });
}

function handleWindowResize() {
  setRightPanelWidth(rightPanelWidth.value);
}

onMounted(() => {
  setRightPanelWidth(rightPanelWidth.value);
  window.addEventListener('pointermove', moveRightPanelResize);
  window.addEventListener('pointerup', stopRightPanelResize);
  window.addEventListener('pointercancel', stopRightPanelResize);
  window.addEventListener('resize', handleWindowResize);
  window.addEventListener('keydown', resizeWithKeyboard);
});

watch(
  () => bubblesStore.selectedBubbleId,
  (id) => {
    if (id) setRightPanelVisible(true);
  }
);

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', moveRightPanelResize);
  window.removeEventListener('pointerup', stopRightPanelResize);
  window.removeEventListener('pointercancel', stopRightPanelResize);
  window.removeEventListener('resize', handleWindowResize);
  window.removeEventListener('keydown', resizeWithKeyboard);
});
</script>
