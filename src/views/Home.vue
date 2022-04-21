<template>
  <div>
    <a-button @click="handlePreview">打开预览</a-button>
    <Preview v-model:visible="visible" :current="current" :urls="urls"></Preview>
  </div>
</template>
<script>
import { ref } from 'vue'
import Preview from '@components/Preview/index.vue'
export default {
  components: { Preview },
  setup() {
    const visible = ref(false)
    const handlePreview = () => {
      visible.value = !visible.value
    }
    return {
      urls: [
        'https://gw.alipayobjects.com/zos/antfincdn/LlvErxo8H9/photo-1503185912284-5271ff81b9a8.webp',
        'https://gw.alipayobjects.com/zos/antfincdn/cV16ZqzMjW/photo-1473091540282-9b846e7965e3.webp',
        'https://gw.alipayobjects.com/zos/antfincdn/x43I27A55%26/photo-1438109491414-7198515b166b.webp'
      ],
      current: 2,
      visible,
      handlePreview
    }
  }
}
</script>
