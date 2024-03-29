<template>
  <div :class="['x-table', canFullscreen ? 'x-table__fullscreen' : '']">
    <a-spin v-bind="spinProps">
      <!--搜索栏-->
      <div v-if="hasSearchBar" class="x-table__search">
        <slot name="searchBar"></slot>
      </div>
      <!--工具栏-->
      <div v-if="hasToolBar" class="x-table__toolbar">
        <div class="toolbar">
          <slot name="toolBar"></slot>
        </div>
        <div v-if="customExport || customSetting || customZoom" class="custom">
          <a-space>
            <template v-if="customExport">
              <ExcelExport
                :columns="customColumns"
                :dataSource="dataSource"
                :exportConfig="exportConfig"
                @export="$emit('export')"></ExcelExport>
            </template>
            <template v-if="customSetting">
              <ColumnSetting
                :columns="customColumns"
                :backup-columns="backupColumns"
                @change="handleSettingColumn"></ColumnSetting>
            </template>
            <template v-if="customZoom">
              <a-button shape="circle" size="middle" @click="toggleFullscreen">
                <template #icon>
                  <FullscreenOutlined v-if="!canFullscreen" />
                  <FullscreenExitOutlined v-else />
                </template>
              </a-button>
            </template>
          </a-space>
        </div>
      </div>
      <a-table
        v-if="getColumns.length"
        ref="xTable"
        bordered
        v-bind="$attrs"
        :loading="false"
        :row-key="rowKey"
        :columns="getColumns"
        :data-source="dataSource"
        :pagination="getPaginationConfig"
        :scroll="getScroll"
        :tableLayout="tableLayout"
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
        <template #headerCell="{ title, column }">
          <slot name="headerCell" v-bind="{ title, column }">
            <!--自定义：必填标识-->
            <span v-if="column?.required" style="color: red">*</span>
            {{ title }}
            <!--自定义：一键填充-->
            <a-button v-if="column?.fillable" type="link" @click="handleFill(column)">一键</a-button>
          </slot>
        </template>
        <template #bodyCell="{ text, record, column, index }">
          <slot name="bodyCell" v-bind="{ text, record, column, index }">
            <!--自定义：缩略图/日期/时间-->
            <template v-if="column?.cellRender">
              <CellRender v-bind="{ text, record, column, index }" />
            </template>
            <!--自定义：复制-->
            <template v-if="column?.copyable">
              {{ text }}
              <CopyOutlined @click="handleCopy(text, record, column)" />
            </template>
          </slot>
        </template>
        <!--插槽-->
        <template v-for="slot of getTableSlots" :key="slot" #[slot]="scope">
          <slot :name="slot" v-bind="scope"></slot>
        </template>
      </a-table>
      <!--当columns为空时默认现在空块-->
      <div v-else class="x-table__empty-block" :style="{ height: emptyBlockHeight }"></div>
    </a-spin>
  </div>
</template>
<script>
import { defineComponent, computed, mergeProps, ref, reactive, toRefs, unref, nextTick, toRef } from 'vue'
import { CopyOutlined, FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons-vue'
import { Button, message, Space, Spin, Table } from 'ant-design-vue'
import ExcelExport from './ExcelExport.vue'
import ColumnSetting from './ColumnSetting.vue'
import CellRender from './CellRender'
import { useFullscreen } from '@components/hooks/useFullscreen'
import { useTableScroll } from './useTableScroll'
import { useTableScrollTo } from './useTableScrollTo'
import {
  columnsToStorage,
  getSortDirection,
  getValueByRowKey,
  mergeStorageAndColumns,
  storageToColumns
} from '@components/Table/src/utils'
import { cloneDeep, omit, pick } from 'lodash-es'
import { copyToClipboard, isEmpty, recursive, triggerResize } from '@src/utils'

export default defineComponent({
  name: 'XTable',
  components: {
    FullscreenOutlined,
    FullscreenExitOutlined,
    CopyOutlined,
    'a-table': Table,
    'a-spin': Spin,
    'a-space': Space,
    'a-button': Button,
    ExcelExport,
    ColumnSetting,
    CellRender
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
    // 表格对齐方式
    align: { type: String, default: 'center' },
    // 斑马纹
    stripe: { type: Boolean, default: true },
    // 额外高度
    extraHeight: Number,
    // 自动计算表格
    autoResize: { type: Boolean, default: false },
    // 表格元素的 table-layout 属性，设为 fixed 表示内容不会影响列的布局
    // 1.固定表头/列【固定表头：scroll: { y: '' } / 固定列：column.fixed】
    // 2.使用了 column.ellipsis
    // 满足以上任意一个条件时，默认值为 fixed
    tableLayout: { type: String, default: 'fixed' },
    // 横向/纵向滚动
    scroll: { type: Object, default: () => ({}) },
    // 选择功能配置项
    rowSelection: { type: [Boolean, Object] },
    // 勾选的行数据
    selectedValue: { type: Array, default: () => [] },
    // 行的类名
    rowClassName: Function,
    // 指定树形结构的列名
    childrenColumnName: { type: Array, default: () => ['children'] },
    // 展示树形数据时，每层缩进的宽度，以 px 为单位
    indentSize: { type: Number, default: 15 },
    // 表格大小 large | middle | small
    size: {
      validator(value) {
        return ['large', 'middle', 'small'].includes(value)
      },
      default: 'middle'
    },
    // 默认文案设置，目前包括排序、过滤、空数据文案
    locale: { type: Object },
    components: Object,
    customRow: Function,
    customHeaderRow: Function,
    // 自定义缩放
    customZoom: { type: Boolean, default: false },
    // 自定义设置
    customSetting: { type: Boolean, default: false },
    // 自定义导出
    customExport: { type: Boolean, default: false },
    exportConfig: {
      type: Object,
      default: () => ({
        remote: true,
        limit: 2000,
        customRequest: null,
        customExport: null
      })
    },
    // 本地Storage名称，拖拽列和自定义表头时本地储存
    storageName: String
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
    'resizeColumn',
    'export'
  ],
  setup(props, { emit, slots, expose }) {
    /**
     * 默认值
     */
    const defaultState = {
      // 当 scroll="{x: '100%'}" 和 tableLayout="fixed" 组合使用时：如果列宽总和大于表格宽，会出现横向滚轴并且不会破坏表格布局
      scroll: { x: '100%', scrollToFirstRowOnChange: true },
      defaultColumn: { visible: true },
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
    const getTransformColumns = columns => {
      recursive(columns, column => {
        // 拖动调整宽度时，width 必须是 number 类型
        const resizable = !isEmpty(column?.width) && typeof column?.width === 'number'
        Object.assign(column, mergeProps(defaultState.defaultColumn, { resizable, align: props.align }, column))
      })
      return columns
      // return columns.map(column => {
      //   // 拖动调整宽度时，width 必须是 number 类型
      //   const resizable = !isEmpty(column?.width) && typeof column?.width === 'number'
      //   return mergeProps(defaultState.defaultColumn, { resizable }, column)
      // })
    }
    const getCustomColumns = () => {
      let columns = props.columns
      if (props.storageName) {
        const storageColumns = localStorage.getItem(props.storageName)
        const oldColumns = JSON.parse(storageColumns || '[]')
        if (!isEmpty(oldColumns)) {
          const sourceColumns = props.columns
          // 对比localStorage和Props（删除移除的，添加新增的）
          const newColumns = mergeStorageAndColumns(oldColumns, sourceColumns)
          columns = storageToColumns(newColumns, sourceColumns)
        }
      }
      return getTransformColumns(columns)
    }
    const state = reactive({
      emptyBlockHeight: '',
      customColumns: getCustomColumns(),
      backupColumns: cloneDeep(props.columns)
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
    const getColumns = computed(() => {
      return state.customColumns.filter(val => val?.visible !== false)
    })
    const getTableSlots = computed(() => {
      return Object.keys(slots).filter(val =>
        [
          // 'headerCell', 在template中实现【必填标识/一键填充】
          // 'bodyCell', 在template中实现【cellRender：缩略图/日期/时间】
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
      return props.transformCellText
        ? props.transformCellText
        : ({ text, record, column, index }) =>
            column?.customRender ? column.customRender({ text, record, column, index }) : isEmpty(text) ? '--' : text
    })
    // 自动计算表格的宽高
    const { scroll } = useTableScroll(xTable, {
      canResize: props.autoResize,
      extraHeight: props.extraHeight,
      data: toRef(props, 'dataSource')
    })
    const getScroll = computed(() => mergeProps(defaultState.scroll, unref(scroll), props.scroll))
    // 是否显示较少页面内容
    const defaultShowLessItems = pick(props.pagination, ['showLessItems'])
    const showLessItems = computed(() => {
      const _showLessItems = props.paginationConfig?.showLessItems ?? defaultShowLessItems
      return typeof _showLessItems === 'undefined' ? false : _showLessItems
    })
    // 分页器
    const defaultPagination = omit(props.pagination, ['page', 'current', 'pageSize'])
    const getPaginationConfig = computed(() => {
      const { page, current, pageSize } = props.pagination // current是为了兼容 antv 原始用法
      return props.showPagination
        ? mergeProps(
            unref(showLessItems) ? { size: 'small' } : defaultState.defaultPaginationConfig,
            defaultPagination, // 为了兼容 antv 原始用法
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
      const rowClassName = props.rowClassName ? props.rowClassName(record, index) : null
      const stripe = props.stripe && index % 2 === 1 ? 'table-striped' : null
      return [stripe, rowClassName].filter(Boolean)
    }

    // 一键填充
    const handleFill = column => {
      const dataIndex = column.dataIndex
      const dataSource = props.dataSource || []
      if (dataIndex && dataSource.length > 1) {
        const value = dataSource[0]?.[dataIndex]
        // 如果第一行的值为空，则不填充
        if (!isEmpty(value)) {
          dataSource.forEach(record => {
            Object.assign(record, { [dataIndex]: value })
          })
        }
      }
    }

    // 复制
    const handleCopy = (text, record, column) => {
      const value = record[column.dataIndex] || text
      if (!isEmpty(value)) {
        copyToClipboard(value)
        message.success('复制成功')
      }
    }

    // 分页、排序、筛选变化时触发
    const handleChange = (pagination, filters, sorter, extra) => {
      const action = extra?.action
      const column = sorter?.column || {}
      if (action === 'filter' && !isEmpty(filters) && isEmpty(column?.onFilter)) {
        // 服务端筛选
        emit('search', filters, 'filter')
      } else if (action === 'sort' && !isEmpty(sorter) && column?.sorter === true) {
        // 服务端排序
        const { order, field } = sorter
        if (!isEmpty(order)) {
          const sortBy = getSortDirection(order)
          emit('search', { sortBy, sortKey: field }, 'sort')
        } else {
          emit('search', {}, 'sort')
        }
      } else if (action === 'paginate' && !isEmpty(pagination)) {
        // 分页
        const { current, pageSize } = pagination
        emit('update:pagination', {
          current, // current是为了兼容 antv 原始用法
          page: current,
          pageSize
        })
        emit('search', null, 'paginate')
      }
      emit('change', pagination, filters, sorter, extra)
    }

    // 点击展开图标时触发
    const handleExpand = (expanded, record) => {
      emit('expand', expanded, record)
    }

    // 展开的行变化时触发
    const handleExpandedRowsChange = expandedRows => {
      emit('expandedRowsChange', expandedRows)
    }

    // 拖拽列
    const handleResizeColumn = (width, column) => {
      column.width = width
      emit('resizeColumn', width, column)
      setColumnsToStorage()
    }

    // 配置列
    const handleSettingColumn = columns => {
      state.customColumns = columns
      setColumnsToStorage()
      // 当columns为空时，计算空块的高度
      if (unref(getColumns).length === 0) {
        const toolbar = document.querySelector('.x-table .x-table__toolbar')
        const toolbarBottom = toolbar?.getBoundingClientRect()?.bottom ?? 0
        state.emptyBlockHeight = `calc(100vh - ${toolbarBottom + (props.extraHeight ?? 0)}px)`
      }
    }

    // 设置本地缓存
    const setColumnsToStorage = () => {
      if (props.storageName) {
        const storageColumns = columnsToStorage(state.customColumns)
        if (storageColumns) {
          localStorage.setItem(props.storageName, JSON.stringify(storageColumns))
        }
      }
    }

    // 是否显示插槽
    const hasSearchBar = computed(() => !!slots['searchBar'])
    const hasToolBar = computed(
      () => !!slots['toolBar'] || props.customExport || props.customSetting || props.customZoom
    )

    // 全屏功能
    const { canFullscreen, toggleFullscreen } = useFullscreen(xTable, { fullscreen: props.customZoom }, () => {
      nextTick(triggerResize)
    })

    // 滚动行为
    const { onScrollTo } = useTableScrollTo(xTable, { data: toRef(props, 'dataSource') })

    expose({
      xTable,
      onToggleFullscreen: toggleFullscreen,
      onScrollTo
    })

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
      handleFill,
      handleCopy,
      handleChange,
      handleExpand,
      handleExpandedRowsChange,
      handleResizeColumn,
      handleSettingColumn,
      canFullscreen,
      toggleFullscreen
    }
  }
})
</script>
<style lang="scss" scoped>
.x-table {
  background-color: #f0f2f5;

  &__search {
    margin-bottom: 10px;
  }

  &__toolbar {
    display: flex;
    background-color: #fff;

    .toolbar {
      display: flex;
      flex-wrap: wrap;
      flex: 1;
      margin: 10px 0;
    }

    .custom {
      padding: 10px 0 10px 10px;
    }
  }

  :deep(.ant-table) {
    .ant-table-title,
    .ant-table-footer {
      padding: 0;
    }

    // 修复拖拽列时会出现横向滚轴
    .ant-table-thead .ant-table-cell:last-child {
      overflow-x: hidden;
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

  // 空块
  &__empty-block {
    background: #fff;
    border: 1px solid #f0f0f0;
  }

  // 全屏
  &__fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding: 10px;
    z-index: 10001;
  }
}
</style>
