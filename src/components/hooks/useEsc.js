import { onMounted, onUnmounted } from 'vue'

export function useEsc(onExitFullscreen) {
  const exitFullscreen = event => {
    if (event.keyCode === 27) {
      onExitFullscreen?.(event)
    }
  }

  onMounted(() => {
    document.addEventListener('keyup', exitFullscreen)
  })

  onUnmounted(() => {
    document.removeEventListener('keyup', exitFullscreen)
  })
}
