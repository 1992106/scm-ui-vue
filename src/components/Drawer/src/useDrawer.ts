import { type Component, createApp, h, getCurrentInstance, ref, isVNode, type VNode } from 'vue'
import { ConfigProvider } from 'ant-design-vue'
import XDrawer from './index'
import { isFunction, isPromise, isString } from '@utils/is'

interface DrawerOptions {
  visible?: boolean
  onOk?: () => void
  onCancel?: () => void
  afterClose?: () => void
  onClose?: () => void // 兼容 antdv
  onAfterVisibleChange?: () => void // 兼容 antdv
  manual?: boolean
  title?: string | VNode | (() => VNode)
  closeIcon?: VNode | (() => VNode)
  extra?: VNode | (() => VNode)
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

function useXDrawer() {
  const appContext = getCurrentInstance()?.appContext
  // 获取当前组件树的provides
  const currentProvides = (getCurrentInstance() as any)?.provides || {}

  function createDrawer(options?: DrawerOptions | any) {
    const {
      visible,
      content,
      title,
      closeIcon,
      extra,
      footer,
      onClose,
      onAfterVisibleChange,
      manual = false,
      globalConfig = useXDrawer.defaultGlobalConfig,
      ...props
    } = options || {}
    const openValue = ref(visible ?? true)

    const container = document.createElement('div')
    document.body.appendChild(container)

    let drawerVM
    const instance = createApp({
      render() {
        return h(
          ConfigProvider,
          { ...globalConfig, notUpdateGlobalConfig: true },
          {
            default: () => {
              drawerVM = h(
                XDrawer,
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
                    onClose?.()
                    if (!manual) {
                      openValue.value = false
                    }
                  },
                  afterClose() {
                    options?.afterClose?.()
                    onAfterVisibleChange?.(false)
                    instance.unmount()
                    container.parentNode?.removeChild(container)
                  }
                },
                {
                  ...(content ? { default: () => renderSomeContent(content) } : {}),
                  ...(title ? { title: () => renderSomeContent(title) } : {}),
                  ...(closeIcon ? { closeIcon: () => renderSomeContent(closeIcon) } : {}),
                  ...(extra ? { extra: () => renderSomeContent(extra) } : {}),
                  ...(footer ? { footer: () => renderSomeContent(footer) } : {})
                }
              )
              return drawerVM
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
      if (drawerVM) {
        for (const prop in currentConfig) {
          if (Reflect.has(drawerVM.component.props, prop)) {
            Object.assign(drawerVM.component.props, { [prop]: currentConfig[prop] })
          } else {
            Object.assign(drawerVM.component.attrs, { [prop]: currentConfig[prop] })
          }
        }
        drawerVM.component.update()
      }
    }

    function open() {
      openValue.value = true
      onAfterVisibleChange?.(true)
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

  return createDrawer
}

export default useXDrawer

// ConfigProvider全局化配置
useXDrawer.defaultGlobalConfig = {}
