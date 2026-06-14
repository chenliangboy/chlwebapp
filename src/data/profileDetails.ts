import { getBubbleTypeDefinition } from '@/data/bubbleTypes';
import type { BubbleItem, ProfileDetail } from '@/types/bubble';

const defaultActions = ['open', 'edit'];

const profileDetails: Record<string, Omit<ProfileDetail, 'id'>> = {
  chl: {
    name: 'CHL',
    intro: '工作台主人',
    description: '一个专注前端、AI 应用和交互体验的个人节点，可以继续扩展为真实联系人或个人主页。',
    tags: ['前端', 'AI', '创作'],
    actions: defaultActions
  },
  xiaoran: {
    name: '小苒',
    intro: '影像与故事节点',
    description: '适合承载人物资料、图片记忆和后续对话互动。',
    tags: ['影像', '故事', '好友'],
    actions: defaultActions
  },
  xuanxuan: {
    name: '萱萱',
    intro: '生活影像节点',
    description: '偏温暖、个人化的图片节点，可以继续扩展详情与聊天。',
    tags: ['照片', '生活', '互动'],
    actions: defaultActions
  }
};

export function getProfileDetail(item: BubbleItem): ProfileDetail {
  const detail = profileDetails[item.id] || {};
  const typeDefinition = getBubbleTypeDefinition(item.category);

  return {
    id: item.id,
    name: item.title || item.label || item.name || detail.name || '未命名气泡',
    intro: item.subtitle || detail.intro || typeDefinition.label,
    description: detail.description || String(item.meta?.description || '') || `这是一个${typeDefinition.label}气泡，可以通过 action 配置打开不同内容。`,
    tags: item.tags?.length ? item.tags : detail.tags || [typeDefinition.label],
    actions: detail.actions || defaultActions,
    logo: item.image || detail.logo,
    color: item.color,
    pale: item.pale,
    type: item.type
  };
}
