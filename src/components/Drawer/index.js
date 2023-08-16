// 导入组件
import XDrawer from './src/index'

// 为组件提供 install 安装方法，供按需引入
XDrawer.install = function (app) {
  app.component(XDrawer.name, XDrawer)
}

// 默认导出组件
export default XDrawer

// 函数组件
export { default as useXDrawer } from './src/useDrawer'
