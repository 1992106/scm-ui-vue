import XExportExcel from './ExportExcel.vue'
import XImportExcel from './ImportExcel.vue'
import { jsonToSheetXlsx } from './utils'
import { produce } from '@src/plugins/produce'
import { formatDate } from '@src/utils'

export const createXExportExcel = options => {
  produce(XExportExcel, { visible: true }, options)
}

export const createXImportExcel = options => {
  produce(XImportExcel, { visible: true }, options)
}

export const exportExcel = options => {
  const { data, header, fileName, sheetName, bookType = 'xlsx', columns, dataSource } = options || {}
  const h = (columns || []).reduce((o, n) => {
    const { label, value } = n
    o[value] = label
    return o
  }, {})
  return jsonToSheetXlsx({
    data: data || dataSource || [],
    header: header || h,
    fileName: fileName ? `${fileName}_${formatDate(new Date())}.${bookType}` : undefined,
    sheetName: sheetName ?? undefined,
    write2excelOpts: { bookType }
  })
}
