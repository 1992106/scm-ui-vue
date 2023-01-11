import { onActivated, onMounted, ref } from 'vue'
import { useEventListener } from '@hooks/useEventListener'
import { unrefElement } from '@hooks/utils'

export const useScrollBehavior = xTable => {
  const scrollTop = ref(null)

  // 监听滚动事件
  onMounted(() => {
    // 由于表格是动态生成，必须延迟绑定scroll事件
    setTimeout(() => {
      const el = unrefElement(xTable)?.querySelector('.ant-table-body')
      if (el) {
        useEventListener(el, 'scroll', e => {
          // 获取scrollTop的高度
          scrollTop.value = e.target.scrollTop
        })
      }
    }, 1000)
  })

  // 当表格keep-alive缓存时，保持滚动行为
  onActivated(() => {
    const el = unrefElement(xTable)?.querySelector('.ant-table-body')
    if (el && scrollTop.value) {
      el.scrollTop = scrollTop.value
    }
  })

  // 滚动到顶部
  const onScrollTop = (to = 0) => {
    const el = unrefElement(xTable)?.querySelector('.ant-table-body')
    if (el) {
      el.scrollTop = to
      // 动画效果实现滚动
      // scrollTop(el, el.scrollTop, to)
    }
  }

  return {
    scrollTop,
    onScrollTop
  }
}
