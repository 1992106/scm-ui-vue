import { getCurrentScope, onScopeDispose, unref } from 'vue'
import { isClient } from '@src/utils'

export const defaultWindow = isClient ? window : undefined
export const defaultDocument = isClient ? window.document : undefined
export const defaultNavigator = isClient ? window.navigator : undefined
export const defaultLocation = isClient ? window.location : undefined

export const noop = () => {}

export const now = () => Date.now()
export const timestamp = () => +Date.now()

export const clamp = (n, min, max) => Math.min(max, Math.max(min, n))
export const rand = (min, max) => {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function unrefElement(elRef) {
  const plain = unref(elRef)
  return plain?.$el ?? plain
}

export function tryOnScopeDispose(fn) {
  // 如果有活跃的effect
  if (getCurrentScope()) {
    // 在当前活跃的 effect 作用域上注册一个处理回调。该回调会在相关的 effect 作用域结束之后被调用
    // 能代替 onUnmounted
    onScopeDispose(fn)
    return true
  }
  return false
}
