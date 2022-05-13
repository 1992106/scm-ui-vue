import { isFunction } from 'lodash-es'

// 转换XTabled的rowKey
export const transformRowKey = (rowKey, record) => {
  if (isFunction(rowKey)) {
    return rowKey(record)
  }
  return record[rowKey]
}

// 获取排序方式 ['ascend', 'descend'] => ['ASC', 'DESC']
export const getSortDirection = order => {
  return ['asc', 'desc'].map(v => order.includes(v) && order.slice(v.length).toUpperCase()).filter(Boolean)[0]
}
