class LRUCache {
  constructor(capacity) {
    if (typeof capacity !== 'number' || capacity < 0) {
      throw new TypeError('capacity必须是一个非负数')
    }
    this.capacity = capacity
    this.cache = new Map()
  }

  // 获取缓存
  get(key) {
    if (!this.cache.has(key)) {
      return null
    }
    const value = this.cache.get(key)
    // 将当前缓存移动到最新位置
    this.cache.delete(key)
    this.cache.set(key, value)
    return value
  }

  // 设置缓存
  set(key, value, delay = 0) {
    // 如果缓存存在，则更新缓存位置
    if (this.cache.has(key)) {
      this.cache.delete(key)
    }
    this.cache.set(key, value)

    // 如果缓存容量已满，删除最久远的缓存数据
    if (this.cache.size >= this.capacity) {
      // 获取最久一条数据的key
      const lastKey = this.cache.keys().next().value
      this.cache.delete(lastKey)
    }
    // 如果delay===0，表示永久缓慢；
    // 如果delay > 0，表明临时缓存；延迟后立即删除缓存
    if (delay > 0) {
      setTimeout(() => {
        this.cache.delete(key)
      }, delay)
    }
  }

  // 删除缓存
  delete(key) {
    this.cache.delete(key)
  }
}

export default LRUCache
