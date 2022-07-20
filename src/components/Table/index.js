// 导入组件
import XTable from './src/index.vue'

// 为组件提供 install 安装方法，供按需引入
XTable.install = function (app) {
  app.component(XTable.name, XTable)
}

// 默认导出组件
export default XTable
