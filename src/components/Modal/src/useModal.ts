import { type Component, createApp, h, getCurrentInstance, ref, isVNode, type VNode } from 'vue'
import { ConfigProvider } from 'ant-design-vue'
import XModal from './index'
import { isPromise } from '@utils/is'

interface ModalOptions {
  visible?: boolean
  onOk?: () => void
  onCancel?: () => void
  afterClose?: () => void
  title?: string | VNode
  closeIcon?: VNode
  footer?: null | VNode
  content?: VNode | Component
  globalConfig?: object
}

function useXModal() {
  const appContext = getCurrentInstance()?.appContext

  function createModal(options?: ModalOptions | any) {
    const {
      visible,
      content,
      title,
      closeIcon,
      footer,
      globalConfig = useXModal.defaultGlobalConfig || {},
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
                XModal,
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
                    openValue.value = false
                  },
                  afterClose() {
                    options?.afterClose?.()
                    instance.unmount()
                    container.parentNode?.removeChild(container)
                  }
                },
                {
                  ...(content ? { default: () => (isVNode(content) ? content : h(content)) } : {}),
                  ...(title ? { title: () => title } : {}),
                  ...(closeIcon ? { closeIcon: () => closeIcon } : {}),
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

  return createModal
}

export default useXModal

// ConfigProvider全局化配置
useXModal.defaultGlobalConfig = {}
