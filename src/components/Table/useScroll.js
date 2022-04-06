import { onBeforeUnmount, onMounted } from 'vue'
import { debounce } from 'lodash-es'

export const useScroll = ({ autoResize, scroll }) => {
  const onResize = debounce(() => {
    scroll.value = getTableScroll()
  }, 200)

  onMounted(() => {
    if (autoResize) {
      onResize()
      window.addEventListener('resize', onResize)
    }
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', onResize)
  })
}

export const getTableScroll = ({ id, extraHeight } = {}) => {
  let tHeader
  if (id) {
    tHeader = document.getElementById(id)
      ? document.getElementById(id).querySelector('.my-table .ant-table .ant-table-header')
      : null
  } else {
    tHeader = document.querySelector('.my-table .ant-table .ant-table-header')
  }
  if (typeof extraHeight === 'undefined') {
    extraHeight = 10 // 页面内边距或外边距
  }
  // 表格内容距离顶部的距离
  let tHeaderBottom = 0
  if (tHeader) {
    tHeaderBottom = tHeader.getBoundingClientRect().bottom
  }
  // 分页器：高度+margin20
  const pagination = document.querySelector('.my-table .ant-table .ant-pagination')
  const paginationHeight = pagination ? pagination.getBoundingClientRect().height : 0

  const y = `calc(100vh - ${tHeaderBottom + paginationHeight + extraHeight}px)`

  // TODO: 设置表格高度不生效
  // const tBody = document.querySelector('.my-table .ant-table .ant-table-body')
  // if (tBody) {
  //   tBody.style.cssText += `height: ${y}px`
  // }

  return { x: 'max-content', y }
}
