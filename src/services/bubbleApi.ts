import http from './http';
import type { BubbleItem } from '@/types/bubble';

export const bubbleApi = {
  list() {
    return http.get<BubbleItem[]>('/bubbles');
  },
  create(data: BubbleItem) {
    return http.post<BubbleItem>('/bubbles', data);
  },
  update(id: string, data: Partial<BubbleItem>) {
    return http.put<BubbleItem>(`/bubbles/${id}`, data);
  },
  remove(id: string) {
    return http.delete<void>(`/bubbles/${id}`);
  }
};
