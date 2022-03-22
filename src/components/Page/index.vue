<template>
  <x-grid
    ref="xGrid"
    v-bind="gridProps"
    v-model:pagination="pagination"
    highlightHoverRow
    customSetting
    align="center"
    @search="handleFilter"
    @sortChange="handleSort"
  >
    <!--搜索栏-->
    <template #searchBar>
      <template v-if="searchBar">
        <x-search
          ref="xSearch"
          v-bind="searchProps"
          @search="handleSearch"
          @reset="emitReset"
          @clear="emitClear"
          layout="horizontal"
          :label-col="{ span: 10 }"
          :wrapper-col="{ span: 14 }"
        >
          <template #extra v-if="hasExtra">
            <slot name="extra"></slot>
          </template>
          <template #shortcut v-if="hasShortcut">
            <slot name="shortcut"></slot>
          </template>
        </x-search>
      </template>
    </template>
    <!--工具栏-->
    <template #toolBar>
      <template v-if="hasToolBar">
        <slot name="toolBar"></slot>
      </template>
    </template>
    <template v-for="slot of getSlots" :key="slot" #[slot]="scope">
      <slot :name="slot" v-bind="scope"></slot>
    </template>
  </x-grid>
</template>

<script>
import { computed, defineComponent, onMounted, reactive, ref, toRef, toRefs, unref, watch, watchEffect } from 'vue'
import { DownOutlined } from '@ant-design/icons-vue'
import XGrid from '@components/Grid'
import XSearch from '@components/Search'
import { useSearch } from '@src/hooks/useSearch'
import { isEmpty } from '@src/utils'

export default defineComponent({
  name: 'XPage',
  inheritAttrs: false,
  components: {
    DownOutlined,
    'x-grid': XGrid,
    'x-search': XSearch
  },
  props: {
    value: Object,
    searchProps: { type: Object, default: () => ({}) },
    gridProps: { type: Object, default: () => ({}) }
  },
  emits: ['update:value', 'search', 'reset', 'clear'],
  setup(props, { emit, slots }) {
    const xGrid = ref(null)
    const xSearch = ref(null)
    const state = reactive({
      pagination: {
        page: 1,
        pageSize: 20
      },
      sortBy: '',
      sortKey: ''
    })

    // 页码默认赋值
    watchEffect(() => {
      if (props.gridProps?.pagination) {
        state.pagination = props.gridProps.pagination
      }
    })

    // 是否显示页码，默认显示
    const showPagination = computed(() => {
      const _showPagination = props.gridProps.showPagination
      return typeof _showPagination === 'undefined' ? true : _showPagination
    })

    const generateSlots = (columns = [], slots = []) => {
      columns.forEach(column => {
        slots.push(column)
        column.children && generateSlots(column.children, slots)
      })
      return slots
    }

    const getSlots = computed(() => {
      const columns = generateSlots(props.gridProps.columns)
      return (columns || [])
        .filter(col => col.slots)
        .flatMap(col =>
          ['default', 'header', 'footer', 'edit', 'filter', 'title', 'checkbox', 'radio', 'content']
            .map(val => col.slots[val])
            .filter(Boolean)
        )
    })

    const emitSearch = (params = {}) => {
      // 点击按钮筛选时，需要重置页码
      if (params.page) {
        state.pagination.page = params.page
      }
      emit('update:value', {
        ...params,
        ...(state.sortBy ? { sortBy: state.sortBy, sortKey: state.sortKey } : {}),
        ...(unref(showPagination) ? state.pagination : {})
      })
      emit('search', { ...params, ...(unref(showPagination) ? state.pagination : {}) })
    }

    const emitReset = $event => {
      state.sortBy = ''
      state.sortKey = ''
      xGrid.value.gridRef.clearSort(state.sortKey)
      handleReset($event)
      emit('update:value', { ...$event, ...(unref(showPagination) ? state.pagination : {}) })
      emit('reset', { ...$event, ...(unref(showPagination) ? state.pagination : {}) })
    }

    const emitClear = $event => {
      handleClear($event)
      emit('update:value', { ...$event, ...(unref(showPagination) ? state.pagination : {}) })
      emit('clear', { ...$event, ...(unref(showPagination) ? state.pagination : {}) })
    }

    const isResize = computed(() => props.gridProps.height === 'auto')

    const { paramsRef, handleFilter, handleSearch, handleReset, handleClear } = useSearch(
      emitSearch,
      unref(isResize),
      toRef(props, 'searchProps'),
      toRef(props, 'gridProps')
    )

    const handleSort = ({ property, order }) => {
      state.sortBy = order ? order.toUpperCase() : ''
      state.sortKey = property
      handleSearch()
    }

    const searchBar = computed(() => !isEmpty(props.searchProps))
    const hasToolBar = computed(() => !!slots['toolBar'])
    const hasShortcut = computed(() => !!slots['shortcut'])
    const hasExtra = computed(() => !!slots['extra'])

    // 初始化调用一下，获取查询参数
    const onInit = () => {
      handleSearch()
      handleFilter()
      emit('update:value', {
        ...unref(paramsRef),
        ...(unref(showPagination) ? state.pagination : {})
      })
    }

    // TODO：监听页码，当页码为1时，重置页码（快捷搜索用到）
    watch(
      () => props.value?.page,
      page => {
        if (page && page === 1) {
          state.pagination.page = props.value?.page
        }
      }
    )

    onMounted(() => {
      onInit()
    })

    return {
      xGrid,
      xSearch,
      ...toRefs(state),
      searchBar,
      hasToolBar,
      hasShortcut,
      hasExtra,
      getSlots,
      handleFilter,
      handleSearch,
      emitReset,
      emitClear,
      handleSort
    }
  }
})
</script>
<style lang="scss" scoped>
.mars-grid {
  background-color: #f0f2f5;

  :deep(.vxe-grid--form-wrapper) {
    overflow: hidden;

    & > .mars-search {
      background-color: #fff;
      border-radius: 2px;
      padding: 10px 0;
      margin-bottom: 10px;
      // 调整搜索栏
      .mars-form {
        display: flex;
        flex-wrap: wrap;
        margin-right: 36px;

        .ant-form-item {
          display: inline-flex;
          margin-bottom: 0;
          width: 25%;

          .ant-input-affix-wrapper,
          .ant-select,
          .ant-cascader-picker,
          .ant-calendar-picker,
          .ant-time-picker,
          .tree-select {
            width: 100%;
          }

          .ant-calendar-picker {
            span[class='ant-calendar-picker-input ant-input'] {
              width: 100%;
            }
          }
        }

        .mars-form-buttons {
          justify-content: flex-end;
        }
      }
    }
  }

  :deep(.vxe-grid--toolbar-wrapper) {
    overflow: hidden;

    .vxe-buttons--wrapper > .mars-toolbar {
      display: flex;
      flex-wrap: wrap;
      background-color: #fff;
      border-radius: 2px;
    }
  }
}
</style>
