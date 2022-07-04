<template>
  <div class="master-info">
    <div class="title">主要信息</div>
    <x-table v-bind="materialOptions">
      <template #headerCell="{ title, column }">
        <slot name="materialHeaderCell" v-bind="{ title, column }">
          <div>
            <span v-if="column?.required === true" class="required">*</span>
            {{ title }}
          </div>
          <div v-if="column?.subTitle">{{ column.subTitle }}</div>
        </slot>
      </template>
      <template #bodyCell="{ text, record, index, column }">
        <slot
          name="materialBodyCell"
          v-bind="{ text, record, index, column }"
          :onUpdate="() => handleChange('material')">
          <template v-if="mode === 'view'">
            <template v-if="column?.dataIndex === 'materialSupplierCode'">
              <span>{{ record?.materialSupplierName || '--' }}</span>
            </template>
          </template>
          <template v-else>
            <template v-if="column?.type === 'AInput'">
              <a-input v-model:value="record[column.dataIndex]" @change="handleChange('material')"></a-input>
            </template>
            <template v-if="column?.type === 'AInputNumber'">
              <a-input-number
                v-model:value="record[column.dataIndex]"
                @change="handleChange('material')"></a-input-number>
            </template>
          </template>
        </slot>
      </template>
    </x-table>
    <div class="title">
      <template v-if="mode === 'view'">原件复印件</template>
      <template v-else>
        请提供原件复印件
        <span class="tips">（支持扩展名： .png .jpg.pdf 单文件大小：4M以下，单个类型文件最多20个）</span>
        <a-button type="link" :loading="loading" @click="handleDownloadPhotocopy">下载示例文件</a-button>
      </template>
    </div>
    <x-table v-bind="photocopyOptions">
      <template #headerCell="{ title, column }">
        <slot name="photocopyHeaderCell" v-bind="{ title, column }">
          <div>
            <span v-if="column?.required === true" class="required">*</span>
            {{ title }}
          </div>
        </slot>
      </template>
      <template #bodyCell="{ text, record, index, column }">
        <slot
          name="photocopyBodyCell"
          v-bind="{ text, record, index, column }"
          :onUpdate="() => handleChange('photocopy')">
          <template v-if="mode === 'view'">
            <x-image :urls="record[column.dataIndex]"></x-image>
          </template>
          <template v-else>
            <x-upload
              v-model:file-list="record[column.dataIndex]"
              :custom-request="customUpload"
              :before-upload="beforeUpload"
              @change="handleChange('photocopy')" />
          </template>
        </slot>
      </template>
    </x-table>
  </div>
</template>
<script>
import { defineComponent, inject, nextTick, reactive, toRefs, watch } from 'vue'
import XTable from '@packages/components/Table/index.vue'
import XUpload from '@packages/components/Upload/index.vue'
import XImage from '@packages/components/Image'
import { isFunction } from 'lodash-es'
import { download, execRequest } from '@src/utils'

export default defineComponent({
  name: 'Master',
  components: {
    'x-table': XTable,
    'x-upload': XUpload,
    'x-image': XImage
  },
  props: {
    mode: { type: String, required: true },
    customUpload: { type: Function },
    beforeUpload: { type: Function },
    materialColumns: { type: Array },
    photocopyColumns: { type: Array },
    customDownloadPhotocopy: { type: Function },
    emptyText: String
  },
  emits: ['del'],
  setup(props) {
    const state = reactive({
      loading: false
    })

    const traceabilityData = inject('traceabilityData')

    const defaultMaterialColumns = [
      { title: '物料名称', width: 140, dataIndex: 'materialName', type: 'AInput', required: true },
      { title: '面料供应商', width: 180, dataIndex: 'materialSupplierCode', type: 'ASelect', required: true },
      { title: '棉花供应商', width: 160, dataIndex: 'cottonSupplierName', type: 'AInput', required: true },
      {
        title: '材料原产地证明编号',
        width: 160,
        dataIndex: 'materialOriginCertificateNo',
        type: 'AInput',
        required: true
      },
      {
        title: '材料产地',
        subTitle: '(国家.中文简体)',
        width: 120,
        dataIndex: 'materialOriginPlace',
        type: 'AInput',
        required: true
      },
      { title: '材料采购合同号', width: 140, dataIndex: 'purchaseContractNo', type: 'AInput', required: true },
      { title: '材料采购时间', width: 120, dataIndex: 'purchaseTime', type: 'AInput', required: true },
      { title: '材料采购数量(KG)', width: 140, dataIndex: 'purchaseQuantity', type: 'AInputNumber', required: true },
      {
        title: '材料提货单号',
        subTitle: '(当坯纱产地=中国时选填)',
        width: 180,
        dataIndex: 'materialLadeBillNo',
        type: 'AInput'
      },
      { title: '坯纱采购合同号', width: 140, dataIndex: 'blankYarnPurchaseNo', type: 'AInput', required: true },
      {
        title: '坯纱产地',
        subTitle: '(国家.中文简体)',
        width: 120,
        dataIndex: 'blankYarnOriginPlace',
        type: 'AInput',
        required: true
      },
      {
        title: '坯纱总采购总量(KG)',
        width: 160,
        dataIndex: 'blankYarnPurchaseQuantity',
        type: 'AInput',
        required: true
      },
      { title: '坯纱采购发票号', width: 140, dataIndex: 'blankYarnInvoiceNo', type: 'AInput', required: true },
      { title: '坯纱装箱单号', width: 120, dataIndex: 'blankYarnPackingNo', type: 'AInput' },
      { title: '坯纱提货单/物流单号', width: 200, dataIndex: 'logisticsNo', type: 'AInput' }
    ]
    const materialOptions = reactive({
      rowKey: 'uid',
      emptyText: props.emptyText,
      size: 'small',
      columns: props.materialColumns || defaultMaterialColumns,
      dataSource: [],
      showPagination: false
    })
    watch(
      () => traceabilityData.value.materialData,
      list => {
        const now = Date.now().toString()
        materialOptions.dataSource = (list || []).map((val, i) => ({ ...val, uid: val?.uid || now + i }))
      },
      { immediate: true }
    )
    const asyncMaterialData = () => {
      nextTick(() => {
        Object.assign(traceabilityData.value.materialData[0], materialOptions.dataSource[0])
      })
    }

    const defaultPhotocopyColumns = [
      { title: '1.棉花产地证明', width: '14%', dataIndex: 'certificateImgs', required: true },
      { title: '2.棉花采购合同', width: '14%', dataIndex: 'contractImgs' },
      { title: '3.棉花提货单', width: '14%', dataIndex: 'logisticsImgs' },
      { title: '4.棉纱采购合同', width: '14%', dataIndex: 'contractYarnImgs' },
      { title: '5.棉纱提货单', width: '14%', dataIndex: 'logisticsYarnImgs' },
      { title: '6.棉纱装箱单', width: '14%', dataIndex: 'packingImgs' },
      { title: '7.棉纱采购发票', width: '14%', dataIndex: 'invoiceImgs' }
    ]
    const photocopyOptions = reactive({
      scroll: {
        y: 320
      },
      rowKey: 'uid',
      emptyText: props.emptyText,
      size: 'small',
      columns: props.photocopyColumns || defaultPhotocopyColumns,
      dataSource: [],
      showPagination: false
    })
    watch(
      () => traceabilityData.value.photocopyData,
      list => {
        const now = Date.now().toString()
        photocopyOptions.dataSource = (list || []).map((val, i) => ({ ...val, uid: val?.uid || now + i }))
      },
      { immediate: true }
    )

    const asyncPhotocopyData = () => {
      nextTick(() => {
        Object.assign(traceabilityData.value.photocopyData[0], photocopyOptions.dataSource[0])
      })
    }

    const handleChange = key => {
      if (key === 'material') {
        asyncMaterialData()
      } else if (key === 'photocopy') {
        asyncPhotocopyData()
      }
    }

    const handleDownloadPhotocopy = async () => {
      const { customDownloadPhotocopy } = props
      if (!isFunction(customDownloadPhotocopy)) return
      state.loading = true
      await execRequest(customDownloadPhotocopy(), {
        success: ({ data }) => {
          if (data) {
            download(data?.url, data?.fileName)
          }
        }
      })
      state.loading = false
    }

    return {
      ...toRefs(state),
      materialOptions,
      photocopyOptions,
      handleChange,
      handleDownloadPhotocopy
    }
  }
})
</script>
<style lang="scss" scoped>
.master-info {
  .x-table {
    margin-bottom: 16px;

    :deep(.x-upload) {
      .ant-upload-list-picture-card {
        min-height: 64px;
      }

      .ant-upload.ant-upload-select-picture-card,
      .ant-upload-list-picture-card-container {
        width: 64px;
        height: 64px;
      }

      .ant-upload-list-picture-card .ant-upload-list-item-info::before {
        left: 0;
      }
    }
  }
}
</style>
