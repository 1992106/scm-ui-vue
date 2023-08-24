import XExportExcel from './ExportExcel.vue'
import XImportExcel from './ImportExcel.vue'
import { jsonToMultipleSheetXlsx, jsonToSheetXlsx, readerData } from './utils'
import useComponent from '@src/plugins/useComponent'
import { formatDate } from '@src/utils'
import { getXlsxColumns as getXlsxColumnsByTable } from '@components/Table/src/utils'
import { getXlsxColumns as getXlsxColumnsByGrid } from '@components/Grid/src/utils'

export const useXExportExcel = (options, successFn, errorFn) => {
  const produce = useComponent(XExportExcel)
  return produce({
    ...options,
    ...(successFn ? { onSuccess: successFn } : {}),
    ...(errorFn ? { onError: errorFn } : {})
  })
}

export const useXImportExcel = (options, successFn, errorFn) => {
  const produce = useComponent(XImportExcel)
  return produce({
    ...options,
    ...(successFn ? { onSuccess: successFn } : {}),
    ...(errorFn ? { onError: errorFn } : {})
  })
}

const formatHeader = (data, dataSource, columns) => {
  if (!columns) return {}
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

export const importExcel = file => {
  return readerData(file).then(({ fileName, sheetList }) => {
    return { fileName, ...(sheetList?.[0] || {}) }
  })
}

export const importMultipleExcel = file => {
  return readerData(file).then(({ fileName, sheetList }) => {
    return sheetList.map(row => ({ ...row, fileName }))
  })
}
