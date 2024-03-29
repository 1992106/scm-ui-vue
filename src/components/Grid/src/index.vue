<template>
  <vxe-grid
    ref="xGrid"
    class="x-grid"
    border
    show-overflow
    keep-source
    v-bind="$attrs"
    :columns="customColumns"
    :data="data"
    :loading="loading"
    :align="align"
    :stripe="stripe"
    :scroll-x="getScrollX"
    :scroll-y="getScrollY"
    :height="height"
    :auto-resize="autoResize"
    :row-config="getRowConfig"
    :column-config="getColumnConfig"
    :row-class-name="rowClassName"
    :cell-class-name="cellClassName"
    :row-style="rowStyle"
    :cell-style="cellStyle"
    :seq-config="seqConfig"
    :radio-config="getRadioConfig"
    :checkbox-config="getCheckboxConfig"
    :sort-config="getSortConfig"
    :filter-config="getFilterConfig"
    :merge-cells="mergeCells"
    :footer-method="footerMethod"
    :edit-config="getEditConfig"
    :valid-config="validConfig"
    :edit-rules="editRules"
    :tooltip-config="tooltipConfig"
    :expand-config="expandConfig"
    :tree-config="treeConfig"
    :toolbar-config="{
      zoom: customZoom,
      custom: false,
      refresh: false,
      slots: { buttons: 'toolbar_buttons', tools: 'toolbar_tools' }
    }"
    :pager-config="{
      enabled: false
    }"
    @edit-closed="handleEditClosed"
    @valid-error="handleValidError"
    @filter-change="handleFilterChange"
    @filter-visible="handleFilterVisible"
    @clear-filter="handleClearFilter"
    @sort-change="handleSortChange"
    @clear-sort="handleClearSort"
    @toggle-row-expand="handleToggleRowExpand"
    @toggle-tree-expand="handleToggleTreeExpand"
    @radio-change="handleRadioChange"
    @checkbox-change="handleCheckboxChange"
    @checkbox-all="handleCheckboxAll"
    @cell-click="handleCellClick"
    @cell-dblclick="handleCellDblclick"
    @resizable-change="handleResizableChange">
    <!--搜索栏-->
    <template v-if="hasSearchBar" #form>
      <slot name="searchBar"></slot>
    </template>
    <!--工具栏-->
    <template #toolbar_buttons>
      <div v-if="hasToolBar" class="toolbar">
        <slot name="toolBar"></slot>
      </div>
    </template>
    <template #toolbar_tools>
      <template v-if="customExport">
        <ExcelExport
          :columns="customColumns"
          :data="data"
          :exportConfig="exportConfig"
          @export="$emit('export')"></ExcelExport>
      </template>
      <template v-if="customSetting">
        <ColumnSetting
          :columns="customColumns"
          :backup-columns="backupColumns"
          @change="handleSettingChange"></ColumnSetting>
      </template>
    </template>
    <!--空数据-->
    <template #empty>
      <slot name="emptyText">
        <a-empty :image="simpleImage" :description="emptyText" />
      </slot>
    </template>
    <!--slot-->
    <template v-for="slot of getGridSlots" :key="slot" #[slot]="scope">
      <slot :name="slot" v-bind="scope"></slot>
    </template>
    <template v-if="hasHeaderBar" #top>
      <slot name="headerBar"></slot>
    </template>
    <template v-if="hasFooterBar" #bottom>
      <slot name="footerBar"></slot>
    </template>
    <!--分页-->
    <template v-if="canPagination" #pager>
      <slot name="pagination">
        <x-pagination
          v-model:pagination="pages"
          :showPagination="showPagination"
          :total="total"
          :paginationConfig="paginationConfig" />
      </slot>
    </template>
  </vxe-grid>
</template>
<script>
import { defineComponent, reactive, ref, computed, toRefs, unref, mergeProps, watch, nextTick } from 'vue'
import { Empty } from 'ant-design-vue'
import ExcelExport from './ExcelExport.vue'
import ColumnSetting from './ColumnSetting.vue'
import XPagination from '@components/Pagination'
import { columnsToStorage, getField, mergeStorageAndColumns, storageToColumns } from './utils'
import { cloneDeep } from 'lodash-es'
import { isEmpty } from '@src/utils'
export default defineComponent({
  name: 'XGrid',
  components: {
    ExcelExport,
    ColumnSetting,
    'x-pagination': XPagination,
    'a-empty': Empty
  },
  inheritAttrs: false,
  props: {
    // 表格数据行唯一主键的字段名
    keyField: String,
    // 自定义列
    columns: { type: Array, required: true, default: () => [] },
    // 表格数据
    data: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    emptyText: { type: String, default: '暂无数据' },
    // 页码
    showPagination: { type: Boolean, default: true },
    total: { type: Number, default: 0 },
    pagination: { type: Object, default: () => ({ page: 1, pageSize: 20 }) },
    paginationConfig: Object,
    // 表格对齐方式
    align: { type: String, default: 'center' },
    // 斑马纹
    stripe: { type: Boolean, default: true },
    // 高度
    height: [Number, String],
    // 自动计算表格
    autoResize: { type: Boolean, default: false },
    // 行配置项
    rowConfig: Object,
    // 列配置项
    columnConfig: Object,
    // 序号配置项
    seqConfig: Object,
    // 单选框配置项
    radioConfig: Object,
    // 复选框配置项
    checkboxConfig: Object,
    // 勾选的行数据
    selectedValue: { type: Array, default: () => [] },
    // 排序配置项
    sortConfig: Object,
    // 筛选配置项
    filterConfig: Object,
    // 合并指定的单元格 (不能用于展开行，不建议用于固定列、树形结构)
    mergeCells: Array,
    // 表尾数据获取方法，返回一个二维数组
    footerMethod: Function,
    // 编辑配置项
    editConfig: Object,
    // 校验配置项
    validConfig: Object,
    // 校验规则配置项
    editRules: Object,
    // tooltip 配置项
    tooltipConfig: Object,
    // 展开行配置项（不支持虚拟滚动）
    expandConfig: Object,
    // 树形结构配置项
    treeConfig: Object,
    // 横向虚拟滚动配置
    scrollX: Object,
    // 纵向虚拟滚动配置
    scrollY: Object,
    // 给行附加className
    rowClassName: [String, Function],
    // 给行附加样式
    rowStyle: [Object, Function],
    // 给单元格附加className
    cellClassName: [String, Function],
    // 给单元格附加样式
    cellStyle: [Object, Function],
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
    'edit-updated',
    'radio-change',
    'checkbox-change',
    'checkbox-all',
    'cell-click',
    'cell-dblclick',
    'edit-closed',
    'valid-error',
    'filter-change',
    'filter-visible',
    'clear-filter',
    'sort-change',
    'clear-sort',
    'toggle-row-expand',
    'toggle-tree-expand',
    'export'
  ],
  setup(props, { emit, slots, expose }) {
    /**
     * 默认值
     */
    const defaultState = {
      defaultRowConfig: { isHover: true, isCurrent: true },
      defaultColumnConfig: { resizable: true },
      defaultRadioConfig: { highlight: true },
      defaultCheckboxConfig: { highlight: true },
      defaultSortConfig: { remote: true },
      defaultFilterConfig: { remote: true },
      defaultEditConfig: { trigger: 'click', mode: 'cell', showStatus: true },
      defaultScrollX: { enabled: false },
      defaultScrollY: { enabled: true, gt: 40, oSize: 10, scrollToTopOnChange: true } // 当数据源被更改时，自动将纵向滚动条滚动到顶部
    }
    /**
     * data
     */
    const getTransformCellText = columns => {
      return columns.map(val => {
        const { formatter, editRender } = val
        return {
          ...val,
          ...(formatter
            ? { formatter }
            : !editRender // 编辑时，会影响下拉框回显
            ? { formatter: ({ cellValue }) => (isEmpty(cellValue) ? '--' : cellValue) }
            : {})
        }
      })
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
      return getTransformCellText(columns)
    }
    const state = reactive({
      customColumns: getCustomColumns(),
      backupColumns: cloneDeep(props.columns)
    })
    /**
     * refs
     */
    const xGrid = ref(null)
    /**
     * 计算属性
     */
    // 页码
    const pages = computed({
      get: () => {
        return props.pagination
      },
      set: val => {
        emit('update:pagination', val)
        emit('search', null, 'paginate')
      }
    })
    // 插槽
    const generateSlots = (columns, slots = []) => {
      columns.forEach(column => {
        slots.push(column)
        column?.children && generateSlots(column?.children, slots)
      })
      return slots
    }
    const getGridSlots = computed(() => {
      const columns = generateSlots(props.columns)
      return (columns || [])
        .filter(col => col.slots)
        .flatMap(col =>
          ['default', 'header', 'footer', 'edit', 'filter', 'title', 'checkbox', 'radio', 'content']
            .map(val => col.slots[val])
            .filter(Boolean)
        )
    })
    const getRowConfig = computed(() =>
      mergeProps(defaultState.defaultRowConfig, props.rowConfig, props.keyField ? { keyField: props.keyField } : {})
    )
    const getColumnConfig = computed(() => mergeProps(defaultState.defaultColumnConfig, props.columnConfig))
    const getRadioConfig = computed(() => mergeProps(defaultState.defaultRadioConfig, props.radioConfig))
    const getCheckboxConfig = computed(() => mergeProps(defaultState.defaultCheckboxConfig, props.checkboxConfig))
    const getSortConfig = computed(() => mergeProps(defaultState.defaultSortConfig, props.sortConfig))
    const getFilterConfig = computed(() => mergeProps(defaultState.defaultFilterConfig, props.filterConfig))
    const getEditConfig = computed(() => mergeProps(defaultState.defaultEditConfig, props.editConfig))
    const getScrollX = computed(() => mergeProps(defaultState.defaultScrollX, props.scrollX))
    const getScrollY = computed(() => mergeProps(defaultState.defaultScrollY, props.scrollY))
    const selectedType = computed(() => props.columns.find(column => column?.type)?.type)
    const canPagination = computed(
      () => props.data?.length > 0 && state.customColumns?.filter(val => val?.visible !== false).length > 0
    )
    /**
     * methods
     */
    // 单选
    const handleRadioChange = ({ row, rowIndex, $rowIndex, column, columnIndex, $columnIndex, $event }) => {
      emit('update:selected-value', [row])
      emit('radio-change', { row, rowIndex, $rowIndex, column, columnIndex, $columnIndex, $event })
    }
    // 勾选
    const handleCheckboxChange = ({
      records, // type=checkbox
      reserves, // checkbox-config.reserve
      indeterminates, // tree-config+type=checkbox
      checked,
      row,
      rowIndex,
      $rowIndex,
      column,
      columnIndex,
      $columnIndex,
      $event
    }) => {
      const $xGrid = unref(xGrid)
      const selectedValue = $xGrid?.getCheckboxRecords()
      if (props.checkboxConfig?.reserve) {
        const reserveRecords = $xGrid?.getCheckboxReserveRecords()
        selectedValue.push(...reserveRecords)
      }
      emit('update:selected-value', selectedValue)
      emit('checkbox-change', {
        records,
        reserves,
        indeterminates,
        checked,
        row,
        rowIndex,
        $rowIndex,
        column,
        columnIndex,
        $columnIndex,
        $event
      })
    }
    // 全选
    const handleCheckboxAll = ({ records, reserves, indeterminates, checked, $event }) => {
      const $xGrid = unref(xGrid)
      const selectedValue = $xGrid?.getCheckboxRecords()
      if (props.checkboxConfig?.reserve) {
        const reserveRecords = $xGrid?.getCheckboxReserveRecords()
        selectedValue.push(...reserveRecords)
      }
      emit('update:selected-value', selectedValue)
      emit('checkbox-all', { records, reserves, indeterminates, checked, $event })
    }
    // 监听selectedValue，实现双向绑定
    watch(
      () => props.selectedValue,
      selectedValue => {
        // flush: 'post' 在某些情况下不生效，故使用nextTick
        nextTick(() => {
          const $xGrid = unref(xGrid)
          if (isEmpty(selectedValue)) {
            // 多选框
            if (unref(selectedType) === 'checkbox') {
              $xGrid?.clearCheckboxRow()
              if (props.checkboxConfig?.reserve) {
                $xGrid?.clearCheckboxReserve()
              }
            }
            // 单选框
            if (unref(selectedType) === 'radio') {
              $xGrid?.clearRadioRow()
              if (props.radioConfig?.reserve) {
                $xGrid?.clearRadioReserve()
              }
            }
          } else {
            // 多选框
            if (unref(selectedType) === 'checkbox') {
              $xGrid?.setCheckboxRow(selectedValue, true)
            }
            // 单选框
            if (unref(selectedType) === 'radio') {
              $xGrid?.setRadioRow(selectedValue[0])
            }
          }
        })
      },
      { immediate: true, deep: true }
    )
    // 单元格点击事件
    const handleCellClick = ({
      row,
      rowIndex,
      $rowIndex,
      column,
      columnIndex,
      $columnIndex,
      triggerRadio,
      triggerCheckbox,
      triggerTreeNode,
      triggerExpandNode,
      $event
    }) => {
      emit('cell-click', {
        row,
        rowIndex,
        $rowIndex,
        column,
        columnIndex,
        $columnIndex,
        triggerRadio,
        triggerCheckbox,
        triggerTreeNode,
        triggerExpandNode,
        $event
      })
    }
    // 单元格双击事件
    const handleCellDblclick = ({ row, rowIndex, $rowIndex, column, columnIndex, $columnIndex, $event }) => {
      emit('cell-dblclick', {
        row,
        rowIndex,
        $rowIndex,
        column,
        columnIndex,
        $columnIndex,
        $event
      })
    }
    // 编辑
    const handleEditClosed = ({ row, rowIndex, $rowIndex, column, columnIndex, $columnIndex }) => {
      // 判断单元格值是否被修改
      const $xGrid = unref(xGrid)
      const field = column.property
      if ($xGrid.isUpdateByRow(row, field)) {
        emit('edit-updated', { row, field, rowIndex, $rowIndex, column, columnIndex, $columnIndex })
        // $xGrid.reloadRow(row, {})
      }
      emit('edit-closed', { row, rowIndex, $rowIndex, column, columnIndex, $columnIndex })
    }
    // 编辑校验
    const handleValidError = ({ rule, row, rowIndex, $rowIndex, column, columnIndex, $columnIndex }) => {
      emit('valid-error', { rule, row, rowIndex, $rowIndex, column, columnIndex, $columnIndex })
    }
    // 筛选
    const handleFilterChange = ({ column, property, values, datas, filterList, $event }) => {
      const filters = {}
      filterList.forEach(({ column, property, values, datas }) => {
        const alias = column?.filterRender?.alias || property
        if (column?.filterRender) {
          filters[alias] = datas[0]
        } else {
          filters[alias] = column?.filterMultiple ? values : values.join()
        }
      })
      emit('filter-change', { column, property, values, datas, filterList, $event })
      if (unref(getFilterConfig)?.remote) {
        emit('search', filters, 'filter')
      } else {
        // xGrid.value?.updateData()
      }
    }
    // 筛选面板显示隐藏
    const handleFilterVisible = ({ column, property, visible, filterList, $event }) => {
      emit('filter-visible', { column, property, visible, filterList, $event })
    }
    // 清除所有筛选条件
    const handleClearFilter = ({ filterList, $event }) => {
      emit('clear-filter', { filterList, $event })
      if (unref(getFilterConfig)?.remote) {
        emit('search', {}, 'filter')
      }
    }
    // 排序
    const handleSortChange = ({ column, property, order, sortBy, sortList, $event }) => {
      const sorts = order ? { sortBy: order.toUpperCase(), sortKey: property } : {}
      emit('sort-change', { column, property, order, sortBy, sortList, $event })
      if (unref(getSortConfig)?.remote) {
        emit('search', sorts, 'sort')
      } else {
        // xGrid.value?.updateData()
      }
    }
    // 清除所有排序条件
    const handleClearSort = ({ sortList, $event }) => {
      emit('clear-sort', { sortList, $event })
      if (unref(getSortConfig)?.remote) {
        emit('search', {}, 'sort')
      }
    }
    // 当行展开或收起时会触发该事件
    const handleToggleRowExpand = ({
      expanded,
      row,
      rowIndex,
      $rowIndex,
      column,
      columnIndex,
      $columnIndex,
      $event
    }) => {
      emit('toggle-row-expand', { expanded, row, rowIndex, $rowIndex, column, columnIndex, $columnIndex, $event })
    }
    // 当树节点展开或收起时会触发该事件
    const handleToggleTreeExpand = ({ expanded, row, column, columnIndex, $columnIndex, $event }) => {
      emit('toggle-tree-expand', { expanded, row, column, columnIndex, $columnIndex, $event })
    }
    // 拖拽列
    const handleResizableChange = async ({ column }) => {
      // 更新column宽度
      const customColumns = state.customColumns.find(v => getField(column) === getField(v))
      if (customColumns) {
        customColumns.width = column.renderWidth
      }
      setColumnsToStorage()
    }
    // 配置列
    const handleSettingChange = columns => {
      const $xGrid = unref(xGrid)
      state.customColumns = columns
      $xGrid?.reloadColumn(columns)
      setColumnsToStorage()
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
    const hasToolBar = computed(() => !!slots['toolBar'])
    const hasHeaderBar = computed(() => !!slots['headerBar'])
    const hasFooterBar = computed(() => !!slots['footerBar'])

    expose({
      xGrid
    })

    return {
      xGrid,
      simpleImage: Empty.PRESENTED_IMAGE_SIMPLE,
      ...toRefs(state),
      pages,
      hasSearchBar,
      hasToolBar,
      hasHeaderBar,
      hasFooterBar,
      getGridSlots,
      getRowConfig,
      getColumnConfig,
      getRadioConfig,
      getCheckboxConfig,
      getSortConfig,
      getFilterConfig,
      getEditConfig,
      getScrollX,
      getScrollY,
      canPagination,
      handleRadioChange,
      handleCheckboxChange,
      handleCheckboxAll,
      handleCellClick,
      handleCellDblclick,
      handleEditClosed,
      handleValidError,
      handleFilterChange,
      handleFilterVisible,
      handleClearFilter,
      handleSortChange,
      handleClearSort,
      handleToggleRowExpand,
      handleToggleTreeExpand,
      handleResizableChange,
      handleSettingChange
    }
  }
})
</script>
<style lang="scss" scoped>
.x-grid {
  background-color: #f0f2f5;

  :deep(.vxe-grid--form-wrapper) {
    .x-search {
      margin-bottom: 10px;
    }
  }

  :deep(.vxe-grid--toolbar-wrapper) {
    .vxe-toolbar {
      padding-top: 0;
      padding-bottom: 0;
      height: auto;

      .toolbar {
        display: flex;
        flex-wrap: wrap;
        margin: 10px 0;
      }
    }

    .vxe-tools--wrapper {
      .vxe-button {
        margin: 10px 0 10px 10px;
      }
    }

    .vxe-tools--operate {
      .vxe-button {
        margin: 10px 0 10px 10px;
      }
    }
  }

  :deep(.vxe-grid--bottom-wrapper) {
    border: 1px solid #f0f0f0;
    border-top: 0;
    background-color: #f8f8f9;
  }

  // 处理表头排序和筛选图标向右对齐
  :deep(.vxe-table--header) {
    .vxe-cell {
      display: flex;
      align-items: center;

      .vxe-cell--title {
        flex: 1;
      }
    }
  }

  .ant-pagination {
    height: 52px;
    padding: 10px;
  }

  // 全屏
  .is--maximize {
    padding: 10px;
  }
}
</style>
