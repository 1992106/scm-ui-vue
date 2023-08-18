import VXETable from 'vxe-table'
import { formatDate, formatTime, isEmpty } from '@src/utils'

export const formats = {
  formatDate: {
    cellFormatMethod({ cellValue }, format) {
      if (isEmpty(cellValue)) return '--'
      return formatDate(cellValue, format || 'yyyy-MM-dd')
    }
  },
  formatTime: {
    cellFormatMethod({ cellValue }, format) {
      if (isEmpty(cellValue)) return '--'
      return formatTime(cellValue, format || 'yyyy-MM-dd HH:mm')
    }
  }
}

// VXETable格式化
VXETable.formats.mixin(formats)
