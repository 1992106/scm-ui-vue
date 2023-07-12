import XExportExcel from './ExportExcel.vue'
import XImportExcel from './ImportExcel.vue'
import { jsonToSheetXlsx } from './utils'
import { produce } from '@src/plugins/produce'
import { formatDate } from '@src/utils'
import { getXlsxColumns as getXlsxColumnsByTable } from '@components/Table/src/utils'
import { getXlsxColumns as getXlsxColumnsByGrid } from '@components/Grid/src/utils'

export const createXExportExcel = options => {
  produce(XExportExcel, { visible: true }, options)
}

export const createXImportExcel = options => {
  produce(XImportExcel, { visible: true }, options)
}

export const exportExcel = options => {
  const { data, dataSource, header, columns, fileName, sheetName, bookType = 'xlsx' } = options || {}
  let h = header
  if (!h) {
    const allColumns =
      (data ? getXlsxColumnsByGrid(columns || []) : undefined) || // 兼容 x-grid
      (dataSource ? getXlsxColumnsByTable(columns || []) : undefined) || // 兼容 x-table
      []
    h = allColumns.reduce((o, n) => {
      const { label, value } = n
      o[value] = label
      return o
    }, {})
  }
  return jsonToSheetXlsx({
    data: data || dataSource || [],
    header: h,
    fileName: fileName ? `${fileName}_${formatDate(new Date())}.${bookType}` : undefined,
    sheetName: sheetName ? sheetName : undefined,
    write2excelOpts: { bookType }
  })
}
