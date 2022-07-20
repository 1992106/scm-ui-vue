// 导入组件
import XPage from './src/index.vue'

// 为组件提供 install 安装方法，供按需引入
XPage.install = function (app) {
  app.component(XPage.name, XPage)
}

// 默认导出组件
export default XPage
