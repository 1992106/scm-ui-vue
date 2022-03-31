import { formats } from './vxe-table/formats'

// VXETable渲染器
export const VXETablePluginSCM = {
  install(vxetablecore) {
    const { renderer } = vxetablecore

    renderer.mixin(formats)
  }
}
