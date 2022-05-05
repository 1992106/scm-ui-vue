<template>
  <div class="shortcut-bar">
    <div v-for="column in columns" :key="column?.field">
      <div>{{ column?.title }}</div>
      <a-checkbox-group v-model:value="column.field" :options="column?.options" />
    </div>
  </div>
</template>
<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Shortcut',
  props: {
    // 自定义字段
    columns: { type: Array, required: true, default: () => [] }
  },
  emits: ['shortcut'],
  setup(props, { emit }) {
    const handleShortcut = params => {
      emit('shortcut', params)
    }

    return {
      handleShortcut
    }
  }
})
</script>
