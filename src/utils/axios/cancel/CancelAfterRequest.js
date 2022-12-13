import { getHashByConfig } from '@utils/axios/utils'
import axios from 'axios'

const CancelToken = axios.CancelToken

// 取消后面重复的请求，保留第一次的请求
// 一般用于提交表单数据时，防止重复
/*
 https://mp.weixin.qq.com/s/-y-W_kN7Io_Rk8CaP0C-Sw
 每次执行request拦截器，判断pendingAjax数组中是否还存在同样的url。
 如果存在，则执行自身的cancel函数进行请求拦截，不重复发送请求，不存在就正常发送并且将该api添加到数组中。
 等请求完结后删除数组中的这个api.
 */
class AfterRequestCancel {
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
    const uniqueKey = getHashByConfig(config)
    if (this.queue.has(uniqueKey)) {
      c ? c(uniqueKey) : this.queue.delete(uniqueKey)
    } else {
      c && this.queue.set(uniqueKey)
    }
  }
}

export default AfterRequestCancel

// 例子：取消后面重复的请求，保留第一次的请求
const queue = new AfterRequestCancel()

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
    queue.removeQueue(error.response.config, 'res')
    return Promise.reject(error)
  }
)
