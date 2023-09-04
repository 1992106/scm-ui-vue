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

function isReject(result) {
  // 失败：[error, undefined]或[null, undefined]
  return Array.isArray(result) && result.length === 2 && result[0] != null
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
  // 获取当前组件树的provides
  const currentProvides = (getCurrentInstance() as any)?.provides || {}

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

    let modalVM
    const instance = createApp({
      render() {
        return h(
          ConfigProvider,
          { ...globalConfig, notUpdateGlobalConfig: true },
          {
            default: () => {
              modalVM = h(
                XModal,
                {
                  ...props,
                  manual,
                  footer,
                  visible: openValue.value,
                  onOk(e) {
                    const _ok = options?.onOk?.(e)
                    if (!isPromise(_ok)) {
                      return
                    }
                    _ok.then(
                      res => {
                        if (!isReject(res) && !manual) {
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
              return modalVM
            }
          }
        )
      }
    })

    // 注入应用的上下文
    if (appContext) {
      instance.config.globalProperties = appContext.config.globalProperties
      Reflect.set(instance._context, 'components', appContext.components)
      Reflect.set(instance._context, 'directives', appContext.directives)
      Reflect.set(instance._context, 'provides', { ...appContext.provides, ...currentProvides })
    }

    function update(configUpdate) {
      let currentConfig = { ...configUpdate }
      if (typeof configUpdate === 'function') {
        currentConfig = configUpdate(options)
      }
      if (modalVM) {
        for (const prop in currentConfig) {
          if (Reflect.has(modalVM.component.props, prop)) {
            Object.assign(modalVM.component.props, { [prop]: currentConfig[prop] })
          } else {
            Object.assign(modalVM.component.attrs, { [prop]: currentConfig[prop] })
          }
        }
        modalVM.component.update()
      }
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
      close,
      update
    }
  }

  return createModal
}

export default useXModal

// ConfigProvider全局化配置
useXModal.defaultGlobalConfig = {}
