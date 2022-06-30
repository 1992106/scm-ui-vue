// 导入组件
import XTraceability from './src/index.vue'
import XBatchImportTraceability from './src/BatchImportTraceability.vue'
import XEditTraceability from './src/EditTraceability.vue'
import XViewTraceability from './src/ViewTraceability.vue'

// 为组件提供 install 安装方法，供按需引入
XTraceability.install = function (app) {
  app.component(XTraceability.name, XTraceability)
}
XBatchImportTraceability.install = function (app) {
  app.component(XBatchImportTraceability.name, XBatchImportTraceability)
}
XEditTraceability.install = function (app) {
  app.component(XEditTraceability.name, XEditTraceability)
}
XViewTraceability.install = function (app) {
  app.component(XViewTraceability.name, XViewTraceability)
}

// 默认导出组件
export default XTraceability
export { XBatchImportTraceability, XEditTraceability, XViewTraceability }
