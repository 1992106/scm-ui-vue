// 导入组件
import XList from './src/index.vue'

// 为组件提供 install 安装方法，供按需引入
XList.install = function (app) {
  app.component(XList.name, XList)
}

// 默认导出组件
export default XList
