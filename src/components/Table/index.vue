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
      ref="tableRef"
      bordered
      v-bind="$attrs"
      :row-key="rowKey"
      :columns="getColumns"
      :data-source="dataSource"
      :loading="loading"
      :empty-text="emptyText"
      :pagination="false"
      :scroll="getScroll"
      :size="size"
      :locale="locale"
      :row-selection="rowSelection"
      :row-class-name="handleRowClassName"
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
    <a-pagination
      v-if="showPagination && getColumns.length"
      v-bind="getPaginationConfig"
      :current="pagination.page"
      :page-size="pagination.pageSize"
      :total="total"
      @change="handlePageChange"
      @showSizeChange="handleShowSizeChange" />
  </div>
</template>
<script>
import { defineComponent, computed, mergeProps, onBeforeUnmount, onMounted, reactive, ref, toRefs, unref } from 'vue'
import { debounce } from 'lodash-es'
import { isEmpty } from '@src/utils'

export default defineComponent({
  name: 'XTable',
  inheritAttrs: false,
  props: {
    // 表格行 key 的取值
    rowKey: { type: [String, Function], default: 'id' },
    // 自定义列
    columns: { type: Array, required: true, default: () => [] },
    // 表格数据
    dataSource: { type: Array, default: () => [] },
    loading: { type: [Boolean, Object], default: false },
    total: { type: Number, default: 0 },
    emptyText: { type: String, default: '暂无数据' },
    // 页码
    showPagination: { type: Boolean, default: true },
    pagination: { type: Object, default: () => ({ page: 1, pageSize: 20 }) },
    paginationConfig: Object,
    // 自动计算高度
    resize: { type: Boolean, default: false },
    // 横向/纵向滚动
    scroll: { type: Object, default: () => ({ scrollToFirstRowOnChange: true }) },
    // 选择功能的配置
    rowSelection: Object,
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
    locale: { type: Object, default: () => ({ filterConfirm: '筛选', filterReset: '重置', emptyText: '暂无数据' }) },
    customRow: Function,
    customHeaderRow: Function,
    transformCellText: { type: Function, default: null }
  },
  emits: ['search', 'update:pagination', 'change', 'expand', 'expandedRowsChange', 'resizeColumn'],
  setup(props, { emit, slots }) {
    /**
     * 默认值
     */
    const defaultState = {
      defaultColumn: { ellipsis: true, align: 'center' },
      defaultPaginationConfig: {
        defaultPageSize: 20,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: total => `共 ${total} 条`,
        pageSizeOptions: ['20', '40', '60', '80', '100']
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
    const tableRef = ref(null)
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
          'footer'
        ].includes(val)
      )
    })
    const getTransformCellText = computed(() => {
      return props.transformCellText ? props.transformCellText : ({ text }) => (isEmpty(text) ? '--' : text)
    })
    const getScroll = computed(() => mergeProps(state.scroll, props.scroll))
    const getPaginationConfig = computed(() => mergeProps(defaultState.defaultPaginationConfig, props.paginationConfig))
    /**
     * methods
     */
    // 监听视窗大小改变
    let observer
    const onResize = debounce(() => {
      // TODO: 待优化
      const $xTable = unref(tableRef)
      const $xTableHeader = $xTable?.$el?.querySelector('.ant-table .ant-table-header>table') // TODO: 初始化无法获取
      const tableHeaderHeight = $xTableHeader?.offsetHeight || 0
      const pageHeight = $xTable?.$el?.parentNode?.offsetHeight || 0
      const HeaderHeight = $xTable?.$el?.previousElementSibling?.offsetHeight || 0
      const paginationHeight = $xTable?.$el?.nextElementSibling?.offsetHeight || 0
      const height = pageHeight - HeaderHeight - paginationHeight - tableHeaderHeight
      if (Number.isFinite(height) && height > 0) {
        state.scroll['y'] = height
      }
      // TODO: 可以获取$xTableHeader时，可停止观察。
      if ($xTableHeader && observer) {
        observer.disconnect()
      }
    }, 200)
    onMounted(() => {
      if (props.resize && unref(tableRef)) {
        // TODO: 由于$xTableHeader在antd中是异步动态生成，初始化时获取不到dom，导致表格高度计算错误。
        // TODO: 所以使用MutationObserver事件监听动态生成的$xTableHeader。
        observer = new MutationObserver(onResize)
        observer.observe(unref(tableRef)?.$el, { attributes: true, childList: true, subtree: true })
        // onResize()
        window.addEventListener('resize', onResize)
      }
    })
    onBeforeUnmount(() => {
      observer && observer.disconnect()
      window.removeEventListener('resize', onResize)
    })
    // 行的类名（默认设置斑马纹）
    const handleRowClassName = (record, index) => {
      const result = props.rowClassName ? props.rowClassName(record, index) : null
      return [index % 2 === 1 ? 'table-striped' : null, result].filter(Boolean)
    }
    // 排序、筛选变化时触发
    const handleChange = (_, filters, sorter, { currentDataSource }) => {
      // TODO:
      emit('change', filters, sorter, { currentDataSource })
    }
    // 页码
    const handlePageChange = (current, pageSize) => {
      const pagination = {
        page: current,
        pageSize
      }
      emit('update:pagination', pagination)
      emit('search')
    }
    const handleShowSizeChange = (_, pageSize) => {
      const pagination = {
        page: 1,
        pageSize
      }
      emit('update:pagination', pagination)
      emit('search')
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

    const hasSearchBar = computed(() => !!slots['searchBar'])
    const hasToolBar = computed(() => !!slots['toolBar'])
    const hasTitle = computed(() => !!slots['title'])
    const hasFooter = computed(() => !!slots['footer'])

    return {
      ...toRefs(state),
      getScroll,
      getColumns,
      getTableSlots,
      getTransformCellText,
      getPaginationConfig,
      tableRef,
      handleRowClassName,
      handleChange,
      handlePageChange,
      handleShowSizeChange,
      handleExpand,
      handleExpandedRowsChange,
      handleResizeColumn,
      hasSearchBar,
      hasToolBar,
      hasTitle,
      hasFooter
    }
  }
})
</script>
<style lang="scss" scoped>
.my-table {
  .toolbar {
    padding: 10px;
    background-color: #fff;
  }

  :deep(.ant-table) {
    .ant-table-title,
    .ant-table-footer {
      padding: 0;
    }
  }

  .ant-pagination {
    padding: 10px;
    text-align: right;
  }

  :deep(.table-striped) {
    background-color: #fafafa;
  }
}
</style>
