<template>
  <div ref="xScrollRef" class="x-scroll-container" v-bind="$attrs">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, unref, nextTick, onActivated } from 'vue'
import { useScroll } from '@src/components/hooks/useScroll'
import { useScrollTo } from '@src/components/hooks/useScrollTo'

export default defineComponent({
  name: 'XScrollContainer',
  inheritAttrs: false,
  setup(_, { expose }) {
    const xScrollRef = ref(null)
    const { refX, refY } = useScroll(xScrollRef, { wait: 200 })

    /**
     * Scroll to the specified position
     */
    function handleScrollTo(top = 0, left = 0, duration = 500) {
      nextTick(() => {
        const el = unref(xScrollRef)
        if (!el) {
          return
        }
        const { start } = useScrollTo({
          el,
          top,
          left,
          duration
        })
        start()
      })
    }

    /**
     * Scroll to the bottom
     */
    function handleScrollBottom() {
      nextTick(() => {
        const el = unref(xScrollRef) as any
        if (!el) {
          return
        }
        const scrollHeight = el.scrollHeight as number
        const scrollWidth = el.scrollWidth as number
        const { start } = useScrollTo({
          el,
          top: scrollHeight,
          left: scrollWidth
        })
        start()
      })
    }

    // 当keep-alive缓存时，保持滚动行为
    onActivated(() => {
      if (unref(xScrollRef)) {
        xScrollRef.value.scrollLeft = refX.value
        xScrollRef.value.scrollTop = refY.value
      }
    })

    expose({
      refX,
      refY,
      onScrollTo: handleScrollTo,
      onScrollBottom: handleScrollBottom
    })

    return {
      xScrollRef
    }
  }
})
</script>
<style lang="scss" scoped>
.x-scroll-container {
  width: 100%;
  height: 100%;
  overflow: auto;
}
</style>
