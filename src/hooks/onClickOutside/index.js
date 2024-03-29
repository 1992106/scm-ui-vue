import { ref } from 'vue'
import { useEventListener } from '../useEventListener'
import { defaultWindow, unrefElement } from '../utils'

export function onClickOutside(target, handler, options = {}) {
  const { window = defaultWindow, ignore, capture = true } = options

  if (!window) return

  const shouldListen = ref(true)

  let fallback

  const listener = e => {
    window.clearTimeout(fallback)

    const el = unrefElement(target)
    const composedPath = e.composedPath()

    if (!el || el === e.target || composedPath.includes(el) || !shouldListen.value) return

    if (ignore && ignore.length > 0) {
      if (
        ignore.some(target => {
          const el = unrefElement(target)
          return el && (e.target === el || composedPath.includes(el))
        })
      )
        return
    }

    handler(e)
  }

  const cleanup = [
    useEventListener(window, 'click', listener, { passive: true, capture }),
    useEventListener(
      window,
      'pointerdown',
      e => {
        const el = unrefElement(target)
        shouldListen.value = !!el && !e.composedPath().includes(el)
      },
      { passive: true }
    ),
    useEventListener(
      window,
      'pointerup',
      e => {
        fallback = window.setTimeout(() => listener(e), 50)
      },
      { passive: true }
    )
  ]

  return () => cleanup.forEach(fn => fn())
}
