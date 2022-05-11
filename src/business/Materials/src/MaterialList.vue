<template>
  <x-table v-bind="tableProps" v-model:pagination="tableProps.pagination" @search="handleSearch">
    <template #bodyCell="{ column, record }">
      <template v-if="column.dataIndex === 'material'">
        <div>{{ record?.materialSku || '--' }}</div>
        <div>{{ record?.materialName || '--' }}</div>
      </template>
      <template v-if="column.dataIndex === 'thumbnail'">
        <x-image :width="60" :thumbnail="record?.images?.[0]?.thumbUrl" :urls="record?.images"></x-image>
      </template>
      <template v-if="column.dataIndex === 'materialInfo'">
        <div>克重：{{ record?.weight || '--' }}</div>
        <div>门幅：{{ record?.width || '--' }}</div>
        <div>规格：{{ record?.standards || '--' }}</div>
      </template>
      <template v-if="column.dataIndex === 'supplierMaterial'">
        <div>{{ record?.supplierMaterialCode || '--' }}</div>
        <div>{{ record?.supplierMaterialName || '--' }}</div>
      </template>
      <template v-if="column.dataIndex === 'materialIngredient'">
        <template v-if="record?.materialIngredient && Array.isArray(record?.materialIngredient)">
          <a-tag v-for="item in record?.materialIngredient" :key="item?.zhName">
            {{ item?.zhName || '--' }}
          </a-tag>
        </template>
        <template v-else>--</template>
      </template>
    </template>
  </x-table>
</template>
<script>
import { defineComponent, reactive, watch, watchEffect } from 'vue'
import XTable from '@components/Table/index.vue'
import XImage from '@components/Image'

export default defineComponent({
  name: 'MaterialList',
  components: {
    'x-table': XTable,
    'x-image': XImage
  },
  props: {
    rowKey: String,
    selectedType: String,
    materialList: { type: Array, default: () => [] },
    total: Number,
    pagination: Object,
    emptyText: String
  },
  emits: ['update:pagination', 'search', 'add', 'del'],
  setup(props, { emit }) {
    const tableProps = reactive({
      scroll: {
        y: 400
      },
      rowKey: props.rowKey,
      emptyText: props.emptyText,
      rowSelection: true,
      size: 'small',
      columns: [
        { title: '物料', width: 160, fixed: 'left', dataIndex: 'material' },
        { title: '图片', width: 100, fixed: 'left', dataIndex: 'thumbnail' },
        { title: '物料状态', width: 100, dataIndex: 'statusDesc' },
        { title: '优选供应商', width: 160, dataIndex: 'supplierName' },
        { title: '颜色', width: 100, dataIndex: 'color' },
        {
          title: '物料分类',
          width: 200,
          customRender: ({ record }) => {
            return [record?.oneCategoryName, record?.twoCategoryName, record?.threeCategoryName]
              .filter(Boolean)
              .join('/')
          },
          ellipsis: true
        },
        { title: '物料信息', width: 200, dataIndex: 'materialInfo' },
        { title: '单位', width: 60, dataIndex: 'unit' },
        { title: '大货价', width: 100, dataIndex: 'bigPrice' },
        { title: '供应商物料', width: 160, dataIndex: 'supplierMaterial' },
        { title: '供应商物料状态', width: 120, dataIndex: 'supplierMaterialStatusDesc' },
        { title: '供应商物料颜色', width: 160, dataIndex: 'supplierMaterialColorName' },
        { title: '供应商物料色号', width: 120, dataIndex: 'supplierMaterialColorNo' },
        { title: '物料成分', width: 180, dataIndex: 'materialIngredient', ellipsis: true }
      ],
      dataSource: [],
      pagination: { page: 1, pageSize: 20 },
      total: 0
    })

    watchEffect(() => {
      tableProps.pagination = props.pagination
    })

    watch(
      () => props.selectedType,
      type => {
        if (type === 'radio') {
          tableProps.rowSelection = {
            type: 'radio'
          }
        } else {
          tableProps.rowSelection = true
        }
      },
      { immediate: true }
    )

    watch(
      () => props.materialList,
      list => {
        tableProps.dataSource = list.map(val => {
          const images = val?.prototypeImgs || val?.imageList || val?.images || val?.fileList || val?.files || []
          return {
            ...val,
            images
          }
        })
      },
      { deep: true, immediate: true }
    )

    const handleSearch = () => {
      emit('update:pagination', tableProps.pagination)
      emit('search')
    }

    return {
      tableProps,
      handleSearch
    }
  }
})
</script>
