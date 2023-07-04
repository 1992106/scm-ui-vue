import { ref, unref } from 'vue'
import { isFunction, isBlank, isWindow } from '@src/utils'

export interface ScrollToParams {
  el: any
  top?: number
  left?: number
  duration?: number
  callback?: () => any
}

const easeInOutQuad = (t: number, b: number, c: number, d: number) => {
  t /= d / 2
  if (t < 1) {
    return (c / 2) * t * t + b
  }
  t--
  return (-c / 2) * (t * (t - 2) - 1) + b
}

const position = (el: HTMLElement | Window) => {
  if (isWindow(el)) {
    return { x: window.scrollX, y: window.scrollY }
  } else {
    return { x: (el as Element).scrollLeft, y: (el as Element).scrollTop }
  }
}

const move = (el: HTMLElement | Window, x: number, y: number) => {
  if (isWindow(el)) {
    window.scrollTo(x, y)
  } else {
    ;(el as Element).scrollLeft = x
    ;(el as Element).scrollTop = y
  }
}

export function useScrollTo({ el, left, top, duration = 500, callback }: ScrollToParams) {
  const isActiveRef = ref(false)
  const { x, y } = position(el)
  const changeX = left - x
  const changeY = top - y
  const increment = 20
  let currentTime = 0
  duration = isBlank(duration) ? 500 : duration

  const animateScroll = function () {
    if (!unref(isActiveRef)) {
      return
    }
    currentTime += increment
    const xx = easeInOutQuad(currentTime, x, changeX, duration)
    const yy = easeInOutQuad(currentTime, y, changeY, duration)
    move(el, xx, yy)
    if (currentTime < duration && unref(isActiveRef)) {
      requestAnimationFrame(animateScroll)
    } else {
      if (callback && isFunction(callback)) {
        callback()
      }
    }
  }

  const run = () => {
    isActiveRef.value = true
    animateScroll()
  }

  const stop = () => {
    isActiveRef.value = false
  }

  return { start: run, stop }
}
