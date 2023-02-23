import { Ref, watchEffect, ref } from 'vue'
import { unrefElement } from './utils'

interface IntersectionObserverProps {
  target: Ref<Element | null | undefined> | Element
  onIntersect: IntersectionObserverCallback
  options?: IntersectionObserverInit
}

export function useIntersectionObserver({ target, onIntersect, options = {} }: IntersectionObserverProps) {
  let cleanup = () => {}
  const observer: Ref<IntersectionObserver> = ref(null)
  const stopEffect = watchEffect(() => {
    cleanup()

    const { root, rootMargin = '0px', threshold = 0.1 } = options
    observer.value = new IntersectionObserver(onIntersect, {
      root,
      rootMargin,
      threshold
    })

    const current = unrefElement(target)

    current && observer.value.observe(current)

    cleanup = () => {
      if (observer.value) {
        observer.value.disconnect()
        current && observer.value.unobserve(current)
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
