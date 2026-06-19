<template>
  <Teleport to="body">
    <div v-if="open" class="auth-modal-root is-open" aria-live="polite">
      <div class="auth-modal-overlay" @click="close"></div>
      <section
        class="auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        @keydown.esc="close"
      >
        <header class="auth-modal-header">
          <div class="auth-modal-brand">
            <img :src="logoSrc" alt="CHL" draggable="false" />
            <div>
              <span>CHL Workspace</span>
              <strong id="auth-modal-title">登录工作台</strong>
            </div>
          </div>
          <button class="modal-close" type="button" aria-label="关闭登录" title="关闭" @click="close">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12"></path>
            </svg>
          </button>
        </header>

        <form class="auth-form" @submit.prevent="submit">
          <p class="auth-intro">登录后可以继续扩展云同步、AI 会话和个人偏好；现在也可以先用本地游客模式体验。</p>

          <label class="auth-field">
            <span>账号</span>
            <input ref="emailInput" v-model.trim="email" type="email" autocomplete="email" placeholder="name@example.com" />
          </label>

          <label class="auth-field">
            <span>密码</span>
            <input v-model="password" type="password" autocomplete="current-password" placeholder="输入密码" />
          </label>

          <label class="auth-remember">
            <input v-model="remember" type="checkbox" />
            <span>保持登录状态</span>
          </label>

          <p v-if="errorMessage" class="auth-error">{{ errorMessage }}</p>

          <div class="auth-actions">
            <button class="primary-button" type="submit">登录</button>
            <button class="secondary-button" type="button" @click="continueGuest">游客继续</button>
          </div>
        </form>
      </section>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const authStore = useAuthStore();
const logoSrc = `${import.meta.env.BASE_URL}images/chl.png`;
const email = ref('');
const password = ref('');
const remember = ref(true);
const errorMessage = ref('');
const emailInput = ref<HTMLInputElement | null>(null);

watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen) return;
    errorMessage.value = '';
    await nextTick();
    emailInput.value?.focus();
  }
);

function close() {
  emit('close');
}

function submit() {
  errorMessage.value = '';

  try {
    authStore.signIn(email.value, password.value, remember.value);
    close();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '登录失败，请稍后重试';
  }
}

function continueGuest() {
  authStore.continueAsGuest();
  close();
}
</script>
