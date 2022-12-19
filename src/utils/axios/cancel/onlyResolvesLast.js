// 忽略请求：忽略前面重复的请求，保留最后一次请求
// 一般用于分页搜索/tab标签切换
/*
 https://mp.weixin.qq.com/s/M2-XXPdLKlTqzGefz7UPvA
 不依赖请求的 API，更加通用，更容易抽象和封装。本质上所有的异步方法都可以使用 onlyResolvesLast 来忽略过期的调用。
 */
export function onlyResolvesLast(fn) {
  // 保存上一个请求的 cancel 方法
  let cancelPrevious = null

  const wrappedFn = (...args) => {
    // 当前请求执行前，先 cancel 上一个请求
    cancelPrevious && cancelPrevious()
    // 执行当前请求
    const result = fn.apply(this, args)

    // 创建指令式的 promise
    const createImperativePromise = promiseArg => {
      let resolve = null
      let reject = null

      const wrappedPromise = new Promise((_resolve, _reject) => {
        resolve = _resolve
        reject = _reject
      })

      promiseArg &&
        promiseArg.then(
          value => {
            resolve && resolve(value)
          },
          error => {
            reject && reject(error)
          }
        )

      return {
        promise: wrappedPromise,
        resolve: value => {
          resolve && resolve(value)
        },
        reject: error => {
          reject && reject(error)
        },
        cancel: () => {
          resolve = null
          reject = null
        }
      }
    }
    const { promise, cancel } = createImperativePromise(result)
    cancelPrevious = cancel

    return promise
  }

  return wrappedFn
}

// 使用唯一 id 标识每次请求
export function onlyResolvesLastById(fn) {
  // 利用闭包保存最新的请求 id
  let id = 0

  const wrappedFn = (...args) => {
    // 发起请求前，生成新的 id 并保存
    const fetchId = id + 1
    id = fetchId

    // 执行请求
    const result = fn.apply(this, args)

    return new Promise((resolve, reject) => {
      // result 可能不是 promise，需要包装成 promise
      Promise.resolve(result).then(
        value => {
          // 只处理最新一次请求
          if (fetchId === id) {
            resolve(value)
          }
        },
        error => {
          // 只处理最新一次请求
          if (fetchId === id) {
            reject(error)
          }
        }
      )
    })
  }

  return wrappedFn
}

// 例子：忽略前面重复的请求，保留最后一次请求
const fn = duration =>
  new Promise(r => {
    setTimeout(r, duration)
  })

const wrappedFn = onlyResolvesLast(fn)

wrappedFn(100).then(() => console.log(1))
wrappedFn(500).then(() => console.log(2))
wrappedFn(1000).then(() => console.log(3))

// 输出 3
