<template>
  <div class="user-menu">
    <button
      class="user-menu-button"
      type="button"
      :aria-label="authStore.user ? `当前用户：${authStore.displayName}` : '登录'"
      :title="authStore.user ? authStore.displayName : '登录'"
      @click="handlePrimaryClick"
    >
      <span class="user-avatar" aria-hidden="true">{{ avatarText }}</span>
      <span class="user-label">{{ authStore.user ? authStore.displayName : '登录' }}</span>
    </button>

    <button
      v-if="authStore.user"
      class="user-signout"
      type="button"
      aria-label="退出登录"
      title="退出登录"
      @click="authStore.signOut"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
        <path d="m16 17 5-5-5-5"></path>
        <path d="M21 12H9"></path>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';

const emit = defineEmits<{
  login: [];
}>();

const authStore = useAuthStore();
const avatarText = computed(() => authStore.user?.avatarInitials ?? 'CHL');

function handlePrimaryClick() {
  if (!authStore.user) {
    emit('login');
  }
}
</script>
