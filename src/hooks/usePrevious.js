import { customRef, readonly, shallowRef, ref, toRef as vueToRef, watch } from 'vue'

export const noop = () => {}

export function toRef(...args) {
  if (args.length !== 1) {
    return vueToRef(...args)
  }
  const r = args[0]
  return typeof r === 'function' ? readonly(customRef(() => ({ get: r, set: noop }))) : ref(r)
}

export function usePrevious(value, initialValue) {
  const previous = shallowRef(initialValue)

  watch(
    toRef(value),
    (_, oldValue) => {
      previous.value = oldValue
    },
    { flush: 'sync' }
  )

  return readonly(previous)
}
