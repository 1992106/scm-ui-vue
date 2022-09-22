// 导入组件
import XUploadDialog from './src/index.vue'

// 为组件提供 install 安装方法，供按需引入
XUploadDialog.install = function (app) {
  app.component(XUploadDialog.name, XUploadDialog)
}

// 默认导出组件
export default XUploadDialog
