// 导入组件
import XSearch from './src/index.vue'

// 为组件提供 install 安装方法，供按需引入
XSearch.install = function (app) {
  app.component(XSearch.name, XSearch)
}

// 默认导出组件
export default XSearch
