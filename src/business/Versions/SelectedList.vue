<template>
  <x-table v-bind="tableProps"></x-table>
</template>
<script>
import { defineComponent, reactive, watch } from 'vue'
import { XTable } from '@src/components'

export default defineComponent({
  name: 'SelectedList',
  components: {
    'x-table': XTable
  },
  props: {
    selectedList: { type: Array, default: () => [] },
    tableProps: { type: Object, default: () => ({}) }
  },
  emits: ['update:selectedList', 'del'],
  setup(props, { emit }) {
    const tableProps = reactive({
      columns: [],
      dataSource: [],
      showPagination: false
    })

    watch(
      () => props.selectedList,
      list => {
        tableProps.dataSource = list
      },
      { deep: true, immediate: true }
    )

    const handleDel = row => {
      const index = props.selectedList.findIndex(v => v?.id === row?.id)
      const list = tableProps.dataSource.splice(index, 1)
      emit('update:selectedList', list)
      emit('del', row)
    }

    return {
      tableProps,
      handleDel
    }
  }
})
</script>
