import { dateToDayjs, dayjsToDate, getType, isEmpty } from '@src/utils'
import { isObject, transform } from 'lodash-es'

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

/**
 * 清空【对象/数组】空值
 * @param object
 * @returns {*}
 */
export const cleanEmpty = object => {
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

// 拍平columns
export const flatColumns = (columns, result = []) => {
  columns.forEach(node => {
    if (node.children) {
      flatColumns(node.children, result)
    } else {
      result.push(node)
    }
  })
  return result
}

// 格式化表单 useForm model
export const formatFormModel = columns => {
  const allColumns = flatColumns(columns)
  return allColumns.reduce((prev, next) => {
    // 在使用useForm时，需要手动设置默认值
    let value = ['defaultValue', 'defaultPickerValue'].map(val => next?.props?.[val]).find(Boolean)
    // 格式化时间（antd不支持new Date()）
    if (hasDate(next)) {
      value = dateToDayjs(value, next?.props?.valueFormat)
    }
    if (isEmpty(value)) {
      value = hasMultiple(next) ? [] : undefined
    }
    // TODO: AAutoComplete组件默认值为undefined时，点击重置无效
    if (next?.type === 'AAutoComplete') {
      value = ''
    }
    prev[next?.field] = value
    return prev
  }, {})
}

// 格式化表单 useForm rules
export const formatFormRules = columns => {
  const allColumns = flatColumns(columns)
  return allColumns.reduce((prev, next) => {
    if (next?.rules) {
      prev[next?.field] = next?.rules
    }
    return prev
  }, {})
}

// 格式化表单 values
export const formatFormValues = (columns, modelRef) => {
  const allColumns = flatColumns(columns)
  const params = allColumns.reduce((prev, column) => {
    const value = modelRef[column?.field]
    prev[column?.field] = hasDate(column) ? dayjsToDate(value, column?.props?.valueFormat) : value
    return prev
  }, {})
  return cleanEmpty(params)
}
