// 导入组件
import XProTable from './src/index.vue'

// 为组件提供 install 安装方法，供按需引入
XProTable.install = function (app) {
  app.component(XProTable.name, XProTable)
}

// 默认导出组件
export default XProTable
