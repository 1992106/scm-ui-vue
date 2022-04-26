import * as components from '@components/index'
import * as business from '@business/index'

const install = function installComponents(app) {
  const list = [...Object.entries(components), ...Object.entries(business)]
  list.forEach(([componentName, component]) => {
    app.component(componentName, component)
  })
}

export default install

export * from '@components/index'
export * from '@business/index'

// 函数调用
export * from '@components/create'
export * from '@business/create'

// export { VXETablePluginSCM } from './plugins/VXETablePluginSCM'
