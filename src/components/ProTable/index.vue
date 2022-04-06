<template>
  <x-table ref="xTable" v-bind="tableProps" v-model:pagination="pagination" auto-resize @search="handleFilter">
    <!--搜索栏-->
    <template v-if="hasSearchBar" #searchBar>
      <x-search
        ref="xSearch"
        show-expand
        layout="horizontal"
        :label-col="{ span: 10 }"
        :wrapper-col="{ span: 14 }"
        v-bind="searchProps"
        @search="handleSearch"
        @reset="emitReset"
        @clear="emitClear">
        <template v-for="slot of getSearchSlots" :key="slot" #[slot]="scope">
          <slot :name="slot" v-bind="scope"></slot>
        </template>
        <template v-if="showExtra" #extra>
          <slot name="extra"></slot>
        </template>
        <template v-if="hasShortcut" #shortcut>
          <slot name="shortcut"></slot>
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
import XTable from '@components/Table/index.vue'
import XSearch from '@components/Search/index.vue'
import { useSearch } from '@src/hooks/useSearch'
import { isEmpty } from '@src/utils'

export default defineComponent({
  name: 'XProTable',
  components: {
    'x-table': XTable,
    'x-search': XSearch
  },
  inheritAttrs: false,
  props: {
    value: Object,
    searchProps: { type: Object, default: () => ({}) },
    tableProps: { type: Object, default: () => ({}) }
  },
  emits: ['update:value', 'search', 'reset', 'clear'],
  setup(props, { emit, slots }) {
    const xGrid = ref(null)
    const xSearch = ref(null)
    const state = reactive({
      pagination: {
        page: 1,
        pageSize: 20
      }
    })

    // 搜索插槽
    const getSearchSlots = computed(() => {
      const columns = props.searchProps.columns
      return (columns || []).map(col => col.slot).filter(Boolean)
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
          'summary'
        ].includes(val)
      )
    })

    // 页码默认赋值
    watchEffect(() => {
      if (props.tableProps?.pagination) {
        state.pagination = props.tableProps.pagination
      }
    })

    // 是否显示页码，默认显示
    const showPagination = computed(() => {
      const _showPagination = props.tableProps.showPagination
      return typeof _showPagination === 'undefined' ? true : _showPagination
    })

    // TODO：监听页码，当页码为1时，重置页码（快捷搜索用到）
    watch(
      () => props.value?.page,
      page => {
        if (page && page === 1) {
          state.pagination.page = props.value?.page
        }
      }
    )

    const emitSearch = (params = {}) => {
      // 点击按钮筛选时，需要重置页码
      if (params.page) {
        state.pagination.page = params.page
      }
      emit('update:value', {
        ...params,
        ...(unref(showPagination) ? state.pagination : {})
      })
      emit('search', { ...params, ...(unref(showPagination) ? state.pagination : {}) })
    }

    const emitReset = $event => {
      xGrid.value.gridRef.clearFilter()
      xGrid.value.gridRef.clearSort()
      handleReset($event)
      emit('update:value', { ...$event, ...(unref(showPagination) ? state.pagination : {}) })
      emit('reset', { ...$event, ...(unref(showPagination) ? state.pagination : {}) })
    }

    const emitClear = $event => {
      handleClear($event)
      emit('update:value', { ...$event, ...(unref(showPagination) ? state.pagination : {}) })
      emit('clear', { ...$event, ...(unref(showPagination) ? state.pagination : {}) })
    }

    const { paramsRef, handleFilter, handleSearch, handleReset, handleClear } = useSearch(
      emitSearch,
      props.tableProps.autoResize,
      toRef(props, 'searchProps'),
      toRef(props, 'tableProps')
    )

    // 是否显示插槽
    const hasSearchBar = computed(() => !isEmpty(props['searchProps']))
    const showExtra = computed(() => !!slots['extra'])
    const hasShortcut = computed(() => !!slots['shortcut'])
    const hasToolBar = computed(() => !!slots['toolBar'])

    // 初始化调用一下，获取查询参数
    const onInit = () => {
      handleSearch()
      handleFilter()
      emit('update:value', {
        ...unref(paramsRef),
        ...(unref(showPagination) ? state.pagination : {})
      })
    }

    onMounted(() => {
      onInit()
    })

    return {
      xGrid,
      xSearch,
      ...toRefs(state),
      hasSearchBar,
      showExtra,
      hasShortcut,
      hasToolBar,
      getSearchSlots,
      getTableSlots,
      handleFilter,
      handleSearch,
      emitReset,
      emitClear
    }
  }
})
</script>
<style lang="scss" scoped>
.my-table {
  background-color: #f0f2f5;
  position: relative;

  // 调整搜索栏
  & > :deep(.my-search) {
    background-color: #fff;
    border-radius: 2px;
    padding: 10px 0;
    margin-bottom: 10px;

    .ant-form {
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

      .actions {
        justify-content: flex-end;
      }
    }

    .extra {
      margin: 0 10px 10px 10px;
    }

    .shortcut {
      margin: 0 10px;
    }
  }
}
</style>
