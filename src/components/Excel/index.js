// excel组件
import XExportExcel from './src/ExportExcel.vue'
import XImportExcel from './src/ImportExcel.vue'

// 为组件提供 install 安装方法，供按需引入
XExportExcel.install = function (app) {
  app.component(XExportExcel.name, XExportExcel)
}
XImportExcel.install = function (app) {
  app.component(XImportExcel.name, XImportExcel)
}

// 默认导出组件
export { XExportExcel, XImportExcel }

// 函数组件
export { createXExportExcel, createXImportExcel, exportExcel, exportMultipleExcel } from './src/function'
