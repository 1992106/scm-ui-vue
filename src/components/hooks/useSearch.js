import { computed, getCurrentInstance, onMounted, onUnmounted, ref, unref } from 'vue'
import { debounce, isFunction } from 'lodash-es'
import { dayjsToDate } from '@src/utils'
import { cleanEmpty, flatColumns, hasDate } from '@components/Form/src/utils'

export function useSearch(fn, canResize = true, searchProps, filterProps) {
  // 是否默认首次search
  const isDefaultSearch = ref(false)
  const searchParams = ref({})
  // 搜索栏
  const onSearch = $event => {
    if (!unref(isDefaultSearch)) {
      isDefaultSearch.value = true
      return init()
    }
    if ($event) {
      searchParams.value = $event
    }
    if (isFunction(fn)) {
      fn({ ...unref(paramsRef), page: 1 }, 'search')
    }
  }

  // 是否默认首次query
  const isDefaultQuery = ref(false)
  const sortParams = ref({})
  const filterParams = ref({})
  // 分页、排序、筛选（当分页时，$event为空）
  // key: paginate/sort/filter
  const handleQuery = ($event, key) => {
    if (!unref(isDefaultQuery)) {
      isDefaultQuery.value = true
      return init()
    }
    const pagination = {}
    if ($event) {
      // 当【排序、筛选】时：需要重置页码
      pagination.page = 1
      if (key === 'sort') {
        sortParams.value = $event
      }
      if (key === 'filter') {
        filterParams.value = $event
      }
    }
    if (isFunction(fn)) {
      // 当分页时：pagination为空对象
      fn({ ...unref(paramsRef), ...pagination }, key)
    }
  }

  const onReset = $event => {
    searchParams.value = $event
    sortParams.value = {}
    filterParams.value = {}
  }

  const onClear = $event => {
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
      filterParams.value = filterProps ? useDefaultValue(unref(filterProps)?.columns) : {}
    }
  }

  useAppHeight(canResize)

  return {
    paramsRef,
    onSearch,
    handleQuery,
    onReset,
    onClear
  }
}

function useDefaultValue(columns) {
  const allColumns = flatColumns(columns)
  const allDefaultValue = ['defaultValue', 'defaultPickerValue']
  const defaultParams = allColumns.reduce((prev, next) => {
    let value = allDefaultValue.map(val => next?.props?.[val]).find(Boolean)
    prev[next?.field] = hasDate(next) ? dayjsToDate(value, next?.props?.valueFormat) : value
    return prev
  }, {})
  return cleanEmpty(defaultParams)
}

export function useAppHeight(canResize) {
  let appRef = ref()
  const setHeight = debounce(
    () => {
      if (appRef.value) {
        const { top } = appRef.value.getBoundingClientRect?.() || {}
        const height = window.innerHeight - (top || 0)
        appRef.value.style.cssText += `;height: ${height}px; z-index: 999; position: relative;`
      }
    },
    200,
    { leading: false, trailing: true }
  )

  onMounted(() => {
    if (canResize) {
      // 动态设置id="#app"的高度
      const { proxy } = getCurrentInstance()
      appRef.value = proxy.$root?.$el?.parentNode
      setHeight()
      window.addEventListener('resize', setHeight)
    }
  })

  onUnmounted(() => {
    // appRef.style.height = ''
    window.removeEventListener('resize', setHeight)
  })
}
