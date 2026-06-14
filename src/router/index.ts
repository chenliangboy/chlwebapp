import { createRouter, createWebHashHistory } from 'vue-router';
import AgentsView from '@/views/AgentsView.vue';
import FriendsView from '@/views/FriendsView.vue';
import GamesView from '@/views/GamesView.vue';
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
      path: '/friends',
      name: 'friends',
      component: FriendsView,
      meta: { label: '好友' }
    },
    {
      path: '/games',
      name: 'games',
      component: GamesView,
      meta: { label: '游戏' }
    },
    {
      path: '/agents',
      name: 'agents',
      component: AgentsView,
      meta: { label: 'AI智能体' }
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
      meta: { label: '设置' }
    }
  ]
});
