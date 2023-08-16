import { createVNode, getCurrentInstance, render } from 'vue'

export const produce = (Component, options) => {
  const appContext = getCurrentInstance()?.appContext
  const container = document.createDocumentFragment()

  const instance = createVNode(Component, { visible: true, ...options })
  instance.appContext = appContext
  render(instance, container)
  document.body.appendChild(container)

  instance.unmount = () => {
    render(null, container)
    container.parentNode?.removeChild(container)
  }

  return instance
}

// import { createApp, h, getCurrentInstance } from 'vue'
// export const produce = (Component, options) => {
//   const appContext = getCurrentInstance()?.appContext
//   const root = document.createElement('div')
//   document.body.append(root)
//
//   const instance = createApp({
//     render() {
//       return h(Component, { visible: true, ...options })
//     }
//   })
//   // 注入应用的上下文
//   if (appContext) {
//     instance.config.globalProperties = appContext.config.globalProperties
//     instance.mixin({
//       ...appContext.mixins,
//       components: appContext.components,
//       directives: appContext.directives,
//       provides: appContext.provides
//     })
//   }
//   instance.mount(root)
//
//   return instance
// }
