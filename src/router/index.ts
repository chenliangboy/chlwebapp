import { createRouter, createWebHashHistory } from 'vue-router';
import WorkspaceView from '@/views/WorkspaceView.vue';
import SettingsView from '@/views/SettingsView.vue';

export const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'workspace',
      component: WorkspaceView,
      meta: { label: '工作台' }
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
      meta: { label: '设置' }
    }
  ]
});
