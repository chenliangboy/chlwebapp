<template>
  <aside class="sidebar-left" aria-label="主菜单">
    <header class="sidebar-brand">
      <button class="brand-button" type="button" aria-label="隐藏左侧菜单" title="隐藏左侧菜单" @click="$emit('hide')">
        <img :src="chlLogo" alt="CHL" draggable="false" />
      </button>
      <div class="brand-copy">
        <strong>CHL</strong>
        <span>Bubble Wall</span>
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
      <RouterLink class="menu-item" active-class="is-active" :to="{ name: 'settings' }">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3v3M12 18v3M4.6 7.5l2.6 1.5M16.8 15l2.6 1.5M4.6 16.5 7.2 15M16.8 9l2.6-1.5"></path>
          <circle cx="12" cy="12" r="4"></circle>
        </svg>
        <span>设置</span>
      </RouterLink>
    </nav>
  </aside>
</template>

<script setup lang="ts">
defineProps<{
  collapsed: boolean;
}>();

defineEmits<{
  hide: [];
}>();

const chlLogo = `${import.meta.env.BASE_URL}images/chl.png`;
</script>
