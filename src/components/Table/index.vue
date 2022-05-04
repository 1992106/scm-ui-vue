<template>
  <div class="my-table">
    <!--搜索栏-->
    <template v-if="hasSearchBar">
      <slot name="searchBar"></slot>
    </template>
    <!--工具栏-->
    <div v-if="hasToolBar" class="toolbar">
      <slot name="toolBar"></slot>
    </div>
    <a-table
      ref="xTable"
      bordered
      v-bind="$attrs"
      :row-key="rowKey"
      :columns="getColumns"
      :data-source="dataSource"
      :loading="loading"
      :pagination="getPaginationConfig"
      :scroll="getScroll"
      :size="size"
      :locale="locale"
      :row-selection="getRowSelection"
      :row-class-name="handleRowClassName"
      :components="components"
      :custom-row="customRow"
      :custom-header-row="customHeaderRow"
      :transform-cell-text="getTransformCellText"
      @change="handleChange"
      @expand="handleExpand"
      @expandedRowsChange="handleExpandedRowsChange"
      @resizeColumn="handleResizeColumn">
      <!--插槽-->
      <template v-for="slot of getTableSlots" :key="slot" #[slot]="scope">
        <slot :name="slot" v-bind="scope"></slot>
      </template>
    </a-table>
  </div>
</template>
<script>
import { defineComponent, computed, mergeProps, ref, reactive, toRef, toRefs, watchEffect } from 'vue'
import { Table } from 'ant-design-vue'
import { useScroll } from './useScroll'
import { isEmpty } from '@src/utils'

export default defineComponent({
  name: 'XTable',
  components: {
    'a-table': Table
  },
  inheritAttrs: false,
  props: {
    // 表格行 key 的取值
    rowKey: { type: [String, Function], default: 'key' },
    // 自定义列
    columns: { type: Array, required: true, default: () => [] },
    // 表格数据
    dataSource: { type: Array, default: () => [] },
    loading: { type: [Boolean, Object], default: false },
    total: { type: Number, default: 0 },
    transformCellText: { type: Function, default: null },
    // 页码
    showPagination: { type: Boolean, default: true },
    pagination: { type: Object, default: () => ({ page: 1, pageSize: 20 }) },
    paginationConfig: Object,
    // 额外高度
    extraHeight: Number,
    // 自动计算表格
    autoResize: { type: Boolean, default: false },
    // 横向/纵向滚动
    scroll: { type: Object, default: () => ({}) },
    // 选择功能的配置项
    rowSelection: { type: [Boolean, Object] },
    // 勾选项
    selectedValue: { type: Array, default: () => [] },
    // 行的类名
    rowClassName: Function,
    // 指定树形结构的列名
    childrenColumnName: { type: Array, default: () => ['children'] },
    // 展示树形数据时，每层缩进的宽度，以 px 为单位
    indentSize: { type: Number, default: 15 },
    // 表格大小 default | middle | small
    size: {
      validator(value) {
        return ['default', 'middle', 'small'].includes(value)
      },
      default: 'middle'
    },
    // 默认文案设置，目前包括排序、过滤、空数据文案
    locale: { type: Object, default: () => ({ filterConfirm: '筛选', filterReset: '重置' }) },
    components: Object,
    customRow: Function,
    customHeaderRow: Function
  },
  emits: [
    'search',
    'update:pagination',
    'update:selected-value',
    'radio-change',
    'checkbox-change',
    'select',
    'select-all',
    'change',
    'expand',
    'expandedRowsChange',
    'resizeColumn'
  ],
  setup(props, { emit, slots }) {
    /**
     * data
     */
    const state = reactive({
      scroll: {},
      selectedRowKeys: props.selectedValue
    })
    /**
     * 默认值
     */
    const defaultState = {
      scroll: { x: true, scrollToFirstRowOnChange: true },
      defaultColumn: { ellipsis: true, align: 'center' },
      defaultPaginationConfig: {
        size: 'default',
        hideOnSinglePage: false,
        defaultPageSize: 20,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: total => `共 ${total} 条`,
        pageSizeOptions: ['20', '40', '60', '80', '100']
      },
      defaultRowSelection: {
        type: 'checkbox',
        fixed: true,
        columnWidth: 50,
        onChange: (selectedRowKeys, selectedRows) => {
          state.selectedRowKeys = selectedRowKeys
          emit('update:selected-value', selectedRowKeys)
          emit('radio-change', selectedRowKeys, selectedRows)
          emit('checkbox-change', selectedRowKeys, selectedRows)
        },
        onSelect: (record, selected, selectedRows, nativeEvent) => {
          emit('select', record, selected, selectedRows, nativeEvent)
        },
        onSelectAll: (selected, selectedRows, changeRows) => {
          emit('select-all', selected, selectedRows, changeRows)
        }
      }
    }
    // 监听selectedValue，如果为空，清空勾选
    watchEffect(() => {
      if (isEmpty(props.selectedValue)) {
        state.selectedRowKeys = []
      }
    })
    /**
     * refs
     */
    const xTable = ref(null)
    /**
     * computed
     */
    const getColumns = computed(() => props.columns.map(column => mergeProps(defaultState.defaultColumn, column)))
    const getTableSlots = computed(() => {
      return Object.keys(slots).filter(val =>
        [
          'headerCell',
          'bodyCell',
          'customFilterDropdown',
          'customFilterIcon',
          'expandedRowRender',
          'expandIcon',
          'summary',
          'title',
          'footer',
          'emptyText'
        ].includes(val)
      )
    })
    const getTransformCellText = computed(() => {
      return props.transformCellText ? props.transformCellText : ({ text }) => (isEmpty(text) ? '--' : text)
    })
    // 自动计算表格的宽高
    useScroll({ autoResize: props.autoResize, extraHeight: props.extraHeight, scroll: toRef(state, 'scroll') })
    const getScroll = computed(() => mergeProps(defaultState.scroll, state.scroll, props.scroll))
    const getPaginationConfig = computed(() => {
      return props.showPagination
        ? mergeProps(defaultState.defaultPaginationConfig, props.paginationConfig, {
            total: props.total,
            current: props.pagination.page,
            pageSize: props.pagination.pageSize
          })
        : false
    })
    const getRowSelection = computed(() => {
      return props.rowSelection === true
        ? mergeProps(defaultState.defaultRowSelection, { selectedRowKeys: state.selectedRowKeys })
        : typeof props.rowSelection === 'object' && !isEmpty(props.rowSelection)
        ? mergeProps(defaultState.defaultRowSelection, { selectedRowKeys: state.selectedRowKeys }, props.rowSelection)
        : null
    })
    /**
     * methods
     */
    // 行的类名（默认设置斑马纹）
    const handleRowClassName = (record, index) => {
      const result = props.rowClassName ? props.rowClassName(record, index) : null
      return [index % 2 === 1 ? 'table-striped' : null, result].filter(Boolean)
    }
    // 排序、筛选变化时触发
    const handleChange = (pagination, filters, sorter, extra) => {
      // 分页
      if (!isEmpty(pagination)) {
        const { current, pageSize } = pagination
        emit('update:pagination', {
          page: current,
          pageSize
        })
        emit('search')
      }
      const column = sorter?.column || {}
      // 服务端筛选
      if (!isEmpty(filters) && isEmpty(column.onFilter)) {
        emit('search', filters, 'filter')
      }
      // 服务端排序
      if (!isEmpty(sorter) && column?.sorter === true) {
        const { order, field } = sorter
        if (!isEmpty(order)) {
          const sortBy = ['asc', 'desc']
            .map(v => order.includes(v) && order.slice(v.length).toUpperCase())
            .filter(Boolean)[0]
          emit('search', { sortBy, sortKey: field }, 'sort')
        } else {
          emit('search', {}, 'sort')
        }
      }
      emit('change', filters, sorter, extra)
    }

    // 点击展开图标时触发
    const handleExpand = (expanded, record) => {
      emit('expand', expanded, record)
    }

    // 点击展开图标时触发
    const handleExpandedRowsChange = expandedRows => {
      emit('expandedRowsChange', expandedRows)
    }

    // 点击展开图标时触发
    const handleResizeColumn = (width, column) => {
      emit('resizeColumn', width, column)
    }

    // 是否显示插槽
    const hasSearchBar = computed(() => !!slots['searchBar'])
    const hasToolBar = computed(() => !!slots['toolBar'])

    return {
      ...toRefs(state),
      hasSearchBar,
      hasToolBar,
      getScroll,
      getColumns,
      getTableSlots,
      getTransformCellText,
      getPaginationConfig,
      getRowSelection,
      xTable,
      handleRowClassName,
      handleChange,
      handleExpand,
      handleExpandedRowsChange,
      handleResizeColumn
    }
  }
})
</script>
<style lang="scss" scoped>
.my-table {
  .toolbar {
    display: flex;
    flex-wrap: wrap;
    padding: 10px;
    background-color: #fff;
  }

  :deep(.ant-table) {
    .ant-table-title,
    .ant-table-footer {
      padding: 0;
    }
  }

  :deep(.ant-table-pagination.ant-pagination) {
    margin: 0;
    padding: 10px;
    background-color: #fff;
  }

  :deep(.table-striped) {
    background-color: #fafafa;
  }
}
</style>
