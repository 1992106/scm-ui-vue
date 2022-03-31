import VXETable from 'vxe-table'
import XEUtils from 'xe-utils'
import { isEmpty } from '@src/utils'

export const formats = {
  formatDate({ cellValue }, format) {
    if (isEmpty(cellValue)) return '--'
    return XEUtils.toDateString(cellValue, format || 'yyyy-MM-dd')
  },
  formatTime({ cellValue }) {
    if (isEmpty(cellValue)) return '--'
    return XEUtils.toDateString(cellValue, 'yyyy-MM-dd HH:mm')
  },
  formatEmpty({ cellValue }, key) {
    if (isEmpty(cellValue)) return '--'
    if (key === 'boolean') {
      cellValue = !!cellValue
    }
    if (typeof cellValue === 'boolean') {
      return cellValue === true ? '是' : '否'
    }
  }
}

// VXETable格式化
VXETable.formats.mixin(formats)
