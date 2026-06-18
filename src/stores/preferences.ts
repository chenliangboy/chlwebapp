import { defineStore } from 'pinia';
import { ref } from 'vue';

export type ToolbarPosition = 'left' | 'top' | 'bottom' | 'right';
export type AccentTheme = 'sky' | 'mint' | 'rose' | 'sunset' | 'violet' | 'forest';
export type BackgroundPreset = 'midnight' | 'cartoon' | 'landscape' | 'coast' | 'sakura' | 'aurora';

const TOOLBAR_POSITION_KEY = 'floating-image-bubbles:toolbar-position';
const ACCENT_THEME_KEY = 'floating-image-bubbles:accent-theme';
const BACKGROUND_PRESET_KEY = 'floating-image-bubbles:background-preset';
const toolbarPositions: ToolbarPosition[] = ['left', 'top', 'bottom', 'right'];
const accentThemes: AccentTheme[] = ['sky', 'mint', 'rose', 'sunset', 'violet', 'forest'];
const backgroundPresets: BackgroundPreset[] = ['midnight', 'cartoon', 'landscape', 'coast', 'sakura', 'aurora'];

function getStoredOption<T extends string>(key: string, options: readonly T[], fallback: T): T {
  const stored = localStorage.getItem(key);
  return options.includes(stored as T) ? stored as T : fallback;
}

function getInitialToolbarPosition(): ToolbarPosition {
  return getStoredOption(TOOLBAR_POSITION_KEY, toolbarPositions, 'left');
}

function getInitialAccentTheme(): AccentTheme {
  return getStoredOption(ACCENT_THEME_KEY, accentThemes, 'sky');
}

function getInitialBackgroundPreset(): BackgroundPreset {
  return getStoredOption(BACKGROUND_PRESET_KEY, backgroundPresets, 'midnight');
}

function applyVisualPreferences(accentTheme: AccentTheme, backgroundPreset: BackgroundPreset) {
  document.documentElement.dataset.accent = accentTheme;
  document.documentElement.dataset.background = backgroundPreset;
}

export const usePreferencesStore = defineStore('preferences', () => {
  const toolbarPosition = ref<ToolbarPosition>(getInitialToolbarPosition());
  const accentTheme = ref<AccentTheme>(getInitialAccentTheme());
  const backgroundPreset = ref<BackgroundPreset>(getInitialBackgroundPreset());

  function setToolbarPosition(nextPosition: ToolbarPosition) {
    toolbarPosition.value = nextPosition;
    localStorage.setItem(TOOLBAR_POSITION_KEY, nextPosition);
  }

  function setAccentTheme(nextTheme: AccentTheme) {
    accentTheme.value = nextTheme;
    localStorage.setItem(ACCENT_THEME_KEY, nextTheme);
    applyVisualPreferences(nextTheme, backgroundPreset.value);
  }

  function setBackgroundPreset(nextPreset: BackgroundPreset) {
    backgroundPreset.value = nextPreset;
    localStorage.setItem(BACKGROUND_PRESET_KEY, nextPreset);
    applyVisualPreferences(accentTheme.value, nextPreset);
  }

  applyVisualPreferences(accentTheme.value, backgroundPreset.value);

  return {
    toolbarPosition,
    accentTheme,
    backgroundPreset,
    setToolbarPosition,
    setAccentTheme,
    setBackgroundPreset
  };
});
