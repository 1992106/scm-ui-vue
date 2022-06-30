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
            <!--染整缸号-->
            <template v-if="column.dataIndex === 'dyeVatNo'">
              <a-input v-model:value="record.dyeVatNo"></a-input>
            </template>
            <!--色布/色纱重量(KG)-->
            <template v-if="column.dataIndex === 'colorClothWeight'">
              <a-input v-model:value="record.colorClothWeight"></a-input>
            </template>
            <!--色布米数(M)-->
            <template v-if="column.dataIndex === 'colorClothLength'">
              <a-input v-model:value="record.colorClothLength"></a-input>
            </template>
            <!--染整颜色-->
            <template v-if="column.dataIndex === 'color'">
              <a-input v-model:value="record.color"></a-input>
            </template>
            <!--染厂-->
            <template v-if="column.dataIndex === 'dyeFactory'">
              <a-input v-model:value="record.dyeFactory"></a-input>
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
      { title: '染整缸号', width: 100, dataIndex: 'dyeVatNo', required: true },
      { title: '色布/色纱重量(KG)', width: 100, dataIndex: 'colorClothWeight', required: true },
      { title: '色布米数(M)', width: 100, dataIndex: 'colorClothLength', required: true },
      { title: '染整颜色', width: 100, dataIndex: 'color', required: true },
      { title: '染厂', width: 100, dataIndex: 'dyeFactory', required: true },
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
        tableOptions.dataSource = list || []
      },
      { deep: true, immediate: true }
    )

    const handleUpload = async () => {
      const { customUploadDyeing = Function.prototype } = props
      if (!isFunction(customUploadDyeing)) return
      state.disabled = true
      await execRequest(customUploadDyeing(), {
        success: ({ data }) => {
          tableOptions.dataSource.push({
            dyeVatNo: '',
            colorClothWeight: '',
            colorClothLength: '',
            color: '',
            dyeFactory: ''
          })
        },
        fail: () => {}
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
