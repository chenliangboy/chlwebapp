<template>
  <aside class="sidebar-left" aria-label="主菜单">
    <header class="sidebar-brand">
      <button class="brand-button" type="button" aria-label="隐藏左侧菜单" title="隐藏左侧菜单" @click="$emit('hide')">
        <img :src="chlLogo" alt="CHL" draggable="false" />
      </button>
      <div class="brand-copy">
        <strong>CHL</strong>
        <span>Bubble Workspace</span>
      </div>
    </header>
    <nav class="app-menu" aria-label="页面菜单">
      <RouterLink class="menu-item" active-class="is-active" :to="{ name: 'workspace' }">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="4" width="7" height="7" rx="1.5"></rect>
          <rect x="14" y="4" width="7" height="7" rx="1.5"></rect>
          <rect x="3" y="15" width="7" height="5" rx="1.5"></rect>
          <rect x="14" y="15" width="7" height="5" rx="1.5"></rect>
        </svg>
        <span>工作台</span>
      </RouterLink>
      <RouterLink class="menu-item" active-class="is-active" :to="{ name: 'friends' }">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
        <span>好友</span>
      </RouterLink>
      <RouterLink class="menu-item" active-class="is-active" :to="{ name: 'games' }">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 12h4"></path>
          <path d="M8 10v4"></path>
          <path d="M15 13h.01"></path>
          <path d="M18 11h.01"></path>
          <rect x="3" y="7" width="18" height="10" rx="4"></rect>
        </svg>
        <span>游戏</span>
      </RouterLink>
      <RouterLink class="menu-item" active-class="is-active" :to="{ name: 'agents' }">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="5" y="7" width="14" height="12" rx="3"></rect>
          <path d="M12 3v4"></path>
          <path d="M9 13h.01M15 13h.01"></path>
          <path d="M9 17h6"></path>
        </svg>
        <span>AI智能体</span>
      </RouterLink>
      <RouterLink class="menu-item" active-class="is-active" :to="{ name: 'settings' }">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3v3M12 18v3M4.6 7.5l2.6 1.5M16.8 15l2.6 1.5M4.6 16.5 7.2 15M16.8 9l2.6-1.5"></path>
          <circle cx="12" cy="12" r="4"></circle>
        </svg>
        <span>设置</span>
      </RouterLink>
    </nav>

    <button class="theme-toggle" type="button" :aria-label="themeLabel" :title="themeLabel" @click="themeStore.toggleTheme()">
      <svg v-if="themeStore.isDark" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="4"></circle>
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"></path>
      </svg>
      <svg v-else viewBox="0 0 24 24" aria-hidden="true">
        <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.5 6.5 0 0 0 9.8 9.8Z"></path>
      </svg>
      <span>{{ themeStore.isDark ? '白天主题' : '暗黑主题' }}</span>
    </button>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useThemeStore } from '@/stores/theme';

defineProps<{
  collapsed: boolean;
}>();

defineEmits<{
  hide: [];
}>();

const themeStore = useThemeStore();
const themeLabel = computed(() => themeStore.isDark ? '切换到白天主题' : '切换到暗黑主题');
const chlLogo = `${import.meta.env.BASE_URL}images/chl.png`;
</script>
