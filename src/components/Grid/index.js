// 导入组件
import XGrid from './src/index.vue'

// 为组件提供 install 安装方法，供按需引入
XGrid.install = function (app) {
  app.component(XGrid.name, XGrid)
}

// 默认导出组件
export default XGrid
