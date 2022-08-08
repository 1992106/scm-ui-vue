import { onBeforeUnmount, onMounted, unref } from 'vue'
import { debounce } from 'lodash-es'
// import { getScrollBarSize } from '@src/utils'

export const useScroll = ({ xTable, autoResize, extraHeight, scroll }) => {
  const resizeFn = debounce(() => {
    scroll.value = getTableScroll({ xTable, extraHeight })
  }, 200)

  const initResize = () => {
    if (unref(xTable) && window.MutationObserver) {
      const observer = new MutationObserver(resizeFn)
      observer.observe(unref(xTable)?.$el, { attributes: true, childList: true, subtree: true })
      setTimeout(() => {
        observer && observer.disconnect()
      }, 3000)
    }
  }

  onMounted(() => {
    if (autoResize) {
      // 由于Table是动态异步生成，初始化直接调用resizeFn()无效，所以使用MutationObserver来实现
      initResize()
      // resizeFn()
      window.addEventListener('resize', resizeFn)
    }
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeFn)
  })
}

export const getTableScroll = ({ xTable, extraHeight } = {}) => {
  let tHeaderEl
  let summaryEl
  let paginationEl
  // let bodyEl
  // let emptyEl
  if (unref(xTable)?.$el) {
    tHeaderEl = unref(xTable)?.$el.querySelector('.ant-table-header')
    summaryEl = unref(xTable)?.$el.querySelector('.ant-table-summary')
    paginationEl = unref(xTable)?.$el.querySelector('.ant-table-pagination')
    // bodyEl = unref(xTable)?.$el.querySelector('.ant-table .ant-table-body')
    // emptyEl = unref(xTable)?.$el.querySelector('.ant-table-empty .ant-table-body .ant-table-placeholder')
  } else {
    tHeaderEl = document.querySelector('.x-table .ant-table .ant-table-header')
    summaryEl = document.querySelector('.x-table .ant-table .ant-table-summary')
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
  const height = `calc(100vh - ${tHeaderBottom + summaryHeight + paginationHeight + extraHeight}px)`

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
