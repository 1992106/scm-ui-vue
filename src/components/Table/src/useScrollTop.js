import { onActivated, onMounted, ref } from 'vue'
import { useEventListener } from '@hooks/useEventListener'
import { unrefElement } from '@hooks/utils'

export const useScrollTop = ({ xTable }) => {
  const scrollTop = ref(null)

  // 当表格keep-alive缓存时，保持滚动行为
  onActivated(() => {
    const el = unrefElement(xTable).querySelector('.ant-table-body')
    if (el && scrollTop.value) {
      el.scrollTop = scrollTop.value
    }
  })
  // TODO: 获取表格的scrollTop一直为0，故使用监听scroll事件实现
  // onDeactivated(() => {
  //   const el = unrefElement(xTable).querySelector('.ant-table-body')
  //   if (el) {
  //     state.scrollTop = el.scrollTop
  //   }
  // })
  onMounted(() => {
    // 必须延迟绑定scroll事件
    setTimeout(() => {
      const el = unrefElement(xTable).querySelector('.ant-table-body')
      if (el) {
        useEventListener(el, 'scroll', e => {
          scrollTop.value = e.target.scrollTop
        })
      }
    }, 1000)
  })

  // 滚动到顶部
  const onScrollTop = (to = 0) => {
    const el = unrefElement(xTable).querySelector('.ant-table-body')
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
