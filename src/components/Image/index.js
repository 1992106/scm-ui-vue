// 导入组件
import XImage from './src/index'

// 为组件提供 install 安装方法，供按需引入
XImage.install = function (app) {
  app.component(XImage.name, XImage)
}

// 默认导出组件
export default XImage
