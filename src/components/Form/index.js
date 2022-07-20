// 导入组件
import XForm from './src/index.vue'

// 为组件提供 install 安装方法，供按需引入
XForm.install = function (app) {
  app.component(XForm.name, XForm)
}

// 默认导出组件
export default XForm
