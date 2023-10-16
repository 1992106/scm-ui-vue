import { AppContext, createVNode, render as vueRender, VNode } from 'vue'
import { Drawer, DrawerProps } from 'ant-design-vue'
import { omit } from 'lodash-es'

type DrawerConfigProps = DrawerProps & { appContext: AppContext }
type ConfigUpdate = any | ((prevConfig: any) => any)

const useDrawer = (config: DrawerConfigProps) => {
  const container: any = document.createDocumentFragment()
  let currentConfig = {
    ...omit(config, ['appContext', 'onClose']),
    visible: true,
    onClose: e => {
      config?.onClose?.(e)
      close()
    }
  } as any

  let dialogInstance: VNode | null = null

  function destroy() {
    if (dialogInstance) {
      dialogInstance.component?.update()
      dialogInstance = null
      vueRender(null, container as any)
    }
  }

  function close() {
    currentConfig = {
      ...currentConfig,
      visible: false,
      afterVisibleChange: visible => {
        if (typeof config.afterVisibleChange === 'function') {
          config.afterVisibleChange(visible)
        }
        destroy()
      }
    }
    update(currentConfig)
  }

  function update(configUpdate: ConfigUpdate) {
    if (typeof configUpdate === 'function') {
      currentConfig = configUpdate(currentConfig)
    } else {
      currentConfig = {
        ...currentConfig,
        ...configUpdate
      }
    }
    if (dialogInstance?.component) {
      Object.assign(dialogInstance.component.props, currentConfig)
      dialogInstance.component?.update()
    }
  }

  function render(props: any) {
    const vm = createVNode(Drawer, { ...props })

    vm.appContext = config.appContext || vm.appContext
    vueRender(vm, container)
    return vm
  }

  dialogInstance = render(currentConfig)

  return {
    destroy: close,
    update
  }
}

export default useDrawer
