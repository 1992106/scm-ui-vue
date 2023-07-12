import * as xlsx from 'xlsx'
import type { WorkBook } from 'xlsx'
import type { JsonToSheet, JsonToMultipleSheet, AoAToSheet, AoaToMultipleSheet } from './index'
import { get } from 'lodash-es'
import { isEmpty } from '@utils/is'
import { formatDate } from '@src/utils'

const { utils, writeFile } = xlsx

const DEF_BOOK_TYPE = 'xlsx'
const DEF_SHEET_NAME = 'sheet'
const DEF_FILE_NAME = `${formatDate(new Date())}.${DEF_BOOK_TYPE}`

// 获取字节长度
function getByteLength(str) {
  let len = str?.length ?? 0
  if (typeof str === 'number') {
    len = (str + '').length
  }
  if (typeof str === 'string') {
    let l = 0
    for (let i = 0; i < len; i++) {
      if ((str?.charCodeAt(i) & 0xff00) != 0) {
        l++
      }
      l++
    }
    len = l
  }
  return len
}

// 设置列宽
function setColumnWidth(data, worksheet, min = 4) {
  const obj = {}
  worksheet['!cols'] = []
  data.forEach(item => {
    Object.keys(item).forEach(key => {
      const len = getByteLength(item?.[key])
      obj[key] = Math.max(len, obj[key] ?? min)
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
      o[key] = get(item, key)
      return o
    }, {})
  })
}

export function jsonToSheetXlsx<T = any>({
  data = [],
  header,
  fileName = DEF_FILE_NAME,
  sheetName = DEF_SHEET_NAME,
  json2sheetOpts = {},
  write2excelOpts = { bookType: DEF_BOOK_TYPE }
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
  data = [],
  header,
  fileName = DEF_FILE_NAME,
  sheetName = DEF_SHEET_NAME,
  write2excelOpts = { bookType: DEF_BOOK_TYPE }
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
  write2excelOpts = { bookType: DEF_BOOK_TYPE }
}: JsonToMultipleSheet<T>) {
  const workbook: WorkBook = {
    SheetNames: [],
    Sheets: {}
  }
  sheetList.forEach((p, index) => {
    let arrData = [...(p.data || [])]
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
  write2excelOpts = { bookType: DEF_BOOK_TYPE }
}: AoaToMultipleSheet<T>) {
  const workbook: WorkBook = {
    SheetNames: [],
    Sheets: {}
  }
  sheetList.forEach((p, index) => {
    const arrData = [...(p.data || [])]
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
