import XExportExcel from './ExportExcel.vue'
import XImportExcel from './ImportExcel.vue'
import { jsonToMultipleSheetXlsx, jsonToSheetXlsx } from './utils'
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

const formatHeader = (data, dataSource, columns) => {
  const allColumns =
    (data ? getXlsxColumnsByGrid(columns || []) : undefined) || // 兼容 x-grid
    (dataSource ? getXlsxColumnsByTable(columns || []) : undefined) || // 兼容 x-table
    []
  return allColumns.reduce((o, n) => {
    const { label, value } = n
    o[value] = label
    return o
  }, {})
}

export const exportExcel = options => {
  const { data, dataSource, header, columns, sheetName, json2sheetOpts, fileName, bookType = 'xlsx' } = options || {}
  return jsonToSheetXlsx({
    data: data || dataSource || [],
    header: header || formatHeader(data, dataSource, columns),
    sheetName,
    json2sheetOpts,
    fileName: fileName ? `${fileName}_${formatDate(new Date())}.${bookType}` : undefined,
    write2excelOpts: { bookType }
  })
}

export const exportMultipleExcel = options => {
  const { sheetList, fileName, bookType = 'xlsx' } = options
  let sheets = (sheetList || []).map(record => {
    const { data, dataSource, header, columns, sheetName, json2sheetOpts } = record
    return {
      data: data || dataSource || [],
      header: header || formatHeader(data, dataSource, columns),
      sheetName,
      json2sheetOpts
    }
  })
  return jsonToMultipleSheetXlsx({
    sheetList: sheets,
    fileName: fileName ? `${fileName}_${formatDate(new Date())}.${bookType}` : undefined,
    write2excelOpts: { bookType }
  })
}
