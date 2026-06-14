<template>
  <section class="workspace-tool-panel">
    <header class="tool-panel-header">
      <div>
        <span>智能体工具</span>
        <h2>{{ item.title }}</h2>
        <p>{{ endpoint }}</p>
      </div>
    </header>

    <form class="agent-tool-form" @submit.prevent="runTool">
      <label v-for="field in fields" :key="field.name">
        <span>{{ field.label }}</span>
        <textarea
          v-if="field.type === 'textarea'"
          v-model="formValues[field.name]"
          :placeholder="field.placeholder"
          rows="5"
        ></textarea>
        <select v-else-if="field.type === 'select'" v-model="formValues[field.name]">
          <option v-for="option in field.options" :key="option" :value="option">{{ option }}</option>
        </select>
        <input v-else v-model="formValues[field.name]" :placeholder="field.placeholder" type="text" />
      </label>
      <button class="primary-button" type="submit">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"></path><path d="m13 6 6 6-6 6"></path></svg>
        <span>运行</span>
      </button>
    </form>

    <div class="tool-result">
      <strong>调用预览</strong>
      <pre>{{ result }}</pre>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watchEffect } from 'vue';
import { resolveBubbleAction } from '@/workspace/actions';
import type { BubbleItem } from '@/types/bubble';

interface ToolField {
  name: string;
  label: string;
  type?: 'text' | 'textarea' | 'select';
  placeholder?: string;
  options?: string[];
}

const props = defineProps<{
  item: BubbleItem;
}>();

const action = computed(() => resolveBubbleAction(props.item));
const payload = computed(() => action.value.payload || {});
const endpoint = computed(() => String(payload.value.endpoint || '未配置接口地址'));
const fields = computed<ToolField[]>(() => (Array.isArray(payload.value.fields) ? payload.value.fields as ToolField[] : []));
const formValues = reactive<Record<string, string>>({});
const result = ref('填写参数后点击运行，这里会显示将要发送到接口的结构。');

watchEffect(() => {
  for (const field of fields.value) {
    if (!(field.name in formValues)) formValues[field.name] = field.options?.[0] || '';
  }
});

function runTool() {
  result.value = JSON.stringify({
    endpoint: endpoint.value,
    method: payload.value.method || 'POST',
    body: { ...formValues }
  }, null, 2);
}
</script>
