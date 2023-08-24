import type { JSON2SheetOpts, WritingOptions } from 'xlsx'

export interface ExcelData<T = any> {
  header: string[]
  data: T[]
  sheetName: string
  fileName?: string
}

export interface MultipleExcelData<T = any> {
  sheetList: ExcelData<T>[]
  fileName?: string
}

export interface JsonToSheet<T = any> {
  data: T[]
  header?: T
  fileName?: string
  sheetName?: string
  json2sheetOpts?: JSON2SheetOpts
  write2excelOpts?: WritingOptions
}

export interface AoAToSheet<T = any> {
  data: T[][]
  header?: T[]
  fileName?: string
  sheetName?: string
  write2excelOpts?: WritingOptions
}

export interface JsonToMultipleSheet<T = any> {
  sheetList: JsonToSheet<T>[]
  fileName?: string
  write2excelOpts?: WritingOptions
}

export interface AoaToMultipleSheet<T = any> {
  sheetList: AoAToSheet<T>[]
  fileName?: string
  write2excelOpts?: WritingOptions
}
