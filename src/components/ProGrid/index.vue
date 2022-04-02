<template>
  <x-grid
    ref="xGrid"
    custom-zoom
    custom-setting
    v-bind="gridProps"
    v-model:pagination="pagination"
    @search="handleFilter">
    <!--搜索栏-->
    <template #searchBar>
      <template v-if="hasSearchBar">
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
          <template v-if="hasShortcut" #shortcut>
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
    <!--插槽-->
    <template v-for="slot of getGridSlots" :key="slot" #[slot]="scope">
      <slot :name="slot" v-bind="scope"></slot>
    </template>
  </x-grid>
</template>

<script>
import { computed, defineComponent, onMounted, reactive, ref, toRef, toRefs, unref, watch, watchEffect } from 'vue'
import XGrid from '@components/Grid/index.vue'
import XSearch from '@components/Search/index.vue'
import { useSearch } from '@src/hooks/useSearch'
import { isEmpty } from '@src/utils'

export default defineComponent({
  name: 'XProGrid',
  components: {
    'x-grid': XGrid,
    'x-search': XSearch
  },
  inheritAttrs: false,
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
      }
    })

    // 搜索插槽
    const getSearchSlots = computed(() => {
      const columns = props.searchProps.columns
      return (columns || []).map(col => col.slot).filter(Boolean)
    })

    // grid插槽
    const generateSlots = (columns = [], slots = []) => {
      columns.forEach(column => {
        slots.push(column)
        column.children && generateSlots(column.children, slots)
      })
      return slots
    }
    const getGridSlots = computed(() => {
      const columns = generateSlots(props.gridProps.columns)
      return (columns || [])
        .filter(col => col.slots)
        .flatMap(col =>
          ['default', 'header', 'footer', 'edit', 'filter', 'title', 'checkbox', 'radio', 'content']
            .map(val => col.slots[val])
            .filter(Boolean)
        )
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

    const isResize = computed(() => props.gridProps.height === 'auto')

    const { paramsRef, handleFilter, handleSearch, handleReset, handleClear } = useSearch(
      emitSearch,
      unref(isResize),
      toRef(props, 'searchProps'),
      toRef(props, 'gridProps')
    )

    const hasSearchBar = computed(() => !isEmpty(props['searchProps']))
    const hasToolBar = computed(() => !!slots['toolBar'])
    const hasShortcut = computed(() => !!slots['shortcut'])

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
      hasToolBar,
      hasShortcut,
      getSearchSlots,
      getGridSlots,
      handleFilter,
      handleSearch,
      emitReset,
      emitClear
    }
  }
})
</script>
<style lang="scss" scoped>
.my-grid {
  background-color: #f0f2f5;

  :deep(.vxe-grid--form-wrapper) {
    overflow: hidden;

    // 调整搜索栏
    & > .my-search {
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

      .shortcut {
        margin: 0 10px;
      }
    }
  }

  :deep(.vxe-grid--toolbar-wrapper) {
    overflow: hidden;

    .vxe-buttons--wrapper > .toolbar {
      display: flex;
      flex-wrap: wrap;
      background-color: #fff;
      border-radius: 2px;
    }
  }
}
</style>
