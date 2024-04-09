// 忽略请求：忽略后面重复的请求，保留第一次请求
// 一般用于提交表单数据时，防止重复
export function onlyResolvesFirst(fn) {
  // 保存第一个请求的 promise 实例
  let pendingPromise = null

  const wrappedFn = (...args) => {
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
    if (pendingPromise === null) {
      // 第一次请求完成后，重置promiseFirst
      pendingPromise = promise.finally(() => (pendingPromise = null))
    } else {
      // 后面重复的请求，都全部取消
      cancel()
    }
    return promise
  }

  return wrappedFn
}
// 使用Promise.race实现
export function onlyResolvesFirst2(fn) {
  let pendingPromise = null

  const wrappedFn = (...args) => {
    let cancel = null
    // 执行当前请求
    const result = fn.apply(this, args)

    const cancelPromise = new Promise((_, reject) => (cancel = reject))
    const promise = Promise.race([result, cancelPromise])
    if (pendingPromise === null) {
      pendingPromise = promise.finally(() => (pendingPromise = null))
    } else {
      cancel && cancel()
    }
    return promise
  }

  return wrappedFn
}

// 使用唯一 id 标识每次请求
export function onlyResolvesFirstById(fn) {
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
      Promise.resolve(result)
        .then(
          value => {
            // 只处理第一次请求
            if (fetchId === 1) {
              resolve(value)
            }
          },
          error => {
            // 只处理第一次请求
            if (fetchId === 1) {
              reject(error)
            }
          }
        )
        .finally(() => (id = 0)) // 第一次请求完成后，重置id=0
    })
  }

  return wrappedFn
}

// 例子：忽略前面重复的请求，保留最后一次请求
const fn = duration =>
  new Promise(r => {
    setTimeout(r, duration)
  })

const wrappedFn = onlyResolvesFirst(fn)

wrappedFn(100).then(() => console.log(1))
wrappedFn(500).then(() => console.log(2))
wrappedFn(1000).then(() => console.log(3))

// 输出 1
