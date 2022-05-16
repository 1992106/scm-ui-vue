<template>
  <div class="x-table">
    <a-spin v-bind="spinProps">
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
        :loading="false"
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
    </a-spin>
  </div>
</template>
<script>
import { defineComponent, computed, mergeProps, ref, reactive, toRef, toRefs, unref } from 'vue'
import { Spin, Table } from 'ant-design-vue'
import { useScroll } from './useScroll'
import { isEmpty } from '@src/utils'
import { getSortDirection, getValueByRowKey } from './utils'

export default defineComponent({
  name: 'XTable',
  components: {
    'a-table': Table,
    'a-spin': Spin
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
    transformCellText: { type: Function, default: null },
    // 页码
    showPagination: { type: Boolean, default: true },
    total: { type: Number, default: 0 },
    pagination: { type: Object, default: () => ({}) },
    paginationConfig: Object,
    // 额外高度
    extraHeight: Number,
    // 自动计算表格
    autoResize: { type: Boolean, default: false },
    // 横向/纵向滚动
    scroll: { type: Object, default: () => ({}) },
    // 选择功能配置项
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
    locale: { type: Object },
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
     * 默认值
     */
    const defaultState = {
      scroll: { x: '100%', scrollToFirstRowOnChange: true },
      defaultColumn: { align: 'center' },
      defaultPaginationConfig: {
        size: 'default',
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
          emit('update:selected-value', selectedRows)
          if (props.rowSelection?.type === 'radio') {
            emit('radio-change', selectedRowKeys, selectedRows)
          } else {
            emit('checkbox-change', selectedRowKeys, selectedRows)
          }
        },
        onSelect: (record, selected, selectedRows, nativeEvent) => {
          emit('select', record, selected, selectedRows, nativeEvent)
        },
        onSelectAll: (selected, selectedRows, changeRows) => {
          emit('select-all', selected, selectedRows, changeRows)
        }
      }
    }
    /**
     * data
     */
    const state = reactive({
      scroll: {}
    })
    /**
     * refs
     */
    const xTable = ref(null)
    /**
     * computed
     */
    // a-table的loading只作用表格，不能覆盖整个页面
    const spinProps = computed(() => {
      return typeof props.loading === 'object' ? props.loading : { spinning: props.loading }
    })
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
    useScroll({ xTable, autoResize: props.autoResize, extraHeight: props.extraHeight, scroll: toRef(state, 'scroll') })
    const getScroll = computed(() => mergeProps(defaultState.scroll, state.scroll, props.scroll))
    // 是否显示较少页面内容
    const showLessItems = computed(() => {
      const _showLessItems = props.paginationConfig?.showLessItems ?? props.pagination?.showLessItems
      return typeof _showLessItems === 'undefined' ? false : _showLessItems
    })
    // 分页器
    const getPaginationConfig = computed(() => {
      const { page, current, pageSize, ...restPagination } = props.pagination // current是为了兼容 antv 原始用法
      return props.showPagination
        ? mergeProps(
            unref(showLessItems) ? { size: 'small' } : defaultState.defaultPaginationConfig,
            restPagination, // 为了兼容 antv 原始用法
            props.paginationConfig,
            {
              total: props.total,
              current: page || current || 1,
              pageSize: pageSize || (unref(showLessItems) ? 10 : 20)
            }
          )
        : false
    })
    // 勾选框
    const selectedRowKeys = computed(() => {
      return props.selectedValue.map(val => getValueByRowKey(props.rowKey, val))
    })
    const getRowSelection = computed(() => {
      return props.rowSelection === true
        ? mergeProps(defaultState.defaultRowSelection, { selectedRowKeys: unref(selectedRowKeys) })
        : typeof props.rowSelection === 'object' && !isEmpty(props.rowSelection)
        ? mergeProps(defaultState.defaultRowSelection, { selectedRowKeys: unref(selectedRowKeys) }, props.rowSelection)
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
          const sortBy = getSortDirection(order)
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
      xTable,
      ...toRefs(state),
      hasSearchBar,
      hasToolBar,
      getScroll,
      getColumns,
      getTableSlots,
      getTransformCellText,
      getPaginationConfig,
      getRowSelection,
      spinProps,
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
.x-table {
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
