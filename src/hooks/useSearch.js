import { computed, getCurrentInstance, onMounted, onUnmounted, ref, unref } from 'vue'
import { debounce, isFunction } from 'lodash-es'
import { isEmpty } from '@src/utils'

export function useSearch(fn, isResize = true, searchProps, gridProps) {
  // 是否默认首次search
  const isDefaultSearch = ref(false)
  const searchParams = ref({})
  // 搜索栏
  const handleSearch = $event => {
    if (!unref(isDefaultSearch)) {
      isDefaultSearch.value = true
      return init()
    }
    if ($event) {
      searchParams.value = $event
    }
    if (isFunction(fn)) {
      fn({ ...unref(paramsRef), page: 1 })
    }
  }

  // 是否默认首次query
  const isDefaultQuery = ref(false)
  const sortParams = ref({})
  const filterParams = ref({})
  // 分页、排序、筛选
  const handleQuery = ($event, key) => {
    if (!unref(isDefaultQuery)) {
      isDefaultQuery.value = true
      return init()
    }
    const pagination = {}
    if ($event) {
      pagination.page = 1
      if (key === 'sort') {
        sortParams.value = $event
      }
      if (key === 'filter') {
        filterParams.value = $event
      }
    }
    if (isFunction(fn)) {
      fn({ ...unref(paramsRef), ...pagination })
    }
  }

  const handleReset = $event => {
    searchParams.value = $event
    sortParams.value = {}
    filterParams.value = {}
  }

  const handleClear = $event => {
    searchParams.value = $event
  }

  const paramsRef = computed(() => {
    return {
      ...unref(searchParams),
      ...unref(sortParams),
      ...unref(filterParams)
    }
  })

  const init = () => {
    if (unref(isDefaultSearch) && unref(isDefaultQuery)) {
      searchParams.value = useDefaultValue(unref(searchProps)?.columns)
      filterParams.value = gridProps ? useDefaultValue(unref(gridProps)?.columns) : {}
    }
  }

  useAppHeight(isResize)

  return {
    paramsRef,
    handleSearch,
    handleReset,
    handleClear,
    handleQuery
  }
}

function useDefaultValue(columns) {
  const allDefaultValue = ['defaultValue', 'defaultPickerValue']
  return (columns || []).reduce((prev, next) => {
    let value = allDefaultValue.map(val => next?.props?.[val]).find(Boolean)
    if (!isEmpty(value)) {
      prev[next.field] = value
    }
    return prev
  }, {})
}

function useAppHeight(isResize) {
  // 动态设置id="#app"的高度
  const { proxy } = getCurrentInstance()
  const appRef = proxy.$root?.$el.parentNode
  const setHeight = debounce(
    () => {
      if (appRef) {
        const { top } = appRef?.getBoundingClientRect?.() || {}
        const height = window.innerHeight - (top || 0)
        appRef.style.height = `${height}px`
      }
    },
    200,
    { leading: false, trailing: true }
  )

  onMounted(() => {
    if (isResize) {
      setHeight()
      window.addEventListener('resize', setHeight)
    }
  })

  onUnmounted(() => {
    // appRef.style.height = ''
    window.removeEventListener('resize', setHeight)
  })
}
