const defaultActions = ['chat', 'addFriend', 'more'];

export const profileDetails = {
  'morning-light': {
    name: '晨光',
    intro: '清晨的灵感节点',
    description: '记录每天最早出现的想法，适合放置轻量备忘、计划和新的开始。',
    tags: ['灵感', '日程', '清晨'],
    actions: defaultActions
  },
  valley: {
    name: '山谷',
    intro: '安静的资料入口',
    description: '适合沉淀长期资料、链接和需要慢慢阅读的内容。',
    tags: ['资料', '阅读', '收藏'],
    actions: defaultActions
  },
  garden: {
    name: '花园',
    intro: '轻松的兴趣空间',
    description: '用于整理照片、作品、生活片段和让人放松的小记录。',
    tags: ['生活', '图片', '兴趣'],
    actions: defaultActions
  },
  sea: {
    name: '海面',
    intro: '开放的问题池',
    description: '可以承载待探索的问题、开放想法和需要进一步讨论的主题。',
    tags: ['探索', '问题', '讨论'],
    actions: defaultActions
  },
  chl: {
    name: 'chl',
    intro: '项目作者',
    description: '一个专注前端、AI 应用和交互体验的小型个人节点。',
    tags: ['前端', 'AI', '创作'],
    actions: defaultActions
  },
  xiaoran: {
    name: 'xiaoran',
    intro: '影像与故事节点',
    description: '适合承载人物资料、图片记忆和后续对话互动。',
    tags: ['影像', '故事', '好友'],
    actions: defaultActions
  },
  deepseek: {
    name: 'deepseek',
    intro: 'AI 工具入口',
    description: '用于连接 AI 工具、模型能力和相关资料链接。',
    tags: ['AI', '工具', '模型'],
    actions: defaultActions
  },
  supabase: {
    name: 'supabase',
    intro: '后端服务入口',
    description: '适合放置数据库、认证、存储和后续应用服务相关内容。',
    tags: ['后端', '数据库', '服务'],
    actions: defaultActions
  },
  xuanxuan: {
    name: 'xuanxuan',
    intro: '生活影像节点',
    description: '一个偏温暖、个人化的图片节点，可以继续扩展详情与聊天。',
    tags: ['照片', '生活', '互动'],
    actions: defaultActions
  }
};

export function getProfileDetail(item) {
  const detail = profileDetails[item.id] || {};

  return {
    id: item.id,
    name: item.title || item.label || detail.name,
    intro: detail.intro || '暂无简介',
    description: detail.description || '这个气泡还没有补充详细说明。',
    tags: detail.tags || [],
    actions: detail.actions || defaultActions,
    logo: item.image || detail.logo,
    color: item.color,
    pale: item.pale,
    type: item.type
  };
}
