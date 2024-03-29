import { omit } from 'lodash-es'
import { isEmpty, recursive } from '@src/utils'

const typeMap = {
  seq: '序号',
  checkbox: '复选框',
  radio: '单选框',
  expand: '展开行'
}

export const generateLeaf = (columns, list = []) => {
  columns.forEach(column => {
    if (column?.children) {
      generateLeaf(column?.children, list)
    } else {
      list.push(column)
    }
  })
  return list
}

export const getField = column => {
  return column?.field || column?.slots?.default || column?.type || column?.title
}

const getPrevious = (column, columns) => {
  const index = columns.findIndex(val => getField(val) === getField(column))
  return columns[index - 1]
}

const hasPrevious = (column, columns) => {
  return columns.map(val => getField(val)).includes(getField(column))
}

export const mergeStorageAndColumns = (oldColumns, newColumns) => {
  const listFieldMap = oldColumns.map(val => val?.field)
  const columnsFieldMap = newColumns.map(val => getField(val))
  // 删除没有的
  const restColumns = oldColumns.filter(item => columnsFieldMap.includes(item?.field))
  // 找到新增的
  const otherColumns = newColumns.filter(item => !listFieldMap.includes(getField(item)))
  otherColumns.forEach(item => {
    const newPrevious = getPrevious(item, newColumns)
    const isPrevious = hasPrevious(newPrevious, restColumns)
    let newIndex
    if (isPrevious) {
      newIndex = restColumns.findIndex(val => val?.field === getField(newPrevious)) + 1
    } else {
      newIndex = restColumns.findIndex(val => !val?.fixed)
    }
    const columns = columnsToStorage([item])
    restColumns.splice(newIndex, 0, columns[0])
  })
  return restColumns
}

export const columnsToStorage = columns => {
  return (columns || []).map(val => {
    let title = val?.title
    if (!title && val?.type) {
      title = typeMap[val?.type]
    }
    return {
      title,
      field: getField(val),
      ...(val?.fixed ? { fixed: val?.fixed } : {}),
      ...(val?.width ? { width: val?.width } : {}),
      ...(val?.minWidth ? { minWidth: val?.minWidth } : {}),
      ...(val?.maxWidth ? { maxWidth: val?.maxWidth } : {}),
      visible: isEmpty(val?.visible) ? true : val?.visible
    }
  })
}

export const storageToColumns = (storageColumns, columns) => {
  return (storageColumns || []).map(val => {
    const column = (columns || []).find(v => val?.field === getField(v))
    const omitList = ['fixed', 'width', 'minWidth', 'maxWidth']
    const restColumn = omit(column || {}, omitList)
    // 递归遍历子设置元素visible
    if (!isEmpty(column.children)) {
      recursive(column.children, column => {
        Object.assign(column, { visible: val?.visible })
      })
    }
    return {
      ...(restColumn ? restColumn : {}),
      ...(val?.fixed ? { fixed: val?.fixed } : {}),
      ...(val?.width ? { width: val?.width } : {}),
      ...(val?.minWidth ? { minWidth: val?.minWidth } : {}),
      ...(val?.maxWidth ? { maxWidth: val?.maxWidth } : {}),
      visible: val?.visible
    }
  })
}

export const getXlsxColumns = (columns = []) => {
  const allColumns = generateLeaf(columns)
  // 过滤导出字段exports为空数组
  // 过滤勾选和操作栏
  const restColumns = allColumns.filter(
    val =>
      !(
        (Array.isArray(val.exports) && val.exports.length === 0) ||
        val.type ||
        (val.slots?.default && val.title?.startsWith('操作'))
      )
  )
  // 导出字段exports：若exports有值，则拍平为导出字段
  return restColumns.flatMap(val => {
    return !isEmpty(val.exports)
      ? val.exports.map(v => ({
          label: v.label || v.title,
          value: v.value || getField(v),
          checked: v.checked ?? v.visible ?? true
        }))
      : {
          label: val.label || val.title,
          value: val.value || getField(val),
          checked: val.checked ?? val.visible ?? true
        }
  })
}
