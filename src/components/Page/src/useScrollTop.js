import { onActivated, ref } from 'vue'
import { unrefElement } from '@hooks/utils'

export const useScrollTop = xPage => {
  const scrollTop = ref(null)

  // 获取scrollTop的高度
  const handleScroll = e => {
    scrollTop.value = e.target.scrollTop
  }

  // 当表格keep-alive缓存时，保持滚动行为
  onActivated(() => {
    const el = unrefElement(xPage)?.querySelector('.x-page__container .x-page__render .scroll')
    if (el && scrollTop.value) {
      el.scrollTop = scrollTop.value
    }
  })

  // 滚动到顶部
  const onScrollTop = (to = 0) => {
    const el = unrefElement(xPage)?.querySelector('.x-page__container .x-page__render .scroll')
    if (el) {
      el.scrollTop = to
      // 动画效果实现滚动
      // scrollTop(el, el.scrollTop, to)
    }
  }

  return {
    scrollTop,
    handleScroll,
    onScrollTop
  }
}
