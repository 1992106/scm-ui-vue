import * as xlsx from 'xlsx'
import type { WorkBook, WorkSheet, Range } from 'xlsx'
import type {
  JsonToSheet,
  JsonToMultipleSheet,
  AoAToSheet,
  AoaToMultipleSheet,
  ExcelData,
  MultipleExcelData
} from './index'
import { get } from 'lodash-es'
import { isEmpty } from '@utils/is'
import { formatDate } from '@src/utils'

const { utils, writeFile, read } = xlsx

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
  header = {} as T,
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
  header = [],
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

/**
 * @description: 格式表头
 */
function shapeWorkSheel(sheet: WorkSheet, range: Range) {
  let str = ' ',
    char = 65,
    customWorkSheet = {
      t: 's',
      v: str,
      r: '<t> </t><phoneticPr fontId="1" type="noConversion"/>',
      h: str,
      w: str
    }
  if (!sheet || !sheet['!ref']) return []
  let c = 0,
    r = 1
  while (c < range.e.c + 1) {
    while (r < range.e.r + 1) {
      if (!sheet[String.fromCharCode(char) + r]) {
        sheet[String.fromCharCode(char) + r] = customWorkSheet
      }
      r++
    }
    r = 1
    str += ' '
    customWorkSheet = {
      t: 's',
      v: str,
      r: '<t> </t><phoneticPr fontId="1" type="noConversion"/>',
      h: str,
      w: str
    }
    c++
    char++
  }
}

/**
 * @description: 第一行作为头部
 */
function getHeaderRow(sheet: WorkSheet) {
  if (!sheet || !sheet['!ref']) return []
  const headers: string[] = []
  // A3:B7=>{s:{c:0, r:2}, e:{c:1, r:6}}
  const range: Range = utils.decode_range(sheet['!ref'])
  shapeWorkSheel(sheet, range)
  const R = range.s.r
  /* start in the first row */
  for (let C = range.s.c; C <= range.e.c; ++C) {
    /* walk every column in the range */
    const cell = sheet[utils.encode_cell({ c: C, r: R })]
    /* find the cell in the first row */
    let hdr = 'UNKNOWN ' + C // <-- replace with your desired default
    if (cell && cell.t) hdr = utils.format_cell(cell)
    headers.push(hdr)
  }
  return headers
}

/**
 * @description: 获得excel数据
 */
function getExcelData(workbook: WorkBook): ExcelData[] {
  const excelData: ExcelData[] = []
  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName]
    const header: string[] = getHeaderRow(worksheet)
    const data = utils.sheet_to_json(worksheet, {
      raw: true
    }) as object[]

    excelData.push({
      header,
      data,
      sheetName
    })
  }
  return excelData
}

/**
 * @description: 读取excel数据
 */
export function readerData(rawFile: File): Promise<MultipleExcelData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async e => {
      try {
        const data = e.target && e.target.result
        const workbook = read(data, { type: 'array', cellDates: true })
        /* DO SOMETHING WITH workbook HERE */
        const excelData = getExcelData(workbook)
        resolve({ fileName: rawFile.name, sheetList: excelData })
      } catch (error) {
        reject(error)
      }
    }
    reader.readAsArrayBuffer(rawFile)
  })
}
