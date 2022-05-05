<template>
  <x-grid
    ref="xProGrid"
    custom-zoom
    custom-setting
    auto-resize
    height="auto"
    v-bind="gridProps"
    v-model:pagination="pagination"
    @search="handleQuery">
    <!--搜索栏-->
    <template v-if="hasSearchBar" #searchBar>
      <x-search
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
        <template v-if="hasExtra" #extra>
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
    <!--空数据-->
    <template #emptyText>
      <slot name="emptyText"></slot>
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
  inheritAttrs: true,
  props: {
    value: Object,
    searchProps: { type: Object, default: () => ({}) },
    gridProps: { type: Object, default: () => ({}) }
  },
  emits: ['update:value', 'search', 'reset', 'clear'],
  setup(props, { emit, slots }) {
    const xProGrid = ref(null)
    const state = reactive({
      pagination: {
        page: 1,
        pageSize: 20
      }
    })

    // 搜索插槽
    const getSearchSlots = computed(() => {
      const columns = props.searchProps?.columns || []
      return columns.map(col => col.slot).filter(Boolean)
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
          ['default', 'header', 'footer', 'title', 'edit', 'filter', 'checkbox', 'radio', 'content']
            .map(val => col.slots[val])
            .filter(Boolean)
        )
    })

    // 页码默认赋值
    watchEffect(() => {
      if (!isEmpty(props.gridProps?.pagination)) {
        state.pagination = props.gridProps.pagination
      }
    })

    // 是否显示页码，默认显示
    const showPagination = computed(() => {
      const _showPagination = props.gridProps?.showPagination
      return typeof _showPagination === 'undefined' ? true : _showPagination
    })

    // TODO：监听页码，当页码为1时，重置页码（快捷搜索用到）
    watch(
      () => props.value?.page,
      page => {
        if (page && page === 1) {
          state.pagination.page = 1
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
      xProGrid.value.xGrid?.clearFilter()
      xProGrid.value.xGrid?.clearSort()
      handleReset($event)
      emit('update:value', { ...$event, ...(unref(showPagination) ? state.pagination : {}) })
      emit('reset', { ...$event, ...(unref(showPagination) ? state.pagination : {}) })
    }

    const emitClear = $event => {
      handleClear($event)
      emit('update:value', { ...$event, ...(unref(showPagination) ? state.pagination : {}) })
      emit('clear', { ...$event, ...(unref(showPagination) ? state.pagination : {}) })
    }

    const isResize = computed(() => props.gridProps.height === 'auto' && props.gridProps.autoResize)

    const { paramsRef, handleQuery, handleSearch, handleReset, handleClear } = useSearch(
      emitSearch,
      unref(isResize),
      toRef(props, 'searchProps'),
      toRef(props, 'gridProps')
    )

    // 是否显示插槽
    const hasSearchBar = computed(() => !isEmpty(props['searchProps']))
    const hasExtra = computed(() => !!slots['extra'])
    const hasShortcut = computed(() => !!slots['shortcut'])
    const hasToolBar = computed(() => !!slots['toolBar'])

    // 初始化调用一下，获取查询参数
    const onInit = () => {
      handleSearch()
      handleQuery()
      emit('update:value', {
        ...unref(paramsRef),
        ...(unref(showPagination) ? state.pagination : {})
      })
    }

    onMounted(() => {
      onInit()
    })

    return {
      xProGrid,
      ...toRefs(state),
      hasSearchBar,
      hasExtra,
      hasShortcut,
      hasToolBar,
      getSearchSlots,
      getGridSlots,
      handleQuery,
      handleSearch,
      emitReset,
      emitClear
    }
  }
})
</script>
<style lang="scss" scoped>
.x-grid {
  background-color: #f0f2f5;
}
</style>
