import { isFunction } from 'lodash-es'

// 获取行的value通过rowKey
export const getValueByRowKey = (rowKey, record, index) => {
  if (!rowKey) {
    console.warn('rowKey 不能为空')
    return index
  }
  if (isFunction(rowKey)) {
    return rowKey(record)
  }
  return record[rowKey]
}

// 获取排序方式 ['ascend', 'descend'] => ['ASC', 'DESC']
export const getSortDirection = order => {
  return ['asc', 'desc'].map(v => order.includes(v) && order.slice(v.length).toUpperCase()).filter(Boolean)[0]
}
