import axios from 'axios'
import { generateKey } from '@utils/axios/utils'

const CancelToken = axios.CancelToken

// 取消后面重复的请求，保留第一次的请求
// 一般用于提交表单数据时，防止重复
/*
 https://mp.weixin.qq.com/s/-y-W_kN7Io_Rk8CaP0C-Sw
 每次执行request拦截器，判断pendingAjax数组中是否还存在同样的url。
 如果存在，则执行自身的cancel函数进行请求拦截，不重复发送请求，不存在就正常发送并且将该api添加到数组中。
 等请求完结后删除数组中的这个api.
 */
class CancelAfterRequest {
  constructor() {
    this.queue = new Set()
  }

  // 添加请求
  addQueue(config) {
    config.cancelToken = new CancelToken(cancel => {
      this.removeQueue(config, cancel)
    })
  }

  // 移除请求
  removeQueue(config, c) {
    const uniqueKey = generateKey(config)
    if (this.queue.has(uniqueKey)) {
      // queue中存在当前请求
      // 如果有取消方法（在请求请求时），则直接取消当前请求
      // 如果没有取消方法（在请求响应时），则只需要删除key
      c ? c() : this.queue.delete(uniqueKey)
    } else {
      // queue中不存在当前请求，并且有取消方法；则说明是新请求添加key
      c && this.queue.add(uniqueKey)
    }
  }
}

export default CancelAfterRequest

// 例子：取消后面重复的请求，保留第一次的请求
const queue = new CancelAfterRequest()

axios.interceptors.request.use(
  function (config) {
    queue.addQueue(config)
    return config
  },
  function (error) {
    return Promise.reject(error)
  }
)

axios.interceptors.response.use(
  function (response) {
    queue.removeQueue(response.config)
    if (response.data.code === 200) {
      return response
    } else {
      return Promise.reject(new Error('network error:' + response.data.msg))
    }
  },
  function (error) {
    queue.removeQueue(error.response.config)
    return Promise.reject(error)
  }
)
