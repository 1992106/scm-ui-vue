// 导入组件
import XEditTable from './src/index.vue'

// 为组件提供 install 安装方法，供按需引入
XEditTable.install = function (app) {
  app.component(XEditTable.name, XEditTable)
}

// 默认导出组件
export default XEditTable
