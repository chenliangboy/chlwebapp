import type { BubbleItem } from '@/types/bubble';

const publicAsset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;

export const initialItems: BubbleItem[] = [
  {
    id: 'chl',
    title: 'CHL',
    subtitle: '工作台主人',
    category: 'friend',
    tags: ['好友', '聊天', '项目'],
    color: '#22c55e',
    pale: '#dcfce7',
    type: 'note',
    image: publicAsset('/images/chl.png'),
    action: {
      kind: 'open-panel',
      panel: 'chat',
      payload: {
        status: '在线',
        welcome: '这里可以继续扩展成真实好友聊天。'
      }
    },
    meta: {
      online: true,
      unreadCount: 2
    }
  },
  {
    id: 'xiaoran',
    title: '小苒',
    subtitle: '影像与故事',
    category: 'friend',
    tags: ['好友', '聊天', '影像'],
    color: '#16a34a',
    pale: '#bbf7d0',
    type: 'film',
    image: publicAsset('/images/xiaoran.jpg'),
    action: {
      kind: 'open-panel',
      panel: 'chat',
      payload: {
        status: '刚刚在线'
      }
    },
    meta: {
      online: true,
      unreadCount: 1
    }
  },
  {
    id: 'xuanxuan',
    title: '萱萱',
    subtitle: '生活影像节点',
    category: 'friend',
    tags: ['好友', '生活', '聊天'],
    color: '#14b8a6',
    pale: '#ccfbf1',
    type: 'film',
    image: publicAsset('/images/xuanxuan.jpg'),
    action: {
      kind: 'open-panel',
      panel: 'chat',
      payload: {
        status: '离线'
      }
    },
    meta: {
      online: false,
      unreadCount: 0
    }
  },
  {
    id: 'game-2048',
    title: '2048',
    subtitle: '休闲数字游戏',
    category: 'game',
    tags: ['游戏', '休闲', '数字'],
    color: '#f97316',
    pale: '#ffedd5',
    type: 'star',
    action: {
      kind: 'open-panel',
      panel: 'game',
      url: 'https://play2048.co/',
      target: 'workspace',
      payload: {
        note: '如果外部站点禁止内嵌，可以使用右上角按钮新窗口打开。'
      }
    },
    meta: {
      provider: 'play2048.co'
    }
  },
  {
    id: 'agent-summary',
    title: '总结助手',
    subtitle: '智能体工具',
    category: 'agent',
    tags: ['智能体', '工具', '总结'],
    color: '#8b5cf6',
    pale: '#ede9fe',
    type: 'book',
    action: {
      kind: 'open-panel',
      panel: 'agent-tool',
      payload: {
        endpoint: '/api/agents/summary',
        method: 'POST',
        fields: [
          { name: 'content', label: '内容', type: 'textarea', placeholder: '粘贴需要总结的内容' },
          { name: 'style', label: '风格', type: 'select', options: ['要点', '简洁', '行动项'] }
        ]
      }
    }
  },
  {
    id: 'deepseek',
    title: 'DeepSeek',
    subtitle: 'AI 聊天入口',
    category: 'ai-chat',
    tags: ['AI', '聊天', '模型'],
    color: '#06b6d4',
    pale: '#cffafe',
    type: 'note',
    image: 'https://www.deepseek.com/favicon.ico',
    action: {
      kind: 'open-panel',
      panel: 'ai-chat',
      payload: {
        provider: 'DeepSeek',
        model: 'deepseek-chat',
        systemPrompt: '你是工作台里的 AI 助手。'
      }
    }
  },
  {
    id: 'supabase',
    title: 'Supabase',
    subtitle: '数据库与后端服务',
    category: 'tool',
    tags: ['工具', '数据库', '后端'],
    color: '#22c55e',
    pale: '#dcfce7',
    type: 'film',
    image: 'https://supabase.com/dashboard/img/supabase-logo.svg',
    action: {
      kind: 'open-panel',
      panel: 'web',
      url: 'https://supabase.com/dashboard',
      target: 'workspace'
    },
    meta: {
      provider: 'Supabase'
    }
  },
  {
    id: 'morning-light',
    title: '晨光',
    subtitle: '灵感笔记',
    category: 'note',
    tags: ['灵感', '日程', '清晨'],
    color: '#ffb86c',
    pale: '#ffe2a8',
    type: 'sun'
  },
  {
    id: 'valley',
    title: '山谷',
    subtitle: '资料入口',
    category: 'note',
    tags: ['资料', '阅读', '收藏'],
    color: '#58c4dd',
    pale: '#d8f5ff',
    type: 'mountain'
  }
];
