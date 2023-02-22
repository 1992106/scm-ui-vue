import { onActivated, onMounted, ref, unref, watch } from 'vue'
import { useEventListener } from '@hooks/useEventListener'
import { unrefElement } from '@hooks/utils'

export const useScrollBehavior = (xTable, { data } = {}) => {
  const refEl = ref(null)
  const refX = ref(0)
  const refY = ref(0)

  let stopWatch
  onMounted(() => {
    stopWatch = watch(
      () => unref(data).length,
      () => {
        refEl.value = unrefElement(xTable)?.querySelector('.ant-table-body')
        // 监听滚动事件
        useEventListener(refEl.value, 'scroll', e => {
          // 获取scrollTop的高度
          refX.value = e.target.scrollLeft
          refY.value = e.target.scrollTop
          stopWatch && stopWatch()
        })
      },
      { immediate: true }
    )
  })

  // 当表格keep-alive缓存时，保持滚动行为
  onActivated(() => {
    if (refEl.value) {
      refEl.value.scrollLeft = refX.value
      refEl.value.scrollTop = refY.value
    }
  })

  // 滚动到顶部
  const onScrollTop = (top = 0, left = 0) => {
    if (refEl.value) {
      refEl.value.scrollTop = top
      refEl.value.scrollLeft = left
      // 动画效果实现滚动
      // scrollTop(el, el.scrollTop, to)
    }
  }

  return {
    refX,
    refY,
    onScrollTop
  }
}
