import * as xlsx from 'xlsx'
import type { WorkBook } from 'xlsx'
import type { JsonToSheet, JsonToMultipleSheet, AoAToSheet, AoaToMultipleSheet } from './index'
import { isEmpty } from '@utils/is'

const { utils, writeFile } = xlsx

const DEF_FILE_NAME = 'excel.xlsx'
const DEF_SHEET_NAME = 'sheet'

/**
 * @param data source data
 * @param worksheet worksheet object
 * @param min min width
 */
function setColumnWidth(data, worksheet, min = 3) {
  const obj = {}
  worksheet['!cols'] = []
  data.forEach(item => {
    Object.keys(item).forEach(key => {
      const cur = item[key]
      const length = (cur?.length ?? 0) * 2 || min
      obj[key] = Math.max(length, obj[key] ?? min)
    })
  })
  Object.keys(obj).forEach(key => {
    worksheet['!cols'].push({
      wch: obj[key]
    })
  })
}

/**
 * @param data source data
 * @param header
 */
function formatJsonData(data, header) {
  const keys = Object.keys(header)
  return data.map(item => {
    return keys.reduce((o, key) => {
      o[key] = item[key]
      return o
    }, {})
  })
}

export function jsonToSheetXlsx<T = any>({
  data,
  header,
  fileName = DEF_FILE_NAME,
  sheetName = DEF_SHEET_NAME,
  json2sheetOpts = {},
  write2excelOpts = { bookType: 'xlsx' }
}: JsonToSheet<T>) {
  let arrData = [...data]
  if (!isEmpty(header)) {
    arrData = formatJsonData(arrData, header)
    arrData.unshift(header)
    json2sheetOpts.skipHeader = true
  }

  const worksheet = utils.json_to_sheet(arrData, json2sheetOpts)
  setColumnWidth(arrData, worksheet)

  /* add worksheet to workbook */
  // const workbook = {
  //   SheetNames: [sheetName],
  //   Sheets: {
  //     [sheetName]: worksheet
  //   }
  // }
  const workbook = utils.book_new()
  utils.book_append_sheet(workbook, worksheet, sheetName)

  /* output format determined by fileName */
  writeFile(workbook, fileName, write2excelOpts)
  /* at this point, out.xlsb will have been downloaded */
}

export function aoaToSheetXlsx<T = any>({
  data,
  header,
  fileName = DEF_FILE_NAME,
  sheetName = DEF_SHEET_NAME,
  write2excelOpts = { bookType: 'xlsx' }
}: AoAToSheet<T>) {
  const arrData = [...data]
  if (!isEmpty(header)) {
    arrData.unshift(header)
  }

  const worksheet = utils.aoa_to_sheet(arrData)

  /* add worksheet to workbook */
  // const workbook = {
  //   SheetNames: [sheetName],
  //   Sheets: {
  //     [sheetName]: worksheet
  //   }
  // }
  const workbook: WorkBook = utils.book_new()
  utils.book_append_sheet(workbook, worksheet, sheetName)

  /* output format determined by fileName */
  writeFile(workbook, fileName, write2excelOpts)
  /* at this point, out.xlsb will have been downloaded */
}

/**
 * json导出多Sheet的Xlsx
 * @param sheetList 多sheet配置
 * @param fileName 文件名(包含后缀)
 * @param write2excelOpts 文件配置
 */
export function jsonToMultipleSheetXlsx<T = any>({
  sheetList,
  fileName = DEF_FILE_NAME,
  write2excelOpts = { bookType: 'xlsx' }
}: JsonToMultipleSheet<T>) {
  const workbook: WorkBook = {
    SheetNames: [],
    Sheets: {}
  }
  sheetList.forEach((p, index) => {
    let arrData = [...p.data]
    if (!isEmpty(p.header)) {
      arrData = formatJsonData(arrData, p.header)
      arrData.unshift(p.header)
      p.json2sheetOpts = p.json2sheetOpts || {}
      p.json2sheetOpts.skipHeader = true
    }

    const worksheet = utils.json_to_sheet(arrData, p.json2sheetOpts)
    setColumnWidth(arrData, worksheet)

    p.sheetName = p.sheetName || `${DEF_SHEET_NAME}${index}`
    workbook.SheetNames.push(p.sheetName)
    workbook.Sheets[p.sheetName] = worksheet
  })
  writeFile(workbook, fileName, write2excelOpts)
}

/**
 * aoa导出多Sheet的Xlsx
 * @param sheetList 多sheet配置
 * @param fileName 文件名(包含后缀)
 * @param write2excelOpts 文件配置
 */
export function aoaToMultipleSheetXlsx<T = any>({
  sheetList,
  fileName = DEF_FILE_NAME,
  write2excelOpts = { bookType: 'xlsx' }
}: AoaToMultipleSheet<T>) {
  const workbook: WorkBook = {
    SheetNames: [],
    Sheets: {}
  }
  sheetList.forEach((p, index) => {
    const arrData = [...p.data]
    if (!isEmpty(p.header)) {
      arrData.unshift(p.header)
    }
    const worksheet = utils.aoa_to_sheet(arrData)

    p.sheetName = p.sheetName || `${DEF_SHEET_NAME}${index}`
    workbook.SheetNames.push(p.sheetName)
    workbook.Sheets[p.sheetName] = worksheet
  })

  /* output format determined by fileName */
  writeFile(workbook, fileName, write2excelOpts)
  /* at this point, out.xlsb will have been downloaded */
}
