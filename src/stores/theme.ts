import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export type AppTheme = 'dark' | 'light';

const STORAGE_KEY = 'floating-image-bubbles:theme';

function getInitialTheme(): AppTheme {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function applyTheme(theme: AppTheme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<AppTheme>(getInitialTheme());
  const isDark = computed(() => theme.value === 'dark');

  function setTheme(nextTheme: AppTheme) {
    theme.value = nextTheme;
    localStorage.setItem(STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
  }

  function toggleTheme() {
    setTheme(isDark.value ? 'light' : 'dark');
  }

  applyTheme(theme.value);

  return {
    theme,
    isDark,
    setTheme,
    toggleTheme
  };
});
