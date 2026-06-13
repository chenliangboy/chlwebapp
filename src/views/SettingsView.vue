<template>
  <section class="view-panel settings-view is-active" aria-label="气泡设置">
    <header class="settings-header">
      <div>
        <p>设置</p>
        <h1>气泡列表</h1>
      </div>
      <button class="primary-button" type="button" @click="openEditor()">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 5v14M5 12h14"></path>
        </svg>
        <span>新增</span>
      </button>
    </header>

    <div class="bubble-editor" :class="{ 'is-open': isEditorOpen }" :aria-hidden="!isEditorOpen">
      <form class="bubble-form" @submit.prevent="saveBubble">
        <input v-model="form.id" type="hidden" />
        <label>
          <span>标题</span>
          <input ref="titleInput" v-model.trim="form.title" name="title" type="text" required maxlength="28" placeholder="例如：产品资料" />
        </label>
        <label>
          <span>图片地址</span>
          <input v-model.trim="form.image" name="image" type="text" placeholder="/images/example.png 或 https://..." />
        </label>
        <div class="form-grid">
          <label>
            <span>主色</span>
            <input v-model="form.color" name="color" type="color" />
          </label>
          <label>
            <span>浅色</span>
            <input v-model="form.pale" name="pale" type="color" />
          </label>
          <label>
            <span>类型</span>
            <select v-model="form.type" name="type">
              <option v-for="type in bubbleTypes" :key="type" :value="type">{{ type }}</option>
            </select>
          </label>
        </div>
        <div class="form-actions">
          <button class="secondary-button" type="button" @click="closeEditor">取消</button>
          <button class="primary-button" type="submit">保存</button>
        </div>
      </form>
    </div>

    <div class="bubble-list" aria-label="所有气泡">
      <article v-for="item in items" :key="item.id" class="bubble-list-item" :data-id="item.id">
        <div class="list-avatar">
          <img :src="imageFor(item.title || item.label || '', item.color, item.pale, item.image)" :alt="item.title || item.label" draggable="false" />
        </div>
        <div class="list-content">
          <strong>{{ item.title || item.label }}</strong>
          <span>{{ item.type || 'spark' }}</span>
        </div>
        <div class="list-actions">
          <button class="icon-button" type="button" aria-label="编辑" title="编辑" @click="openEditor(item)">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9"></path><path d="m16.5 3.5 4 4L8 20H4v-4L16.5 3.5Z"></path></svg>
          </button>
          <button class="icon-button danger" type="button" aria-label="删除" title="删除" @click="deleteBubble(item.id)">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18"></path><path d="M8 6V4h8v2"></path><path d="M6 6l1 15h10l1-15"></path></svg>
          </button>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { nextTick, onMounted, reactive, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import { imageFor } from '@/core/artwork';
import { useBubblesStore } from '@/stores/bubbles';
import type { BubbleItem } from '@/types/bubble';

const bubblesStore = useBubblesStore();
const { items } = storeToRefs(bubblesStore);
const route = useRoute();
const router = useRouter();
const titleInput = ref<HTMLInputElement | null>(null);
const isEditorOpen = ref(false);
const bubbleTypes = ['spark', 'sun', 'mountain', 'flower', 'wave', 'note', 'film', 'star', 'book'];

const form = reactive({
  id: '',
  title: '',
  image: '',
  color: '#ffc107',
  pale: '#fff3cd',
  type: 'spark'
});

function resetForm() {
  form.id = '';
  form.title = '';
  form.image = '';
  form.color = '#ffc107';
  form.pale = '#fff3cd';
  form.type = 'spark';
}

function focusTitle() {
  nextTick(() => titleInput.value?.focus());
}

function openEditor(item: BubbleItem | null = null) {
  isEditorOpen.value = true;
  form.id = item?.id || '';
  form.title = item?.title || item?.label || '';
  form.image = item?.image || '';
  form.color = item?.color || '#ffc107';
  form.pale = item?.pale || '#fff3cd';
  form.type = item?.type || 'spark';
  focusTitle();
}

function closeEditor() {
  isEditorOpen.value = false;
  resetForm();
  if (route.query.edit) router.replace({ name: 'settings' });
}

function saveBubble() {
  if (!form.title.trim()) return;

  const id = form.id || bubblesStore.createId(form.title);
  const data: BubbleItem = {
    id,
    title: form.title,
    image: form.image,
    color: form.color,
    pale: form.pale,
    type: form.type
  };

  const item = form.id ? bubblesStore.updateBubble(form.id, data) : bubblesStore.addBubble(data);
  if (item) bubblesStore.selectBubble(item.id);
  closeEditor();
}

function deleteBubble(id: string) {
  bubblesStore.removeBubble(id);
  closeEditor();
}

function openEditorFromRoute() {
  const editId = typeof route.query.edit === 'string' ? route.query.edit : '';
  if (!editId) return;
  const item = items.value.find((entry) => entry.id === editId);
  if (item) openEditor(item);
}

watch(() => route.query.edit, openEditorFromRoute);

onMounted(openEditorFromRoute);
</script>
