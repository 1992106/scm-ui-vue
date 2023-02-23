import { onActivated, onMounted, ref, unref, watch } from 'vue'
import { useEventListener } from '@hooks/useEventListener'
import { unrefElement } from '@hooks/utils'

export const useTableScrollTo = (xTable, { data } = {}) => {
  const refEl = ref(null)
  const refX = ref(0)
  const refY = ref(0)

  let stopWatch
  onMounted(() => {
    stopWatch = watch(
      () => [unrefElement(xTable), unref(data).length],
      () => {
        const el = unrefElement(xTable)?.querySelector('.ant-table-body')
        if (el) {
          refEl.value = el
          // 监听滚动事件
          useEventListener(el, 'scroll', e => {
            // 获取scrollTop的高度
            refX.value = e.target.scrollLeft
            refY.value = e.target.scrollTop
          })
          stopWatch && stopWatch()
        }
      },
      { immediate: true, flush: 'post' }
    )
  })

  // 当表格keep-alive缓存时，保持滚动行为
  onActivated(() => {
    if (unref(refEl)) {
      refEl.value.scrollLeft = refX.value
      refEl.value.scrollTop = refY.value
    }
  })

  // 滚动到顶部/左侧
  const onScrollTo = (top = 0, left = 0) => {
    if (unref(refEl)) {
      refEl.value.scrollTop = top
      refEl.value.scrollLeft = left
    }
  }

  return {
    refX,
    refY,
    onScrollTo
  }
}
