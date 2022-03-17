import VXETable from 'vxe-table'
import XEUtils from 'xe-utils'

// VXETable格式化
VXETable.formats.mixin({
  formatDate({ cellValue }, format) {
    return XEUtils.toDateString(cellValue, format || 'yyyy-MM-dd')
  },
  formatTime({ cellValue }, format) {
    return XEUtils.toDateString(cellValue, format || 'yyyy-MM-dd HH:mm')
  }
})
