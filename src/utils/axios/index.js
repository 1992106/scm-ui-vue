import httpService from './axios'
import LRUCache from '@utils/axios/LRUCache'
import { getHashByConfig } from '@utils/axios/utils'

const cache = new LRUCache(100)
/**
 * request请求
 * @param url
 * @param params
 * @param method
 * @param options
 * @returns {Promise<unknown>}
 */
export function request(url, params = {}, method = 'post', options = {}) {
  const config = {
    url,
    method,
    ...(method === 'post' ? { data: params } : {}),
    ...(method === 'get' ? { params: params } : {}),
    options
  }
  const key = getHashByConfig(config)
  // 获取缓存
  let instance = cache.get(key)
  if (instance) {
    return instance
  }
  instance = new Promise((resolve, reject) => {
    httpService(config)
      .then((res = {}) => {
        resolve(res)
      })
      .catch(err => {
        reject(err)
      })
  })
  // 是否支持缓存
  const { $cache: hasCache, $cacheDelay: delay = 200 } = config?.options || {}
  if (hasCache) {
    // 设置缓存
    cache.set(key, instance, delay)
  }
  return instance
}

/**
 * post请求
 * @param url
 * @param params
 * @param options
 * @returns {Promise<unknown>}
 */
export async function post(url, params = {}, options = {}) {
  try {
    const res = await request(url, params, 'post', options)
    return res?.data
  } catch (err) {
    return err?.data
  }
}

/**
 * get请求
 * @param url
 * @param params
 * @param options
 * @returns {Promise<unknown>}
 */
export async function get(url, params = {}, options = {}) {
  try {
    const res = await request(url, params, 'get', options)
    return res?.data
  } catch (err) {
    return err?.data
  }
}
