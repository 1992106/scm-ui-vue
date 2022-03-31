import * as components from '@components/index'
import * as library from '@library/index'

const install = function installComponents(app) {
  const list = [...Object.entries(components), ...Object.entries(library)]
  list.forEach(([componentName, component]) => {
    app.component(componentName, component)
  })
}

export default install

export * from '@components/index'
export * from '@library/index'

export { VXETablePluginSCM } from './plugins/VXETablePluginSCM'
