<template>
  <div class="weaving-info">
    <a-form v-if="tableOptions.dataSource.length === 0">
      <a-form-item label="请导入织布明细" name="file">
        <a-upload :showUploadList="false" :before-upload="beforeUpload" @change="handleUpload">
          <a-button>
            <UploadOutlined></UploadOutlined>
            上传
          </a-button>
        </a-upload>
        <template #extra>
          <div>
            支持扩展名：xlx,xlsx；文件大小：4M以下
            <a-button type="link" :loading="loading" @click="handleDownload">查看模板</a-button>
          </div>
        </template>
      </a-form-item>
    </a-form>
    <template v-else>
      <div>
        织布信息
        <a-button type="link" :loading="loading" @click="handleDownload">查看模板</a-button>
        <a-upload :showUploadList="false" :before-upload="beforeUpload" @change="handleUpload">
          <a-button type="link">继续导入</a-button>
        </a-upload>
      </div>
      <x-table v-bind="tableOptions">
        <template #headerCell="{ title, column }">
          <slot name="headerCell" v-bind="{ title, column }">
            <div>
              <span v-if="column?.required === true" class="required">*</span>
              {{ title }}
            </div>
            <div v-if="column?.subTItle">{{ column.subTItle }}</div>
          </slot>
        </template>
        <template #bodyCell="{ text, record, index, column }">
          <slot name="bodyCell" v-bind="{ text, record, index, column }" :onDelete="handleDel">
            <template v-if="column?.type === 'AInput'">
              <a-input v-model:value="record[column.dataIndex]"></a-input>
            </template>
            <template v-if="column?.type === 'AInputNumber'">
              <a-input-number v-model:value="record[column.dataIndex]"></a-input-number>
            </template>
            <template v-if="column.dataIndex === 'actions'">
              <a-button type="link" size="small" @click="handleDel(index)">删除</a-button>
            </template>
          </slot>
        </template>
        <template v-if="mode !== 'view'" #summary>
          <a-table-summary-row>
            <a-table-summary-cell :col-span="colSpanLength" align="center">
              <a-button type="link" size="small" @click="handleAdd">添加一行</a-button>
            </a-table-summary-cell>
          </a-table-summary-row>
        </template>
      </x-table>
    </template>
  </div>
</template>
<script>
import { computed, defineComponent, inject, reactive, toRefs, watch } from 'vue'
import { UploadOutlined } from '@ant-design/icons-vue'
import XTable from '@packages/components/Table/index.vue'
import { isFunction } from 'lodash-es'
import { download, execRequest } from '@src/utils'

export default defineComponent({
  name: 'Weaving',
  components: {
    'x-table': XTable,
    UploadOutlined
  },
  props: {
    mode: { type: String, required: true },
    weavingRowKey: [String, Function],
    weavingColumns: Array,
    customUploadWeaving: Function,
    customDownloadWeaving: Function,
    emptyText: String
  },
  emits: ['del'],
  setup(props) {
    const state = reactive({
      loading: false,
      disabled: false
    })

    const beforeUpload = inject('beforeUpload')
    const traceabilityData = inject('traceabilityData')

    const defaultColumns = [
      { title: '织单号', width: 100, dataIndex: 'weavingOrderNo', type: 'AInput', required: true },
      { title: '坯布条编码', width: 100, dataIndex: 'greyClothNo', type: 'AInput', required: true },
      { title: '坯纱采购合同号', width: 100, dataIndex: 'blankYarnPurchaseNo', type: 'AInput', required: true },
      {
        title: '棉成分占比(0到100)',
        width: 100,
        dataIndex: 'cottonComponentsRate',
        type: 'AInputNumber',
        required: true
      },
      { title: '坯布重量(KG)', width: 100, dataIndex: 'colorClothWeight', type: 'AInputNumber', required: true },
      { title: '坯布米数(M)', width: 100, dataIndex: 'colorClothLength', type: 'AInput', required: true },
      { title: '织厂', width: 100, dataIndex: 'textileMill', type: 'AInput', required: true },
      { title: '操作', width: 60, dataIndex: 'actions' }
    ]
    const tableOptions = reactive({
      rowKey: props.weavingRowKey,
      emptyText: props.emptyText,
      size: 'small',
      columns: (props.weavingColumns || defaultColumns).map(column => ({
        ...column,
        visible: column?.dataIndex === 'actions' ? props.mode !== 'view' : true
      })),
      dataSource: [],
      showPagination: false
    })
    // 获取总结栏长度
    const colSpanLength = computed(() => tableOptions.columns.filter(val => val?.visible !== false).length)

    watch(
      () => traceabilityData.value?.weavingData,
      list => {
        tableOptions.dataSource = list || []
      },
      { deep: true, immediate: true }
    )

    const handleUpload = async () => {
      const { customUploadWeaving = Function.prototype } = props
      if (!isFunction(customUploadWeaving)) return
      state.disabled = true
      await execRequest(customUploadWeaving(), {
        success: ({ data }) => {
          tableOptions.dataSource.push({
            weavingOrderNo: '',
            greyClothNo: '',
            blankYarnPurchaseNo: '',
            cottonComponentsRate: '',
            colorClothWeight: '',
            colorClothLength: '',
            textileMill: ''
          })
        },
        fail: () => {}
      })
      state.disabled = false
    }

    const handleDownload = async () => {
      const { customDownloadWeaving } = props
      if (!isFunction(customDownloadWeaving)) return
      state.loading = true
      await execRequest(customDownloadWeaving(), {
        success: ({ data }) => {
          if (data) {
            download(data?.url, data?.fileName)
          }
        }
      })
      state.loading = false
    }

    const handleDel = index => {
      tableOptions.dataSource.splice(index, 1)
    }

    const handleAdd = () => {
      tableOptions.dataSource.push({
        weavingOrderNo: '',
        greyClothNo: '',
        blankYarnPurchaseNo: '',
        cottonComponentsRate: '',
        colorClothWeight: '',
        colorClothLength: '',
        textileMill: ''
      })
    }

    return {
      ...toRefs(state),
      beforeUpload,
      tableOptions,
      colSpanLength,
      handleUpload,
      handleDownload,
      handleDel,
      handleAdd
    }
  }
})
</script>
