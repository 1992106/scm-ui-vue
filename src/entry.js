import * as components from '@components/index'

const install = function installComponents(app) {
  const list = [...Object.entries(components)]
  list.forEach(([componentName, component]) => {
    app.component(componentName, component)
  })
}

export default install

// 基础组件
export * from '@components/index'

// 函数组件
export * from '@components/create'

// export { VXETablePluginSCM } from './plugins/VXETablePluginSCM'
