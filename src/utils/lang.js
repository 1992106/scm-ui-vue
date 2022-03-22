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
 * 填充对象
 * @param target
 * @param source
 * @returns {{}}
 */
export function polyfill(target, source) {
  const obj = {}
  Object.keys(target).forEach(key => {
    if (isEmpty(source[key])) {
      obj[key] = target[key]
    } else {
      obj[key] = getType(target[key]) === 'object' ? polyfill(target[key], source[key]) : source[key]
    }
  })
  return obj
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
