import { getHashByConfig } from '@utils/axios/utils'
import axios from 'axios'

const CancelToken = axios.CancelToken

// 取消前面重复的请求，保留最后一次请求
// 一般用于分页搜索/tab标签切换
/*
 https://mp.weixin.qq.com/s/-y-W_kN7Io_Rk8CaP0C-Sw
 每次执行request拦截器，判断queue中是否还存在同样的url。
 如果存在，则删除数组中的这个api并且执行数组中在pending请求的cancel函数进行请求取消，然后就正常发送第二次请求并且将该api添加到数组中。
 等请求完结后删除数组中的这个api
 */
class CancelBeforeRequest {
  constructor() {
    this.queue = new Map()
  }

  // 添加请求
  addQueue(config) {
    const uniqueKey = getHashByConfig(config)
    config.cancelToken = new CancelToken(cancel => {
      this.queue.set(uniqueKey, cancel)
    })
  }

  // 移除请求
  removeQueue(config, type) {
    const uniqueKey = getHashByConfig(config)
    if (this.queue.has(uniqueKey)) {
      // 如果queue中存在当前请求，则取消当前请求并移除
      const cancel = this.queue.get(uniqueKey)
      // 请求拦截时取消请求；响应拦截时不需要取消
      if (type === 'req') cancel(uniqueKey)
      this.queue.delete(uniqueKey)
    }
  }

  // 清空请求
  clearQueue() {
    for (const [url, cancel] of this.queue) {
      cancel(url)
    }
    this.queue.clear()
  }
}

export default CancelBeforeRequest

// 例子：取消前面重复的请求，保留最后一次请求
const queue = new CancelBeforeRequest()

axios.interceptors.request.use(
  function (config) {
    queue.removeQueue(config, 'req')
    queue.addQueue(config)
    return config
  },
  function (error) {
    return Promise.reject(error)
  }
)

axios.interceptors.response.use(
  function (response) {
    queue.removeQueue(response.config, 'res')
    if (response.data.code === 200) {
      return response
    } else {
      return Promise.reject(new Error('network error:' + response.data.msg))
    }
  },
  function (error) {
    queue.removeQueue(error.response.config, 'res')
    return Promise.reject(error)
  }
)
