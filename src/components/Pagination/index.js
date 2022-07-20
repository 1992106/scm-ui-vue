// 导入组件
import XPagination from './src/index.vue'

// 为组件提供 install 安装方法，供按需引入
XPagination.install = function (app) {
  app.component(XPagination.name, XPagination)
}

// 默认导出组件
export default XPagination
