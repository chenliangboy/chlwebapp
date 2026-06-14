import type { BubbleCategory, BubblePanelType } from '@/types/bubble';

export interface BubbleTypeDefinition {
  id: BubbleCategory;
  label: string;
  defaultColor: string;
  defaultPale: string;
  defaultPanel: BubblePanelType;
  tone: string;
}

export const bubbleTypeDefinitions: Record<string, BubbleTypeDefinition> = {
  friend: {
    id: 'friend',
    label: '好友',
    defaultColor: '#22c55e',
    defaultPale: '#dcfce7',
    defaultPanel: 'chat',
    tone: 'green'
  },
  game: {
    id: 'game',
    label: '游戏',
    defaultColor: '#f97316',
    defaultPale: '#ffedd5',
    defaultPanel: 'game',
    tone: 'orange'
  },
  agent: {
    id: 'agent',
    label: '智能体',
    defaultColor: '#8b5cf6',
    defaultPale: '#ede9fe',
    defaultPanel: 'agent-tool',
    tone: 'violet'
  },
  'ai-chat': {
    id: 'ai-chat',
    label: 'AI 聊天',
    defaultColor: '#06b6d4',
    defaultPale: '#cffafe',
    defaultPanel: 'ai-chat',
    tone: 'cyan'
  },
  tool: {
    id: 'tool',
    label: '工具',
    defaultColor: '#eab308',
    defaultPale: '#fef9c3',
    defaultPanel: 'web',
    tone: 'amber'
  },
  note: {
    id: 'note',
    label: '笔记',
    defaultColor: '#94a3b8',
    defaultPale: '#e2e8f0',
    defaultPanel: 'detail',
    tone: 'slate'
  }
};

export function getBubbleTypeDefinition(category = 'note') {
  return bubbleTypeDefinitions[category] || bubbleTypeDefinitions.note;
}

export const categoryOptions = Object.values(bubbleTypeDefinitions);
