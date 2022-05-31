<template>
  <x-table v-bind="tableProps">
    <template #bodyCell="{ column, record }">
      <template v-if="column.dataIndex === 'actions'">
        <a-button type="link" size="small" @click="handleDel(record)">删除</a-button>
      </template>
      <template v-if="column.dataIndex === 'thumbnail'">
        <x-image :width="60" :height="60" :thumbnail="record?.images?.[0]?.thumbUrl" :urls="record?.images"></x-image>
      </template>
    </template>
  </x-table>
</template>
<script>
import { defineComponent, reactive, watch } from 'vue'
import XTable from '@components/Table/index.vue'
import XImage from '@components/Image'

export default defineComponent({
  name: 'SelectedList',
  components: {
    'x-table': XTable,
    'x-image': XImage
  },
  props: {
    rowKey: [String, Function],
    selectedList: { type: Array, default: () => [] },
    emptyText: String
  },
  emits: ['del'],
  setup(props, { emit }) {
    const tableProps = reactive({
      scroll: {
        y: 400
      },
      rowKey: props.rowKey,
      emptyText: props.emptyText,
      size: 'small',
      columns: [
        { title: '操作', width: 100, dataIndex: 'actions' },
        { title: '缩略图', width: 100, dataIndex: 'thumbnail' },
        {
          title: '版型编号',
          dataIndex: 'prototypeNo'
        },
        {
          title: '版型分类',
          customRender: ({ record }) => {
            return [record?.oneCategoryName, record?.twoCategoryName, record?.threeCategoryName]
              .filter(Boolean)
              .join('/')
          }
        },
        {
          title: '类型',
          dataIndex: 'typeDesc'
        },
        {
          title: '角色',
          dataIndex: 'styleRoleName'
        },
        {
          title: '面料类型',
          dataIndex: 'fabricsTypeDesc'
        }
      ],
      dataSource: [],
      showPagination: false
    })

    watch(
      () => props.selectedList,
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

    const handleDel = row => {
      emit('del', row)
    }

    return {
      tableProps,
      handleDel
    }
  }
})
</script>
