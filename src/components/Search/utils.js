import { cloneDeep, omit } from 'lodash-es'
import { getType, isEmpty, recursive } from '@src/utils'

export const defaultState = {
  AInput: {
    props: {
      allowClear: true
    },
    events: ['change', 'pressEnter']
  },
  ATextarea: {
    props: {
      allowClear: true
    },
    events: ['change', 'pressEnter']
  },
  AInputNumber: {
    events: ['pressEnter']
  },
  AAutoComplete: {
    props: {
      allowClear: true
    },
    events: ['change']
  },
  ASelect: {
    props: {
      allowClear: true,
      showSearch: true,
      optionFilterProp: 'label'
    },
    events: ['clear']
  },
  ATreeSelect: {
    props: {
      allowClear: true,
      showSearch: true,
      treeCheckable: true,
      maxTagCount: 1
    },
    events: ['change']
  },
  ACascader: {
    props: {
      allowClear: true,
      showSearch: true,
      placeholder: ''
    },
    events: ['change']
  },
  ADatePicker: {
    props: {
      allowClear: true,
      format: 'YYYY-MM-DD',
      valueFormat: 'YYYY-MM-DD'
    },
    events: ['change']
  },
  AWeekPicker: {
    props: {
      allowClear: true,
      format: 'YYYY-wo',
      valueFormat: 'YYYY-MM-DD'
    },
    events: ['change']
  },
  AMonthPicker: {
    props: {
      allowClear: true,
      format: 'YYYY-MM',
      valueFormat: 'YYYY-MM-DD'
    },
    events: ['change']
  },
  ARangePicker: {
    props: {
      allowClear: true,
      format: 'YYYY-MM-DD',
      valueFormat: 'YYYY-MM-DD'
    },
    events: ['change']
  },
  ATimePicker: {
    props: {
      allowClear: true
    },
    events: ['change']
  }
}

export const emitPropsDisabled = column => {
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

export const omitEmpty = value => {
  if (getType(value) === 'object') {
    let newObj = {}
    Object.keys(value).forEach(key => {
      if (!isEmpty(value[key])) {
        newObj[key] = value[key]
      }
    })
    return newObj
  }
  if (Array.isArray(value)) {
    return value.filter(val => !isEmpty(val))
  }
  return value
}
