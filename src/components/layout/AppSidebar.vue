<template>
  <aside class="sidebar-left" aria-label="主菜单">
    <header class="sidebar-brand">
      <div class="brand-button" aria-label="CHL">
        <img :src="chlLogo" alt="CHL" draggable="false" />
      </div>
    </header>

    <nav class="app-menu" aria-label="页面菜单">
      <RouterLink class="menu-item" active-class="is-active" :to="{ name: 'workspace' }" aria-label="工作台" title="工作台">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="4" width="7" height="7" rx="1.5"></rect>
          <rect x="14" y="4" width="7" height="7" rx="1.5"></rect>
          <rect x="3" y="15" width="7" height="5" rx="1.5"></rect>
          <rect x="14" y="15" width="7" height="5" rx="1.5"></rect>
        </svg>
      </RouterLink>
      <RouterLink class="menu-item" active-class="is-active" :to="{ name: 'friends' }" aria-label="好友" title="好友">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      </RouterLink>
      <RouterLink class="menu-item" active-class="is-active" :to="{ name: 'games' }" aria-label="游戏" title="游戏">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 12h4"></path>
          <path d="M8 10v4"></path>
          <path d="M15 13h.01"></path>
          <path d="M18 11h.01"></path>
          <rect x="3" y="7" width="18" height="10" rx="4"></rect>
        </svg>
      </RouterLink>
      <RouterLink class="menu-item" active-class="is-active" :to="{ name: 'agents' }" aria-label="AI 智能体" title="AI 智能体">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="5" y="7" width="14" height="12" rx="3"></rect>
          <path d="M12 3v4"></path>
          <path d="M9 13h.01M15 13h.01"></path>
          <path d="M9 17h6"></path>
        </svg>
      </RouterLink>
      <RouterLink class="menu-item" active-class="is-active" :to="{ name: 'customize' }" aria-label="自定义" title="自定义">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3H5a2 2 0 0 0-2 2v7"></path>
          <path d="M21 12v7a2 2 0 0 1-2 2h-7"></path>
          <path d="m14 5 5 5"></path>
          <path d="M19 5 8 16l-4 1 1-4L16 2"></path>
        </svg>
      </RouterLink>
    </nav>

    <nav class="app-menu app-menu-secondary" aria-label="应用菜单">
      <button class="menu-item" type="button" aria-label="设置" title="设置" @click="emit('openSettings')">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3v3M12 18v3M4.6 7.5l2.6 1.5M16.8 15l2.6 1.5M4.6 16.5 7.2 15M16.8 9l2.6-1.5"></path>
          <circle cx="12" cy="12" r="4"></circle>
        </svg>
      </button>
    </nav>
  </aside>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  openSettings: [];
}>();

const chlLogo = `${import.meta.env.BASE_URL}images/chl.png`;
</script>
