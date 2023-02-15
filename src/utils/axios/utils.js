import md5 from 'js-md5'
import qs from 'qs'
import { deepTrim } from '@utils'

export const hasOwn = (config, key) => {
  return Object.prototype.hasOwnProperty.call(config, key)
}

// 处理参数
export const disposeParams = config => {
  const key = config.method === 'get' ? 'params' : 'data'
  // 过滤前后空格
  deepTrim(config[key])
}

// 将请求参数排序，防止相同参数生成的hash不同
const sortParams = params => {
  if (typeof params === 'string') {
    params = params ? JSON.parse(params) : {}
  }
  const result = {}
  Object.keys(params)
    .sort()
    .forEach(key => {
      result[key] = params[key]
    })
  return result
}

// 根据method,url,data/params生成唯一key
export const generateKey = config => {
  const target = {
    method: config.method,
    url: config.url,
    ...(config.method === 'get' ? { params: sortParams(config.params) } : {}),
    ...(config.method === 'post' ? { data: sortParams(config.data) } : {})
  }
  return md5(qs.stringify(target))
}

export const generateKey2 = config => {
  const target = {
    method: config.method,
    url: config.url,
    ...(config.method === 'get' ? { params: sortParams(config.params) } : {}),
    ...(config.method === 'post' ? { data: sortParams(config.data) } : {})
  }
  return JSON.stringify(target)
}

export const generateKey3 = config => {
  const { method, url, params, data } = config
  return [method, url, qs.stringify(sortParams(params)), qs.stringify(sortParams(data))].join('&')
}

export const generateKey4 = config => {
  const { method, url, params, data } = config
  return [method, url, JSON.stringify(sortParams(params)), JSON.stringify(sortParams(data))].join(',')
}

export const sleep = delay => new Promise(resolve => setTimeout(resolve, delay))
