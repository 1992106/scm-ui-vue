<template>
  <div class="dyeing-info">
    <a-form v-if="tableOptions.dataSource.length === 0">
      <a-form-item label="请导入染整明细" name="file">
        <a-upload :before-upload="beforeUpload" @change="handleUpload">
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
        染整信息
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
            <div v-if="column?.subTitle">{{ column.subTitle }}</div>
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
              <a-button v-show="record?.itemId == null" type="link" size="small" @click="handleDel(index)">
                删除
              </a-button>
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
  name: 'Dyeing',
  components: {
    'x-table': XTable,
    UploadOutlined
  },
  props: {
    mode: { type: String, required: true },
    dyeingRowKey: [String, Function],
    dyeingColumns: Array,
    customUploadDyeing: Function,
    customDownloadDyeing: Function,
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
      { title: '染整缸号', width: 100, dataIndex: 'dyeVatNo', type: 'AInput', required: true },
      {
        title: '色布/色纱重量(KG)',
        subTitle: '针织必填/梭织不能填',
        width: 100,
        dataIndex: 'colorClothWeight',
        type: 'AInputNumber'
      },
      {
        title: '色布米数(M)',
        subTitle: '针织不能填/梭织必填',
        width: 100,
        dataIndex: 'colorClothLength',
        type: 'AInputNumber'
      },
      { title: '染整颜色', width: 100, dataIndex: 'color', type: 'AInput' },
      { title: '染厂', width: 100, dataIndex: 'dyeFactory', type: 'AInput' },
      { title: '操作', width: 60, dataIndex: 'actions' }
    ]
    const tableOptions = reactive({
      rowKey: props.dyeingRowKey,
      emptyText: props.emptyText,
      size: 'small',
      columns: (props.dyeingColumns || defaultColumns).map(column => ({
        ...column,
        visible: column?.dataIndex === 'actions' ? props.mode !== 'view' : true
      })),
      dataSource: [],
      showPagination: false
    })
    // 获取总结栏长度
    const colSpanLength = computed(() => tableOptions.columns.filter(val => val?.visible !== false).length)

    watch(
      () => traceabilityData.value?.dyeingData,
      list => {
        const now = Date.now().toString()
        tableOptions.dataSource = (list || []).map((val, i) => ({ ...val, uid: now + i }))
      },
      { deep: true, immediate: true }
    )

    const handleUpload = async () => {
      const { customUploadDyeing = Function.prototype } = props
      if (!isFunction(customUploadDyeing)) return
      state.disabled = true
      await execRequest(customUploadDyeing(), {
        success: ({ data }) => {
          if (data.length) {
            const now = Date.now().toString()
            data.forEach((item, index) => {
              tableOptions.dataSource.push({
                uid: now + index,
                dyeVatNo: '',
                colorClothWeight: '',
                colorClothLength: '',
                color: '',
                dyeFactory: ''
              })
            })
          }
        }
      })
      state.disabled = false
    }

    const handleDownload = async () => {
      const { customDownloadDyeing } = props
      if (!isFunction(customDownloadDyeing)) return
      state.loading = true
      await execRequest(customDownloadDyeing(), {
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
        uid: Date.now(),
        dyeVatNo: '',
        colorClothWeight: '',
        colorClothLength: '',
        color: '',
        dyeFactory: ''
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
