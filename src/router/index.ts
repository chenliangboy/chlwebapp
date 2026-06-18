import { createRouter, createWebHashHistory } from 'vue-router';
import AgentsView from '@/views/AgentsView.vue';
import CustomizeView from '@/views/CustomizeView.vue';
import FriendsView from '@/views/FriendsView.vue';
import GamesView from '@/views/GamesView.vue';
import SettingsView from '@/views/SettingsView.vue';
import WorkspaceView from '@/views/WorkspaceView.vue';

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
      meta: { label: 'AI 智能体' }
    },
    {
      path: '/customize',
      name: 'customize',
      component: CustomizeView,
      meta: { label: '自定义' }
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
      meta: { label: '设置' }
    }
  ]
});
