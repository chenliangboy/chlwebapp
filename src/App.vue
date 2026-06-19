<template>
  <div class="app-window">
    <header class="window-titlebar" aria-label="应用标题栏">
      <div class="window-brand" aria-label="CHL floating image bubbles">
        <img :src="chlLogo" alt="CHL" draggable="false" />
        <span>CHL Bubble Workspace</span>
      </div>

      <div class="window-drag-region" aria-hidden="true"></div>

      <div class="window-actions">
        <UserMenu @login="openLoginModal" />

        <div class="window-controls" aria-label="窗口控制">
          <button class="window-control" type="button" aria-label="最小化" title="最小化" @click="sendWindowCommand('minimize')">
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M4 8h8"></path>
            </svg>
          </button>
          <button class="window-control" type="button" aria-label="最大化" title="最大化" @click="sendWindowCommand('maximize')">
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <rect x="4.5" y="4.5" width="7" height="7" rx="1"></rect>
            </svg>
          </button>
          <button class="window-control window-control-close" type="button" aria-label="关闭" title="关闭" @click="sendWindowCommand('close')">
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="m5 5 6 6M11 5l-6 6"></path>
            </svg>
          </button>
        </div>
      </div>
    </header>

    <main
      ref="appShell"
      class="app-shell is-right-collapsed"
      :class="`is-toolbar-${preferencesStore.toolbarPosition}`"
      aria-label="浮动气泡工作台"
    >
      <AppSidebar @open-settings="openSettingsDrawer" />

      <section class="workspace-panel" aria-label="工作区域">
        <router-view @edit-bubble="openBubbleEditor" />
      </section>
    </main>

    <div class="settings-drawer-root" :class="{ 'is-open': isSettingsOpen }" :aria-hidden="!isSettingsOpen">
      <div class="settings-drawer-overlay" @click="closeSettingsDrawer"></div>
      <aside class="settings-drawer" role="dialog" aria-modal="true" aria-label="应用设置" @keydown.esc="closeSettingsDrawer">
        <header class="settings-drawer-header">
          <div>
            <span>设置</span>
            <strong>应用偏好</strong>
          </div>
          <button class="settings-drawer-close" type="button" aria-label="关闭设置" title="关闭设置" @click="closeSettingsDrawer">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12"></path>
            </svg>
          </button>
        </header>
        <SettingsView />
      </aside>
    </div>

    <LoginModal :open="isLoginOpen" @close="closeLoginModal" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import LoginModal from '@/components/auth/LoginModal.vue';
import UserMenu from '@/components/auth/UserMenu.vue';
import AppSidebar from '@/components/layout/AppSidebar.vue';
import SettingsView from '@/views/SettingsView.vue';
import { useBubblesStore } from '@/stores/bubbles';
import { usePreferencesStore } from '@/stores/preferences';
import { useThemeStore } from '@/stores/theme';
import type { BubbleItem } from '@/types/bubble';

const router = useRouter();
const bubblesStore = useBubblesStore();
const preferencesStore = usePreferencesStore();
const chlLogo = `${import.meta.env.BASE_URL}images/chl.png`;
const isLoginOpen = ref(false);
const isSettingsOpen = ref(false);
useThemeStore();

type WindowCommand = 'minimize' | 'maximize' | 'close';

function openLoginModal() {
  isLoginOpen.value = true;
}

function closeLoginModal() {
  isLoginOpen.value = false;
}

function openSettingsDrawer() {
  isSettingsOpen.value = true;
}

function closeSettingsDrawer() {
  isSettingsOpen.value = false;
}

function sendWindowCommand(command: WindowCommand) {
  const electronWindow = window as Window & {
    electronWindow?: Partial<Record<WindowCommand, () => void>>;
    electronAPI?: { window?: Partial<Record<WindowCommand, () => void>> };
  };
  const handler = electronWindow.electronWindow?.[command] ?? electronWindow.electronAPI?.window?.[command];

  if (handler) {
    handler();
    return;
  }

  window.dispatchEvent(new CustomEvent('chl-window-command', { detail: { command } }));
}

async function openBubbleEditor(item: BubbleItem) {
  bubblesStore.selectBubble(item.id);
  await router.push({ name: 'customize', query: { edit: item.id } });
}
</script>
