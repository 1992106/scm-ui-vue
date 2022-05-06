import dayjs from 'dayjs'

/**
 * 获取对象tag
 * @param value
 * @returns {string}
 */
export const getTag = value => {
  return Object.prototype.toString.call(value)
}

/**
 * 获取对象类型
 * @param value
 * @returns {string}
 */
export const getType = value => {
  return getTag(value).slice(8, -1).toLowerCase()
}

/**
 * 是否为空
 * @param value
 * @returns {boolean}
 */
export const isEmpty = value => {
  if (value == null) {
    return true
  }
  if (Array.isArray(value) || typeof value === 'string' || value instanceof String) {
    return value.length === 0
  }
  if (value instanceof Map || value instanceof Set) {
    return value.size === 0
  }
  if (getTag(value) === '[object Object]') {
    return Object.keys(value).length === 0
  }
  return false
}

/**
 * 是否是promise
 * @param obj
 * @returns {boolean}
 */
export const isPromise = obj => {
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function'
}

/**
 * 四舍五入
 * @param value 需要舍入的数
 * @param length 保留小数点后位数
 */
export const toFixed = (value, length = 2) => {
  if (typeof value === 'string') {
    value = Number(value)
  }
  if (typeof value !== 'number') {
    throw new Error('value不是数字')
  }
  return Math.round(Math.pow(10, length) * value) / Math.pow(10, length)
}

/**
 * 获取像素大小
 * @param val
 * @returns {number|null|number}
 */
export const getPixelSize = val => {
  if (typeof val === 'number') {
    return val
  }
  if (typeof val === 'string' && (val.endsWith('px') || val.endsWith('PX') || !Number.isNaN(+val))) {
    return parseFloat(val)
  }
  return null
}

/**
 * 字符串前后去空
 * @param string
 * @returns {string}
 */
export const trim = string => {
  return (string || '').replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g, '')
}

/**
 * 获取滚抽条大小
 * @returns {number}
 */
let scrollBarWidth
export const getScrollBarSize = () => {
  if (scrollBarWidth === undefined) {
    const inner = document.createElement('div')
    inner.style.width = '100%'
    inner.style.height = '200px'

    const outer = document.createElement('div')
    const outerStyle = outer.style

    outerStyle.position = 'absolute'
    outerStyle.top = 0
    outerStyle.left = 0
    outerStyle.pointerEvents = 'none'
    outerStyle.visibility = 'hidden'
    outerStyle.width = '200px'
    outerStyle.height = '150px'
    outerStyle.overflow = 'hidden'

    outer.appendChild(inner)

    document.body.appendChild(outer)

    var widthContained = inner.offsetWidth
    outer.style.overflow = 'scroll'
    var widthScroll = inner.offsetWidth

    if (widthContained === widthScroll) {
      widthScroll = outer.clientWidth
    }

    document.body.removeChild(outer)

    scrollBarWidth = widthContained - widthScroll
  }
  return scrollBarWidth
}

/**
 * 广度递归遍历树
 * @param tree
 * @param callback
 */
export const recursive = (tree, callback) => {
  if (!Array.isArray(tree)) tree = []
  let node,
    list = [...tree]
  while ((node = list.shift())) {
    callback(node)
    node.children && list.push(...node.children)
  }
}

/**
 * 对象赋值
 * @param {Object} target 要赋值的对象
 * @param {Object} source 获取赋值数据的对象
 * @return {Object} 返回赋值后的target
 */
export function polyfill(target, source) {
  const obj = {}
  Object.keys(target).forEach(key => {
    if (getType(target[key]) === 'object') {
      obj[key] = isEmpty(source[key]) ? target[key] : polyfill(target[key], source[key])
    } else {
      obj[key] = isEmpty(source[key]) ? target[key] : source[key]
    }
  })
  return obj
}

/**
 * 格式化时间
 * @param date
 * @param fmt
 * @returns {*}
 */
export function dateFormat(date, fmt) {
  date = new Date(date)
  const o = {
    'M+': date.getMonth() + 1, // 月
    'q+': Math.floor((date.getMonth() + 3) / 3), // 季节
    'd+': date.getDate(), // 日
    'H+': date.getHours(), // 时
    'm+': date.getMinutes(), // 分
    's+': date.getSeconds(), // 秒
    S: date.getMilliseconds() // 毫秒
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  for (let k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length))
    }
  }
  return fmt
}

export function formatDate(value, format) {
  return dateFormat(value, format || 'yyyy-MM-dd')
}

export function formatTime(value, format) {
  return dateFormat(value, format || 'yyyy-MM-dd HH:mm:ss')
}

export const dayjsToDate = (value, valueFormat = 'YYYY-MM-DD') => {
  if (Array.isArray(value)) {
    return value.map(val => (dayjs.isDayjs(val) ? val.format(valueFormat) : val))
  } else {
    return dayjs.isDayjs(value) ? value.format(valueFormat) : value
  }
}

export const dateToDayjs = (value, valueFormat = 'YYYY-MM-DD') => {
  if (Array.isArray(value)) {
    return value.map(val => (isEmpty(val) ? null : dayjs.isDayjs(val) ? val : dayjs(val, valueFormat)))
  } else {
    return isEmpty(value) ? null : dayjs.isDayjs(value) ? value : dayjs(value, valueFormat)
  }
}
