<template>
  <a-tooltip v-model:visible="visible" color="#fff" trigger="click" placement="bottomRight">
    <a-button shape="circle" size="middle" title="导出" @click="handleClick">
      <template #icon>
        <ExportOutlined />
      </template>
    </a-button>
    <template #title>
      <div class="x-table__excel-export">
        <div class="item" @click="handleExportExcel('current')">当前页数据</div>
        <div v-if="exportConfig?.customRequest" class="item" @click="handleExportExcel('limit')">
          {{ exportConfig?.limit }}条数据
        </div>
        <div v-if="exportConfig?.customExport" class="item" @click="handleExportExcel('all')">全量数据</div>
      </div>
    </template>
  </a-tooltip>
</template>
<script>
import { defineComponent, reactive, toRefs } from 'vue'
import { message } from 'ant-design-vue'
import { ExportOutlined } from '@ant-design/icons-vue'
import { cloneDeep } from 'lodash-es'
import { createXExportExcel } from '@components/Excel'
import { getXlsxColumns } from '@components/Table/src/utils'

export default defineComponent({
  name: 'ExcelExport',
  components: {
    ExportOutlined
  },
  props: {
    // 自定义列
    columns: { type: Array, required: true, default: () => [] },
    // 表格数据
    dataSource: { type: Array, default: () => [] },
    // 导出配置
    exportConfig: { type: Object }
  },
  emits: ['change'],
  setup: function (props) {
    const state = reactive({
      visible: false,
      customColumns: []
    })

    const handleClick = () => {
      state.visible = !state.visible
      if (state.visible) {
        const cloneColumns = cloneDeep(props.columns)
        state.customColumns = getXlsxColumns(cloneColumns)
      }
    }

    // 导出excel
    const handleExportExcel = key => {
      state.visible = false
      const { dataSource, exportConfig: { limit, customRequest, customExport } = {} } = props
      if (key === 'current') {
        if (dataSource.length === 0) {
          message.info('当前页数据为空！')
          return
        }
        createXExportExcel({
          dataSource,
          columns: state.customColumns,
          title: `导出当前页条数据(${dataSource.length})条`
        })
      } else if (key === 'limit') {
        createXExportExcel({
          customRequest: customRequest,
          columns: state.customColumns,
          title: `导出${limit}条数据`
        })
      } else if (key === 'all') {
        createXExportExcel({
          customExport: customExport,
          title: `导出全量数据`
        })
      }
    }

    return {
      ...toRefs(state),
      handleClick,
      handleExportExcel
    }
  }
})
</script>
<style lang="scss" scoped>
.x-table__excel-export {
  margin: 0 -8px;
  color: $text-color;
  .item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 2px 10px;
    cursor: pointer;
    &:hover {
      background-color: #1890ff1a;
    }
  }
}
</style>
