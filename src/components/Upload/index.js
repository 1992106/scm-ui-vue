// 导入组件
import XUpload from './src/index.vue'

// 为组件提供 install 安装方法，供按需引入
XUpload.install = function (app) {
  app.component(XUpload.name, XUpload)
}

// 默认导出组件
export default XUpload
