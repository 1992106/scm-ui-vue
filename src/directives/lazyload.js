import { useIntersectionObserver } from '@src/hooks/useIntersectionObserver'

const setupLazyload = app => {
  app.directive('Lazyload', {
    bind: function (el, binding) {
      const { stop, observer } = useIntersectionObserver({
        target: el,
        onIntersect: entries => {
          entries.forEach(entry => {
            const isIntersecting = entry.isIntersecting || entry.intersectionRatio
            const lazyImage = entry.target
            if (isIntersecting) {
              lazyImage.src = binding.value
              if (observer.value) {
                stop()
              }
            }
          })
        }
      })
    }
  })
}

export default setupLazyload
