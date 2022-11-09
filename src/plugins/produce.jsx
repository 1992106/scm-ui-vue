import { createVNode, render } from 'vue'
import { ConfigProvider } from 'ant-design-vue'
import zhCn from 'ant-design-vue/es/locale/zh_CN'

export const produce = (Component, defaultProps, options) => {
  const container = document.createDocumentFragment()
  const Wrapper = props => {
    return (
      <ConfigProvider locale={zhCn}>
        <Component {...props} />
      </ConfigProvider>
    )
  }
  const instance = createVNode(Wrapper, { ...defaultProps, ...options })
  render(instance, container)
  document.body.appendChild(container)

  return instance
}

// import { createApp, h } from 'vue'
// export const produce = (Component, defaultProps, options) => {
//   const root = document.createElement('div')
//   document.body.append(root)
//   const instance = createApp({
//     render() {
//       return h(Component, { ...defaultProps, ...options })
//     }
//   })
//   instance.mount(root)
//   return instance
// }
