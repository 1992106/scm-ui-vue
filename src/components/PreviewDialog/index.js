// 导入组件
import XPreviewDialog from './src/index.vue'

// 为组件提供 install 安装方法，供按需引入
XPreviewDialog.install = function (app) {
  app.component(XPreviewDialog.name, XPreviewDialog)
}

// 默认导出组件
export default XPreviewDialog
