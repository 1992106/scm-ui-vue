import { ref } from 'vue'
import { useEventListener } from '@hooks/useEventListener'

export function useFullscreen(target, { fullscreen }, callback = () => {}) {
  const canFullscreen = ref(false)

  // 全屏切换
  const toggleFullscreen = () => {
    if (!fullscreen) return
    canFullscreen.value = !canFullscreen.value
    callback?.()
  }

  // ESC关闭全屏功能
  const exitFullscreen = $event => {
    if ($event?.keyCode === 27 && canFullscreen.value) {
      canFullscreen.value = false
      callback?.()
    }
  }

  if (fullscreen) {
    useEventListener(document, 'keyup', exitFullscreen)
  }

  return {
    canFullscreen,
    toggleFullscreen
  }
}
