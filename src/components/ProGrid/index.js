// 导入组件
import XProGrid from './src/index.vue'

// 为组件提供 install 安装方法，供按需引入
XProGrid.install = function (app) {
  app.component(XProGrid.name, XProGrid)
}

// 默认导出组件
export default XProGrid
