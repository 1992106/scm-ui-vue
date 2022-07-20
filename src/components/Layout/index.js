// 导入组件
import XLayout from './src/index.vue'

// 为组件提供 install 安装方法，供按需引入
XLayout.install = function (app) {
  app.component(XLayout.name, XLayout)
}

// 默认导出组件
export default XLayout
