import { getBubbleTypeDefinition } from '@/data/bubbleTypes';
import type { BubbleAction, BubbleItem, BubblePanelType } from '@/types/bubble';

export function resolveBubbleAction(item: BubbleItem): BubbleAction {
  if (item.action) return item.action;

  const definition = getBubbleTypeDefinition(item.category);
  return {
    kind: 'open-panel',
    panel: definition.defaultPanel,
    payload: {}
  };
}

export function resolveBubblePanel(item: BubbleItem): BubblePanelType {
  const action = resolveBubbleAction(item);
  if (action.kind === 'open-url' && action.target !== 'workspace') return 'detail';
  return action.panel || getBubbleTypeDefinition(item.category).defaultPanel;
}

export function openExternalAction(item: BubbleItem) {
  const action = resolveBubbleAction(item);
  if (action.kind !== 'open-url' || !action.url) return false;

  if (action.target === 'same-tab') {
    window.location.href = action.url;
    return true;
  }

  if (action.target === 'new-tab') {
    window.open(action.url, '_blank', 'noopener,noreferrer');
    return true;
  }

  return false;
}
