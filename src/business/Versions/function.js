import XVersions from './index.vue'
import { produce } from '@src/plugins/produce'

export const createXVersions = (options, fn) => {
  produce(XVersions, { visible: true, onDone: fn }, options)
}
