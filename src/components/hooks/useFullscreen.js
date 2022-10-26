import { ref } from 'vue'
import { useEventListener } from '@hooks/useEventListener'

export function useFullscreen(target, { fullscreen }, callback) {
  const canFullscreen = ref(false)

  // 全屏切换
  const toggleFullscreen = $event => {
    if (!fullscreen) return
    // 通过ESC操作
    if ($event?.keyCode === 27) {
      // ESC关闭全屏功能
      if (canFullscreen.value) {
        canFullscreen.value = false
      }
    } else {
      // 点击鼠标操作
      canFullscreen.value = !canFullscreen.value
    }
    callback && callback()
  }

  useEventListener(document, 'keyup', toggleFullscreen)

  return {
    canFullscreen,
    toggleFullscreen
  }
}
