import { dateToDayjs, getType, isEmpty } from '@src/utils'

// 是否是多选框
export const hasMultiple = column => {
  return (
    (column?.type === 'ASelect' && ['multiple', 'tags'].includes(column?.props?.mode)) ||
    (column?.type === 'ASlider' && column?.props?.range) ||
    (column?.type === 'ATreeSelect' && column?.props?.multiple) ||
    ['ACheckboxGroup', 'ACascader', 'ARangePicker'].includes(column?.type)
  )
}

// 是否是日期选择框
export const hasDate = column => {
  return ['ADatePicker', 'AWeekPicker', 'AMonthPicker', 'ARangePicker', 'ATimePicker'].includes(column?.type)
}

export const allDefaultValue = ['defaultValue', 'defaultPickerValue']

// 格式化表单值
export const formatModel = (columns, values) => {
  return columns.reduce((prev, next) => {
    // 在使用useForm时，需要手动设置默认值
    let value = allDefaultValue.map(val => next?.props[val]).find(Boolean)
    // 格式化时间（antd不支持new Date()）
    if (hasDate(next)) {
      value = dateToDayjs(value, next?.props?.valueFormat)
    }
    if (isEmpty(value)) {
      value = hasMultiple(next) ? [] : undefined
    }
    // TODO: AAutoComplete组件默认值为undefined时，点击重置无效
    if (next.type === 'AAutoComplete') {
      value = ''
    }
    prev[next.field] = isEmpty(values) ? value : values[next.field]
    return prev
  }, {})
}

// 格式化表单规则
export const formatRules = columns => {
  return columns.reduce((prev, next) => {
    if (!isEmpty(next?.rules)) {
      prev[next.field] = next?.rules
    }
    return prev
  }, {})
}

/**
 * 删除【对象/数组】空值
 * @param object
 * @returns {*}
 */
export const toEmpty = object => {
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
