import XPreview from './index.vue'
import useComponent from '@src/plugins/useComponent'

export const useXPreview = options => {
  const produce = useComponent(XPreview)
  return produce(options)
}
