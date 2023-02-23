import setupDebounceDirective from './debounce'
import setupThrottleDirective from './throttle'
import setupClickOutsideDirective from './clickOutside'
import setupLazyload from './lazyload'

export function setupDirectives(app) {
  setupDebounceDirective(app)
  setupThrottleDirective(app)
  setupClickOutsideDirective(app)
  setupLazyload(app)
  return app
}
