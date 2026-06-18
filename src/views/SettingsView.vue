<template>
  <section class="view-panel settings-view app-settings-view is-active" aria-label="应用设置">
    <header class="settings-header">
      <div>
        <p>设置</p>
        <h1>应用偏好</h1>
      </div>
    </header>

    <div class="settings-section">
      <div class="settings-section-heading">
        <div>
          <h2>外观</h2>
          <p>选择白天或暗黑主题。</p>
        </div>
        <span class="settings-current-value">{{ themeStore.isDark ? '暗黑模式' : '白天模式' }}</span>
      </div>

      <div class="settings-option-grid" role="radiogroup" aria-label="主题模式">
        <button
          v-for="option in themeOptions"
          :key="option.value"
          class="settings-choice"
          :class="{ 'is-selected': themeStore.theme === option.value }"
          type="button"
          role="radio"
          :aria-checked="themeStore.theme === option.value"
          @click="themeStore.setTheme(option.value)"
        >
          <span class="settings-choice-icon" aria-hidden="true">
            <svg v-if="option.value === 'dark'" viewBox="0 0 24 24">
              <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.5 6.5 0 0 0 9.8 9.8Z"></path>
            </svg>
            <svg v-else viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="4"></circle>
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"></path>
            </svg>
          </span>
          <span>
            <strong>{{ option.label }}</strong>
            <small>{{ option.description }}</small>
          </span>
        </button>
      </div>
    </div>

    <div class="settings-section">
      <div class="settings-section-heading">
        <div>
          <h2>主题色</h2>
          <p>切换按钮、选中态和高亮反馈的主色。</p>
        </div>
        <span class="settings-current-value">{{ currentAccentLabel }}</span>
      </div>

      <div class="theme-preset-grid" role="radiogroup" aria-label="主题色">
        <button
          v-for="option in accentOptions"
          :key="option.value"
          class="theme-preset-choice"
          :class="{ 'is-selected': preferencesStore.accentTheme === option.value }"
          :style="{ '--preset-accent': option.color, '--preset-soft': option.soft }"
          type="button"
          role="radio"
          :aria-checked="preferencesStore.accentTheme === option.value"
          @click="preferencesStore.setAccentTheme(option.value)"
        >
          <span class="theme-preset-swatch" aria-hidden="true">
            <span></span>
          </span>
          <span>
            <strong>{{ option.label }}</strong>
            <small>{{ option.description }}</small>
          </span>
        </button>
      </div>
    </div>

    <div class="settings-section">
      <div class="settings-section-heading">
        <div>
          <h2>背景图片</h2>
          <p>给工作台更换不同氛围的背景风格。</p>
        </div>
        <span class="settings-current-value">{{ currentBackgroundLabel }}</span>
      </div>

      <div class="background-preset-grid" role="radiogroup" aria-label="背景图片">
        <button
          v-for="option in backgroundOptions"
          :key="option.value"
          class="background-preset-choice"
          :class="{ 'is-selected': preferencesStore.backgroundPreset === option.value }"
          :style="{ '--preview-background': option.preview, '--preview-background-size': option.size || 'cover' }"
          type="button"
          role="radio"
          :aria-checked="preferencesStore.backgroundPreset === option.value"
          @click="preferencesStore.setBackgroundPreset(option.value)"
        >
          <span class="background-preset-preview" aria-hidden="true"></span>
          <span class="background-preset-copy">
            <strong>{{ option.label }}</strong>
            <small>{{ option.description }}</small>
          </span>
        </button>
      </div>
    </div>

    <div class="settings-section">
      <div class="settings-section-heading">
        <div>
          <h2>工具栏位置</h2>
          <p>把主工具栏放在屏幕任意一侧。</p>
        </div>
        <span class="settings-current-value">{{ currentToolbarLabel }}</span>
      </div>

      <div class="toolbar-position-grid" role="radiogroup" aria-label="工具栏位置">
        <button
          v-for="option in toolbarOptions"
          :key="option.value"
          class="toolbar-position-choice"
          :class="{ 'is-selected': preferencesStore.toolbarPosition === option.value }"
          type="button"
          role="radio"
          :aria-checked="preferencesStore.toolbarPosition === option.value"
          @click="preferencesStore.setToolbarPosition(option.value)"
        >
          <span class="toolbar-position-preview" :class="`is-${option.value}`" aria-hidden="true">
            <span></span>
          </span>
          <strong>{{ option.label }}</strong>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import auroraBackground from '@/assets/backgrounds/aurora.svg';
import cartoonBackground from '@/assets/backgrounds/cartoon.svg';
import coastBackground from '@/assets/backgrounds/coast.svg';
import landscapeBackground from '@/assets/backgrounds/landscape.svg';
import sakuraBackground from '@/assets/backgrounds/sakura.svg';
import { usePreferencesStore, type AccentTheme, type BackgroundPreset, type ToolbarPosition } from '@/stores/preferences';
import { useThemeStore, type AppTheme } from '@/stores/theme';

const themeStore = useThemeStore();
const preferencesStore = usePreferencesStore();

const themeOptions: Array<{ value: AppTheme; label: string; description: string }> = [
  { value: 'dark', label: '暗黑模式', description: '适合沉浸式气泡工作台' },
  { value: 'light', label: '白天模式', description: '适合明亮环境下使用' }
];

const accentOptions: Array<{ value: AccentTheme; label: string; description: string; color: string; soft: string }> = [
  { value: 'sky', label: '晴空蓝', description: '清爽、科技感', color: '#60a5fa', soft: '#dbeafe' },
  { value: 'mint', label: '薄荷绿', description: '轻盈、自然感', color: '#34d399', soft: '#d1fae5' },
  { value: 'rose', label: '蔷薇粉', description: '温柔、卡片感', color: '#fb7185', soft: '#ffe4e6' },
  { value: 'sunset', label: '落日橙', description: '温暖、有活力', color: '#fb923c', soft: '#ffedd5' },
  { value: 'violet', label: '星云紫', description: '梦幻、AI 感', color: '#a78bfa', soft: '#ede9fe' },
  { value: 'forest', label: '森林青', description: '安静、专注感', color: '#2dd4bf', soft: '#ccfbf1' }
];

const backgroundOptions: Array<{ value: BackgroundPreset; label: string; description: string; preview: string; size?: string }> = [
  {
    value: 'midnight',
    label: '深夜网格',
    description: '默认深色工作台',
    preview: [
      'radial-gradient(circle at 18% 16%, rgba(var(--app-accent-rgb), 0.3), transparent 34%)',
      'radial-gradient(circle at 78% 76%, rgba(var(--app-accent-rgb), 0.18), transparent 32%)',
      'linear-gradient(rgba(var(--app-accent-rgb), 0.16) 1px, transparent 1px)',
      'linear-gradient(90deg, rgba(var(--app-accent-rgb), 0.16) 1px, transparent 1px)',
      '#090c10'
    ].join(', '),
    size: 'auto, auto, 18px 18px, 18px 18px, auto'
  },
  {
    value: 'cartoon',
    label: '卡通云朵',
    description: '柔和、轻快',
    preview: `linear-gradient(90deg, rgba(2, 6, 23, 0.14), rgba(2, 6, 23, 0.02)), url("${cartoonBackground}")`
  },
  {
    value: 'landscape',
    label: '山野美景',
    description: '自然、开阔',
    preview: `linear-gradient(90deg, rgba(2, 6, 23, 0.16), rgba(2, 6, 23, 0.03)), url("${landscapeBackground}")`
  },
  {
    value: 'coast',
    label: '海岸晴光',
    description: '明亮、通透',
    preview: `linear-gradient(90deg, rgba(2, 6, 23, 0.14), rgba(2, 6, 23, 0.02)), url("${coastBackground}")`
  },
  {
    value: 'sakura',
    label: '樱花街景',
    description: '粉色、治愈',
    preview: `linear-gradient(90deg, rgba(2, 6, 23, 0.16), rgba(2, 6, 23, 0.02)), url("${sakuraBackground}")`
  },
  {
    value: 'aurora',
    label: '极光夜色',
    description: '梦幻、沉浸',
    preview: `linear-gradient(90deg, rgba(2, 6, 23, 0.12), rgba(2, 6, 23, 0.02)), url("${auroraBackground}")`
  }
];

const toolbarOptions: Array<{ value: ToolbarPosition; label: string }> = [
  { value: 'left', label: '最左侧' },
  { value: 'top', label: '上侧' },
  { value: 'bottom', label: '下侧' },
  { value: 'right', label: '最右侧' }
];

const currentToolbarLabel = computed(() => {
  return toolbarOptions.find((option) => option.value === preferencesStore.toolbarPosition)?.label || '最左侧';
});

const currentAccentLabel = computed(() => {
  return accentOptions.find((option) => option.value === preferencesStore.accentTheme)?.label || '晴空蓝';
});

const currentBackgroundLabel = computed(() => {
  return backgroundOptions.find((option) => option.value === preferencesStore.backgroundPreset)?.label || '深夜网格';
});
</script>
