import { isFunction } from 'lodash-es'

// 转换XTabled的rowKey
export const transformRowKey = (rowKey, record) => {
  if (isFunction()) {
    return rowKey(record)
  }
  return rowKey
}

// 获取
export const getSortBy = order => {
  return ['asc', 'desc'].map(v => order.includes(v) && order.slice(v.length).toUpperCase()).filter(Boolean)[0]
}
