import { getCurrentInstance, onBeforeUnmount, ref, Ref, shallowRef, unref } from 'vue'
import { throttle } from 'lodash-es'
import { isBlank } from '@src/utils/is'
import { useEventListener } from '@hooks/useEventListener'

const domSymbol = Symbol('watermark-dom')

export function useWatermark(appendEl: Ref<HTMLElement | null> = ref(document.body) as Ref<HTMLElement>) {
  const func = throttle(function () {
    const pEl = unref(appendEl)
    if (!pEl) return
    const { clientHeight: height, clientWidth: width } = pEl
    updateWatermark({ height, width })
  }, 200)
  const id = domSymbol.toString()
  const watermarkEl = shallowRef<HTMLElement>()

  const clear = () => {
    const el = unref(watermarkEl) || document.getElementById(`${id}`)
    watermarkEl.value = undefined
    const pEl = unref(appendEl)
    if (!pEl) return
    el && pEl.removeChild(el)
  }

  function createBase64(str: string, data?: string) {
    const can = document.createElement('canvas')
    const width = 300
    const height = 240
    Object.assign(can, { width, height })

    const cans = can.getContext('2d')
    if (cans) {
      cans.rotate((-20 * Math.PI) / 120)
      cans.font = '15px Vedana'
      cans.fillStyle = 'rgba(0, 0, 0, 0.15)'
      cans.textAlign = 'left'
      cans.textBaseline = 'middle'
      cans.fillText(str, width / 20, height)
      data && cans.fillText(data, width / 20, height / 2)
    }
    return can.toDataURL('image/png')
  }

  function updateWatermark(
    options: {
      width?: number
      height?: number
      str?: string
      data?: string
    } = {}
  ) {
    const el = unref(watermarkEl) || document.getElementById(`${id}`)
    if (!el) return
    if (!isBlank(options.width)) {
      el.style.width = `${options.width}px`
    }
    if (!isBlank(options.height)) {
      el.style.height = `${options.height}px`
    }
    if (!isBlank(options.str)) {
      el.style.background = `url(${createBase64(options.str, options.data)}) left top repeat`
    }
  }

  const createWatermark = (str: string, data: string) => {
    const el = unref(watermarkEl) || document.getElementById(`${id}`)
    if (el) {
      updateWatermark({ str, data })
      return id
    }
    const div = document.createElement('div')
    watermarkEl.value = div
    div.id = id
    div.style.pointerEvents = 'none'
    div.style.top = '0px'
    div.style.left = '0px'
    div.style.position = 'absolute'
    div.style.zIndex = '100000'
    const pEl = unref(appendEl)
    if (!pEl) return id
    const { clientHeight: height, clientWidth: width } = pEl
    updateWatermark({ str, data, width, height })
    pEl.appendChild(div)
    return id
  }

  function setWatermark(str: string, data: string) {
    createWatermark(str, data)
    useEventListener(window, 'resize', func)
    const instance = getCurrentInstance()
    if (instance) {
      onBeforeUnmount(() => {
        clear()
      })
    }
  }

  return { setWatermark, clear }
}
