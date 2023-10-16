import { createVNode, render as vueRender, VNode } from 'vue'
import { Modal, ModalFuncProps, ModalProps } from 'ant-design-vue'
import { omit } from 'lodash-es'
import { isPromise } from '@utils/is'

type ModalConfigProps = ModalFuncProps & ModalProps
type ConfigUpdate = ModalFuncProps | ((prevConfig: ModalFuncProps) => ModalFuncProps)

const useModal = (config: ModalConfigProps) => {
  const container: any = document.createDocumentFragment()
  let currentConfig = {
    ...omit(config, ['parentContext', 'appContext', 'onOk', 'onCancel']),
    visible: true,
    onOk: e => {
      const _ok = config?.onOk?.(e)
      if (!isPromise(_ok)) {
        return
      }
      _ok.then(
        () => {
          close()
        },
        err => console.error(err)
      )
    },
    onCancel: e => {
      config?.onCancel?.(e)
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
      afterClose: () => {
        if (typeof config.afterClose === 'function') {
          config.afterClose()
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

  function render(props: ModalFuncProps) {
    const vm = createVNode(Modal, { ...props })

    vm.appContext = config.parentContext || config.appContext || vm.appContext
    vueRender(vm, container)
    return vm
  }

  dialogInstance = render(currentConfig)

  return {
    destroy: close,
    update
  }
}

export default useModal
