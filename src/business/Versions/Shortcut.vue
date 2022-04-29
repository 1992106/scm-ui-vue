<template>
  <div class="shortcut-bar">更多搜索条件</div>
</template>
<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Shortcut',
  props: {
    shortcutProps: { type: Object, default: () => ({}) }
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
