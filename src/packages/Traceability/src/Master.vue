<template>
  <div class="master-info">
    <div class="title">主要信息</div>
    <x-table v-bind="materialOptions">
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
        <slot name="bodyCell" v-bind="{ text, record, index, column }">
          <template v-if="mode !== 'view'">
            <!--物料名称-->
            <template v-if="column.dataIndex === 'materialName'">
              <a-input v-model:value="record.materialName"></a-input>
            </template>
            <!--棉花供应商-->
            <template v-if="column.dataIndex === 'cottonSupplierName'">
              <a-input v-model:value="record.cottonSupplierName"></a-input>
            </template>
            <!--材料原产地证明编号-->
            <template v-if="column.dataIndex === 'materialOriginCertificateNo'">
              <a-input v-model:value="record.materialOriginCertificateNo"></a-input>
            </template>
            <!--材料产地(国家.中文简体)-->
            <template v-if="column.dataIndex === 'materialOriginPlace'">
              <a-input v-model:value="record.materialOriginPlace"></a-input>
            </template>
            <!--材料采购合同号-->
            <template v-if="column.dataIndex === 'purchaseContractNo'">
              <a-input v-model:value="record.purchaseContractNo"></a-input>
            </template>
            <!--材料采购时间-->
            <template v-if="column.dataIndex === 'purchaseTime'">
              <a-input v-model:value="record.purchaseTime"></a-input>
            </template>
            <!--材料采购数量(KG)-->
            <template v-if="column.dataIndex === 'purchaseQuantity'">
              <a-input v-model:value="record.purchaseQuantity"></a-input>
            </template>
            <!--材料提货单号-->
            <template v-if="column.dataIndex === 'materialLadeBillNo'">
              <a-input v-model:value="record.materialLadeBillNo"></a-input>
            </template>
            <!--坯纱采购合同号-->
            <template v-if="column.dataIndex === 'blankYarnPurchaseNo'">
              <a-input v-model:value="record.blankYarnPurchaseNo"></a-input>
            </template>
            <!--坯纱产地(国家.中文简体)-->
            <template v-if="column.dataIndex === 'blankYarnOriginPlace'">
              <a-input v-model:value="record.blankYarnOriginPlace"></a-input>
            </template>
            <!--坯纱总采购总量(KG)-->
            <template v-if="column.dataIndex === 'blankYarnPurchaseQuantity'">
              <a-input v-model:value="record.blankYarnPurchaseQuantity"></a-input>
            </template>
            <!--坯纱采购发票号-->
            <template v-if="column.dataIndex === 'blankYarnInvoiceNo'">
              <a-input v-model:value="record.blankYarnInvoiceNo"></a-input>
            </template>
            <!--坯纱装箱单号-->
            <template v-if="column.dataIndex === 'blankYarnPackingNo'">
              <a-input v-model:value="record.blankYarnPackingNo"></a-input>
            </template>
            <!--坯纱提货单/物流单号-->
            <template v-if="column.dataIndex === 'logisticsNo'">
              <a-input v-model:value="record.logisticsNo"></a-input>
            </template>
          </template>
        </slot>
      </template>
    </x-table>
    <div class="title">
      请提供原件复印件
      <span class="tips">（支持扩展名： .png .jpg.pdf 单文件大小：4M以下，单个类型文件最多20个）</span>
      <a-button type="link">查看模板</a-button>
    </div>
    <x-table v-bind="photocopyOptions">
      <template #bodyCell="{ text, record, index, column }">
        <slot name="bodyCell" v-bind="{ text, record, index, column }">
          <template v-if="mode === 'view'">
            <x-image urls="record[column.dataIndex]"></x-image>
          </template>
          <template v-else>
            <x-upload v-model:file-list="record[column.dataIndex]" :custom-request="customUpload" />
          </template>
        </slot>
      </template>
    </x-table>
  </div>
</template>
<script>
import { defineComponent, inject, reactive, watch } from 'vue'
import XTable from '@packages/components/Table/index.vue'
import XUpload from '@packages/components/Upload/index.vue'
import XImage from '@packages/components/Image'

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
    materialColumns: { type: Array },
    photocopyColumns: { type: Array },
    emptyText: String
  },
  emits: ['del'],
  setup(props) {
    const traceabilityData = inject('traceabilityData')

    const defaultMaterialColumns = [
      { title: '物料名称', width: 120, dataIndex: 'materialName', required: true },
      { title: '面料供应商', width: 120, dataIndex: 'materialSupplierCode', required: true },
      { title: '棉花供应商', width: 120, dataIndex: 'cottonSupplierName', required: true },
      { title: '材料原产地证明编号', width: 160, dataIndex: 'materialOriginCertificateNo', required: true },
      { title: '材料产地', width: 120, dataIndex: 'materialOriginPlace', required: true, subTitle: '(国家.中文简体)' },
      { title: '材料采购合同号', width: 140, dataIndex: 'purchaseContractNo', required: true },
      { title: '材料采购时间', width: 120, dataIndex: 'purchaseTime', required: true },
      { title: '材料采购数量(KG)', width: 140, dataIndex: 'purchaseQuantity', required: true },
      {
        title: '材料提货单号',
        width: 180,
        dataIndex: 'materialLadeBillNo',
        required: true,
        subTitle: '(当坯纱产地=中国时选填)'
      },
      { title: '坯纱采购合同号', width: 140, dataIndex: 'blankYarnPurchaseNo', required: true },
      { title: '坯纱产地', width: 120, dataIndex: 'blankYarnOriginPlace', required: true, subTitle: '(国家.中文简体)' },
      { title: '坯纱总采购总量(KG)', width: 160, dataIndex: 'blankYarnPurchaseQuantity', required: true },
      { title: '坯纱采购发票号', width: 140, dataIndex: 'blankYarnInvoiceNo', required: true },
      { title: '坯纱装箱单号', width: 120, dataIndex: 'blankYarnPackingNo' },
      { title: '坯纱提货单/物流单号', width: 200, dataIndex: 'logisticsNo' }
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
      () => traceabilityData.value?.masterData,
      list => {
        materialOptions.dataSource = (list || []).map(val => ({ ...val, uid: Date.now() }))
      },
      { deep: true, immediate: true }
    )

    const defaultPhotocopyColumns = [
      { title: '棉花产地证明', width: '14%', dataIndex: 'certificateImgs' },
      { title: '棉花采购合同', width: '14%', dataIndex: 'contractImgs' },
      { title: '棉花提货单', width: '14%', dataIndex: 'logisticsImgs' },
      { title: '棉纱采购合同', width: '14%', dataIndex: 'contractYarnImgs' },
      { title: '棉纱提货单', width: '14%', dataIndex: 'logisticsYarnImgs' },
      { title: '棉纱装箱单', width: '14%', dataIndex: 'packingImgs' },
      { title: '棉纱采购发票', width: '14%', dataIndex: 'invoiceImgs' }
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
      () => traceabilityData.value?.photocopyData,
      list => {
        photocopyOptions.dataSource = (list || []).map(val => ({ ...val, uid: Date.now() }))
      },
      { deep: true, immediate: true }
    )

    return {
      materialOptions,
      photocopyOptions
    }
  }
})
</script>
<style lang="scss" scoped>
.master-info {
  .x-table {
    margin-bottom: 16px;
  }
}
</style>
