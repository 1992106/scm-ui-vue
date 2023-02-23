// 导入组件
import XLazyContainer from './src/LazyContainer.vue'
import XScrollContainer from './src/ScrollContainer.vue'

// 为组件提供 install 安装方法，供按需引入
XLazyContainer.install = function (app) {
  app.component(XLazyContainer.name, XLazyContainer)
}

XScrollContainer.install = function (app) {
  app.component(XScrollContainer.name, XScrollContainer)
}

// 默认导出组件
export { XLazyContainer, XScrollContainer }
