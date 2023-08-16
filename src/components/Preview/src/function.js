import XPreview from './index.vue'
import useComponent from '@src/plugins/useComponent'

export const createXPreview = options => {
  const produce = useComponent(XPreview)(options)
  return produce(options)
}
