import * as components from '@components/index'
import * as pages from '@library/index'

const install = function installComponents(app) {
  const list = [...Object.entries(components), ...Object.entries(pages)]
  list.forEach(([componentName, component]) => {
    app.component(componentName, component)
  })
}

export default install

export * from '@components/index'
export * from '@library/index'
