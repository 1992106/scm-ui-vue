import { type Component, createApp, h, getCurrentInstance, ref, isVNode, type VNode } from 'vue'
import { ConfigProvider } from 'ant-design-vue'
import XDrawer from './index'
import { isPromise } from '@utils/is'

interface DrawerOptions {
  visible?: boolean
  onOk?: () => void
  onCancel?: () => void
  afterClose?: () => void
  onClose?: () => void // 兼容 antdv
  onAfterVisibleChange?: () => void // 兼容 antdv
  title?: string | VNode
  footer?: null | VNode
  content?: VNode | Component
  globalConfig?: object
}

function useXDrawer() {
  const appContext = getCurrentInstance()?.appContext

  function createDrawer(options?: DrawerOptions | any) {
    const {
      visible,
      content,
      title,
      closeIcon,
      extra,
      footer,
      globalConfig = useXDrawer.defaultGlobalConfig,
      onClose,
      onAfterVisibleChange,
      ...props
    } = options
    const openValue = ref(visible ?? true)

    const container = document.createElement('div')
    document.body.appendChild(container)

    const instance = createApp({
      render() {
        return h(
          ConfigProvider,
          { ...globalConfig, notUpdateGlobalConfig: true },
          {
            default: () =>
              h(
                XDrawer,
                {
                  ...props,
                  footer,
                  visible: openValue.value,
                  onOk(e) {
                    const _ok = options?.onOk?.(e)
                    if (!isPromise(_ok)) {
                      openValue.value = false
                      return
                    }
                    _ok.then(
                      () => (openValue.value = false),
                      err => console.error(err)
                    )
                  },
                  onCancel(e) {
                    options?.onCancel?.(e)
                    onClose?.()
                    openValue.value = false
                  },
                  afterClose() {
                    options?.afterClose?.()
                    onAfterVisibleChange?.(false)
                    instance.unmount()
                    container.parentNode?.removeChild(container)
                  }
                },
                {
                  ...(content ? { default: () => (isVNode(content) ? content : h(content)) } : {}),
                  ...(title ? { title: () => title } : {}),
                  ...(closeIcon ? { closeIcon: () => closeIcon } : {}),
                  ...(extra ? { extra: () => extra } : {}),
                  ...(footer ? { footer: () => footer } : {})
                }
              )
          }
        )
      }
    })

    // 注入应用的上下文
    if (appContext) {
      instance.config.globalProperties = appContext.config.globalProperties
      instance.mixin({
        ...appContext.mixins,
        components: appContext.components,
        directives: appContext.directives,
        provides: appContext.provides
      })
    }

    function open() {
      onAfterVisibleChange?.(true)
      openValue.value = true
      instance.mount(container)
    }
    function close() {
      openValue.value = false
    }

    // 默认直接打开弹窗
    visible !== false && open()

    return {
      open,
      close
    }
  }

  return createDrawer
}

export default useXDrawer

// ConfigProvider全局化配置
useXDrawer.defaultGlobalConfig = {}
