import type { BubbleItem } from '@/types/bubble';

const publicAsset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;

export const initialItems: BubbleItem[] = [
  { id: 'morning-light', title: '晨光', color: '#ffb86c', pale: '#ffe2a8', type: 'sun' },
  { id: 'valley', title: '山谷', color: '#58c4dd', pale: '#d8f5ff', type: 'mountain' },
  { id: 'garden', title: '花园', color: '#ff7aa2', pale: '#ffd4e2', type: 'flower' },
  { id: 'sea', title: '海面', color: '#4d96ff', pale: '#cbe3ff', type: 'wave' },
  { id: 'chl', title: 'chl', color: '#ffc107', pale: '#fff3cd', type: 'note', image: publicAsset('/images/chl.png') },
  { id: 'xiaoran', title: 'xiaoran', color: '#f8b500', pale: '#fffceb', type: 'film', image: publicAsset('/images/xiaoran.jpg') },
  { id: 'deepseek', title: 'deepseek', color: '#ffc107', pale: '#fff3cd', type: 'note', image: 'https://www.deepseek.com/favicon.ico' },
  { id: 'supabase', title: 'supabase', color: '#f8b500', pale: '#fffceb', type: 'film', image: 'https://supabase.com/dashboard/img/supabase-logo.svg' },
  { id: 'xuanxuan', title: 'xuanxuan', color: '#f8b500', pale: '#fffceb', type: 'film', image: publicAsset('/images/xuanxuan.jpg') }
];
