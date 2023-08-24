import { type Component, createApp, h, getCurrentInstance, ref, isVNode, type VNode } from 'vue'
import { ConfigProvider } from 'ant-design-vue'
import XModal from './index'
import { isFunction, isPromise, isString } from '@utils/is'

interface ModalOptions {
  visible?: boolean
  onOk?: () => void
  onCancel?: () => void
  afterClose?: () => void
  manual?: boolean
  title?: string | VNode | (() => VNode)
  closeIcon?: VNode | (() => VNode)
  footer?: null | VNode | (() => VNode)
  content?: string | VNode | Component | (() => VNode)
  globalConfig?: object
}

function renderSomeContent(someContent) {
  let result = someContent
  if (isFunction(someContent)) {
    result = someContent()
  }
  return isVNode(result) || isString(result) ? result : h(result)
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
      manual = false,
      globalConfig = useXModal.defaultGlobalConfig || {},
      ...props
    } = options || {}
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
                  manual,
                  footer,
                  visible: openValue.value,
                  onOk(e) {
                    const _ok = options?.onOk?.(e)
                    if (!isPromise(_ok)) {
                      // 成功关闭 [null, data]或[null, null]
                      if (Array.isArray(_ok) && _ok.length === 2 && _ok[0] == null) {
                        openValue.value = false
                      }
                      return
                    }
                    _ok.then(
                      () => {
                        if (!manual) {
                          openValue.value = false
                        }
                      },
                      err => console.error(err)
                    )
                  },
                  onCancel(e) {
                    options?.onCancel?.(e)
                    if (!manual) {
                      openValue.value = false
                    }
                  },
                  afterClose() {
                    options?.afterClose?.()
                    instance.unmount()
                    container.parentNode?.removeChild(container)
                  }
                },
                {
                  ...(content ? { default: () => renderSomeContent(content) } : {}),
                  ...(title ? { title: () => renderSomeContent(title) } : {}),
                  ...(closeIcon ? { closeIcon: () => renderSomeContent(closeIcon) } : {}),
                  ...(footer ? { footer: () => renderSomeContent(footer) } : {})
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
