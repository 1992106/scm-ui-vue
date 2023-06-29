// 预览组件
import XPreview from './src/index.vue'

// 为组件提供 install 安装方法，供按需引入
XPreview.install = function (app) {
  app.component(XPreview.name, XPreview)
}

// 默认导出组件
export default XPreview

// 函数组件
export { createXPreview } from './src/function'
