import { cloneDeep, omit } from 'lodash-es'
import { getType, isEmpty, recursive } from '@src/utils'

export const mergeEvents = (defaultEventsMap, defaultEvents = [], events = {}) => {
  const newEvents = defaultEvents.reduce((prev, name) => {
    const defaultEvent = defaultEventsMap[name] || Function.prototype
    const event = events[name]
    prev[name] = event
      ? $event => {
          event($event)
          defaultEvent($event)
        }
      : defaultEvent
    return prev
  }, {})
  return { ...events, ...newEvents }
}

export const emitDisabled = column => {
  const props = column?.props || {}
  const options = cloneDeep(props?.options || [])
  const treeData = cloneDeep(props?.treeData || [])
  if (['ASelect', 'AAutoComplete'].includes(column.type)) {
    return { ...column, props: { ...props, options: options.map(val => omit(val, ['disabled'])) } }
  } else if (column.type === 'ACascader') {
    recursive(options, node => {
      delete node.disabled
    })
    return { ...column, props: { ...props, options } }
  } else if (column.type === 'ATreeSelect') {
    recursive(treeData, node => {
      delete node.disabled
      delete node.disableCheckbox
    })
    return { ...column, props: { ...props, treeData } }
  } else {
    return column
  }
}

/**
 * 删除【对象/数组】空值
 * @param object
 * @returns {*}
 */
export const omitEmpty = object => {
  if (getType(object) === 'object') {
    let newObj = {}
    Object.keys(object).forEach(key => {
      if (!isEmpty(object[key])) {
        newObj[key] = object[key]
      }
    })
    return newObj
  }
  if (Array.isArray(object)) {
    return object.filter(val => !isEmpty(val))
  }
  return object
}

/**
 * 深度去前后空格
 * @param object
 */
export const deepTrim = object => {
  Object.keys(object).forEach(key => {
    if (['object', 'array'].includes(getType(object[key]))) {
      deepTrim(object[key])
    } else {
      if (getType(object[key]) === 'string') {
        object[key] = object[key].trim()
      }
    }
  })
}
