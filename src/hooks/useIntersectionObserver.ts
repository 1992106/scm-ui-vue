import { Ref, watchEffect, ref } from 'vue'

interface IntersectionObserverProps {
  onIntersect: IntersectionObserverCallback
  target: Ref<Element | null | undefined>
  root?: Ref<any>
  rootMargin?: string
  threshold?: number
}

export function useIntersectionObserver({
  onIntersect,
  target,
  root,
  rootMargin = '0px',
  threshold = 0.1
}: IntersectionObserverProps) {
  let cleanup = () => {}
  const observer: Ref<IntersectionObserver> = ref(null)
  const stopEffect = watchEffect(() => {
    cleanup()

    observer.value = new IntersectionObserver(onIntersect, {
      root: root ? root.value : null,
      rootMargin,
      threshold
    })

    const current = target.value

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
