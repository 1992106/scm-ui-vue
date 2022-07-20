// 导入组件
import XTabs from './src/index.vue'

// 为组件提供 install 安装方法，供按需引入
XTabs.install = function (app) {
  app.component(XTabs.name, XTabs)
}

// 默认导出组件
export default XTabs
