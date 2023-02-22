<template>
  <x-table
    ref="xProTable"
    custom-zoom
    custom-setting
    auto-resize
    :extra-height="12"
    v-bind="tableProps"
    v-model:pagination="pagination"
    @search="handleQuery">
    <!--搜索栏-->
    <template v-if="hasSearchBar" #searchBar>
      <x-search ref="xSearch" v-bind="searchProps" @search="handleSearch" @reset="handleReset" @clear="handleClear">
        <template #formItemRender="scope">
          <slot name="formItemRender" v-bind="scope"></slot>
        </template>
        <template v-if="hasTop" #top>
          <slot name="top"></slot>
        </template>
        <template v-if="hasBottom" #bottom>
          <slot name="bottom"></slot>
        </template>
      </x-search>
    </template>
    <!--工具栏-->
    <template v-if="hasToolBar" #toolBar>
      <slot name="toolBar"></slot>
    </template>
    <!--插槽-->
    <template v-for="slot of getTableSlots" :key="slot" #[slot]="scope">
      <slot :name="slot" v-bind="scope"></slot>
    </template>
  </x-table>
</template>
<script>
import { computed, defineComponent, onMounted, reactive, ref, toRef, toRefs, unref, watch, watchEffect } from 'vue'
import XTable from '@components/Table'
import XSearch from '@components/Search'
import { useSearch } from '@components/hooks/useSearch'
import { isEmpty } from '@src/utils'
export default defineComponent({
  name: 'XProTable',
  components: {
    'x-table': XTable,
    'x-search': XSearch
  },
  inheritAttrs: true,
  props: {
    value: Object,
    searchProps: { type: Object, default: () => ({}) },
    tableProps: { type: Object, default: () => ({}) }
  },
  emits: ['update:value', 'search', 'reset', 'clear'],
  setup(props, { emit, slots, expose }) {
    const xProTable = ref(null)
    const xSearch = ref(null)

    const state = reactive({
      pagination: {
        page: 1,
        pageSize: 20
      },
      action: ''
    })

    // table插槽
    const getTableSlots = computed(() => {
      return Object.keys(slots).filter(val =>
        [
          'headerCell',
          'bodyCell',
          'customFilterDropdown',
          'customFilterIcon',
          'expandedRowRender',
          'expandIcon',
          'title',
          'footer',
          'summary',
          'emptyText'
        ].includes(val)
      )
    })

    // 是否显示页码，默认显示
    const showPagination = computed(() => {
      const _showPagination = props.tableProps?.showPagination
      return typeof _showPagination === 'undefined' ? true : _showPagination
    })

    // 页码默认赋值
    watchEffect(() => {
      if (!isEmpty(props.tableProps?.pagination)) {
        state.pagination = props.tableProps.pagination
      }
    })

    // TODO：监听页码，当页码为1时，重置页码（父组件手动重置页码：如快捷搜索）
    watch(
      () => props.value?.page,
      page => {
        if (page && page === 1) {
          state.pagination.page = 1
        }
      }
    )

    /**
     * 搜索栏-搜索按钮
     */
    const handleSearch = params => {
      onSearch(params)
      // 搜索按钮-滚动置顶
      unref(xProTable)?.onScrollTop?.()
    }

    /**
     * 搜索栏-重置按钮
     * 1.重置时，默认会触发搜索事件
     * 2.重置时，需要重置页码为1
     * @param {*} params
     */
    const handleReset = params => {
      onReset(params)
      // 重置会触发搜索事件，搜索方法会重置page和更新value
      // if (unref(showPagination)) {
      //   state.pagination.page = 1
      // }
      // emit('update:value', { ...params, ...(unref(showPagination) ? state.pagination : {}) })
      emit('reset', { ...params, ...(unref(showPagination) ? state.pagination : {}) })
    }

    const handleClear = params => {
      onClear(params)
      emit('update:value', { ...params, ...(unref(showPagination) ? state.pagination : {}) })
      emit('clear', { ...params, ...(unref(showPagination) ? state.pagination : {}) })
    }

    // 【XSearch-搜索】和【XTable-分页、筛选、排序】都会触发该方法
    // action：【XSearch：search】 和 【XTable：paginate/sort/filter】
    const emitSearch = (params = {}, action) => {
      // 当【搜索、筛选、排序】时，page不为空；当【分页】时，page为空
      // 【搜索、筛选、排序】需要重置页码为1
      if (unref(showPagination) && params.page) {
        state.pagination.page = params.page || 1
      }
      state.action = action
      emit('update:value', {
        ...params,
        ...(unref(showPagination) ? state.pagination : {})
      })
      emit('search', { ...params, ...(unref(showPagination) ? state.pagination : {}) }, action)
    }

    const canResize = computed(() => props.tableProps?.autoResize == null || props.tableProps?.autoResize === true)

    const { paramsRef, handleQuery, onSearch, onReset, onClear } = useSearch(
      emitSearch,
      unref(canResize),
      toRef(props, 'searchProps'),
      toRef(props, 'tableProps')
    )

    // 是否显示插槽
    const hasSearchBar = computed(() => !isEmpty(props['searchProps']))
    const hasTop = computed(() => !!slots['top'])
    const hasBottom = computed(() => !!slots['bottom'])
    const hasToolBar = computed(() => !!slots['toolBar'])

    // 初始化调用一下，获取搜索参数
    const onInit = () => {
      onSearch()
      handleQuery()
      emit('update:value', {
        ...unref(paramsRef),
        ...(unref(showPagination) ? state.pagination : {})
      })
    }

    onMounted(() => {
      onInit()
    })

    expose({
      xProTable,
      xSearch
    })

    return {
      xProTable,
      xSearch,
      ...toRefs(state),
      hasSearchBar,
      hasTop,
      hasBottom,
      hasToolBar,
      getTableSlots,
      handleQuery,
      handleSearch,
      handleReset,
      handleClear
    }
  }
})
</script>
<style lang="scss" scoped>
.x-table {
  :deep(.x-table__toolbar) {
    padding: 0 10px;
  }
}
</style>
