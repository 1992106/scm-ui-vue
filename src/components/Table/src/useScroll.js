import { nextTick, onMounted, ref, unref, watch } from 'vue'
import { debounce } from 'lodash-es'
import { useEventListener } from '@hooks/useEventListener'
import { unrefElement } from '@hooks/utils'
// import { getScrollBarSize } from '@src/utils'

export const useScroll = (xTable, { canResize, data, extraHeight }) => {
  const scroll = ref({})

  const resizeFn = debounce(() => {
    nextTick(() => {
      scroll.value = getTableScroll({ xTable, extraHeight })
    })
  }, 200)

  watch(
    () => unref(data).length,
    () => {
      if (canResize) {
        resizeFn()
      }
    },
    { flush: 'post' }
  )

  onMounted(() => {
    if (canResize) {
      resizeFn()
      useEventListener(window, 'resize', resizeFn)
    }
  })

  return {
    scroll
  }
}

export const getTableScroll = ({ xTable, extraHeight } = {}) => {
  let tHeaderEl
  let summaryEl
  let footerEl
  let paginationEl
  // let bodyEl
  // let emptyEl
  const el = unrefElement(xTable)
  if (el) {
    tHeaderEl = el.querySelector('.ant-table-header')
    summaryEl = el.querySelector('.ant-table-summary')
    footerEl = el.querySelector('.ant-table-footer')
    paginationEl = el.querySelector('.ant-table-pagination')
    // bodyEl = el.querySelector('.ant-table .ant-table-body')
    // emptyEl = el.querySelector('.ant-table-empty .ant-table-body .ant-table-placeholder')
  } else {
    tHeaderEl = document.querySelector('.x-table .ant-table .ant-table-header')
    summaryEl = document.querySelector('.x-table .ant-table .ant-table-summary')
    footerEl = document.querySelector('.x-table .ant-table-footer')
    paginationEl = document.querySelector('.x-table .ant-table-pagination')
    // bodyEl = document.querySelector('.x-table .ant-table .ant-table-body')
    // emptyEl = document.querySelector('.x-table .ant-table-empty .ant-table-body .ant-table-placeholder')
  }
  // 表格内容距离顶部的距离
  let tHeaderBottom = 0
  if (tHeaderEl) {
    tHeaderBottom = tHeaderEl.getBoundingClientRect().bottom
  }
  // 总结栏
  let summaryHeight = 0
  if (summaryEl) {
    summaryHeight = summaryEl.getBoundingClientRect().height
  }
  // 表格尾部
  let footerHeight = 0
  if (footerEl) {
    footerHeight = footerEl.getBoundingClientRect().height
  }
  // 分页器的高度
  let paginationHeight = 0
  if (paginationEl) {
    paginationHeight = paginationEl.getBoundingClientRect().height
  }
  // 其它高度：页面内边距或外边距
  if (typeof extraHeight === 'undefined') {
    extraHeight = 0
  }
  // 表格窗体高度-表格内容顶部的高度-表格内容底部的高度
  const height = `calc(100vh - ${tHeaderBottom + summaryHeight + footerHeight + paginationHeight + extraHeight}px)`

  // TODO: 设置表格高度不生效
  // if (bodyEl) {
  //   bodyEl.style.cssText += `height: ${height}px`
  // }
  // 空数据时，设置高度
  // if (emptyEl) {
  //   const scrollBarWidth = getScrollBarSize()
  //   emptyEl.style.height = `calc(100vh - ${tHeaderBottom + paginationHeight + extraHeight + scrollBarWidth}px)`
  // }

  // TODO: x: 'max-content' 会导致 ellipsis: true 无效
  return { x: '100%', y: height }
}
