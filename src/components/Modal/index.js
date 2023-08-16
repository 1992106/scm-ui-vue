// 导入组件
import XModal from './src/index'

// 为组件提供 install 安装方法，供按需引入
XModal.install = function (app) {
  app.component(XModal.name, XModal)
}

// 默认导出组件
export default XModal

// 函数组件
export { default as useXModal } from './src/useModal'
