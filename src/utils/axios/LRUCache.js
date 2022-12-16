import { getHashByConfig } from '@utils/axios/utils'

class LRUCache {
  constructor(capacity) {
    if (typeof capacity !== 'number' || capacity < 0) {
      throw new TypeError('capacity必须是一个非负数')
    }
    this.capacity = capacity
    this.cache = new Map()
  }

  // 获取缓存
  get(config) {
    const key = getHashByConfig(config)
    const value = this.cache.get(key)
    if (value) {
      // 将当前的缓存移动到最常用的位置
      this.cache.delete(key)
      this.cache.set(key, value)
      return value
    }
  }

  // 设置缓存
  set(config, value, delay = 0) {
    const key = getHashByConfig(config)
    if (this.cache.has(key)) {
      // 如果缓存存在更新缓存位置
      this.cache.delete(key)
    } else if (this.cache.size >= this.capacity) {
      // 如果缓存容量已满，删除最近最少使用的缓存
      const lastKey = Array.from(this.cache.keys()).slice(-1)[0]
      this.cache.delete(lastKey)
    }
    this.cache.set(key, value)
    // 如果delay===0，表示永久缓慢；
    // 如果delay!==0，表明临时缓存；延迟后立即删除缓存
    if (delay !== 0) {
      setTimeout(() => {
        this.cache.delete(key)
      }, delay)
    }
  }
}

export default LRUCache
