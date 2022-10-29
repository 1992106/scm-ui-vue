<template>
  <div style="display: none">
    <a-image-preview-group
      v-if="isPreview"
      :preview="{
        rootClassName: 'x-preview__root',
        current,
        visible: isPreview,
        onVisibleChange: handleVisibleChange
      }">
      <a-image v-for="src in urls" :key="src" :src="src" />
    </a-image-preview-group>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, PropType, ref, watchEffect } from 'vue'
import { Image, ImagePreviewGroup } from 'ant-design-vue'
export default defineComponent({
  name: 'XPreview',
  components: {
    'a-image': Image,
    'a-image-preview-group': ImagePreviewGroup
  },
  inheritAttrs: false,
  props: {
    visible: { type: Boolean as PropType<boolean>, default: false },
    current: { type: Number as PropType<number>, default: 0 },
    urls: { type: Array as PropType<string[]>, required: true }
  },
  emits: ['update:visible'],
  setup(props, { emit, expose }) {
    const isPreview = computed({
      get: () => props.visible,
      set: val => {
        emit('update:visible', val)
      }
    })

    const current = ref(0)
    watchEffect(() => {
      current.value = props.current
    })

    const urls = ref([])
    watchEffect(() => {
      urls.value = props.urls
    })

    // 关闭预览时触发
    const handleVisibleChange = bool => {
      isPreview.value = bool
    }

    expose({})

    return {
      isPreview,
      current,
      urls,
      handleVisibleChange
    }
  }
})
</script>
<style lang="scss">
.x-preview__root {
  .ant-image-preview-switch-left,
  .ant-image-preview-switch-right {
    color: rgb(0 0 0 / 45%);
    background: rgb(255 255 255 / 100%);
  }

  .ant-image-preview-operations {
    color: rgb(255 255 255 / 100%);
  }
}
</style>
