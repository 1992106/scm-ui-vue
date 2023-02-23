import { Ref, watchEffect, ref } from 'vue'
import { unrefElement } from './utils'

interface MutationObserverProps {
  target: Ref<Element | null | undefined> | Element
  onMutation: MutationCallback
  options?: MutationObserverInit
}

export function useMutationObserver({ target, onMutation, options = {} }: MutationObserverProps) {
  let cleanup = () => {}
  const observer: Ref<MutationObserver> = ref(null)
  const stopEffect = watchEffect(() => {
    cleanup()

    observer.value = new MutationObserver(onMutation)

    const current = unrefElement(target)

    current &&
      observer.value.observe(current, {
        childList: true,
        attributes: true,
        subtree: true,
        ...options
      })

    cleanup = () => {
      if (observer.value) {
        observer.value.disconnect()
      }
    }
  })

  return {
    observer,
    stop: () => {
      cleanup()
      stopEffect()
    }
  }
}
