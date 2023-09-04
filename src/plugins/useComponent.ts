import {
  type AppContext,
  type Component,
  type ComponentPublicInstance,
  createVNode,
  getCurrentInstance,
  ref,
  render,
  type VNode
} from 'vue'
import { ConfigProvider } from 'ant-design-vue'

// https://juejin.cn/post/7253062314306322491
export interface Options {
  visible?: boolean
  appendTo?: HTMLElement | string
  globalConfig?: object
  [key: string]: unknown
}

export interface UseComponent {
  (options: Options): VNode
  unmount: () => void
}

const getAppendToElement = (props: Options): HTMLElement => {
  let appendTo: HTMLElement | null = document.body
  if (props.appendTo) {
    if (typeof props.appendTo === 'string') {
      appendTo = document.querySelector<HTMLElement>(props.appendTo)
    }
    if (props.appendTo instanceof HTMLElement) {
      appendTo = props.appendTo
    }
    if (!(appendTo instanceof HTMLElement)) {
      appendTo = document.body
    }
  }
  return appendTo
}

const initInstance = <T extends Component>(
  Component: T,
  props: Options,
  container: HTMLElement,
  appContext: AppContext | null = null
) => {
  const { globalConfig = useComponent.defaultGlobalConfig || {}, ...restProps } = props
  let vNode
  const instance = createVNode(
    ConfigProvider,
    { ...globalConfig, notUpdateGlobalConfig: true },
    {
      default: () => {
        vNode = createVNode(Component, restProps)
        vNode.appContext = appContext
        return vNode
      }
    }
  )
  render(instance, container)

  getAppendToElement(restProps).appendChild(container)
  return vNode
}

const useComponent = <T extends Component>(Component: T): UseComponent => {
  const appContext = getCurrentInstance()?.appContext
  if (appContext) {
    // 获取当前组件树的provides
    const currentProvides = (getCurrentInstance() as any)?.provides || {}
    Reflect.set(appContext, 'provides', { ...appContext.provides, ...currentProvides })
  }

  const container = document.createElement('div')

  const _unmount = () => {
    render(null, container)
    container.parentNode?.removeChild(container)
  }

  const withComponent = (options: Options): VNode => {
    const { visible, onCancel, onOk, onClose, onDone, ...props } = options || {}
    // v-model:visible
    const openValue = ref(visible ?? true)
    const setVisible = visible => {
      openValue.value = visible
      if (!visible) {
        _unmount()
      }
    }

    // 兼容 onClose/onCancel/onOk/onDone
    const _onEvent = (fn, args = []) => {
      fn?.apply(this, args)
      _unmount()
    }

    const vNode = initInstance<T>(
      Component,
      {
        ...props,
        visible: openValue.value,
        'onUpdate:visible': setVisible,
        ...(onCancel ? { onCancel: (...args) => _onEvent(onCancel, args) } : {}),
        ...(onOk ? { onOk: (...args) => _onEvent(onOk, args) } : {}),
        ...(onClose ? { onClose: (...args) => _onEvent(onClose, args) } : {}),
        ...(onDone ? { onDone: (...args) => _onEvent(onDone, args) } : {})
      },
      container,
      appContext
    )
    const vm = vNode.component?.proxy as ComponentPublicInstance<Options>
    for (const prop in options) {
      if (!Reflect.has(vm.$props, prop)) {
        vm[prop as keyof ComponentPublicInstance] = options[prop]
      }
    }
    return vNode
  }

  withComponent.unmount = _unmount

  return withComponent
}

export default useComponent

// ConfigProvider全局化配置
useComponent.defaultGlobalConfig = {}
